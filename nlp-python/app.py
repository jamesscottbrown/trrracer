from flask import Flask
import os
import sys
import json

app = Flask(__name__)

def filter_txt(file):
    return [f for f in file if "txt" in f]


@app.route("/")
def index():
    document_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'
    files = os.listdir(document_path)
    txt_files = filter_txt(files)

    data_backbone = open(document_path + "trrrace.json", 'r')
    d_b_json = json.loads(data_backbone.read())

    # for t in txt_files:
    #     f = open(document_path + t, 'r')
    #     print(f.read())

    for en in d_b_json["entries"]:
        # print(en["title"])
        for f in en["files"]:
            # print(f["title"])
            if "fileType" not in f:
                print(f["title"])
                if "txt" in f["title"]:
                    f["fileType"] = "txt"
                elif "gdoc" in f["title"]:
                    f["fileType"] = "gdoc"
                elif "pdf" in f["title"]:
                    f["fileType"] = "pdf"

    
    write_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/trrracePYTHON.json'

    with open(write_path, 'w') as outfile:
        json.dump(d_b_json, outfile)
            

        
    return str(d_b_json["entries"])