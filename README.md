# Bachelor Thesis
This repository contains the code and data used for my bachelor thesis
> "How can Large Language Models (LLMs) be Effectively Used for Classifying and Transferring Between Language Proficiency Levels in German?"

## Table of Contents
- [Bachelor Thesis](#bachelor-thesis)
  - [Table of Contents](#table-of-contents)
  - [Structure](#structure)
  - [Pre-requisites](#pre-requisites)
  - [benchmark](#benchmark)
    - [Installation](#installation)
    - [Usage](#usage)
  - [database](#database)
    - [Table: texts](#table-texts)
    - [Table: transformations3](#table-transformations3)
  - [database-creator](#database-creator)
    - [Usage](#usage-1)
  - [fine-tune (models)](#fine-tune-models)
    - [llama](#llama)
    - [llama3-transfer](#llama3-transfer)
  - [thesis and expose](#thesis-and-expose)
  - [Database licenses](#database-licenses)
  - [License](#license)

## Structure
<!-- - `benchmark/` contains the code for the benchmark interface
- `data/` contains the dataset, database and tools
  - `data/main.db` sqlite database containing all datasets
  - `data/datasets/` contains the raw datasets
  - `data/database-creator/` contains the tool to create and work with the database
- `expose/` contains the LaTeX code for my expose
- `finetune/` contains the scripts for fine-tuning and evaluating the models
  - `finetune/llama3/` contains the scripts for fine-tuning and evaluating the classificator model
  - `finetune/llama3-transfer/` contains the scripts for fine-tuning and evaluating the transfer model
- `thesis/` contains the LaTeX code for my thesis -->

```
├── benchmark/                # Benchmark interface code
├── data/                     # Datasets and database
│   ├── main.db               # SQLite database containing all datasets
│   ├── datasets/             # Raw datasets
│   └── database-creator/     # Database creation and management tool
├── expose/                   # LaTeX code for the thesis proposal
├── finetune/                 # Scripts for fine-tuning and evaluating models
│   ├── llama3/               # Classification model scripts
│   └── llama3-transfer/      # Transfer model scripts
└── thesis/                   # LaTeX code for the main thesis
```

Each component is described in more detail in the corresponding section below:

## Pre-requisites
You have to have the following runtimes installed to use all scripts and components:
- [bun Typescript runtime](https://bun.sh)
- [Python (3.10)](https://www.python.org/downloads/)

> [!IMPORTANT]
> The database in the `data/` folder contains no data in this repository, you can manually download a populated db from `https://ahlers.click/main.db` and place it in the `data/` folder.

## benchmark
This is a nodejs based interface for viewing and creating benchmarks for the models, specifically the classification task.

### Installation
```bash
cd benchmark
bun install # install dependencies
```
Now make sure to insert the deepinfra api key into the `benchmark/src/provider/openai-api.ts` file if you want to run any benchmarks.

### Usage
```bash
bun src/index.ts # start the interface
```
The interface is now available at [`http://localhost:81`](http://localhost:81)

When first run, there will be no benchmarks listed. You can start a benchmark by setting some parameters in the first container. Set the model (Caution, not all model are available on the deepinfra api), temperature, number of runs, sample size and system prompt (If you leave it empty, the prompt from the `benchmark/prompt.txt` file will be used). Then click on "Start new run" and wait for the results to come in, the interface will automatically update.

You can click on the filename of each run to see the details of the run including the prompt, accuracy and group accuracy, confusion matrix and precision, recall and f1 score metrics.

Please note, if a run fails due to repeatedly failing classifications no results are available and the run will be marked as `Automatically aborted`.

## database
The datasets fpr this thesis are stored in a sqlite database at `data/main.db`. The database is created and managed using the `database-creator` tool. For manual inspection and querying, you can use a sqlite client like [DB Browser for SQLite](https://sqlitebrowser.org/). Here is a small overview about the tables in the database:

### Table: texts
Stores text samples with their CEFR levels.

- `id`: Unique identifier for each text entry
- `content`: The sample text content
- `cefrLevel`: The CEFR level of the text
- `learnerLevel`: The learner's proficiency level

### Table: transformations3
Contains text transformations between different CEFR levels.

- `id`: Unique identifier for each transformation
- `original_level`: CEFR level of the original text
- `target_level`: Target CEFR level for the transformation
- `original_text`: The original text content
- `target_text`: The transformed text content
- `original_text_id`: Reference to the original text in the `texts` table


## database-creator
This is a CLI tool to create and work with the database containing the datasets.

### Usage
```bash
cd data/database-creator
bun src/index.ts # start the CLI, no arguments needed
```
When running the CLI you are given multiple options to interact with the database:

- **_Create database from existing dataset_**: This will create a new database from the datasets in the `data/datasets/` folder. The database will be saved as `data/main.db`.
- **_Download datasets_**: This will download the datasets from the internet and save them to the `data/datasets/` folder.
- **_Download datasets and create database_**: Combines the two previous options.
- **_Create training data from database (classification task)_**: Creates a JSON file from the database for fine-tuning the classification model. You will be asked further questions about the model for which the data should be created.
- **_Export samples as JSON (classification task)_**: Exports all classification samples as a single JSON file and reports a basic distribution of the samples.
- **-Create transfer JSON from existing dataset (transfer task)_**: Creates a JSON file from the database for fine-tuning the transfer model.

## fine-tune (models)
This folder contains the scripts for fine-tuning and evaluating the classificator model.

### llama
There are multiple scripts in this folder, each with a specific purpose:
- `train.py`: Fine-tunes the model on the classification dataset using unsloth
- `ìnfer.py`: Runs a single inference on the model and prints the result to the console
- `benchmark-test-data.py`: Runs the model on the test data and saves the results to a file that can be consumed by the benchmark interface
- `generate-synth-transfer-data.py`: Uses the classification model and a LLamA3-70B model to generate synthetic transfer data, see thesis for more details

### llama3-transfer
There are multiple scripts in this folder, each with a specific purpose:
- `train.py`: Fine-tunes the model on the transfer dataset using unsloth
- `benchmark.py`: Runs the model on the test data and saves the results to a json file
- `benchmark2.py`: Runs the model on the test data and also checks content retention using the judge model (LLaMA3)
- `generate_matrix.py [PATH TO OUTPUT FILE]`: Generates a confusion matrix for a given output file generated by the benchmark scripts
- `generate_stats.py [PATH TO OUTPUT FILE]`: Generates precision, recall and f1 score metrics for a given output file generated by the benchmark scripts

## thesis and expose
Those two folders contain the corresponding LaTeX code for my thesis and expose. The thesis is structured in a way that each chapter is a separate file in the `thesis/chapters/` folder. The expose is a single file in the `expose/latex/` folder.

## Database licenses
The following datasets were used in this thesis:
- [FALKO Corpus](https://www.linguistik.hu-berlin.de/de/institut/professuren/korpuslinguistik/forschung/falko) under [(CC BY 3.0)](https://creativecommons.org/licenses/by/3.0/deed.en)
- [MERLIN Corpus](https://www.merlin-platform.eu) under [(CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)

## License
This thesis is licensed under CC BY-SA 4.0 for all textual content and data derived from the FALKO and MERLIN corpora (`thesis/`). All original code contained in this work is licensed under the MIT License.