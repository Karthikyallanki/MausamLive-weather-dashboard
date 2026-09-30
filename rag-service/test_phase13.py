import os
import sys
import json

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.routes.rag import query_rag, RagQueryRequest
from app.services.evaluator import RagEvaluator

def run_phase13_test():
    print("=== PHASE 13 — 25-QUESTION RAG EVALUATION SUITE ===")

    dataset_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'evaluation', 'dataset_25.json'))
    with open(dataset_path, 'r', encoding='utf-8') as f:
        dataset = json.load(f)

    print(f"Loaded {len(dataset)} evaluation questions across 5 categories.")

    live_weather_hyd = {
        "location": "Hyderabad, India",
        "temperature": 32,
        "rain_probability": 75,
        "uv_index": 8,
        "aqi": 150
    }

    eval_results = []

    for item in dataset:
        req = RagQueryRequest(
            query=item["question"],
            location="Hyderabad, India",
            live_weather=live_weather_hyd
        )
        query_res = query_rag(req)
        eval_item = RagEvaluator.evaluate_item(item, query_res)
        eval_results.append(eval_item)

        print(f"[{eval_item['id']:02d}/25] [{eval_item['category']}] \"{eval_item['question'][:45]}...\" -> Recall: {eval_item['recall_at_k']} | Faith: {eval_item['faithfulness']} | AnsRel: {eval_item['answer_relevance']}")

    summary = RagEvaluator.summarize_evaluations(eval_results)

    print("\n=============================================================")
    print("PHASE 13 EVALUATION SUMMARY REPORT:")
    print("=============================================================")
    print(f"  • Total Questions Evaluated: {summary['total_questions']}")
    print("  • OVERALL BENCHMARK SCORES:")
    for metric, score in summary['overall_metrics'].items():
        print(f"      - {metric}: {score * 100:.1f}%")

    print("\n  • CATEGORY BREAKDOWN:")
    for cat, data in summary['category_breakdown'].items():
        print(f"      - {cat} ({data['count']} questions): Recall = {data['avg_recall']*100:.1f}%, Faithfulness = {data['avg_faithfulness']*100:.1f}%")

    print("=============================================================")
    print("PHASE 13 RAG EVALUATION SUITE PASSED")
    print("=============================================================")

if __name__ == "__main__":
    run_phase13_test()
