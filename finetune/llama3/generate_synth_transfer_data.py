import json
import torch
import os
import sqlite3
import argparse
from openai import OpenAI
from unsloth import FastLanguageModel
from itertools import combinations

# Config
config = {
    "deepinfra_api_key": "HlLnLaP9UwxdTqA71Linx8QG6adBZ9wF",
    "generation_model": "meta-llama/Meta-Llama-3.1-70B-Instruct",
    "local_model_config": {
        "finetuned_model": "llama-3-8b-Instruct-cefr-tuned-v2",
        "max_seq_length": 4096,
        "dtype": torch.float16,
        "load_in_4bit": False,
    },
    "db_path": "../../data/main.db",
    "max_tokens": 32768,
}

# Initialize api client for transfer model
deepinfra_client = OpenAI(
    api_key=config["deepinfra_api_key"],
    base_url="https://api.deepinfra.com/v1/openai",
)

# Load classification model
def load_local_model():
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=config["local_model_config"]["finetuned_model"],
        max_seq_length=config["local_model_config"]["max_seq_length"],
        dtype=config["local_model_config"]["dtype"],
        load_in_4bit=config["local_model_config"]["load_in_4bit"],
    )
    FastLanguageModel.for_inference(model)
    return model, tokenizer

# Generate text variants for all CEFR levels using api model
def generate_texts(text, original_level):
    prompt = f"""Erstelle bitte Varianten des folgenden Textes in allen CEFR Niveaus, außer dem Originalniveau {original_level}:

"{text}"

Die Texte sollten den gleichen Inhalt haben, aber an das jeweilige CEFR Niveau angepasst sein. Gebe die Texte als JSON Objekt mit CEFR-Leveln als Keys zurück und antworte NUR mit dem Objekt, keine Begründungen, keine Codeblöcke(```), keine Erklärungen dass du etwas nur versuchen kannst oder ähnliches! Und stelle sicher, dass die Texte den gleichen Inhalt haben, sonst wirst du gefeuert!"""

    response = deepinfra_client.chat.completions.create(
        model=config["generation_model"],
        messages=[
            {"role": "user", "content": prompt}
        ],
        max_tokens=config["max_tokens"],
        temperature=0.2
    )

    try:
        return json.loads(response.choices[0].message.content.strip())
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        print("Raw response content:")
        print(response.choices[0].message.content)
        return None

# Classify text using local model
def evaluate_text(model, tokenizer, text):
    system_prompt = "Klassifiziere das Sprachniveau des bereitgestellten deutschen Textes gemäß dem Gemeinsamen Europäischen Referenzrahmen für Sprachen (GER/CEFR). Antworte NUR mit der entsprechenden Stufe: A1, A2, B1, B2, C1 oder C2, NICHT MEHR. Entscheide nicht nach dem Inhalt, sondern nach der sprachlichen Komplexität."
    inputs = tokenizer(
        [f"<|start_header_id|>system<|end_header_id|>{system_prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>{text}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"],
        return_tensors="pt"
    ).to("cuda")
    outputs = model.generate(**inputs, max_new_tokens=2, use_cache=True)
    classified_level = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0][-2:] # Get last two characters
    return classified_level

# Filter samples to only have one per classified CEFR level
def filter_samples(classified_samples):
    filtered_samples = {}
    for original_level, (text, classified_level) in classified_samples.items():
        if classified_level not in filtered_samples:
            filtered_samples[classified_level] = (original_level, text)
    return filtered_samples

# Generate all possible non-adjacent CEFR level pairs
def generate_non_adjacent_pairs(filtered_samples):
    levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    available_levels = [level for level in levels if level in filtered_samples]
    non_adjacent_pairs = []
    for i, level1 in enumerate(available_levels):
        for level2 in available_levels[i+2:]:
            non_adjacent_pairs.append((level1, level2))
    return non_adjacent_pairs

# Initialize database connection and table
def init_database():
    db_path = os.path.abspath(config["db_path"])
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transformations3 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_level TEXT,
        target_level TEXT,
        original_text TEXT,
        target_text TEXT,
        content_preserved INTEGER,
        original_text_id INTEGER
    )
    ''')
    conn.commit()
    return conn, cursor

# Insert transformation into database
def insert_transformation(cursor, original_level, target_level, original_text, target_text, original_text_id):
    cursor.execute('''
    INSERT INTO transformations3 (original_level, target_level, original_text, target_text, content_preserved, original_text_id)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', (original_level, target_level, original_text, target_text, 1, original_text_id))

# Process a single text
def process_single_text(local_model, tokenizer, cursor, text_id, text, cefr_level):
    print(f"\nProcessing text ID: {text_id}")
    print(f"Original CEFR Level: {cefr_level}")
    print(f"Text preview: {text[:200]}...")

    print("\nGenerating texts for other CEFR levels...")
    generated_texts = generate_texts(text, cefr_level)
    if generated_texts is None:
        print("Failed to generate texts. Skipping this text.")
        return

    print("\nClassifying generated texts:")
    classified_samples = {cefr_level: (text, cefr_level)}
    for level, generated_text in generated_texts.items():
        classified_level = evaluate_text(local_model, tokenizer, generated_text)
        classified_samples[level] = (generated_text, classified_level)
        print(f"\nGenerated Level: {level}")
        print(f"Classified Level: {classified_level}")
        print(f"Text preview: {generated_text[:200]}...")

    print("\nFiltering samples to have one per classified CEFR level...")
    filtered_samples = filter_samples(classified_samples)
    for classified_level, (original_level, sample_text) in filtered_samples.items():
        print(f"\nClassified Level: {classified_level}")
        print(f"Original Level: {original_level}")
        print(f"Text preview: {sample_text[:200]}...")

    print("\nGenerating all possible non-adjacent CEFR level pairs and inserting into database:")
    non_adjacent_pairs = generate_non_adjacent_pairs(filtered_samples)
    for i, combo in enumerate(non_adjacent_pairs, 1):
        level1, level2 = combo
        original_level, original_text = filtered_samples[level1]
        target_level, target_text = filtered_samples[level2]
        
        print(f"\nInserting Combination {i}: {level1} -> {level2}")
        insert_transformation(cursor, original_level, target_level, original_text, target_text, text_id)
        
        print(f"Inserting Reverse Combination {i}: {level2} -> {level1}")
        insert_transformation(cursor, target_level, original_level, target_text, original_text, text_id)

def main(skip_samples):
    local_model, tokenizer = load_local_model()
    conn, cursor = init_database()
    
    cursor.execute("SELECT id, content, cefrLevel FROM texts WHERE  cefrLevel IS NOT \"C1-C2\"")
    texts = cursor.fetchall()

    print(f"Skipping {skip_samples} samples...")
    
    for text_id, content, cefr_level in texts[skip_samples:]:
        try:
            process_single_text(local_model, tokenizer, cursor, text_id, content, cefr_level)
            conn.commit()
            print(f"--- Completed processing for text ID {text_id} ---")
        except Exception as e:
            print(f"Error processing text ID {text_id}: {e}")
            print("Skipping to next text.")
            conn.rollback()

    conn.close()
    print("\nAll texts processed. All successful transformations have been inserted into the database.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process texts and generate CEFR variants")
    parser.add_argument("--skip", type=int, default=0, help="Number of samples to skip")
    args = parser.parse_args()

    main(args.skip)