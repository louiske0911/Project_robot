import os
import sys
import re
from pykml import parser
from os import path

list_latlng = []


def analysis():
    kml_file = path.join('123.kml')
    with open(kml_file) as f:
        doc = parser.parse(f).getroot()
    for x in doc.Document.Folder.Placemark:
        coord = str(x.Point.coordinates).split()
        coord = coord[0].replace(',0', '').split(',')
        list_latlng.append(coord[1] + ',' + coord[0])
        # list_latlng.append(", new LatLng(" + coord[1] + ',' + coord[0] + ")")
        #list_latlng.append("{ \"Lat\":" + "\""+coord[1]+"\"" +','+" \"Lng\":" + "\""+ coord[0] +"\""+ "},")
    return list_latlng


output = open("output.txt", mode='w')
list = analysis()
list = sorted(list)
i = 0
# for item in list:
#     i += 1
# output.write("<Placemark>\n")
# output.write("<name>%d</name>\n" % i)
# output.write("<styleUrl>#icon-503-DB4436-nodesc</styleUrl>\n")
# output.write("<Point>\n")
# output.write("<coordinates>\n")
# output.write("%s" % item)
# output.write("</coordinates>\n")
# output.write("</Point>\n")
# output.write("</Placemark>\n")

output.close()
f = open("num.txt", mode='r')
f = f.readlines()
