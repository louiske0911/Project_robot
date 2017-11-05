import os
import sys
import re
from pykml import parser
from os import path

list_latlng = []


def analysis():
    kml_file = path.join('./location.kml')
    with open(kml_file) as f:
        doc = parser.parse(f).getroot()

    data = str(doc.Document.Folder.Placemark.LineString.coordinates).split()
    for x in data:
        coord = x.replace(',0', '').split(',')
        list_latlng.append(", new LatLng(" + coord[1] + ',' + coord[0] + ")")
    # for x in doc.Document.Folder.Placemark:
    #     coord = str(x.Point.coordinates).split()
    #     name = unicode(x.name).encode('utf8')
    #     coord = coord[0].replace(',0', '').split(',')
    #     print name
    #     print coord
    #     list_latlng.append(", new LatLng(" + coord[1] + ',' + coord[0] + ")")
    # return list_latlng
    return list_latlng


output = open("output.txt", mode='w')
list = analysis()
i = 0
for item in list:
    i += 1
    print item
    print i
    output.write("%s\n" % item)
    # output.write("<Placemark>\n")
    # output.write("<name>fculct0101</name>\n")
    # output.write("<styleUrl>#icon-503-DB4436-nodesc</styleUrl>\n")
    # output.write("<Point>\n")
    # output.write("<coordinates>\n")
    # output.write("%s" % item)
    # output.write("</coordinates>\n")
    # output.write("</Point>\n")
    # output.write("</Placemark>\n")

output.close()
