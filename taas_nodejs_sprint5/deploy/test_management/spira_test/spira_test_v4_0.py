import urllib.request
import json
import sys
import socket
import time
from underscore import _

class spira_test:
	"""intialize spiratest connection information

	Args:
		project_ID(str): id of the project which user want upload report into (high privilege)
		project_Name (str): name of the project which user want upload report into
		host (str): ip or url without (http://) of target spiratest server
		port (int): port number or None for default port
		username (str): login information
		api_key (str): login information
	"""
	def __init__(self, project_ID, project_Name, host, port, username, api_key):
		self.host = host
		self.urlprefix = 'http://'+self.host
		if(port is not None):
			self.port = port
			self.urlprefix += ':' + self.port
		self.headers = {
			'Content-Type': 'application/json',
			'accept': 'application/json',
			'username' : username,
			'api-key' : api_key
		}
		if(project_ID):
			self.project_id = int(project_ID)
		else:
			self.project_id = self.getProjectIdByProjectName(project_Name)
		

	def connectSpiraTest(self, url, message, dict_post_data):
		"""
		This function handles every connection to spiratest and handle error except httperror

	Args:
		url (str): complete url of rest api of target server
		message (str): it is for reminding user where the error happens.
		dict_post_data (dict): it will be sent as json object to target server

	Returns:
		object (json): return contents in object depend on url

	""" 

		if(dict_post_data is None):
			req = urllib.request.Request(url, None, self.headers)
		else:
			req = urllib.request.Request(url, json.dumps(dict_post_data).encode('utf-8'), self.headers)
		try:
			response = urllib.request.urlopen(req,timeout=10)
			return json.loads(response.read().decode('utf-8'))
		except urllib.error.HTTPError as err:
			if(err.read().decode('utf-8').find('Access is denied.') != -1):
				print('[Error] SpiraTest: Access denied while ' + message)
			else:
				print('[Error] SpiraTest: %s while %s' % (str(err), message))
			sys.exit(0)
		except urllib.error.URLError as err:
			if(type(err.reason) is socket.timeout):
				print('[Error] SpiraTest: Connection timed out while %s, please check host and port is correct.' % message)
			else:
				print('[Error] SpiraTest: %s while %s' % (str(err), message))
			sys.exit(0)
		except:
			print("[Error] SpiraTest: An error occures while %s" % message)
			print("[Error] SpiraTest: Unexpected error:", sys.exc_info()[0])
			sys.exit(0)

	def createNewTestRun(self, test_run_contents):
		"""create a new test run in target server

	Args:
		test_run_contents(dict): it contains all the elements necessary in creating a test run
	"""
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/projects/' + str(self.project_id) + '/test-runs/record'
		return_data = self.connectSpiraTest(url, 'creating a new test run', test_run_contents)

	def getUserId(self):
		"""get user id from target server

		Returns:
			userId (int): user id depends on username and api-key
	"""
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/users'
		return_data = self.connectSpiraTest(url, 'getting user\'s information', None)
		return return_data['UserId']

	def getProjectIdByProjectName(self, project_name):
		"""get project id from target server

		Args:
			project_name(str): find the same project name in server and return its id

		Returns:
			projectId (int): project id depends on project name

	"""
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/projects'
		return_data = self.connectSpiraTest(url, 'getting project', None)
		projectId = None
		for project_data in return_data:
			if(project_data['Name'] == project_name):
				projectId = project_data['ProjectId']
				break
		if(projectId is None):
			print('[Error] SpiraTest: Can not find project. Probably user is not authenticated or project is not exist.')
			sys.exit(0)
		return projectId

	def getTestCaseCount(self):
		"""get testcase amount of current project from target server

		Returns:
			testCaseCount (int): amount of testcases

	"""
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/projects/' + str(self.project_id) + '/test-cases/count'
		test_cases_count = self.connectSpiraTest(url, 'getting test cases count', None)
		return test_cases_count
	def getTestCaseFolders(self):
		"""get all test case folders of current project from target server

		Returns:
			objects (json array): detail of test case folders

	"""
		test_cases_count = self.getTestCaseCount()
		#In database of spiratest v4, test case folders is mixed with test cases, so we need to get all test cases and filter the result.
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/projects/' + str(self.project_id) + '/test-cases/search?starting_row=1&number_of_rows=' + str(test_cases_count)
		test_case_folders = self.connectSpiraTest(url, 'getting test cases', None)
		def findFolder(test_case):
			return test_case['Folder']		
		return _.filter(test_case_folders, findFolder)
		

	def getTestCasesByFolder(self, test_case_folder_id):
		"""get all test case in test_case_folder from target server
	
		Args:
			test_case_folder_id(int): test case folder id

		Returns:
			objects (json array): detail of test cases in test case folder

	"""
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/projects/' + str(self.project_id) + '/test-folders/' + str(test_case_folder_id) + '/test-cases'
		test_cases = self.connectSpiraTest(url, 'getting test cases by folder id', None)
		return test_cases

	def createTestCaseFolder(self, parent_folder_id, new_subfolder_name):
		"""create test case folder in given folder
	
		Args:
			parent_folder_id(int): test case folder's id  which you want to create test case folder in
			new_subfolder_name(str): the name of test case folder which you want to create

		Returns:
			information object of the testcase folder which is just created in spiratest server, but IndentLevel is strangely None

	"""
		current_timestamp = str(int(time.time() * 1000))
		json = {
			"ConcurrencyDate": "/Date("+ current_timestamp +")/",
			"ProjectId": self.project_id,
			"CreationDate":"/Date("+ current_timestamp +")/",
			"LastUpdateDate":"/Date("+ current_timestamp +")/",
			"Name": new_subfolder_name,
			"OwnerId": self.getUserId()
		}
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/projects/' + str(self.project_id) + '/test-folders?parent_test_folder_id=' + str(parent_folder_id)
		new_test_case_folder = self.connectSpiraTest(url, 'create a new test case folder in TaaS folder', json)
		return new_test_case_folder

	def createTestCase(self, parent_folder_id, new_test_case_name):
		"""create test case in given folder
	
		Args:
			parent_folder_id(int): test case folder's id  which you want to create test case in
			new_test_case_name(str): the name of test case which you want to create

		Returns:
			information object of the testcase which is just created in spiratest server, but IndentLevel is strangely None

	"""
		current_timestamp = str(int(time.time() * 1000))
		json = {
			"ConcurrencyDate": "/Date("+ current_timestamp +")/",
			"ProjectId": self.project_id,
			"CreationDate":"/Date("+ current_timestamp +")/",
			"LastUpdateDate":"/Date("+ current_timestamp +")/",
			"Name": new_test_case_name,
			"OwnerId": self.getUserId()
		}
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/projects/' + str(self.project_id) + '/test-cases?parent_test_folder_id=' + str(parent_folder_id)
		new_test_case = self.connectSpiraTest(url, 'create a new test case', json)
		return new_test_case

	def checkReleaseIDCorrect(self, releaseID):
		"""get all releases, check if release id is exist in them and return id of the corresponding release
	
		Args:
			releaseID(int): release id which needs to be checked

		Returns:
			releaseID(int): release id if release id is exist in the releases

	"""
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/projects/' + str(self.project_id) + '/releases'
		return_data = self.connectSpiraTest(url, 'getting all release versions', None)
		def checkReleaseID(release, index, all):
			return release['ReleaseId'] == int(releaseID)
		foundRelease = _.find(return_data, checkReleaseID)
		if(foundRelease is not None):
			return releaseID
		print('[Error] SpiraTest: The release corresponding to the given Release ID %s is not found.' % releaseID)
		sys.exit(0)

	def getReleaseByVersion(self, releaseVersionNumber):
		"""get all releases and return the corresponding release with version number, if not exist, then return None 
	
		Args:
			releaseVersionNumber(string): release version which needs to be checked

		Returns:
			release(obj): release if release version is exist in the releases, otherwise it will return None.

	"""
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/projects/' + str(self.project_id) + '/releases'
		return_data = self.connectSpiraTest(url, 'getting all release versions', None)
		def checkReleaseID(release, index, all):
			return release['VersionNumber'] == releaseVersionNumber
		foundRelease = _.find(return_data, checkReleaseID)
		return foundRelease

	def CreateNewRelease(self, releaseName, releaseVersionNumber):
		"""create a new release to current project and set name and version number as given parameters
	
		Args:
			releaseName(string): new release's name and version number

		Returns:
			releaseID(int): release id of new release

	"""
		current_timestamp = str(int(time.time() * 1000))
		json = {
			"ConcurrencyDate": "/Date("+ current_timestamp +")/",
			"ProjectId": self.project_id,
			"CreationDate":"/Date("+ current_timestamp +")/",
			"StartDate": "/Date("+ current_timestamp +")/",
			"EndDate": "/Date("+ current_timestamp +")/",
			"LastUpdateDate":"/Date("+ current_timestamp +")/",
			"Name": releaseName,
			"VersionNumber": releaseVersionNumber,
			"OwnerId": self.getUserId()
		}
		url = self.urlprefix + '/SpiraTest/Services/v4_0/RestService.svc/projects/' + str(self.project_id) + '/releases'
		return_data = self.connectSpiraTest(url, 'create a new release version', json)
		print('[Auto] SpiraTest: Create release successfully.')
		return return_data["ReleaseId"]