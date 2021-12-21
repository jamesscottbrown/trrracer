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
from google_api import goog_auth, goog_doc_start, google_drive_start, get_doc_text_by_id, get_doc_all_by_id, get_doc_data_from_id_array

def extract_entry_text_to_blobs(document_path, fun_function):
    
    cred = goog_auth()
    gdoc_service = goog_doc_start(cred)
    gdrive_service = google_drive_start(cred)
    print(gdrive_service)

    data_backbone = open(document_path + "trrrace.json", 'r')
    d_b_json = json.load(data_backbone)

    fixed_entries = d_b_json["entries"] 
    # fix_missing_file_type(d_b_json["entries"])

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

def make_blob_for_google_files(entries, gdoc_service, document_path):
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
           
            if f["fileType"] == "gdoc":
                print("its a google doc", f["title"])
                if f["fileId"] != "":
                    text = get_doc_text_by_id(gdoc_service, f["fileId"])
                    blob["blob"] = blob["blob"] + text
                else: 
                    print("google doc no id")
            
            elif f["fileType"] == "txt":
                
                file_t = open(document_path + f["title"],'r')
                filelines = list(file_t)
                file_t.close()
                for f in filelines:
                    blob["blob"] = blob["blob"] + f
        # print(blob)
        entry_blobs.append(blob)

    return entry_blobs

def make_files_for_text_data(entries, gdoc_service, gdrive_service, document_path):
    giant_wrapper = {}
    entry_blobs_google = []
    goog_id_array = []
    entry_blobs_txt = []
    entry_index = 0
    request_counter = 0

    

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
              
                goog_id_array.append(f['fileId'])
                # request_counter = request_counter + 1
                # print("REQUESTSSSSS",request_counter)
                # tblob['blob'] = get_doc_all_by_id(gdoc_service, f["fileId"])
                # # tblob['comments'] = get_comments_by_id(gdrive_service, f['fileId'])
                # google_blob["file-array"].append(tblob)
            
            elif f["fileType"] == "txt":
                print("text file")
                # tblob = {}
                # tblob['title'] = f['title']
                # file_t = open(document_path + f["title"],'r')
                # filelines = list(file_t)
                # file_t.close()
                # # tblob['blob'] = ""
                # temp = ""
                # for f in filelines:
                #     # tblob['blob'] = tblob['blob'] + f
                #     temp = temp + f

                # tblob['blob'] = use_yake_for_text(temp)
                    
                # text_blob["file-array"].append(tblob)

    print('goog id array', goog_id_array)
    goog_data_array = get_doc_data_from_id_array(gdoc_service, goog_id_array)
   
        # entry_blobs_google.append(google_blob)
        # entry_blobs_txt.append(text_blob)
        # giant_wrapper["google"] = entry_blobs_google
        # giant_wrapper["text"] = entry_blobs_txt

    return goog_data_array