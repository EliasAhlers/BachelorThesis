import json
from typing import List, Dict
import torch
from unsloth import FastLanguageModel
from datetime import datetime, timezone
from openai import OpenAI
import time

# Config
config = {
    "model_config": {
        "transfer_model": "llama-3-8b-Instruct-cefr-tuned-transform-v2",
        "classification_model": "../llama3/llama-3-8b-Instruct-cefr-tuned-v2",
        "max_seq_length": 4096,
        "dtype": torch.float16,
        "load_in_4bit": False,
    },
    "benchmark_config": {
        "test_data_path": "../../data/german_cefr_transformations_test.json",
        "use_api_for_transfer": False,  # Set to False to use local model
    },
    "api_config": {
        "api_key": "HlLnLaP9UwxdTqA71Linx8QG6adBZ9wF",
        "base_url": "https://api.deepinfra.com/v1/openai",
        "model": "meta-llama/Meta-Llama-3-8B-Instruct",
    }
}

# Prompts
transfer_system_prompt = "Transformiere den gegebenen deutschen Text auf das angegebene CEFR-Niveau, während du die ursprüngliche Bedeutung beibehältst."
classification_system_prompt = "Klassifiziere die Sprachkenntnisse des bereitgestellten deutschen Textes gemäß dem Gemeinsamen Europäischen Referenzrahmen für Sprachen (GER/CEFR). Antworte NUR mit der entsprechenden Stufe: A1, A2, B1, B2, C1 oder C2, NICHT MEHR. Gebe auch *keine* Begründung!"

# Load classification model
def load_model_and_tokenizer(model_name):
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=model_name,
        max_seq_length=config["model_config"]["max_seq_length"],
        dtype=config["model_config"]["dtype"],
        load_in_4bit=config["model_config"]["load_in_4bit"],
    )
    FastLanguageModel.for_inference(model)
    return model, tokenizer

# Generate a transformation using local fine-tuned model
def generate_transfer_local(model, tokenizer, original_text: str, target_level: str) -> str:
    user_prompt = f"Übersetze den folgenden deutschen Text auf das CEFR-Sprachniveau {target_level}, während du den ursprünglichen Inhalt und die Bedeutung so weit wie möglich beibehältst:\n{original_text}"
    inputs = tokenizer(
        [f"<|start_header_id|>system<|end_header_id|>{transfer_system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>{user_prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"],
        return_tensors="pt"
    ).to("cuda")
    outputs = model.generate(**inputs, max_new_tokens=512, use_cache=True)
    generated = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
    generated = generated.split("assistant")[1]
    return generated

# Generate a transformation using API model
def generate_transfer_api(original_text: str, target_level: str) -> str:
    openai = OpenAI(
        api_key=config["api_config"]["api_key"],
        base_url=config["api_config"]["base_url"],
    )
    user_prompt = f"Übersetze den folgenden deutschen Text auf das CEFR-Sprachniveau {target_level}, während du den ursprünglichen Inhalt und die Bedeutung so weit wie möglich beibehältst:\n{original_text}"
    chat_completion = openai.chat.completions.create(
        model=config["api_config"]["model"],
        messages=[
            {"role": "system", "content": transfer_system_prompt},
            {"role": "user", "content": user_prompt}
        ],
    )
    return chat_completion.choices[0].message.content

# Generate a classification using local fine-tuned model
def generate_classification(model, tokenizer, text: str) -> str:
    inputs = tokenizer(
        [f"<|start_header_id|>system<|end_header_id|>{classification_system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>{text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"],
        return_tensors="pt"
    ).to("cuda")
    outputs = model.generate(**inputs, max_new_tokens=2, use_cache=True)
    predicted_level = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0][-2:].strip().upper()
    
    valid_levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    return predicted_level if predicted_level in valid_levels else "ERROR"

# Load test data from file
def load_test_data(file_path: str) -> List[Dict]:
    data = []
    with open(file_path, 'r') as f:
        for line in f:
            data.append(json.loads(line.strip()))
    return data

# Check if two CEFR levels are in the same group (adjcent)
def is_same_group(level1: str, level2: str) -> bool:
    cefr_levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
    try:
        index1 = cefr_levels.index(level1)
        index2 = cefr_levels.index(level2)
        return abs(index1 - index2) <= 1
    except ValueError:
        return False

