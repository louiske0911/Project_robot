import pip
import sys
from packaging import version
installed_packages = pip.get_installed_distributions()
installed_packages_list = sorted(["%s==%s" % (i.key, i.version)for i in installed_packages])
check_packages = [
	{
		"Name":"coverage",
		"Version":"4.2",
	},{
		"Name":"underscore.py",
		"Version":"0.1.6"
	}
]
checked = [False] * len(check_packages)

for i in range(len(check_packages)):
	for package in installed_packages_list:
		if(package.split("==")[0] == check_packages[i]['Name'] and version.parse(package.split("==")[1]) >= version.parse(check_packages[i]['Version'])):
			checked[i] = True

check_package_pass = True
for i in range(len(check_packages)):
	if not (checked[i]):
		print(check_packages[i]['Name'], check_packages[i]['Version'], 'should be installed')
		check_package_pass = False

if not (check_package_pass):
	print('packages aren\'t installed well, so test exits.')
	sys.exit(0)

import argparse
parser = argparse.ArgumentParser()
parser.add_argument("-p","--path", help="specify where the test runs", dest="path", default="tests")
parser.add_argument('--recursive', dest='recursive', action='store_true')
parser.add_argument('--no-recursive', dest='recursive', action='store_false')
parser.set_defaults(recursive=True)
parser.add_argument('--covhtml', dest='covhtml', action='store_true')
parser.add_argument('--no-covhtml', dest='covhtml', action='store_false')
parser.set_defaults(covhtml=False)
parser.add_argument('--covtext', dest='covtext', action='store_true')
parser.add_argument('--no-covtext', dest='covtext', action='store_false')
parser.set_defaults(covtext=False)
args = parser.parse_args()
args.cov = args.covhtml or args.covtext

import coverage
import os
from pprint import pprint

for root, subdirs, files in os.walk(args.path):
	for file in files:
		filename, fileextend = os.path.splitext(file)
		if(fileextend == ".py"):
			print("\n"+file+"\n")
			if args.cov:
				os.system("python3 -m coverage run --parallel-mode "+root+'/'+file+" -v")
			else:
				os.system("python3 "+root+'/'+file+" -v")

if args.cov:
	os.system("python3 -m coverage combine")
	if args.covhtml:
		os.system("python3 -m coverage html")
	if args.covtext:
		os.system("python3 -m coverage report")
