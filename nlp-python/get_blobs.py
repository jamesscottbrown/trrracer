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
from google_api import goog_auth, goog_doc_start, google_drive_start, get_doc_data_from_id_array

def extract_entry_text_to_blobs(document_path):
    
    cred = goog_auth()
    gdoc_service = goog_doc_start(cred)

    data_backbone = open(document_path + "trrrace.json", 'r')
    d_b_json = json.load(data_backbone)

    fixed_entries = d_b_json["entries"] 
    # fix_missing_file_type(d_b_json["entries"])

    blob = {}
    # google_data = make_file_for_google_data(fixed_entries, gdoc_service, document_path)
    text_data = make_file_for_text_data(fixed_entries, document_path)


    return text_data

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

"""
Makes object that has the text data and important keywords for each text file.
Args:
    entries: entry data object
    document_path: read/write 
"""
def make_file_for_text_data(entries, document_path):
    keeper = {}
    entry_blobs_txt = []

    for i in range(len(entries)):

        en = entries[i]

        for j in range(len(en["files"])):
            
            fil = en["files"][j]

            if fil["fileType"] == "txt":
                print("text file")

                text_blob = {}
                text_blob["entry-title"] = en["title"]
                text_blob["entry-index"] = i
                text_blob["file-index"] = j
                text_blob["file-title"] = fil["title"]

                file_t = open(document_path + fil["title"],'r')
                filelines = list(file_t)
                file_t.close()
               
                temp = ""
                for f in filelines:
                    temp = temp + f

                text_blob['keywords'] = use_yake_for_text(temp)
                text_blob["text"] = temp
                    
                entry_blobs_txt.append(text_blob)
    


    keeper["text-data"] = entry_blobs_txt

    outfile = open(document_path+'text_data.json', 'w')
    json.dump(keeper, outfile)

    return keeper

def make_file_for_google_data(entries, gdoc_service, document_path):
 
    goog_id_array = []
    entry_index = 0

    keeper = {}

    try:
        blob_f = open(document_path + "goog_data.json", 'r')
        blobb = json.load(blob_f)
        keeper = blobb

    except:
        print('does not exist')

    for en in entries:

        google_blob = {}
        text_blob = {}

        google_blob["title"] = en["title"]
        google_blob["index"] = entry_index

        text_blob["title"] = en["title"]
        text_blob["index"] = entry_index

        entry_index  += 1

        google_blob["file-array"] = []
        text_blob["file-array"] = []

        for f in en["files"]:
         
            if f["fileType"] == "gdoc" and "fileId" in f:
                tblob = {}
                tblob['title'] = f['title']
                if f['fileId'] not in keeper.keys():
                    
                    goog_id_array.append(f['fileId'])
                
            elif f["fileType"] == "txt":
                print("text file")

    print('goog id array', goog_id_array)
    
    if len(goog_id_array) > 0:
        goog_data_array = get_doc_data_from_id_array(gdoc_service, goog_id_array, document_path, keeper)


    return goog_data_array
    