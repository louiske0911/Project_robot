"""
Utility for generating TaaS configuration
"""

__author__ = 'Kuan-Li Peng'

import getopt, sys, traceback

# recognized attributes
attr_list = [
        'main_db',
        'jenkins_master',
        'archive_file_server',
        'archive_file_listing_server',
        'resource_management_server',
        'host_address'
        ]


def main():
    try:
        # parse commandline arguments
        opts, args = getopt.getopt(
                sys.argv[1:],
                '',  # short options not supported
                [attr+'=' for attr in attr_list]  # long options
                )
    except getopt.GetoptError as err:
        sys.stderr.write('Argument parsing error:\n')
        sys.stderr.write(traceback.format_exc(None, err))
        sys.stderr.write('\nTerminating...\n')
        sys.exit(2)

    # print config in JSON format
    print('{')
    for attr, val in opts:
        print('  "%s": "%s",' % (attr[2:], val))
    print('}')


if __name__ == '__main__':
    main()
