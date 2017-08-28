import sys
import os.path
import unittest


def loadModule(mod_name, src_path):
    """Load a test module from file

    Args:
        mod_name: module name (could be defined by user)
        src_path: test module file path

    Returns:
        test module
    """
    if sys.version_info.major < 3:
        # Python 2
        import imp
        return imp.load_source(mod_name, src_path)
    elif sys.version_info.major == 3 and (3 <= sys.version_info.minor <= 4):
        # Python 3.3 and 3.4
        from importlib.machinery import SourceFileLoader
        return SourceFileLoader(mod_name, src_path).load_module()
    else:
        # Python 3.5+
        import importlib.util
        spec = importlib.util.spec_from_file_location(mod_name, src_path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod


def loadTests(startDir, pattern, testNames=None):
    """Load tests by loading a single test module or by test discovery

    It first attempts to load the test script from file directly if `startDir/pattern`
    refers to a Python script file.
    Otherwise, it loads tests by the Python unit-test test discovery mechanism;
    note that it will not find matching test cases when the test script is not importable.

    Args:
        startDir: root directory for discovering tests or test module
        pattern: file name of test module or a pattern (could contain wild characters) for test discovery
        testNames: (optional) a list of dotted names specifying the test suites, test case classes,
                   or test methods within test case classes;
                   this option is ineffective in test-discovery mode;
                   under Python 3, duplicate test suites/functions may result in errors of calling
                   'NoneType' objects (there is no such a problem under Python 2)

    Returns:
        loaded tests as a test suite
    """
    # attempt to load test by loading module if applicable
    src_path = os.path.join(startDir, pattern)
    if os.path.isfile(src_path):
        try:
            sys.stderr.write('[INFO] Attempt to load test script directly\n')
            mod = loadModule('taas_test_mod', src_path)
            if testNames is None:
                suite = unittest.defaultTestLoader.loadTestsFromModule(mod)
            else:
                suite = unittest.defaultTestLoader.loadTestsFromNames(testNames, mod)
            return suite
        except (ImportError, NotImplementedError) as e:
            sys.stderr.write('[ERROR] ' + str(e) + '\n')

    try:
        # attempt to load tests by discovery
        suite = unittest.defaultTestLoader.discover(startDir, pattern)
        return suite
    except (ImportError, NotImplementedError) as e:
        sys.stderr.write('[ERROR] ' + str(e) + '\n')


def main(startDir, pattern, outFile, testNames=None,
         exit=False, extDocString=False, printError=False, printFailure=False):
    """Main program to run test

    Args:
        startDir: root directory for discovering tests or test module
        pattern: file name of test module or a pattern (could contain wild characters) for test discovery
        outFile: test report file path
        testNames: (optional) a list of dotted names specifying the test suites, test case classes,
                   or test methods within test case classes
        exit: (optional) exit on end of test; the exit code is 0 iff the test was successful;
              it is disabled by default
        extDocString: (optional) enable extended doc string
                      (short description may be located in the second line if the first line is empty);
                      it is disabled by default
        printError: (optional) print errors to stdout at the end of test function, disabled by default
        printFailure: (optional) print failures to stdout at the end of test function, disabled by default
    Returns:
        test result as a unittest.TestResult object, or None when no test is run or the exit option is on
    """
    import HTMLTestRunner

    suite = loadTests(startDir, pattern, testNames)

    if suite is not None:
        with open(outFile, 'wb') as fp:
            runner = HTMLTestRunner.HTMLTestRunner(
                stream=fp,
                title='TaaS Python Unit Test Report',
                ext_docstring=extDocString,
                print_error=printError,
                print_failure=printFailure
            )
            test_result = runner.run(suite)
            if exit:
                sys.exit(not test_result.wasSuccessful())
            return test_result
    else:
        sys.stderr.write('[WARNING] Empty test set; no tests well be run\n')

    return None


if __name__ == '__main__':
    # startDir = 'tests/integration'
    # pattern = '*.py'
    # outfile = 'test_results.html'
    # testNames = '' (optional) a list of dotted names separated by commas
    #                specifying test suites, test case classes, or test methods within test case classes
    # extDocstring = 'false' (optional; enabled only if it equals 'true')
    # printError = 'false' (optional; enabled only if it equals 'true')
    # printFailure = 'false' (optional; enabled only if it equals 'true')
    startDir = sys.argv[1]
    pattern = sys.argv[2]
    outFile = sys.argv[3]
    testNames = [name.strip() for name in sys.argv[4].split(',')] \
        if len(sys.argv) > 4 and sys.argv[4].strip() != '' \
        else None
    extDocString = True if len(sys.argv) > 5 and sys.argv[5].lower() == 'true' else False
    printError = True if len(sys.argv) > 6 and sys.argv[6].lower() == 'true' else False
    printFailure = True if len(sys.argv) > 7 and sys.argv[7].lower() == 'true' else False

    main(startDir, pattern, outFile, testNames=testNames,
         exit=True, extDocString=extDocString, printError=printError, printFailure=printFailure)
