""" TaaS Dockerfile generation tool

Usage: python gen_dockerfile.py [TEMPLATE_FILE] [OUTPUT_FILE]
Example: python gen_dockerfile.py Dockerfile.slave_base.template ../Dockerfile.slave_base
"""
import json, os.path, re, sys, traceback

def readMapping(mapping_file_path):
    with open(mapping_file_path, 'rU') as mapping_file:
        return json.load(mapping_file)


def applyMapping(template, mapping):
    def getMapping(match_obj):
        # template unchanged on no matching
        result = mapping.get(match_obj.group(1), match_obj.group(0))
        return result

    translated = re.sub(r'{{\s*([\S]+)\s*}}', getMapping, template,
            count=0, flags=re.MULTILINE)
    return translated


def main(template_file, output_file):
    template = template_file.read()
    slave_lib_path_filename = os.path.join(os.path.dirname(__file__), '../slave_lib_path.json')
    slave_lib_path_mapping = readMapping(slave_lib_path_filename)
    translated = applyMapping(template, slave_lib_path_mapping)
    output_file.write(translated)


def printUsage():
    sys.stderr.write('Usage: python gen_dockerfile.py [TEMPLATE_FILE] [OUTPUT_FILE]\n')


if __name__ == '__main__':
    try:
        template_file_path = sys.argv[1]
        output_file_path = sys.argv[2]
        with open(template_file_path, 'rU') as template_file, \
                open(output_file_path, 'w') as output_file:
            main(template_file, output_file)
    except:
        sys.stderr.write(traceback.format_exc())
        sys.stderr.write('\n\n')
        printUsage()
        sys.exit(1)
