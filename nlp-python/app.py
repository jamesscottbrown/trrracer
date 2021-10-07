from flask import Flask
import os
import sys
import json
from google_api import goog_auth, goog_doc_start, get_doc_text_by_id
from nlp_work import get_frequent_words_all_files, term_freq_for_entry, concordance, make_blob_for_entry, get_concordance_for_concepts


app = Flask(__name__)

def reformat(entries):
    indexer = 0
    new_entries = []
    for en in entries:
        new_entry = {}
        new_entry["title"] = en["title"]
        new_entry["tags"] = en["tags"]
        new_entry["description"] = en["description"]
        new_entry["date"] = en["date"]
        new_entry["entry_freq_words"] = en["entry_freq_words"]
        new_entry["files"] = []
        
        for f in en["files"]:
            new_f = {}
            new_f["corpus_index"] = indexer
            indexer  = indexer + 1
            new_f["title"] = f["title"]
            new_f["fileType"] = f["fileType"]
            new_f["context"] = f["context"]
            if "freq_words" in f:
                new_f["freq_words"] = f["freq_words"]
            if "fileId" in f:
                new_f["fileId"] = f["fileId"]
            
            new_entry["files"].append(new_f)
        
        new_entries.append(new_entry)
        
    return new_entries


@app.route("/")
def index():
    document_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'

    cred = goog_auth()
    gdoc_service = goog_doc_start(cred)

    data_backbone = open(document_path + "trrrace.json", 'r')
    d_b_json = json.load(data_backbone)

    new_json = d_b_json

    # new_json["entries"] = reformat(d_b_json["entries"])

    # json_with_freq_w = get_frequent_words_all_files(d_b_json, gdoc_service, document_path)

    # json_with_entry_freq = term_freq_for_entry(d_b_json, gdoc_service, document_path)
    # blob = {}
    # blob["entry_blobs"] = make_blob_for_entry(d_b_json["entries"], gdoc_service, document_path)
    blob_f = open(document_path + "blobs.json", 'r')
    blob = json.load(blob_f)
    # print(blob)
    get_concordance_for_concepts(new_json["concepts"], blob["entry_blobs"])

    # for con in d_b_json["concepts"]:
    #  print('conceptssss',con.name)
        
        
    write_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/blobs.json'

    # outfile = open(write_path, 'w')
    # json.dump(blob, outfile)
    
    return str(blob["entry_blobs"])
    # return text

                # for f in en["files"]:
            #     if "fileType" not in f:
            #         if "txt" in f["title"]:
            #             f["fileType"] = "txt"
            #         elif "gdoc" in f["title"]:
            #             f["fileType"] = "gdoc"
            #         elif "pdf" in f["title"]:
            #             f["fileType"] = "pdf"

if __name__ == "__main__":
    app.run(port=5000)