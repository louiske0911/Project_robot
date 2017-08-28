""" Utility for specifying the versions of the targets to install

Usage: python apply_version.py [VERSION_DB_FILE] [TEMPLATE_FILE] [OUTPUT_FILE]
Example: python apply_version.py slave.v1.json Dockerfile.slave_basic.template Dockerfile.slave_baic
"""
import json
import re
import sys
import traceback


def read_mapping(mapping_file):
    return json.load(mapping_file)


def apply_mapping(template, mapping):
    def get_mapping(match_obj):
        category = match_obj.group(1)
        if len(category) == 0:
            category = '[apt]'  # default category
        category = category[1:-1]  # remove square braces
        target = match_obj.group(2)

        try:
            result = target + mapping[category][target]
            return result
        except KeyError:
            sys.stderr.write('Version info for %s is not found under category [%s]\n' %
                             (target, category))
            return target

    translated = re.sub(r'{<\s*(\[\S+\]|)\s*(\S+)\s*>}', get_mapping, template,
                        count=0, flags=re.MULTILINE)
    return translated


def main(version_db_file, template_file, output_file):
    template = template_file.read()
    slave_lib_path_mapping = read_mapping(version_db_file)
    translated = apply_mapping(template, slave_lib_path_mapping)
    output_file.write(translated)


def print_usage():
    sys.stderr.write('Usage: python apply_version.py [VERSION_DB_FILE] [TEMPLATE_FILE] [OUTPUT_FILE]\n')


if __name__ == '__main__':
    try:
        version_db_file_path = sys.argv[1]
        template_file_path = sys.argv[2]
        output_file_path = sys.argv[3]
        with open(version_db_file_path, 'rU') as _version_db_file, \
                open(template_file_path, 'rU') as _template_file, \
                open(output_file_path, 'w') as _output_file:
            main(_version_db_file, _template_file, _output_file)
    except IndexError:
        sys.stderr.write(traceback.format_exc())
        sys.stderr.write('\n\n')
        print_usage()
        sys.exit(1)
