from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import word_tokenize
import gensim
from gensim.utils import simple_preprocess
import string

STOP = stopwords.words('english')
# STOP = set(STOPLIST)

EXCLUDE_PUNCT = set(string.punctuation)
LEMMA = WordNetLemmatizer()

def remove_stopwords(texts, stop):
    return [[word for word in simple_preprocess(str(doc)) 
             if word not in stop] for doc in texts]

def clean(doc):
    
    NEWSTOP = ["yeah", "like", "pre", "post"]
    STOP.extend(NEWSTOP)

    word_tokens = word_tokenize(doc)
    filtered_sentence = [w for w in word_tokens if not w.lower() in STOP]
    f_too = [w for w in filtered_sentence if not w.lower() in ["yeah", "like", "pre", "post", "okay", "one", "really"]]
    pun = [w for w in f_too if not w in EXCLUDE_PUNCT]
    short = [w for w in pun if not len(w) < 3]
    apo = [w for w in short if not "'" in w]
 
    # filtered_sentence = []
 
    # for w in word_tokens:
    #     if w not in stop_words:
    #         filtered_sentence.append(w)

    # print(apo)
    
    # punc_free = ''.join(ch for ch in stop_free if ch not in EXCLUDE_PUNCT)
    normalized = " ".join(LEMMA.lemmatize(word) for word in apo)   
    
    return normalized

