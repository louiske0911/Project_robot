import testlinkapi
import time
import PythonHtmlParser
import sys
from underscore import _
from pprint import pprint as p


def main():
	"""parse html and send all report to testlink server

	Args:
		reportHTML (str): html to be parsed
		api_url (str): url of testlink server
		api_key (str): Personal API access key of user
		project_name (str): project name
		testplan_name(str): testplan name
		build_name (str): build name
		platform_name (str): platform name
		root_suite_name (str): test case suite name

	"""

	reportHTML = sys.argv[1]
	api_url = sys.argv[2]
	api_key = sys.argv[3]
	project_name = sys.argv[4]
	testplan_name = sys.argv[5]
	build_name = sys.argv[6]
	platform_name = sys.argv[7]
	root_suite_name = sys.argv[8]

	report = PythonHtmlParser.PythonHtmlParser(reportHTML)
	result = report.parsePythonUnitTestReport()

	testlink_api = testlinkapi.testlink(api_url, api_key)
	project_id = testlink_api.getProjectId(project_name)
	testplan_id = testlink_api.getTestPlanId(project_id, testplan_name)
	build_id = testlink_api.getBuildId(testplan_id, build_name)
	platform_id = testlink_api.getPlatformId(testplan_id,platform_name)
	root_suite_id = testlink_api.getTestCaseSuiteId(testplan_id,root_suite_name,project_id)
	suites = testlink_api.getTestCaseSuites(testplan_id, root_suite_id)

	def findTestCaseSuite(suite, index, all):
		return suite['name'] == test_case_suite['suite_name']
	def findTestCase(case, index, all):
		return case['name'] == test_case['case_name'] and case['parent_id'] == testlink_suite['id']
	for test_case_suite in result['test_suites']:
		testlink_suite = _.find(suites,findTestCaseSuite)
		if testlink_suite is None:
			print(suites)
			print('[Error] TestLink: Can not find test case suite \'' + test_case_suite['suite_name'] + '\'')
		else:
			testcases = testlink_api.getTestCases(int(testlink_suite['id']))
			for test_case in test_case_suite['test_cases']:
				testlink_test_case = _.find(testcases, findTestCase)
				if testlink_test_case is None:
					print('[Error] TestLink: Can not find test case \'' + test_case['case_name'] + '\'')
				else:
					status = 'u'
					notes = 'undefined'
					if(test_case['status'] == 'pass'):
						status = 'p'
						notes = 'success'
					elif(test_case['status'] == 'fail'):
						status = 'f'
						notes = test_case['message']
					elif(test_case['status'] == 'error'):
						status = 'f'
						notes = test_case['message']
					testlink_api.testCaseExcute(int(testlink_test_case['id']), testplan_id, status, build_name, notes, platform_id)


if __name__ == "__main__":
	main()
