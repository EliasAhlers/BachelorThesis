import json
from typing import List, Dict
import torch
from unsloth import FastLanguageModel
from datetime import datetime, timezone

# Config
config = {
    "model_config": {
        "finetuned_model": "llama-3-8b-Instruct-cefr-tuned-v2",
        "max_seq_length": 4096,
        "dtype": torch.float16,
        "load_in_4bit": False,
    },
    "benchmark_config": {
        "test_data_path": "../../data/german_cefr_test_v4.json",
    },
}

def load_model_and_tokenizer():
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=config["model_config"]["finetuned_model"],
        max_seq_length=config["model_config"]["max_seq_length"],
        dtype=config["model_config"]["dtype"],
        load_in_4bit=config["model_config"]["load_in_4bit"],
    )
    FastLanguageModel.for_inference(model)
    return model, tokenizer

# Generate a cefr level prediction for a given text
def generate_prediction(model, tokenizer, text: str) -> str:
    system_prompt = "Klassifiziere die Sprachkenntnisse des bereitgestellten deutschen Textes gemäß dem Gemeinsamen Europäischen Referenzrahmen für Sprachen (GER/CEFR). Antworte NUR mit der entsprechenden Stufe: A1, A2, B1, B2, C1 oder C2, NICHT MEHR. Gebe auch *keine* Begründung!"
    inputs = tokenizer(
        [f"<|start_header_id|>system<|end_header_id|>{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>{text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"],
        return_tensors="pt"
    ).to("cuda")
    outputs = model.generate(**inputs, max_new_tokens=2, use_cache=True)
    generated_text = tokenizer.batch_decode(outputs, skip_special_tokens=True)
    predicted_level = generated_text[0][-2:].strip().upper()  # Get last two characters, remove whitespace, and convert to uppercase
    
    # Make sure the predicted level is valid
    valid_levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    return predicted_level if predicted_level in valid_levels else "ERROR"

# Check if two CEFR levels are in the same group (adjcent)
def is_same_group(level1: str, level2: str) -> bool:
    cefr_levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    try:
        index1 = cefr_levels.index(level1)
        index2 = cefr_levels.index(level2)
        return abs(index1 - index2) <= 1
    except ValueError:
        return False  # If either level is not valid, consider it not in the same group

# Load test data from file
def load_test_data() -> List[Dict]:
    with open(config["benchmark_config"]["test_data_path"], 'r') as file:
        return [json.loads(line) for line in file]

# Run the benchmark on the test data
def run_benchmark(model, tokenizer) -> Dict:
    results = []
    correct = 0
    group_correct = 0
    total = 0
    errors = 0

    test_data = load_test_data()

    # Iterate through each sample
    for sample in test_data:
        text = sample["text"]
        true_label = sample["cefrLevel"]
        # Generate prediction
        predicted_label = generate_prediction(model, tokenizer, text)
        print(f"True: {true_label}, Predicted: {predicted_label}")
        
        if predicted_label == "ERROR":
            errors += 1
            continue

        is_correct = predicted_label == true_label
        is_group_correct = is_same_group(predicted_label, true_label)
        
        if is_correct:
            correct += 1
        if is_group_correct:
            group_correct += 1
        total += 1
        
        results.append({
            "content": text,
            "cefrLevel": true_label,
            "predictedLevel": predicted_label
        })

    accuracy = correct / total if total > 0 else 0
    group_accuracy = group_correct / total if total > 0 else 0
    
    return {
        "model": config["model_config"]["finetuned_model"],
        "systemPrompt": "Klassifiziere die Sprachkenntnisse des bereitgestellten deutschen Textes gemäß dem Gemeinsamen Europäischen Referenzrahmen für Sprachen (GER/CEFR). Antworte NUR mit der entsprechenden Stufe: A1, A2, B1, B2, C1 oder C2, NICHT MEHR. Gebe auch *keine* Begründung!",
        "temperature": 0,
        "runs": [{
            "results": results,
            "evaluation": {
                "correct": correct,
                "incorrect": total - correct,
                "accuracy": accuracy,
                "groupCorrect": group_correct,
                "groupIncorrect": total - group_correct,
                "groupAccuracy": group_accuracy,
                "errors": errors
            }
        }],
        "runAccuracies": [accuracy],
        "completeEvaluation": {
            "correct": correct,
            "incorrect": total - correct,
            "accuracy": accuracy,
            "groupCorrect": group_correct,
            "groupIncorrect": total - group_correct,
            "groupAccuracy": group_accuracy,
            "errors": errors
        },
        "aborted": False,
        "abortReason": ""
    }

def main():
    print("Loading model and tokenizer...")
    model, tokenizer = load_model_and_tokenizer()

    print("Running benchmark...")
    benchmark_results = run_benchmark(model, tokenizer)

    print(f"Benchmark completed. Accuracy: {benchmark_results['completeEvaluation']['accuracy']:.2%}")
    print(f"Group Accuracy: {benchmark_results['completeEvaluation']['groupAccuracy']:.2%}")
    print(f"Correct: {benchmark_results['completeEvaluation']['correct']}, Group Correct: {benchmark_results['completeEvaluation']['groupCorrect']}, Total: {benchmark_results['completeEvaluation']['correct'] + benchmark_results['completeEvaluation']['incorrect']}")
    print(f"Errors: {benchmark_results['completeEvaluation']['errors']}")

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    filename = f"run_{timestamp}.json"
    with open(filename, "w") as f:
        json.dump(benchmark_results, f, indent=2)

    print(f"Benchmark results saved to {filename}")

if __name__ == "__main__":
    main()