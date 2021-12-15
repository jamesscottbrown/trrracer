import os
import sys
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from word_extraction import extract_words_yake, use_yake_for_text
import nltk
import spacy
STOP = stopwords.words('english')
from google_api import goog_auth, goog_doc_start, google_drive_start, get_doc_text_by_id, get_comments_by_id

def extract_entry_text_to_blobs(document_path, fun_function):
    
    cred = goog_auth()
    gdoc_service = goog_doc_start(cred)
    gdrive_service = google_drive_start(cred)
    print(gdrive_service)

    data_backbone = open(document_path + "trrrace.json", 'r')
    d_b_json = json.load(data_backbone)

    new_json = d_b_json

    fixed_entries = fix_missing_file_type(d_b_json["entries"])

    blob = {}
    blob["entries"] = fun_function(fixed_entries, gdoc_service, gdrive_service, document_path)
 
    return blob

def fix_missing_file_type(entries):
    for en in entries:
        for f in en["files"]:
            if "fileType" not in f:
                if "txt" in f["title"]:
                    f["fileType"] = "txt"
                elif "gdoc" in f["title"]:
                    f["fileType"] = "gdoc"
                elif "pdf" in f["title"]:
                    f["fileType"] = "pdf"
    return entries

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
           # print('filetyyyyyyy',f)
           
            if f["fileType"] == "gdoc" and "fileId" in f:
                text = get_doc_text_by_id(gdoc_service, f["fileId"])
                blob["blob"] = blob["blob"] + text
            
            elif f["fileType"] == "txt":
                # print("TITLEEE",f["title"])
                file_t = open(document_path + f["title"],'r')
                filelines = list(file_t)
                file_t.close()
                for f in filelines:
                    blob["blob"] = blob["blob"] + f
        # print(blob)
        entry_blobs.append(blob)

    return entry_blobs

def make_file_array_for_entry(entries, gdoc_service, gdrive_service, document_path):
    entry_blobs = []
    entry_index = 0
    for en in entries:

        blob = {}
        blob["title"] = en["title"]
        blob["index"] = entry_index
        entry_index  += 1
        blob["file-array"] = []

        for f in en["files"]:
         
            if f["fileType"] == "gdoc" and "fileId" in f:
                tblob = {}
                tblob['title'] = f['title']
                tblob['blob'] = get_doc_text_by_id(gdoc_service, f["fileId"])
                tblob['comments'] = get_comments_by_id(gdrive_service, f['fileId'])
                blob["file-array"].append(tblob)
            
            elif f["fileType"] == "txt":
               
                tblob = {}
                tblob['title'] = f['title']
                file_t = open(document_path + f["title"],'r')
                filelines = list(file_t)
                file_t.close()
                # tblob['blob'] = ""
                temp = ""
                for f in filelines:
                    # tblob['blob'] = tblob['blob'] + f
                    temp = temp + f

                tblob['blob'] = use_yake_for_text(temp)
                    
                blob["file-array"].append(tblob)
   
        entry_blobs.append(blob)

    return entry_blobs