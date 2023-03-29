from transformers import AutoTokenizer
from transformers import AutoModelForSequenceClassification
from torch.utils.data import DataLoader
from torch.optim import AdamW
from transformers import get_scheduler
from datasets import Dataset, load_dataset
import torch 
from torch import nn
from tqdm.auto import tqdm
from utils import *

device = 'cuda' if torch.cuda.is_available() else 'cpu'

  
### FINETUNING

def load_matcher_tokenizer_model(model_checkpoint='shamz15531/roberta_tuple_matcher_base'):
    ### Load Model & tokenizer
    match_tokenizer = AutoTokenizer.from_pretrained(model_checkpoint)

    match_model = AutoModelForSequenceClassification.from_pretrained(model_checkpoint)
    match_model.to(device)

    ### Add Special Tokens
    # new tokens
    new_tokens = ["[ATT]", "[VAL]", "[MS]", "[SEP]"]
    # check if the tokens are already in the vocabulary
    new_tokens = set(new_tokens) - set(match_tokenizer.vocab.keys())
    # add the tokens to the tokenizer vocabulary
    match_tokenizer.add_tokens(list(new_tokens))
    # add new, random embeddings for the new tokens
    match_model.resize_token_embeddings(len(match_tokenizer))

    return match_tokenizer, match_model

def tokenize_function(examples, tokenizer):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

def finetuning_matcher(finetune_set_name, output_directory, model=None, tokenizer=None):

    ## Load Dataset
    raw_datasets_train = load_dataset("csv", data_files="./finetuning_sets/{}".format(finetune_set_name))

    ## Training set size
    train_set_size = len(raw_datasets_train["train"])

    ## Load Tokenizer 
    if tokenizer == None or model == None:
        model_checkpoint = 'shamz15531/roberta_tuple_matcher_base'
        tokenizer, model = load_matcher_tokenizer_model(model_checkpoint)

    ### Distribute Model
    model = nn.DataParallel(model).to(device)

    ### Tokenize Dataset to Input IDs
    tokenized_dataset = raw_datasets_train.map(tokenize_function, fn_kwargs={"tokenizer":tokenizer}, batched=True)
    tokenized_dataset = tokenized_dataset["train"]
    tokenized_dataset = tokenized_dataset.remove_columns(["text"])

    ### Make Data Loader
    tokenized_dataset.set_format('torch')
    train_dataloader = DataLoader(tokenized_dataset, shuffle=True, batch_size=32)

    ### Training params
    optimizer = AdamW(model.parameters(), lr=5e-5)
    num_epochs = 15
    num_training_steps = num_epochs * len(train_dataloader)
    lr_scheduler = get_scheduler(
        name="linear", optimizer=optimizer, num_warmup_steps=0, num_training_steps=num_training_steps
    )
    
    ### Train Model
    progress_bar = tqdm(range(num_training_steps))
    model.train()
    loss_fn = nn.CrossEntropyLoss()
    for epoch in range(num_epochs):
        for batch in train_dataloader:
            optimizer.zero_grad()
            batch = {k: v.to(device) for k, v in batch.items()}
            outputs = model(**batch)

            loss = loss_fn(outputs["logits"], batch["labels"])

            loss.backward()
            optimizer.step()
            lr_scheduler.step()
            progress_bar.update(1)
    
    model.module.save_pretrained(output_directory)
    tokenizer.save_pretrained(output_directory)
    
    return output_directory

print("LOADED matcher_finetuning_helper")
