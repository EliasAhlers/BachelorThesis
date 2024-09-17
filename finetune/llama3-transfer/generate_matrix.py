import json
import sys
from typing import List, Dict

def load_benchmark_results(file_path: str) -> Dict:
    with open(file_path, 'r') as f:
        return json.load(f)

def create_confusion_matrix(results: List[Dict]) -> List[List[int]]:
    cefr_levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    matrix = [[0 for _ in range(6)] for _ in range(6)]
    
    for result in results:
        target_level = result["targetLevel"]
        predicted_level = result["predictedLevel"]
        
        if predicted_level == "ERROR":
            print("Error: Encountered 'ERROR' classification in results.")
            sys.exit(1)
        
        target_index = cefr_levels.index(target_level)
        predicted_index = cefr_levels.index(predicted_level)
        
        matrix[target_index][predicted_index] += 1
    
    return matrix

def main():
    if len(sys.argv) != 2:
        print("Please provide the path to the benchmark results file as first argument")
        sys.exit(1)
    
    benchmark_file = sys.argv[1]
    benchmark_data = load_benchmark_results(benchmark_file)
    
    confusion_matrix = create_confusion_matrix(benchmark_data["results"])
    
    output = {
        "confusionMatrix": confusion_matrix,
        "levels": ["A1", "A2", "B1", "B2", "C1", "C2"]
    }
    
    print(json.dumps(output))

if __name__ == "__main__":
    main()