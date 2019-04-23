#!/usr/bin/python3

import sys
import csv
import json

filename = sys.argv[1]

data = {}
with open(filename) as csvfile:
    reader = csv.reader(csvfile)
    for ln, line in enumerate(reader):
        if ln > 0:
            data[line[0]] = list(line[i] for i in [1,2,19,18,21,20,25,24,27,26])

if len(sys.argv) > 2:
    for k,v in data.items():
        print('{}: "{}"'.format(v[1], k))
else:
    print("'use strict';")
    print("const FlowerData =")
    print(json.dumps(data))
    print(";")
    print("export {FlowerData};")
