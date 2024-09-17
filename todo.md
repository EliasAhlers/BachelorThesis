## General 
- [x] Subsubsection for data analysis (length etc...)
- [x] Fix table for dataset sources
- [x] Expand on synthetic data generation
- [x] Cite other models in the Base Model Section
- [x] Add model selection results to appendix
- [x] Add figure to methods section that shows the process
- [x] Fix appendix long prompt
- [x] Incorporate Pires2019 paper
- [x] Make tables pettier 💅💅💅
- [x] Move caption to beginning or end of table for all tables
- [x] Add prompt classification section
- [x] Add fine-tuned classification section
- [x] Add transfer task section
- [x] Sources
- [x] Add result analysis
- [x] Discussion part
- [x] Conclusion
- [x] Revisit Related Work and Background
- [x] Proof reading
- [x] Readd analysis to other chapter, currently commented out
- [x] Add drawings showing the structure
- [x] Bars same colors in the graphs
- [x] Remove MistralNemo from graphs??
<!-- - [ ] Maybe add to discussion that it was surprising, that the 8B model performed better than the 70B model -->
- [x] Maybe explain fine-tune?
- [x] Add color highlights to prompts
- [x] Performance graphs label units
- [x] LaTeX bug at Dataset Generation Process -> move caption
- [x] adapt transfer metrics
- [x] format prompts placehodlers with color
- [x] attention is all you need
- [x] Discuss that the 100% cant be right
- [x] Check the BERT citations at is a encode, not decoder
- [x] Mention the unbalanced second dataset
- [x] Analysis for transfer dataset
- [x] Maybe remove CEFR from the images to make it more readable
- [x] Think about the dataset graph
- [x] Rework Future work into flowing text
- [x] Fix citation capitalization
- [x] Add more details to the transfer results
- [x] Remove levelUnsure and content_preserved from db
- [x] Prune the database for size seasons and provide alternative download
- [x] Cleanup model list
- [x] Github link
- [x] Prompt references caption
<!-- - [ ] (Mention token generation time isn't the problems, rather "prompt parsing") -->


# questions for malte die zweite :D
- Dataset distribution problems -> 
- Accompanying interface - mention? (page 15)
- Analysis of dataset in results?
- Train second model on llama3 or llama3.1 -> keep llama3
- Small graphics?
- How much to mention code (e.g. parsing of synthetic generation)
- How much to repeat for tine-tuning?
- I perspective
- (Shortened prompt or direct link to appendix)
- (Figures where heading?)
- (Prompt to long for latex page)
- 
- See Mattermost -> mit rein

# transfer dataset methodology
- instruct model to transfer sample to all cefr levels not equals the samples level
- classify the transformation
- check if content is retained using judge model
- save to db
- filter out data that is not useful
  - if target and transfer level is the same
  - if content is not retained

# Questions for Malte
- Long authors list - how to handle? -> APA references
- Methods/Prompt construction: How to handle results for iterative prompt design ? -> Results in results teil schieben und zwischenschritte nur kurz beschreiben, tests etc...
- Base model kinda forced through optimizing prompt - mention? -> disclaimer, auch gpt4o-mini robustheit etc...
- How to handle transfer data generation?
weight and biases
