import yake
import json
import nltk
import re
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import pandas as pd
from concordance import key_concord

def remove_string_special_characters(s):
      
    # removes special characters with ' '
    stripped = re.sub('[^a-zA-z\s]', '', s)
    stripped = re.sub('_', '', stripped)
      
    # Change any white space to one space
    stripped = re.sub('\s+', ' ', stripped)
      
    # Remove start and end white spaces
    stripped = stripped.strip()
    if stripped != '':
            return stripped.lower()


def extract_words_yake(d_b_json):

    keyKeep = []
    for en in d_b_json['entries']:
   
        enob = {}
        enob['title'] = en['title']
       
        wumbo_blob_clean = ""
        wumbo_blob_raw = ""
        for file in en['file-array']:
            fiOb = {}
            fiOb['title'] = file['title']
            enob['index'] = en['index']

            if len(file['blob']) > 2:
                wumbo_blob_raw = wumbo_blob_raw + file['blob']
                test = remove_string_special_characters(file['blob'])
                if test is not None:
                
                    stop_words = set(stopwords.words('english'))
                    your_list = ['think', 'know', '\n', 'pre', 'post', 'PRE', 'POST', 'yeah', 'https', 'httpssitesdukeedudnac', 'researchinteresting']

                    temp = ' '.join([x for 
                            x in nltk.word_tokenize(test) if 
                            ( x not in stop_words ) and ( x not in your_list )])
                    
                    wumbo_blob_clean = wumbo_blob_clean + temp

            language = "en"
            max_ngram_size = 2
            deduplication_thresold = 0.2
            deduplication_algo = 'seqm'
            windowSize = 1
            numOfKeywords = 20

            kw_extractor = yake.KeywordExtractor(lan=language, n=max_ngram_size, dedupLim=deduplication_thresold, dedupFunc=deduplication_algo, windowsSize=windowSize, top=numOfKeywords, features=None)
            keywords = kw_extractor.extract_keywords(wumbo_blob_clean)

            # keyKeep.append(keywords)
            key_array = key_concord(keywords, wumbo_blob_raw)

            enob['keywords'] = key_array
            
            keyKeep.append(enob)

            


    return keyKeep