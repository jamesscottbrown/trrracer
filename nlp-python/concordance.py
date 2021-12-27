import os
import sys
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import word_tokenize
import nltk
import spacy
import string

from spacy.lang.en import English
from spacy.matcher import PhraseMatcher

STOP = stopwords.words('english')
EXCLUDE_PUNCT = set(string.punctuation)
LEMMA = WordNetLemmatizer()

def combine_file_blob(entry_array):
    key_keep = []
    for en in entry_array['entries']:
  
        enob = {}
        enob['title'] = en['title']
        # enob['file-array'] = []
        wumbo_blob = ""
        for file in en['file-array']:
            fiOb = {}
            fiOb['title'] = file['title']
            enob['index'] = en['index']

            if len(file['blob']) > 2:
                wumbo_blob = wumbo_blob + file['blob']
            else:
                wumbo_blob = wumbo_blob + "null"

        key_keep.append(wumbo_blob)

    return key_keep

def key_concord(keywords, blob):
   
    nlp = English()
    
    nlp.add_pipe('sentencizer')
    doc = nlp(blob)

    key_array = []

    for k in keywords:
        test = k[0].split(' ')
        if len(test) > 1:
            if test[0] != test[1]:
                k_ob = {}
                k_ob['key'] = k[0]
                k_ob['freq'] = k[1]
                k_ob['matches'] = []

                for sent in doc.sents:
                  
                    if test[0] in str(sent.text) and test[1] in str(sent.text):
                        k_ob['matches'].append(str(sent.text))

                key_array.append(k_ob)

        elif len(test) == 1:
            k_ob = {}
            k_ob['key'] = k[0]
            k_ob['freq'] = k[1]
            k_ob['matches'] = []

            matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
            patterns = [nlp.make_doc(name) for name in [k[0]]]
            matcher.add("Names", patterns)

            for sent in doc.sents:
                for match_id, start, end in matcher(nlp(sent.text)):
                    if nlp.vocab.strings[match_id] in ["Names"]:
                        if str(sent.text) not in k_ob['matches']:
                            k_ob['matches'].append(str(sent.text))

            key_array.append(k_ob)

    return key_array
    
#     print(i, tfj['entry_keywords'][i], temp_blob)
#     if tfj['entry_keywords'][i]['yak'] != 'null' and len(tfj['entry_keywords'][i]['yak']) > 1:
#         for y in tfj['entry_keywords'][i]['yak']:
            
#             con = {}
#             con["term"] = y[0]
#             con['frequency'] = y[1]
#             con["entry_matches"] = []
            
#             matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
#             patterns = [nlp.make_doc(name) for name in [y[0]]]
#             matcher.add("Names", patterns)

#             doc = nlp(temp_blob['blob'])
       
#             for sent in doc.sents:
#                 for match_id, start, end in matcher(nlp(sent.text)):
#                     if nlp.vocab.strings[match_id] in ["Names"]:

#                         match_ob = {}
#                         match_ob["concept"] = str(sent[start:end])
#                         match_ob["concord"] = str(sent.text)
#                         con["entry_matches"].append(match_ob)

#             temp_tf_ob['yak'].append(con)
#     tempKeep.append(temp_tf_ob)
        
# tempKeep



