import spacy 
import nltk
from collections import Counter
from google_api import goog_auth, goog_doc_start, get_doc_text_by_id
nlpS = spacy.load("en_core_web_sm")

def term_freq_for_entry(json_data, gdoc_service, document_path):

    for en in json_data["entries"]:

        blob = ""
        for f in en["files"]:
            if f["fileType"] == "gdoc" and "fileId" in f:
                text = get_doc_text_by_id(gdoc_service, f["fileId"])
                blob = blob + text
            
            elif f["fileType"] == "txt":
                text = open(document_path + f["title"], 'r')
                blob = blob + text.read()
                text.close()

        tok = get_tokens(blob)
        freq = get_top_words(tok)
        en["freq_words"] = freq

    return json_data


def get_tokens(text):
    doc = nlpS(text)
    words = [token.lemma_ for token in doc if token.is_stop != True and token.is_punct != True and "\n" not in token.text]
    return words
    
def get_top_words(words):
    word_freq = Counter(words)
    common_words = word_freq.most_common(10)
    
    holder = []
    for w in common_words:
        data = {}
        data["word"] = w[0]
        data["count"] = w[1]
        holder.append(data)
       
    return holder

def get_frequent_words_all_files(json, gdoc_service, document_path):
    
    for en in json["entries"]:
        
        for f in en["files"]:
            if f["fileType"] == "gdoc" and "fileId" in f:
                text = get_doc_text_by_id(gdoc_service, f["fileId"])
                tok = get_tokens(text)
                freq = get_top_words(tok)
                
                f["freq_words"] = freq
                
            elif f["fileType"] == "txt":
                text = open(document_path + f["title"], 'r')
                blob = text.read()
                tok = get_tokens(blob)
                text.close()
                freq = get_top_words(tok)
                f["freq_words"] = freq

    return json

def concordance(word, text):
    tokens = nltk.word_tokenize(text)
     
    ## Create the text of tokens
    text_tokens = nltk.Text(tokens)
    return text_tokens.concordance(word)


