import os
import sys
import re


def analysis(file):
    list_file_name = []
    list_file_latlng = []
    String = ""
    print file
    for x in xrange(1, len(file) - 1):
#        if (cmp(file[x][3:9], "<name>") == 0):
#            file[x] = file[x].replace('<name>', '').replace('</name>', '')
#            file[x] = file[x].replace('\t', '')
#            list_file_name.append(file[x])
#        if (cmp(file[x][4:17], "<coordinates>") == 0):
#            file[x] = file[x].replace('<coordinates>', '').replace(
#                ',0</coordinates>', '')
#            file[x] = file[x].replace('\t', '')
#            list_file_latlng.append(", new LatLng(" + file[x] + ")")
#            String = String + ", new LatLng(" + file[x] + ")"

    return String


f = open("fculocation.kml", mode='r')
output = open("output.txt", 'w')
output.write(analysis(f.readlines()))

f.close()
output.close()
