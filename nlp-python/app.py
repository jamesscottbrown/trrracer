from flask import Flask
import os
import sys
import json
from google_api import goog_auth, goog_doc_start, get_doc_text_by_id
from nlp_work import get_tokens


app = Flask(__name__)


@app.route("/")
def index():
    document_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'

    cred = goog_auth()
    gdoc_service = goog_doc_start(cred)

     # Retrieve the documents contents from the Docs service.
    #text = get_doc_text_by_id(gdoc_service, '1rl5X_PwEdSkXXzo-afV1B-Ig86ZDJJcXmyKyFp5h8WY'

    data_backbone = open(document_path + "trrrace.json", 'r')
    d_b_json = json.load(data_backbone)
    data_backbone.close()
        
    for en in d_b_json["entries"]:
        
        for f in en["files"]:
            if f["fileType"] == "gdoc" and "fileId" in f:
                text = get_doc_text_by_id(gdoc_service, f["fileId"])
                tok = get_tokens(text)
                f["freq_words"] = tok
                
            elif f["fileType"] == "txt":
                text = open(document_path + f["title"], 'r')
                blob = text.read()
                tok = get_tokens(blob)
                text.close()
                
                f["freq_words"] = tok

    write_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/trrrace.json'

    # testJson = d_b_json
    # with open(write_path, 'w') as outfile:
    #     json.dump(d_b_json, outfile)
    outfile = open(write_path, 'w')
    json.dump(d_b_json, outfile)
    
    
    return str(d_b_json)
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