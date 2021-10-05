from flask import Flask
import os
import sys

app = Flask(__name__)

def filter_txt(file):
    return [f for f in file if "txt" in f]


@app.route("/")
def index():
    document_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'
    files = os.listdir(document_path)
    
    txt_files = filter_txt(files)

    for t in txt_files:
        f = open(document_path + t, 'r')
        print(f.read())
        
    return str(txt_files)