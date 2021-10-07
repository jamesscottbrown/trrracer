from flask import Flask
import os
import sys
import json
from google_api import goog_auth, goog_doc_start, get_doc_text_by_id
from nlp_work import get_frequent_words_all_files


app = Flask(__name__)


@app.route("/")
def index():
    document_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'

    cred = goog_auth()
    gdoc_service = goog_doc_start(cred)

    data_backbone = open(document_path + "trrrace.json", 'r')
    d_b_json = json.load(data_backbone)
   
    json_with_freq_w = get_frequent_words_all_files(d_b_json, gdoc_service, document_path)

    for con in d_b_json["concepts"]:
        print('conceptssss',con)
        
    write_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/trrrace.json'

    # testJson = d_b_json
    # with open(write_path, 'w') as outfile:
    #     json.dump(d_b_json, outfile)
    # outfile = open(write_path, 'w')
    # json.dump(d_b_json, outfile)
    
    return str(json_with_freq_w)
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