import json
import sys
from typing import List, Dict
from collections import defaultdict

def calculate_metrics(results: List[Dict]) -> Dict[str, Dict[str, float]]:
    levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    confusion_matrix = defaultdict(lambda: defaultdict(int))
    
    for result in results:
        target_level = result["targetLevel"]
        predicted_level = result["predictedLevel"]
        
        if predicted_level == "ERROR":
            print("Error: Encountered 'ERROR' classification in results.")
            sys.exit(1)
        
        confusion_matrix[target_level][predicted_level] += 1
    
    metrics = {}
    
    for level in levels:
        true_positives = confusion_matrix[level][level]
        false_positives = sum(confusion_matrix[other][level] for other in levels if other != level)
        false_negatives = sum(confusion_matrix[level][other] for other in levels if other != level)
        
        precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
        recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
        f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        metrics[level] = {
            "precision": precision,
            "recall": recall,
            "f1_score": f1_score
        }
    
    return metrics

def main():
    if len(sys.argv) != 2:
        print("Please provide the path to the benchmark results file as first argument")
        sys.exit(1)
    
    benchmark_file = sys.argv[1]
    
    with open(benchmark_file, 'r') as f:
        benchmark_data = json.load(f)
    
    results = benchmark_data["results"]
    metrics = calculate_metrics(results)
    
    # Calculate macro average
    levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    macro_avg = {
        "precision": sum(m["precision"] for m in metrics.values()) / len(levels),
        "recall": sum(m["recall"] for m in metrics.values()) / len(levels),
        "f1_score": sum(m["f1_score"] for m in metrics.values()) / len(levels)
    }
    
    metrics["macro_avg"] = macro_avg
    
    print(json.dumps(metrics))

if __name__ == "__main__":
    main()