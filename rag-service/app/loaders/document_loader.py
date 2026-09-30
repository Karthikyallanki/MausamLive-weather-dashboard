import os
import re
from typing import Dict, Any, List, Optional

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

try:
    from docx import Document as DocxDocument
except ImportError:
    DocxDocument = None

class DocumentLoader:
    """Loads and cleans text from PDF, DOCX, HTML, TXT, and Markdown files while extracting document metadata."""

    @staticmethod
    def load_document(file_path: str, custom_category: Optional[str] = None) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        filename = os.path.basename(file_path)
        ext = os.path.splitext(filename)[1].lower()

        # Infer category and topic from directory structure or filename
        parent_dir = os.path.basename(os.path.dirname(file_path))
        category = custom_category or (parent_dir if parent_dir not in ['knowledge', 'rag'] else 'weather')
        topic = os.path.splitext(filename)[0]

        content = ""

        if ext in ['.txt', '.md']:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

        elif ext == '.pdf':
            reader = PdfReader(file_path)
            pages_text = [page.extract_text() for page in reader.pages if page.extract_text()]
            content = "\n\n".join(pages_text)

        elif ext in ['.docx', '.doc']:
            doc = DocxDocument(file_path)
            content = "\n".join([p.text for p in doc.paragraphs if p.text])

        elif ext in ['.html', '.htm']:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')
                content = soup.get_text(separator='\n')

        else:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()

        cleaned_text = DocumentLoader.clean_text(content)

        metadata = {
            "source": filename,
            "source_path": file_path,
            "category": category,
            "topic": topic,
            "authority": "official_source",
            "country": "Worldwide",
            "file_type": ext.lstrip('.'),
            "length_chars": len(cleaned_text)
        }

        return {
            "text": cleaned_text,
            "metadata": metadata
        }

    @staticmethod
    def clean_text(text: str) -> str:
        # Normalize whitespace while keeping section breaks intact
        text = re.sub(r'\r\n', '\n', text)
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    @staticmethod
    def load_directory(dir_path: str) -> List[Dict[str, Any]]:
        documents = []
        for root, _, files in os.walk(dir_path):
            for file in files:
                if file.endswith(('.md', '.txt', '.pdf', '.docx', '.html')):
                    full_path = os.path.join(root, file)
                    try:
                        doc = DocumentLoader.load_document(full_path)
                        documents.append(doc)
                    except Exception as e:
                        print(f"Error loading {full_path}: {e}")
        return documents