# Run the benchmark on the test data
def run_benchmark(transfer_model, transfer_tokenizer, classification_model, classification_tokenizer) -> Dict:
    results = []
    correct_transfer = 0
    group_correct_transfer = 0
    total = 0
    total_time = 0

    test_data = load_test_data(config["benchmark_config"]["test_data_path"])

    print(f"Starting benchmark with {len(test_data)} samples...")

    for i, sample in enumerate(test_data, 1):
        original_text = sample["originalText"]
        original_level = sample["originalLevel"]
        target_level = sample["targetLevel"]

        start_time = time.time()
        if config["benchmark_config"]["use_api_for_transfer"]:
            transferred_text = generate_transfer_api(original_text, target_level)
        else:
            transferred_text = generate_transfer_local(transfer_model, transfer_tokenizer, original_text, target_level)
        transfer_time = time.time() - start_time
        total_time += transfer_time

        predicted_level = generate_classification(classification_model, classification_tokenizer, transferred_text)

        print(f"Sample {i}: Original Level: {original_level}, Target Level: {target_level}, Predicted Level: {predicted_level}")

        if predicted_level == "ERROR":
            print(f"Error in classification for sample {i}")
            continue

        is_transfer_correct = predicted_level == target_level
        is_group_correct = is_same_group(predicted_level, target_level)
        
        if is_transfer_correct:
            correct_transfer += 1
        if is_group_correct:
            group_correct_transfer += 1
        total += 1
        
        results.append({
            "originalText": original_text,
            "originalLevel": original_level,
            "targetLevel": target_level,
            "transferredText": transferred_text,
            "predictedLevel": predicted_level,
            "isTransferCorrect": is_transfer_correct,
            "isGroupCorrect": is_group_correct,
            "transferTime": transfer_time
        })

        if i % 10 == 0:
            print(f"Processed {i} samples. Current accuracy: {correct_transfer/total:.2%}, Group accuracy: {group_correct_transfer/total:.2%}")

    transfer_accuracy = correct_transfer / total if total > 0 else 0
    group_accuracy = group_correct_transfer / total if total > 0 else 0
    average_time = total_time / total if total > 0 else 0
    
    return {
        "transferModel": config["api_config"]["model"] if config["benchmark_config"]["use_api_for_transfer"] else config["model_config"]["transfer_model"],
        "classificationModel": config["model_config"]["classification_model"],
        "results": results,
        "evaluation": {
            "total": total,
            "correctTransfer": correct_transfer,
            "groupCorrectTransfer": group_correct_transfer,
            "transferAccuracy": transfer_accuracy,
            "groupAccuracy": group_accuracy,
            "totalTime": total_time,
            "averageTime": average_time
        }
    }

def main():
    print("Loading classification model and tokenizer...")
    classification_model, classification_tokenizer = load_model_and_tokenizer(config["model_config"]["classification_model"])

    if not config["benchmark_config"]["use_api_for_transfer"]:
        print("Loading transfer model and tokenizer...")
        transfer_model, transfer_tokenizer = load_model_and_tokenizer(config["model_config"]["transfer_model"])
    else:
        transfer_model, transfer_tokenizer = None, None
        print("Using API for transfer model...")

    print("Running benchmark...")
    benchmark_results = run_benchmark(transfer_model, transfer_tokenizer, classification_model, classification_tokenizer)

    print(f"\nBenchmark completed.")
    print(f"Transfer Accuracy: {benchmark_results['evaluation']['transferAccuracy']:.2%}")
    print(f"Group Accuracy: {benchmark_results['evaluation']['groupAccuracy']:.2%}")
    print(f"Total samples: {benchmark_results['evaluation']['total']}")
    print(f"Total time: {benchmark_results['evaluation']['totalTime']:.2f} seconds")
    print(f"Average time per sample: {benchmark_results['evaluation']['averageTime']:.2f} seconds")

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%fZ")
    filename = f"transfer_benchmark_{timestamp}.json"
    with open(filename, "w") as f:
        json.dump(benchmark_results, f, indent=2)

    print(f"Benchmark results saved to {filename}")

if __name__ == "__main__":
    main()