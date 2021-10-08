import spacy 
import nltk
from collections import Counter
# Importing Gensim
import gensim
from gensim import corpora

from google_api import goog_auth, goog_doc_start, get_doc_text_by_id
nlpS = spacy.load("en_core_web_sm")

from nltk.corpus import webtext
  
# use to find bigrams, which are pairs of words

from nltk.metrics import BigramAssocMeasures

from doc_clean import LEMMA, STOP, clean


# import nltk
# import ssl

# try:
#     _create_unverified_https_context = ssl._create_unverified_context
# except AttributeError:
#     pass
# else:
#     ssl._create_default_https_context = _create_unverified_https_context

# nltk.download()

def make_blob_for_entry(entries, gdoc_service, document_path):
    entry_blobs = []
    entry_index = 0
    for en in entries:

        blob = {}
        blob["title"] = en["title"]
        blob["index"] = entry_index
        entry_index  += 1
        blob["blob"] = ""

        for f in en["files"]:
            if f["fileType"] == "gdoc" and "fileId" in f:
                text = get_doc_text_by_id(gdoc_service, f["fileId"])
                blob["blob"] = blob["blob"] + text
            
            elif f["fileType"] == "txt":
                file_t = open(document_path + f["title"],'r')
                filelines = list(file_t)
                file_t.close()
                for f in filelines:
                    blob["blob"] = blob["blob"] + f
        # print(blob)
        entry_blobs.append(blob)

    return entry_blobs

def term_freq_for_entry(json_data, gdoc_service, document_path):

    for en in json_data["entries"]:

        blob = ""
        for f in en["files"]:
            if f["fileType"] == "gdoc" and "fileId" in f:
                text = get_doc_text_by_id(gdoc_service, f["fileId"])
                blob = blob + text
            
            elif f["fileType"] == "txt":
                file_t = open(document_path + f["title"],'r')
                filelines = list(file_t)
                file_t.close()
                for f in filelines:
                    blob = blob + f
                # with open(document_path + f["title"]) as text:
                #     lines = text.readLines()
                #     blob = blob + lines

        tok = get_tokens(blob)
        freq = get_top_words(tok)
        # print(freq)
        if len(freq) < 1:
            print(blob)

        en["entry_freq_words"] = freq

    return json_data


def get_tokens(text):
    doc = nlpS(text)
    words = [token.lemma_ for token in doc if token.is_stop != True and token.is_punct != True and "\n" not in token.text]
    return words
    
def get_top_words(words):
    word_freq = Counter(words)
    common_words = word_freq.most_common(10)
    
    holder = []
    for w in common_words:
        data = {}
        data["word"] = w[0]
        data["count"] = w[1]
        holder.append(data)
       
    return holder

def get_frequent_words_all_files(json, gdoc_service, document_path):
    
    for en in json["entries"]:
        
        for f in en["files"]:
            if f["fileType"] == "gdoc" and "fileId" in f:
                text = get_doc_text_by_id(gdoc_service, f["fileId"])
                tok = get_tokens(text)
                freq = get_top_words(tok)
                
                f["freq_words"] = freq
                
            elif f["fileType"] == "txt":
                text = open(document_path + f["title"], 'r')
                blob = text.read()
                tok = get_tokens(blob)
                text.close()
                freq = get_top_words(tok)
                f["freq_words"] = freq

    return json

def concordance(word, text):

    tokens = nltk.word_tokenize(text)
    # tokens = nlpS(text)
     
    # ## Create the text of tokens
    text_tokens = nltk.Text(tokens)
    con_list = text_tokens.concordance_list(word)
    wrap = []
    for c in con_list:
        strang = ' '.join(c.left) + ' ' + ''.join(c.query) + ' '.join(c.right)
        wrap.append(strang)

    # return text_tokens.concordance(word)
    return wrap

def get_concordance_for_concepts(concepts, blob):
    con_wrap_array = []
  
    for con in concepts:
        con_wrap = {}
        con_wrap["concept"] = con["name"]
        con_wrap["concordance_by_entry"] = []
        for b in blob:
           
            bc = {}
            bc["title"] = b["title"]
            bc["matches"] = concordance(con["name"], b["blob"])
            print(bc["matches"])
            con_wrap["concordance_by_entry"].append(bc)

        con_wrap_array.append(con_wrap)

    return con_wrap_array

def collocations_maker(corpus):

    tokens = nltk.word_tokenize(corpus["blob"])
    lemmatized_words = [LEMMA.lemmatize(word) for word in tokens]

    # new_text = nltk.Text(lemmatized_words)

    # print(new_text.collocations())

    bigram_measures = nltk.collocations.BigramAssocMeasures()

    # Ngrams with 'creature' as a member
    creature_filter = lambda *w: len(w) < 2 or w in STOP

    ## Bigrams
    finder = BigramCollocationFinder.from_words(lemmatized_words)
    # only bigrams that appear 3+ times
    finder.apply_freq_filter(2)
    # only bigrams that contain 'creature'
    finder.apply_word_filter(lambda w: len(w) < 3 or w.lower() in STOP)
    # return the 10 n-grams with the highest PMI
    # print (finder.nbest(bigram_measures.likelihood_ratio, 10))
    ngrams = []
    for i in finder.score_ngrams(bigram_measures.likelihood_ratio):
        ngrams.append(i)
        # print(i)

    return ngrams


def run_lda(docs):

    doc_clean = [clean(doc["blob"]).split() for doc in docs]
  
    # Creating the term dictionary of our courpus, where every unique term is assigned an index. 
    dictionary = corpora.Dictionary(doc_clean)
    # Converting list of documents (corpus) into Document Term Matrix using dictionary prepared above.
    doc_term_matrix = [dictionary.doc2bow(doc) for doc in doc_clean]
    # Creating the object for LDA model using gensim library
    lda = gensim.models.ldamodel.LdaModel


    # Running and Trainign LDA model on the document term matrix.
    return lda(doc_term_matrix, num_topics=10, id2word = dictionary, passes=50)
  