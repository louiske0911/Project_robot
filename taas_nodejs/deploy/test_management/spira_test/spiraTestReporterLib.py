from underscore import _

def find_TaaS_folder(spira_test_case_folders, target_folder, taas_path):
    """TaaS Folder is the folder user want to put report data in
    this function is used to find TaaS folder in the project

    Args:
        spira_test_case_folders(Objects): testcase folders in the project
        target_folder(string): represents the target testcase folder
        taas_path(array): record the path variation of TaaS folder

    """
    indent = 3
    #last_folder is the last folder during searching TaaS folder
    last_folder = None
    #this function is defined for underscore.js to find folder which fits the requirement(Name and indentlevel)
    def __find_TaaS_folder(test_case_folder, key, all):
        return len(test_case_folder['IndentLevel']) == indent and (last_folder is None or last_folder['IndentLevel'] == test_case_folder['IndentLevel'][:indent-3]) and target == test_case_folder['Name']

    #find TaaS folder level by level
    targets = target_folder.split("/")
    for target in targets:
        if(target != ""):
            taas_path[0] += "/" + target
            last_folder = _.find(spira_test_case_folders, __find_TaaS_folder)
            if last_folder is None:
                break
            indent += 3
    return last_folder


def find_testcase_folder(spira_test_api, spira_test_case_folders, TaaS_folder, suppress_level, autocreate, path, current_path, check_update):
    """find the target testcase folder

    Args:
        spira_test_api(Object): initiated spiratest api
        spira_test_case_folders(Objects): testcase folders in the project
        TaaS_folder(Object): the TaaS folder object
        suppress_level(integer): suppress level of folder structure
        autocreate(string): AutoCreateTestCase or NotAutoCreateTestCase
        path(string): xx.xx.xx represents the location of target folder
        current_path(array): record the path variation of target folder
        check_update(array): record if there is any folder created

    """
    targets = path.split('.')
    targets = targets[:len(targets) - suppress_level]
    #last_folder is the last folder dring searching target testcase folder
    last_folder = TaaS_folder

    #this function use defined for underscore.js to find folder which fits the requirement(Name and indentlevel)
    def __find_testcase_folder(test_case_folder, key, all):
        return len(test_case_folder['IndentLevel']) == len(last_folder['IndentLevel']) + 3 and test_case_folder['IndentLevel'][:len(test_case_folder['IndentLevel'])-3] == last_folder['IndentLevel'] and target == test_case_folder['Name']

    #find target folder level by level
    for target in targets:
        last_folder_id = last_folder['TestCaseId']
        #if the folder is just created, its indentlevel will be None, Therefore, next level will automatically create new folder.
        if last_folder['IndentLevel'] is None:
            print('[Warn] SpiraTest: Can not find test case folder \'' + current_path[0] + "/" + target + '\'')
            last_folder = spira_test_api.createTestCaseFolder(last_folder_id, target)
            print('[Auto] SpiraTest: Automatically create test case folder "'+ target +'" in folder "'+ current_path[0] +'"')
        else:
            #find the folder which fits requirement
            last_folder = _.find(spira_test_case_folders, __find_testcase_folder)
            if last_folder is None:
                if autocreate == 'AutoCreateTestCase':
                    print('[Warn] SpiraTest: Can not find test case folder \'' + current_path[0] + "/" + target + '\'')
                    last_folder = spira_test_api.createTestCaseFolder(last_folder_id, target)
                    print('[Auto] SpiraTest: Automatically create test case folder "'+ target +'" in folder "'+ current_path[0] +'"')
                    check_update[0] = True
                elif autocreate == 'NotAutoCreateTestCase':
                    print('[Error] SpiraTest: Can not find test case folder \''+ current_path[0] + "/" + target +'\'')
                    return None
        current_path[0] += "/" + target
    return last_folder


def find_testcase(spira_test_api, target_folder, target, autocreate, current_path):
    """find the target testcase

    Args:
        spira_test_api(Object): initiated spiratest api
        target_folder(Object): represents the target testcase folder
        target(string): target testcase name
        autocreate(string): AutoCreateTestCase or NotAutoCreateTestCase
        current_path(string): path of target testcase

    """
    spira_test_cases = spira_test_api.getTestCasesByFolder(target_folder['TestCaseId'])
    #if Indentlevel of testcase folder is None, it represents that the folder is just created and there will have no testcase in the folder, so we don't need to check the folder.
    if target_folder['IndentLevel'] is None:
        print('[Warn] SpiraTest: Can not find test case \'' + target + '\' in test case folder \''+ current_path +'\'')
        spira_test_case = spira_test_api.createTestCase(target_folder['TestCaseId'], target)
        print('[Auto] SpiraTest: Automatically create test case "'+ target +'" in folder "'+ current_path +'"')
        return spira_test_case

    #if Indentlevel of testcase folder isn't None, we have to check whether there is a testcase fits the requirement.
    def __find_testcase(test_case, key, all):
        return test_case['Name'] == target and len(target_folder['IndentLevel']) == len(test_case['IndentLevel']) - 3 and target_folder['IndentLevel'] == test_case['IndentLevel'][:len(test_case['IndentLevel'])-3]
    spira_test_case = _.find(spira_test_cases, __find_testcase)
    if spira_test_case is None:
        if autocreate == "AutoCreateTestCase":
            print('[Warn] SpiraTest: Can not find test case \'' + target + '\' in test case folder \''+ current_path +'\'')
            spira_test_case = spira_test_api.createTestCase(target_folder['TestCaseId'], target)
            print('[Auto] SpiraTest: Automatically create test case "'+ target +'" in folder "'+ current_path +'"')
            return spira_test_case
        elif autocreate == "NotAutoCreateTestCase":
            print('[Error] SpiraTest: Can not find test case \'' + target + '\' in test case folder \''+ current_path +'\'')
            return None
    else:
        return spira_test_case