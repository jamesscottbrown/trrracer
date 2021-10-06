import spacy 
from collections import Counter
nlpS = spacy.load("en_core_web_sm")

def get_tokens(text):
    doc = nlpS(text)
    words = [token.lemma_ for token in doc if token.is_stop != True and token.is_punct != True and "\n" not in token.text]
    word_freq = Counter(words)
    common_words = word_freq.most_common(10)
    
    holder = []
    for w in common_words:
        data = {}
        data["word"] = w[0]
        data["count"] = w[1]
        holder.append(data)
       
    return holder
