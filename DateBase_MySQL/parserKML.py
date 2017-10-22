import os
import sys
import re


def analysis(file):
    list_file_name = []
    list_file_latlng = []

    for x in xrange(1, len(file) - 1):
        if (cmp(file[x][3:9], "<name>") == 0):
            file[x] = file[x].replace('<name>', '').replace('</name>', '')
            # print (file[x])
            list_file_name.append(file[x])

        if (cmp(file[x][4:17], "<coordinates>") == 0):
            file[x] = file[x].replace('<coordinates>', '').replace(
                ',0</coordinates>', '')
            print (file[x].strip())
            list_file_latlng = ", new LatLng(" + file[x].strip() + ")"
    return list_file_latlng


f = open("fculocation.kml", mode='r')
output = open("output.txt", mode='w')
print (analysis(f.readlines()))

output.write(analysis(f.readlines()))
f.close()

