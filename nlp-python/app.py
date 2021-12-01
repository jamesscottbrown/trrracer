from flask import Flask
import os
import sys
import json
from google_api import goog_auth, goog_doc_start, get_doc_text_by_id, get_doc_all_by_id
from get_blobs import extract_entry_text_to_blobs, make_file_array_for_entry
from nlp_work import get_frequent_words_all_files, term_freq_for_entry, concordance, make_blob_for_entry, get_concordance_for_concepts, collocations_maker, run_lda, fix_missing_file_type, tf_idf
from doc_clean import clean
from word_extraction import extract_words_yake
from concordance import key_concord

app = Flask(__name__)

DOCUMENT_PATH_DERYA = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'
DOCUMENT_PATH_JEN = '/Volumes/GoogleDrive/Shared drives/trrrace/Jen Artifact Trrracer/Jen/'

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

def load_all_blobs_as_corpus(document_path):
    blob_f = open(document_path + "blobs.json", 'r')
    blobb = json.load(blob_f)
    print(blobb["entries"])
    entry = blobb["entries"]

    # blobarray = []
    # for b in entry:
    #     print(b["blob"])
    #     blobarray.append(b["blob"])
    # return blob

def write_blobs_to_file(blob, document_path):  

    write_path = document_path +'blob.json'#/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/blob.json'

    outfile = open(write_path, 'w')
    json.dump(blob, outfile)


@app.route("/")
def index():
    # document_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'
   
    # cred = goog_auth()
    # gdoc_service = goog_doc_start(cred)
    # test = get_doc_all_by_id(gdoc_service, '1haYPT-BK_iP4sLmvSjgOaqSa0eAXrEgXYqVMPwyMqdk')
    return "nothing happening"

@app.route('/get_all_google_extract/<string:path>')
def get_all_google_extract(path):
    path_array = path.split("+")
    document_path = "/".join(path_array) + "/"

    # import glob
    # print(glob.glob("/Volumes/GoogleDrive/"))
    # return str(glob.glob(document_path))

    # /Volumes/GoogleDrive/Shared drives/trrrace/Jen Artifact Trrracer/Jen/trrrace.json
    final_path = DOCUMENT_PATH_DERYA if path == 'derya' else DOCUMENT_PATH_JEN 
   
    blob = extract_entry_text_to_blobs(final_path, make_file_array_for_entry)

    outfile = open(final_path+'emphasized_text_from_files.json', 'w')
    json.dump(blob, outfile)
    return str(blob)

    
@app.route("/extract_text_files")
def extract_text_files():
    # document_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'
    blob = extract_entry_text_to_blobs(DOCUMENT_PATH+"/", make_file_array_for_entry)

    outfile = open(DOCUMENT_PATH+'blob_w_files.json', 'w')
    json.dump(blob, outfile)
    return str(blob)

@app.route("/extract_emphasized_text")
def extract_emphasized_text():
    # document_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'
    blob = extract_entry_text_to_blobs(DOCUMENT_PATH, make_file_array_for_entry)

    outfile = open(DOCUMENT_PATH+'emphasized_text_from_files', 'w')
    json.dump(blob, outfile)
    return str(blob)

@app.route("/extract_text_entry")
def extract_text_entry():
    # document_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'
    blob = extract_entry_text_to_blobs(DOCUMENT_PATH, make_blob_for_entry)

    outfile = open(DOCUMENT_PATH+'blob.json', 'w')
    json.dump(blob, outfile)
    return str(blob)

@app.route("/yake_extract_words")
def yake_extract_words():
    # document_path = 
    data_backbone = open(DOCUMENT_PATH + "blob_w_files.json", 'r')
    d_b_json = json.load(data_backbone)
    blob_array = extract_words_yake(d_b_json)
   
    bob = {}
    bob['keyword_data'] = blob_array
    outfile = open(DOCUMENT_PATH+'keyword_data_array.json', 'w')
    json.dump(bob, outfile)
    return str(blob_array)



 # load_all_blobs_as_corpus(document_path)
    # new_json["entries"] = reformat(d_b_json["entries"]
    # json_with_freq_w = get_frequent_words_all_files(d_b_json, gdoc_service, document_path)
    # json_with_entry_freq = term_freq_for_entry(d_b_json, gdoc_service, document_path)

    # collocation_array = []
    # for b in blob["entry_blobs"]:
    #     coco = {}
    #     coco["entry_title"] = b["title"]
    #     coco["collocations"] = collocations_maker(b)
    #     collocation_array.append(coco)

    # blob = extract_entry_text_to_blobs(document_path)
    # write_blobs_to_file(blob, document_path)
    # giantarray = []
    # nameArray = []
    # for bubs in blob['entries']:
    #     giantarray.append(bubs['blob'])
    #     nameArray.append(bubs['title'])

    # top = {}
    # top_df = tf_idf(giantarray, nameArray)

    # write_path = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/tf-idf.json'

    # # outfile = open(write_path, 'w')
    # # json.dump(top, outfile)
    
    # # groups = top_df.groupby("document")
    # group_lists = top_df["document"].apply(list)
    # group_lists = group_lists.reset_index()

    
    #array = load_all_blobs_as_corpus(document_path)
    # ldamodel = run_lda(blob["entry_blobs"])
  

    # print(blob)
    # conco = get_concordance_for_concepts(new_json["concepts"], blob["entry_blobs"])

    # for con in d_b_json["concepts"]:
    #  print('conceptssss',con.name)
    # print(len(collocation_array), len(d_b_json["entries"]))
        
    
    #json.dump(ldamodel.print_topics(), outfile)


          

if __name__ == "__main__":
    app.run(port=5000)