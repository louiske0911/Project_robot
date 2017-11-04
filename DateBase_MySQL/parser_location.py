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
    for x in doc.Document.Folder.Placemark:
        coord = str(x.Point.coordinates).split()
        name = unicode(x.name).encode('utf8')
        coord = coord[0].replace(',0', '').split(',')
        print name
        print coord
        list_latlng.append(", new LatLng(" + coord[1] + ',' + coord[0] + ")")
    return list_latlng


output = open("output.txt", mode='w')
list = analysis()
for item in list:
    output.write("%s\n" % item)
output.close()
