import testlink as PythonTestLink
from testlink.testlinkerrors import TLConnectionError
from testlink.testlinkerrors import TLResponseError
from testlink.testlinkerrors import TLArgError
from testlink.testlinkerrors import TLAPIError
import json
import sys
import socket
import time
from underscore import _

class testlink:
	"""intialize testlink connection information

	Args:
		url (str): complete url of xmlrpc api of target server
		api_key (str): Personal API access key of user
	"""
	def __init__(self, url, api_key):
		self.tls = PythonTestLink.TestLinkHelper().connect(PythonTestLink.TestlinkAPIClient)
		self.tls.__init__(url, api_key)
		#self.tls.doesUserExist()

	def handlingFunction(self,function,*args):
		"""This function excutes function and handles error with print and exit

	Args:
		function (function): function to be executed
		*args (args): args which want to be sent into function

	"""
		try:
			return function(*args)
		except TLResponseError as err:
			print('[Error] TestLink:',err)
			sys.exit(0)
		except TLConnectionError as err:
			print('[Error] TestLink:',err)
			sys.exit(0)
		except TLAPIError as err:
			print('[Error] TestLink:',err)
			sys.exit(0)
		except TLArgError as err:
			print('[Error] TestLink:',err)
			sys.exit(0)
		except:
			print('[Error] TestLink: Undefined error.')
			sys.exit(0)

	def getProjectId(self, project_name):
		"""get project id by project name

	Args:
		project_name (str): project name

	Returns:
		project_id(int): project id
	"""
		projects = self.handlingFunction(self.tls.getProjects)
		def findProject(project, index, all):
			return project['name'] == project_name
		project = _.find(projects, findProject)
		if project is None:
			print('[Error] TestLink: Can not find project named "'+ project_name +'".')
			sys.exit(0)
		return int(project['id'])

	def getTestPlanId(self, project_id, testplan_name):
		"""get testplan id by project id and testplan name

	Args:
		project_id (int): project id
		testplan_name (str): testplan name

	Returns:
		testplan_id(int): testplan id
	"""
		testplans = self.handlingFunction(self.tls.getProjectTestPlans, project_id)
		def findTestPlan(testplan, index, all):
			return testplan['name'] == testplan_name
		testplan = _.find(testplans, findTestPlan)
		if testplan is None:
			print('[Error] TestLink: Can not find testplan named "'+ testplan_name +'".')
			sys.exit(0)
		elif not(int(testplan['active'])):
			print('[Error] TestLink: Testplan "'+ testplan_name +'" is inactive')
			sys.exit(0)
		return int(testplan['id'])

	def getBuildId(self, testplan_id, build_name):
		"""get Build id by testplan id and build name

	Args:
		testplan_id (int): testplan id
		build_name (str): build name

	Returns:
		build_id(int): build id
	"""
		builds = self.handlingFunction(self.tls.getBuildsForTestPlan, testplan_id)
		def findBuild(build, index, all):
			return build['name'] == build_name
		build = _.find(builds, findBuild)
		if build is None:
			print('[Error] TestLink: Can not find build named "'+ build_name +'".')
			sys.exit(0)
		elif not(int(build['active'])):
			print('[Error] TestLink: Build "'+ build_name +'" is not active.')
			sys.exit(0)
		elif not(int(build['is_open'])):
			print('[Error] TestLink: Build "'+ build_name +'" is not opened.')
			sys.exit(0)
		return int(build['id'])

	def getPlatformId(self, testplan_id, platform_name):
		"""get platform id by testplan id and platform name

	Args:
		testplan_id (int): testplan id
		platform_name (str): platform name

	Returns:
		platform_id(int): platform id
	"""
		platforms = self.handlingFunction(self.tls.getTestPlanPlatforms, testplan_id)
		def findPlatform(platform, index, all):
			return platform['name'] == platform_name
		platform = _.find(platforms, findPlatform)
		if platform is None:
			print('[Error] TestLink: Can not find platform named "'+ platform_name +'".')
			sys.exit(0)
		return int(platform['id'])

	def getTestCaseSuiteId(self,testplan_id, suite_name, parent_Id):
		"""get test case suite id by testplan id and test case suite name and parent test case suite id

	Args:
		testplan_id (int): testplan id
		suite_name (str): test case suite name
		parent_id (int): parent test case suite id

	Returns:
		testcase_suite_id(int): test case suite id
	"""
		suites = self.handlingFunction(self.tls.getTestSuitesForTestPlan, testplan_id)
		def findSuite(suite, index, all):
			return suite['name'] == suite_name and int(suite['parent_id']) == parent_Id
		suite = _.find(suites, findSuite)
		if suite is None:
			print('[Error] TestLink: Can not find test case suite named "'+ suite_name +'" at first level of project.')
			sys.exit(0)
		return int(suite['id'])

	def getTestCaseSuites(self,testplan_id, parent_Id):
		"""get test case suites by testplan id and parent test case suite id

	Args:
		testplan_id (int): testplan id
		parent_id (int): parent test case suite id

	Returns:
		testcase_suites(dict array): detail of test case suites
	"""
		suites = self.handlingFunction(self.tls.getTestSuitesForTestPlan, testplan_id)
		def findSuite(suite):
			return int(suite['parent_id']) == parent_Id
		return _.filter(suites, findSuite)

	def getTestCases(self, suite_id):
		"""get test cases by parent test case suite id

	Args:
		suite_id (int): parent test case suite id

	Returns:
		testcases(dict array): detail of test cases
	"""
		return self.handlingFunction(self.tls.getTestCasesForTestSuite, suite_id, True, 'simple')

	def testCaseExcute(self, testcase_id, testplan_id, status, build_name, notes, platform_id):
		"""execute the testcase and upload report

	Args:
		testcase_id (int): parent test case suite id
		testplan_id (int): testplan id
		status(char): running status. 'p' for pass, 'f' for fail
		build_name: release name
		notes(str): running message
		platform_id: platform id

	"""
		try:
			self.tls.reportTCResult(testcase_id, testplan_id, build_name, status, notes, platformid=platform_id)
		except TLResponseError as err:
			print('[Error] TestLink:',err)
			sys.exit(0)
		except TLConnectionError as err:
			print('[Error] TestLink:',err)
			sys.exit(0)
		except TLAPIError as err:
			print('[Error] TestLink:',err)
			sys.exit(0)
		except TLArgError as err:
			print('[Error] TestLink:',err)
			sys.exit(0)
		except:
			print('[Error] TestLink: Undefined error.')
			sys.exit(0)
