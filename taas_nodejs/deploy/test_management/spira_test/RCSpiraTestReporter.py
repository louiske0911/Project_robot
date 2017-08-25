import spira_test_v4_0
import time
import datetime
import RCHtmlParser
import sys
import re
import spiraTestReporterLib
from underscore import _

def main():
    """ Get the dict from parser and put it in spiratest by api.

    Args:
        reportPath(string): html report file path.
        host(string): the ip of spiratest.
        port(number): port number of spiratest.
        projectID(string): id of the project which user want upload report into (high privilege)
        projectName(string): name of the project which user want upload report into
        username(string): username of user who can access project.
        apiKey(number): in brace like {XXX-XX...}.
        targetFolder(string): represents the location of folder which user want to put reports in
        regexPattern(string): regular expression pattern of testcase
        regexReplace(string): regular expression replacement of testcase
        suppresslevel(string): suppress level of folder structure
        autocreateTestcase(string): NotAutoCreateTestCase or AutoCreateTestCase
        releaseSelectedIndex(number): handling release mode choosen by user
        four possibility (varied with releaseSelectedIndex):[
            empty string(string): empty string
            empty string(string): empty string
            ,
            releaseID(number): release id if user want to run the testcase with release version
            empty string(string): empty string
            ,
            releaseVersionNumber(string): release version number if user want to run the testcase with release version
            empty string(string): empty string
            ,
            releaseName(string): release name if user want to create a new release when version number is not found in project
            releaseVersionNumber(number): release version number if user want to create a new release when version number is not found in project
        ]
    """
    reportFileName = sys.argv[1]
    host = sys.argv[2]
    port = sys.argv[3]
    projectID = sys.argv[4]
    projectName = sys.argv[5]
    username = sys.argv[6]
    apiKey = sys.argv[7]
    targetFolder = sys.argv[8]
    regexPattern = sys.argv[9]
    regexReplace = sys.argv[10]
    suppresslevel = int(sys.argv[11])
    autocreateTestcase = sys.argv[12]
    releaseSelectedIndex = int(sys.argv[13])
    releaseID = None
    if releaseSelectedIndex == 0:
        pass
    elif releaseSelectedIndex == 1:
        releaseID = sys.argv[14]
    elif releaseSelectedIndex == 2:
        releaseVersionNumber = sys.argv[14]
    elif releaseSelectedIndex == 3:
        releaseName = sys.argv[14]
        releaseVersionNumber = sys.argv[15]


    report = RCHtmlParser.RCHtmlParser(reportFileName)
    result = report.parseRCUnitTestReport()

    end_timestamp = time.mktime(time.strptime(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "%Y-%m-%d %H:%M:%S"))
    start_timestamp = end_timestamp - float(result['duration'])

    spira_test_api = spira_test_v4_0.spira_test(projectID, projectName, host, port, username, apiKey)
    spira_test_case_folders = spira_test_api.getTestCaseFolders()
    user_id = spira_test_api.getUserId()

    if releaseSelectedIndex == 0:
        pass
    elif releaseSelectedIndex == 1:
        #find if there is any release having same release id.
        releaseID = spira_test_api.checkReleaseIDCorrect(releaseID)
    elif releaseSelectedIndex == 2:
        #find if there is any release having same version number.
        release = spira_test_api.getReleaseByVersion(releaseVersionNumber)
        if release is None:
            print('[Error] SpiraTest: The release corresponding to the given release version number %s is not found.' % releaseVersionNumber)
            sys.exit(0)
        releaseID = release['ReleaseId']
    elif releaseSelectedIndex == 3:
        #Check version number is not exist in releases, if it does, use the original one.
        #If it is not exsit in releases, creating a new release instead. 
        releaseName = sys.argv[14]
        releaseVersionNumber = sys.argv[15]
        release = spira_test_api.getReleaseByVersion(releaseVersionNumber)
        if release is None:
            releaseID = spira_test_api.CreateNewRelease(releaseName, releaseVersionNumber)
        else:
            print('[Warn] SpiraTest: The release corresponding to the given release version number is found, so use the original one instead')
            releaseID = release['ReleaseId']

    TaaS_Path = [""]
    TaaS_test_case_folder = spiraTestReporterLib.find_TaaS_folder(spira_test_case_folders, targetFolder, TaaS_Path)

    if TaaS_test_case_folder is None:
        if TaaS_Path[0] == "":
            print('[Error] SpiraTest: Can not find path "'+ targetFolder +'" in testcase structure of the Project. Please make sure that path is existing and it cannot be rootfolder.')
        else:
            print('[Error] SpiraTest: Can not find path "'+ TaaS_Path[0] +'" in testcase structure of the Project. Please make sure that path is existing.')
        sys.exit(0)
        
    result['test_suites'] = _.sortBy(result['test_suites'], 'suite_name')

    for test_case_folder in result['test_suites']:
        check_update = [False]
        current_path = [TaaS_Path[0]]
        target_testcase_folder = spiraTestReporterLib.find_testcase_folder(spira_test_api, spira_test_case_folders, TaaS_test_case_folder, suppresslevel, autocreateTestcase, test_case_folder['suite_name'], current_path, check_update)
        if(check_update[0]):
            spira_test_case_folders = spira_test_api.getTestCaseFolders()
        if target_testcase_folder is not None:
            for test_case in test_case_folder['test_cases']:
                if regexPattern != "":
                    try:
                        test_case['case_name'] = re.sub(regexPattern, regexReplace, test_case['case_name'])
                    except re.error as err:
                        print('[Warn] SpiraTest: Regular Expression proccessing failed. Instead, Using original testcase name. Error message: '+ err.msg)
                target_testcase = spiraTestReporterLib.find_testcase(spira_test_api, target_testcase_folder, test_case['case_name'], autocreateTestcase, current_path[0])
                if target_testcase is not None:
                    test_contents = {
                        "ConcurrencyDate":"/Date("+ str(int(start_timestamp*1000)) +")/",
                        "EndDate":"/Date("+ str(int(end_timestamp*1000)) +")/",
                        "StartDate":"/Date("+ str(int(start_timestamp*1000)) +")/",
                        "TestCaseId":target_testcase['TestCaseId'],
                        "TesterId":user_id,
                        "RunnerName":"TaaS",
                        "RunnerTestName":target_testcase['Name'],
                    }
                    if releaseID:
                        test_contents.update({"ReleaseId":releaseID})
                    if test_case['status'] == 'pass':
                        test_contents.update({"ExecutionStatusId":2,"RunnerMessage":"Pass"})
                    elif test_case['status'] == 'fail':
                        test_contents.update({"ExecutionStatusId":1,"RunnerMessage":"Fail","RunnerStackTrace":test_case['message']})
                    elif test_case['status'] == 'error':
                        test_contents.update({"ExecutionStatusId":1,"RunnerMessage":"Error","RunnerStackTrace":test_case['message']})
                    else:
                        test_contents.update({"ExecutionStatusId":1,"RunnerMessage":"Undefined Status"})
                    spira_test_api.createNewTestRun(test_contents)

if __name__ == "__main__":
    main()
