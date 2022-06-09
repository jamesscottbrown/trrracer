from flask import Flask, jsonify
import os
import sys
import json
from google_api import create_google_file, get_emphasized_text, get_comments_for_all_goog
from get_blobs import extract_entry_text_to_blobs
from nlp_work import get_frequent_words_all_files, term_freq_for_entry, concordance, make_blob_for_entry, get_concordance_for_concepts, collocations_maker, run_lda, fix_missing_file_type, tf_idf
from doc_clean import clean
from word_extraction import extract_words_yake, use_yake_for_text
from concordance import key_concord
import datetime
import json
import eml_parser
from email import message_from_file, policy, parser
from extract_links import extract_links_from_pdf

app = Flask(__name__)

DOCUMENT_PATH_DERYA = '/Volumes/GoogleDrive/Shared drives/trrrace/Derya Artifact Trrracer/'
FOLDER_ID_DERYA = '1-tPBWWUaf7CzNYRyVOqfZvmYg3I4r9Zg'
DOCUMENT_PATH_JEN = '/Volumes/GoogleDrive/Shared drives/trrrace/Jen Artifact Trrracer/Jen/'
FOLDER_ID_JEN  = '1-SzcYM_4-ezaFaFguQTJ0sOCtW2gB0Rp'
DOCUMENT_PATH_EVO = '/Volumes/GoogleDrive/Shared drives/trrrace/EvoBio Design Study/'
FOLDER_ID_EVO = '120QnZNEmJNF40VEEDnxq1F80Dy6esxGC'

def json_serial(obj):
    if isinstance(obj, datetime.datetime):
        serial = obj.isoformat()
        return serial

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
    return "nothing happening"

#/get_google_comments/EvoBio Design Study
@app.route("/get_google_comments/<string:path>")
def get_google_comments(path):

    if path == 'EvoBio Design Study':
        final_path = DOCUMENT_PATH_EVO
        folder_id = FOLDER_ID_EVO
        
    elif path == 'Jen':
        final_path = DOCUMENT_PATH_JEN
        folder_id = FOLDER_ID_JEN
    else:
        final_path = DOCUMENT_PATH_DERYA
        folder_id = FOLDER_ID_DERYA

    goog_ids = []

    blob_f = open(final_path + "goog_data.json", 'r')
    goog = json.load(blob_f)

    comms = get_comments_for_all_goog(final_path, goog.keys())

    outfile = open(final_path +'goog_comms.json', 'w')
    json.dump(comms, outfile)

    return comms

@app.route("/parse_eml/<string:name>/<string:path>")
def parse_eml(name, path):

    if path == 'EvoBio Design Study':
        final_path = DOCUMENT_PATH_EVO
        
    elif path == 'Jen':
        final_path = DOCUMENT_PATH_JEN
        
    else:
        final_path = DOCUMENT_PATH_DERYA

    with open(final_path + name, 'rb') as fp:
        policy500 = policy.default.clone(max_line_length=500)
        msg = parser.BytesParser(policy=policy500).parse(fp)
        
    text = msg.get_body(preferencelist=('plain')).get_content()

    return text

@app.route("/create_google_file/<string:name>/<string:type>/<string:arttype>/<string:entrynum>/<string:path>")
def create_google(name, type, arttype, entrynum, path):

    if path == 'EvoBio Design Study':
        final_path = DOCUMENT_PATH_EVO
        folder_id = FOLDER_ID_EVO
        
    elif path == 'Jen':
        final_path = DOCUMENT_PATH_JEN
        folder_id = FOLDER_ID_JEN
    else:
        final_path = DOCUMENT_PATH_DERYA
        folder_id = FOLDER_ID_DERYA

    
    goog_id = create_google_file(name, type, folder_id)

    blob_f = open(final_path + "trrrace.json", 'r')
    trrrace = json.load(blob_f)


    extension = "gdoc" if type == "document" else "gsheet"

    blob = {}
    blob['title'] = f'{name}.{extension}'
    blob["fileId"] = goog_id
    blob["fileType"] = extension
    blob["artifactType"] = arttype

    trrrace["entries"][int(entrynum)]["files"].append(blob)

    outfile = open(final_path +'trrrace.json', 'w')
    json.dump(trrrace, outfile)

    return trrrace

@app.route('/extract_emphasized_from_google/<string:path>')
def extract_emphasized_from_google(path):

    if path == 'EvoBio Design Study':
        final_path = DOCUMENT_PATH_EVO
    elif path == 'Jen':
        final_path = DOCUMENT_PATH_JEN
    else:
        final_path = DOCUMENT_PATH_DERYA

    outfile = open(final_path+'goog_data.json', 'r')
    goog_data = json.load(outfile)
    
    em_text = {}
    for key in goog_data:
        
        test = goog_data[key].get('body').get('content')
        
        em_text[key] = get_emphasized_text(test, key)

    outfile = open(final_path+'goog_em.json', 'w')
    json.dump(em_text, outfile)
    return em_text

#/get_all_goog_blobs/EvoBio Design Study
@app.route('/get_all_goog_blobs/<string:path>')
def get_all_goog_blobs(path):

    if path == 'EvoBio Design Study':
        final_path = DOCUMENT_PATH_EVO
        
    elif path == 'Jen':
        final_path = DOCUMENT_PATH_JEN
    else:
        final_path = DOCUMENT_PATH_DERYA

    print('FINAL PATH',final_path)
    # DOCUMENT_PATH_DERYA if path == 'derya' DOCUMENT_PATH_EVO elif path === '' else DOCUMENT_PATH_JEN 
   
    blob = extract_entry_text_to_blobs(final_path, 'google')

    return jsonify(blob)

#/get_all_sig_blobs/EvoBio Design Study
@app.route('/get_all_sig_blobs/<string:path>')
def get_all_sig_blobs(path):

    if path == 'EvoBio Design Study':
        final_path = DOCUMENT_PATH_EVO
        
    elif path == 'Jen':
        final_path = DOCUMENT_PATH_JEN
    else:
        final_path = DOCUMENT_PATH_DERYA

    print('FINAL PATH',final_path)
    # DOCUMENT_PATH_DERYA if path == 'derya' DOCUMENT_PATH_EVO elif path === '' else DOCUMENT_PATH_JEN 
   
    blob = extract_entry_text_to_blobs(final_path, 'text')

    return jsonify(blob)
    
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
    blob = extract_entry_text_to_blobs(DOCUMENT_PATH, make_blob_for_google_files)

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
        
    
#http://127.0.0.1:5000/parse_links/EvoBio Design Study
@app.route("/parse_links/<string:path>")
def parse_links(path):

    # if path == 'EvoBio Design Study':
    #     final_path = DOCUMENT_PATH_EVO
        
    # elif path == 'Jen':
    #     final_path = DOCUMENT_PATH_JEN
        
    # else:
    #     final_path = DOCUMENT_PATH_DERYA

    extract_links_from_pdf(DOCUMENT_PATH_EVO)

          

if __name__ == "__main__":
    app.run(port=5000)