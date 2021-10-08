from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
import gensim
from gensim.utils import simple_preprocess
import string

STOP = stopwords.words('english')
# STOP = set(STOPLIST)

EXCLUDE_PUNCT = set(string.punctuation)
LEMMA = WordNetLemmatizer()

def remove_stopwords(texts):
    return [[word for word in simple_preprocess(str(doc)) 
             if word not in STOP] for doc in texts]

def clean(doc):
    
    NEWSTOP = ["yeah", "like", "pre", "post"]
    STOP.extend(NEWSTOP)
   
    stop_free = " ".join([i for i in doc.lower().split() if i not in STOP])
    
    punc_free = ''.join(ch for ch in stop_free if ch not in EXCLUDE_PUNCT)
    normalized = " ".join(LEMMA.lemmatize(word) for word in punc_free.split())   
    
    return normalized

