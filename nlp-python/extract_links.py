# N.B. make sure  to install the "pdfminer.six" package, rather than "pdfminer"
# (pdfminer was the original  package, but was forked due to being unmaintained)


# These pages had useful hints when writing this script:
# starting point that needed modification to work: https://stackoverflow.com/a/49614726
# contained the hint to use resolve1 rather than .resolve(): https://github.com/pdfminer/pdfminer.six/issues/531

import json
import traceback 

from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.converter import PDFPageAggregator
from pdfminer.layout import LAParams
from pdfminer.pdftypes import resolve1

def extract_links_from_pdf(path):
    print('PATH',path)
    links = []
    with open(path + "paper_2020_insights.pdf", "rb") as fp:
        parser = PDFParser(fp)
        doc = PDFDocument(parser)
        parser.set_document(doc)

        if not doc.is_extractable:
            print(f"File is not extractable")

        rsrcmgr = PDFResourceManager()
        laparams = LAParams()
        device = PDFPageAggregator(rsrcmgr, laparams=laparams)
        interpreter = PDFPageInterpreter(rsrcmgr, device)

        for i, page in enumerate(PDFPage.create_pages(doc)):
            interpreter.process_page(page)

            print('pageeeeeee',page.mediabox)
            print('___________________________________')

            if page.annots:
                for annotation in page.annots:
                    annotationDict = resolve1(annotation)

                    try:
                        # Skip over any annotations that are not links
                        if str(annotationDict.get("Subtype")) != "/'Link'":
                            continue

                        position = annotationDict["Rect"]
                        uriDict = annotationDict["A"]

                        # skip internal /'GoTo' links to figures/sections
                        if str(uriDict["S"]) != "/'URI'":
                            continue

                        # extract URLs, escaping any spaces
                        uri = uriDict["URI"].decode("utf8").replace(" ", "%20")

                        # skip URLs that aren't to a trrrace view
                        if "https://vdl.sci.utah.edu/trrrace/" not in uri:
                            continue

                        print('URI DICT', annotationDict, uriDict)

                        links.append({"position": position, "url": uri, "page": i + 1, "pdf-dim": page.mediabox})
                        
                    except Exception as e:
                        traceback.print_exc()

    with open("links.json", "w") as fp:
        json.dump(links, fp, indent=4)
    
    return links

