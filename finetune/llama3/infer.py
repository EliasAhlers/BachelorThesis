# Importing the necessary packages(libraries) for the experiments
import json
import torch
from datasets import load_dataset
from huggingface_hub import login
from transformers import TrainingArguments
from trl import SFTTrainer
from unsloth import FastLanguageModel

# Logging into the Hugging Face Hub(with token)
login(token='TOKEN')

# Defining the configuration for the base model, LoRA and training
config = {
    "hugging_face_username":"EliasAhl",
    "model_config": {
        #"base_model":"unsloth/llama-3-8b-Instruct-bnb-4bit", 
        "base_model":"unsloth/llama-3-8b-Instruct", 
        "finetuned_model":"llama-3-8b-Instruct-cefr-tuned-v2", 
        "max_seq_length": 4096, 
        #"dtype":torch.float16, 
        "dtype":torch.float16,
        "load_in_4bit": False,# Load the model in 4-bit
    },
    "lora_config": {
      "r": 32, # The number of LoRA layers 8, 16, 32, 64
      "target_modules": ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj"], 
      "lora_alpha":32, 
      "lora_dropout":0, 
      "bias":"none", 
      "use_gradient_checkpointing":True, 
      "use_rslora":False, # Use RSLora
      "use_dora":False, # Use DoRa
      "loftq_config":None # The LoFTQ configuration
    },
    "training_dataset":{
        "name":"EliasAhl/german-cefr", # The dataset name(huggingface/datasets)
        "split":"train", # The dataset split
        "input_field":"prompt", # The input field
    },
    "training_config": {
        "per_device_train_batch_size": 1, # The batch size
        "gradient_accumulation_steps": 1, # The gradient accumulation steps
        "warmup_steps": 400, # The warmup steps
        "max_steps":0, # The maximum steps (0 if the epochs are defined)
        "num_train_epochs": 10, # The number of training epochs(0 if the maximum steps are defined)
        "learning_rate": 2e-4, # The learning rate
        "fp16": True, # für A6000
        #"bf16": torch.cuda.is_bf16_supported(), # The bf16
        "logging_steps": 1, # The logging steps
        "optim" :"adamw_8bit", # The optimizer
        "weight_decay" : 0.001,  # The weight decay
        "lr_scheduler_type": "linear", # The learning rate scheduler
        "seed" : 42, # The seed
        "output_dir" : "outputs", # The output directory
    }
}

# Loading the model and the tokinizer for the model
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = config.get("model_config").get("base_model"),
    max_seq_length = config.get("model_config").get("max_seq_length"),
    dtype = config.get("model_config").get("dtype"),
    load_in_4bit = config.get("model_config").get("load_in_4bit"),
)

# Loading the fine-tuned model and the tokenizer for inference
model, tokenizer = FastLanguageModel.from_pretrained(
        model_name = config.get("model_config").get("finetuned_model"),
        max_seq_length = config.get("model_config").get("max_seq_length"),
        dtype = config.get("model_config").get("dtype"),
        load_in_4bit = config.get("model_config").get("load_in_4bit"),
    )

# Using FastLanguageModel for fast inference
FastLanguageModel.for_inference(model)

text_to_classify = """Sehr geehrter Michael,
ich möchte Ihnen zunächst meinen aufrichtigen Dank für Ihren jüngsten Brief aussprechen. Es wäre mir eine große Freude und Ehre, das neue Jahr in Ihrer Gesellschaft zu verbringen, sollten Sie die Gelegenheit haben, unsere Stadt zu besuchen. Vielleicht könnten wir einen Abend in einem der hiesigen Nachtclubs verbringen, eine kleine, gemütliche Feier in meinem Zuhause ausrichten oder einen Spaziergang durch die malerische Altstadt unternehmen? Zu Silvester hatten wir das Vergnügen, den Abend im Kreise meiner Familie zu Hause zu verbringen, wo wir gemeinsam kochten, tanzten und uns rundum bestens amüsierten.
Auch Ihnen ein frohes und erfolgreiches neues Jahr! Ich habe Ihnen bislang noch nicht mitgeteilt, dass ich vor etwa vier Monaten eine neue berufliche Tätigkeit aufgenommen habe. Ich muss Ihnen gestehen, dass ich diese Stelle bisweilen als durchaus herausfordernd empfinde, da mein Arbeitspensum recht umfangreich ist und sich meine Kollegen in manchen Situationen etwas eigenwillig verhalten.
Es wäre mir eine große Freude, wenn wir uns in etwa einer Woche zu einem gemeinsamen Treffen zusammenfinden könnten. Gemeinsam könnten wir dann beispielsweise einen Theaterbesuch oder Kinoabend planen, oder aber zu Hause eine kleine Mahlzeit zubereiten. Wären Sie an einer solchen Unternehmung interessiert?
Mit den herzlichsten Grüßen
Anna Schmidt"""

# Tokenizing the input and generating the output
inputs = tokenizer(
[
    f"<|start_header_id|>system<|end_header_id|>Klassifiziere die Sprachkenntnisse des bereitgestellten deutschen Textes gemäß dem Gemeinsamen Europäischen Referenzrahmen für Sprachen (GER/CEFR). Antworte NUR mit der entsprechenden Stufe: A1, A2, B1, B2, C1 oder C2, NICHT MEHR. Gebe auch *keine* Begründung!<|eot_id|><|start_header_id|>user<|end_header_id|>{text_to_classify}<|eot_id|><|start_header_id|>assistant<|end_header_id|>"
], return_tensors = "pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens = 2, use_cache = True)
generated_text = tokenizer.batch_decode(outputs, skip_special_tokens = True) # Last two chars are the classification
print(generated_text)