import spacy 
import nltk
from nltk import word_tokenize
from collections import Counter
from google_api import goog_auth, goog_doc_start, get_doc_text_by_id
nlpS = spacy.load("en_core_web_sm")

def make_blob_for_entry(entries, gdoc_service, document_path):
    entry_blobs = []
    entry_index = 0
    for en in entries:

        blob = {}
        blob["title"] = en["title"]
        blob["index"] = entry_index
        entry_index  += 1
        blob["blob"] = ""

        for f in en["files"]:
            if f["fileType"] == "gdoc" and "fileId" in f:
                text = get_doc_text_by_id(gdoc_service, f["fileId"])
                blob["blob"] = blob["blob"] + text
            
            elif f["fileType"] == "txt":
                file_t = open(document_path + f["title"],'r')
                filelines = list(file_t)
                file_t.close()
                for f in filelines:
                    blob["blob"] = blob["blob"] + f
        # print(blob)
        entry_blobs.append(blob)

    return entry_blobs

def term_freq_for_entry(json_data, gdoc_service, document_path):

    for en in json_data["entries"]:

        blob = ""
        for f in en["files"]:
            if f["fileType"] == "gdoc" and "fileId" in f:
                text = get_doc_text_by_id(gdoc_service, f["fileId"])
                blob = blob + text
            
            elif f["fileType"] == "txt":
                file_t = open(document_path + f["title"],'r')
                filelines = list(file_t)
                file_t.close()
                for f in filelines:
                    blob = blob + f
                # with open(document_path + f["title"]) as text:
                #     lines = text.readLines()
                #     blob = blob + lines

        tok = get_tokens(blob)
        freq = get_top_words(tok)
        # print(freq)
        if len(freq) < 1:
            print(blob)

        en["entry_freq_words"] = freq

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

def get_concordance_for_concepts(concepts, blob):
    # con_wrap_array = []
    # print(blob)
    for con in concepts:
        con_wrap = {}
        con_wrap["concept"] = con["name"]
        con_wrap["concordance_by_entry"] = []
        for b in blob:
            print('blob', b)
            test = concordance(con["name"], b["blob"])
            print(test)
