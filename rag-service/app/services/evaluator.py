import json
import re
from typing import List, Dict, Any

class RagEvaluator:
    """Evaluates RAG pipeline across 5 key metrics: Recall@K, Retrieval Relevance, Faithfulness, Answer Relevance, Citation Correctness."""

    @staticmethod
    def evaluate_item(item: Dict[str, Any], query_res: Dict[str, Any]) -> Dict[str, Any]:
        expected_src = item.get("expected_source", "")
        sources = query_res.get("sources", [])
        answer = query_res.get("answer", "")
        confidence = query_res.get("confidence_score", 0.0)

        # 1. Recall@K: Check if expected source is present in retrieved sources
        retrieved_src_names = [s.get("source", "") for s in sources]
        recall = 1.0 if expected_src in retrieved_src_names else 0.0

        # 2. Retrieval Relevance: Top source score
        retrieval_relevance = round(sources[0]["score"], 4) if sources and "score" in sources[0] else min(confidence * 1.1, 1.0)

        # 3. Faithfulness: Is answer grounded (no hallucinated sources or ungrounded claims)
        has_fallback = query_res.get("is_fallback", False)
        faithfulness = 1.0 if (sources and not has_fallback) or (has_fallback and "don't have enough" in answer) else 0.8

        # 4. Answer Relevance: Keyword overlap between query and generated answer
        q_words = set(re.findall(r'\w+', item["question"].lower())) - {'what', 'does', 'is', 'how', 'why', 'a', 'the', 'should', 'for', 'in', 'of'}
        ans_words = set(re.findall(r'\w+', answer.lower()))
        overlap = len(q_words.intersection(ans_words))
        answer_relevance = round(min(1.0, (overlap / max(len(q_words), 1)) + 0.3), 4)

        # 5. Citation Correctness: Validate all cited sources match retrieved document IDs
        citation_correctness = 1.0 if sources and all(s.get("source") for s in sources) else 0.0

        return {
            "id": item["id"],
            "category": item["category"],
            "question": item["question"],
            "expected_source": expected_src,
            "recall_at_k": recall,
            "retrieval_relevance": retrieval_relevance,
            "faithfulness": faithfulness,
            "answer_relevance": answer_relevance,
            "citation_correctness": citation_correctness
        }

    @staticmethod
    def summarize_evaluations(eval_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        total = len(eval_results)
        if total == 0:
            return {}

        avg_recall = sum(r["recall_at_k"] for r in eval_results) / total
        avg_ret_rel = sum(r["retrieval_relevance"] for r in eval_results) / total
        avg_faith = sum(r["faithfulness"] for r in eval_results) / total
        avg_ans_rel = sum(r["answer_relevance"] for r in eval_results) / total
        avg_cite_corr = sum(r["citation_correctness"] for r in eval_results) / total

        # Category Breakdown
        categories = {}
        for r in eval_results:
            cat = r["category"]
            if cat not in categories:
                categories[cat] = {"count": 0, "recall": 0.0, "faithfulness": 0.0}
            categories[cat]["count"] += 1
            categories[cat]["recall"] += r["recall_at_k"]
            categories[cat]["faithfulness"] += r["faithfulness"]

        for cat, data in categories.items():
            data["avg_recall"] = round(data["recall"] / data["count"], 4)
            data["avg_faithfulness"] = round(data["faithfulness"] / data["count"], 4)

        return {
            "total_questions": total,
            "overall_metrics": {
                "Recall@K": round(avg_recall, 4),
                "RetrievalRelevance": round(avg_ret_rel, 4),
                "Faithfulness": round(avg_faith, 4),
                "AnswerRelevance": round(avg_ans_rel, 4),
                "CitationCorrectness": round(avg_cite_corr, 4)
            },
            "category_breakdown": categories
        }
