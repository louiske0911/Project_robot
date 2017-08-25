import unittest
from unittest.mock import patch
from unittest.mock import MagicMock
from pprint import pprint as p
import sys
import os
import imp
import urllib

spira_test_v4_0 = imp.load_source('spira_test_v4_0', os.path.join(os.path.dirname(__file__), '../../../../deploy/test_management/spira_test/spira_test_v4_0.py'))
spira_test_class = spira_test_v4_0.spira_test

class spira_test(unittest.TestCase):
	@patch.object(spira_test_class, 'getProjectIdByProjectName')
	def test_constructor_normal_case(self,getProjectIdByProjectName):
		getProjectIdByProjectName.return_value = 'fakeID';
		spira_test_api = spira_test_class('5','fakeProjectName', 'fakehost', 'fakeport', 'fakeusername', 'fakeapikey')
		self.assertEqual(spira_test_api.host, 'fakehost')
		self.assertEqual(spira_test_api.port, 'fakeport')
		self.assertEqual(spira_test_api.project_id, 5)
		self.assertEqual(spira_test_api.headers['Content-Type'], 'application/json')
		self.assertEqual(spira_test_api.headers['accept'], 'application/json')
		self.assertEqual(spira_test_api.headers['username'], 'fakeusername')
		self.assertEqual(spira_test_api.headers['api-key'], 'fakeapikey')

	@patch('urllib.request')
	def test_connectSpiraTest_normal_case(self, request):
		request.Request = MagicMock()
		request.Request.return_value = "fakerequest"
		request.urlopen = MagicMock()
		magic = MagicMock()
		magic.read = MagicMock()
		magic.read.return_value = '{"x":["fakeaa",null]}'.encode('utf-8')
		request.urlopen.return_value = magic

		fakeself = MagicMock()
		fakeself.headers = {} 
		return_data = spira_test_class.connectSpiraTest(fakeself,'fakeurl', 'testing', None)
		self.assertEqual(return_data['x'][0],'fakeaa')
		self.assertEqual(return_data['x'][1],None)

	@patch('urllib.request')
	def test_connectSpiraTest_normal_case_with_data(self, request):
		request.Request = MagicMock()
		request.Request.return_value = "fakerequest"
		request.urlopen = MagicMock()
		magic = MagicMock()
		magic.read = MagicMock()
		magic.read.return_value = '{"x":["fakeaa",null]}'.encode('utf-8')
		request.urlopen.return_value = magic

		fakeself = MagicMock()
		fakeself.headers = {} 
		return_data = spira_test_class.connectSpiraTest(fakeself,'fakeurl', 'testing',{'data':'i\'m data'})
		self.assertEqual(return_data['x'][0],'fakeaa')
		self.assertEqual(return_data['x'][1],None)

	@patch('urllib.request')
	@patch.object(spira_test_v4_0,'print')
	def test_connectSpiraTest_error_case(self, mockPrint, request):
		request.Request = MagicMock()
		request.Request.return_value = "fakerequest"
		request.urlopen.side_effect = ValueError('A very specific bad thing happened')
		fakeself = MagicMock()
		fakeself.headers = {}
		with self.assertRaises(SystemExit):
			spira_test_class.connectSpiraTest(fakeself,'fakeurl', 'testing',None)
		self.assertEqual(mockPrint.call_count, 2)

	@patch('urllib.request')
	@patch.object(spira_test_v4_0,'print')
	def test_connectSpiraTest_http_error_case(self, mockPrint, request):
		request.Request = MagicMock()
		request.Request.return_value = "fakerequest"
		class fake():
			def close(self):
				pass
			def read(self):
				return 'undefined http error'.encode('utf-8')
		f = fake()
		request.urlopen.side_effect = urllib.error.HTTPError(f,f,f,f,f)
		fakeself = MagicMock()
		fakeself.headers = {}
		with self.assertRaises(SystemExit):
			spira_test_class.connectSpiraTest(fakeself,'fakeurl', 'testing', None)
		self.assertEqual(mockPrint.call_count, 1)

	def test_createNewTestRun_normal_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeself.connectSpiraTest = fakeConnect
		spira_test_class.createNewTestRun(fakeself,{})
		self.assertEqual(fakeConnect.call_count,1)

	def test_getUserId_normal_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = {'UserId':'fakereturn'}
		fakeself.connectSpiraTest = fakeConnect
		self.assertEqual(spira_test_class.getUserId(fakeself),'fakereturn')
		self.assertEqual(fakeConnect.call_count,1)

	def test_getProjectIdByProjectName_normal_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = [{"ProjectId":1,"Name":"fake"},{"ProjectId":2,"Name":"ProjectName"},{"ProjectId":3,"Name":"fake"}]
		fakeself.connectSpiraTest = fakeConnect
		self.assertEqual(spira_test_class.getProjectIdByProjectName(fakeself,"ProjectName"),2)
		self.assertEqual(fakeConnect.call_count,1)

	@patch.object(spira_test_v4_0,'print')
	def test_getProjectIdByProjectName_not_found_case(self,mockPrint):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = [{"ProjectId":1,"Name":"fake"},{"ProjectId":2,"Name":"fake"},{"ProjectId":3,"Name":"fake"}]
		fakeself.connectSpiraTest = fakeConnect
		with self.assertRaises(SystemExit):
			spira_test_class.getProjectIdByProjectName(fakeself,"ProjectName")
		self.assertEqual(fakeConnect.call_count,1)
		self.assertEqual(mockPrint.call_count,1)

	def test_getTestCaseCount_normal_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = 3
		fakeself.connectSpiraTest = fakeConnect
		self.assertEqual(spira_test_class.getTestCaseCount(fakeself),3)
		self.assertEqual(fakeConnect.call_count,1)

	def test_getTestCaseFolders_normal_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeCount = MagicMock
		fakeCount.return_value = 3
		fakeself.getTestCaseCount = fakeCount
		fakeConnect = MagicMock()
		fakeConnect.return_value = [{"Folder":True, "FolderId":1, "Name":"fake"},{"Folder":False, "FolderId":2,"Name":"fake"},{"Folder":True, "FolderId":3,"Name":"fake"}]
		fakeself.connectSpiraTest = fakeConnect
		fakeself.urlprefix = 'http://'+fakeself.host
		spira_test_class.getTestCaseFolders(fakeself)

		self.assertEqual(fakeConnect.call_count,1)

	def test_getTestCasesByFolder_normal_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = [{"TestCaseId":1,"Name":"fake"},{"TestCaseId":2,"Name":"fake"},{"TestCaseId":3,"Name":"fake"}]
		fakeself.connectSpiraTest = fakeConnect
		fakeself.urlprefix = 'http://'+fakeself.host
		self.assertEqual(spira_test_class.getTestCasesByFolder(fakeself,5),[{"TestCaseId":1,"Name":"fake"},{"TestCaseId":2,"Name":"fake"},{"TestCaseId":3,"Name":"fake"}])
		self.assertEqual(fakeConnect.call_count,1)

	def test_createTestCaseFolder_normal_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = {"TestCaseId":1,"Name":"fake"}
		fakeself.connectSpiraTest = fakeConnect
		fakeself.urlprefix = 'http://'+fakeself.host
		self.assertEqual(spira_test_class.createTestCaseFolder(fakeself,5,'fake'),{"TestCaseId":1,"Name":"fake"})
		self.assertEqual(fakeConnect.call_count,1)

	def test_createTestCase_normal_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = {"TestCaseId":1,"Name":"fake"}
		fakeself.connectSpiraTest = fakeConnect
		fakeself.urlprefix = 'http://'+fakeself.host
		self.assertEqual(spira_test_class.createTestCase(fakeself,5,'fake'),{"TestCaseId":1,"Name":"fake"})
		self.assertEqual(fakeConnect.call_count,1)
		self.assertEqual(fakeConnect.call_args[0][0], 'http://fakehost/SpiraTest/Services/v4_0/RestService.svc/projects/3/test-cases?parent_test_folder_id=5')

	def test_checkReleaseIDCorrect_normal_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = [{"ReleaseId":1,"Name":"fake"}, {"ReleaseId":2,"Name":"fake2"}]
		fakeself.connectSpiraTest = fakeConnect
		fakeself.urlprefix = 'http://'+fakeself.host
		self.assertEqual(spira_test_class.checkReleaseIDCorrect(fakeself,2), 2)
		self.assertEqual(fakeConnect.call_count,1)
		self.assertEqual(fakeConnect.call_args[0][0], 'http://fakehost/SpiraTest/Services/v4_0/RestService.svc/projects/3/releases')

	@patch.object(spira_test_v4_0,'print')
	def test_checkReleaseIDCorrect_release_not_found_case(self, mockPrint):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = [{"ReleaseId":1,"Name":"fake"}, {"ReleaseId":2,"Name":"fake2"}]
		fakeself.connectSpiraTest = fakeConnect
		fakeself.urlprefix = 'http://'+fakeself.host
		with self.assertRaises(SystemExit):
			spira_test_class.checkReleaseIDCorrect(fakeself, 3)
		self.assertEqual(fakeConnect.call_count,1)
		self.assertEqual(fakeConnect.call_args[0][0], 'http://fakehost/SpiraTest/Services/v4_0/RestService.svc/projects/3/releases')
		self.assertEqual(mockPrint.call_count,1)
		self.assertEqual(mockPrint.call_args[0][0], '[Error] SpiraTest: The release corresponding to the given Release ID 3 is not found.')

	def test_getReleaseByVersion_normal_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = [{"ReleaseId":1,"Name":"fake", "VersionNumber": "v1"}, {"ReleaseId":2,"Name":"fake2", "VersionNumber":"v2"}]
		fakeself.connectSpiraTest = fakeConnect
		fakeself.urlprefix = 'http://'+fakeself.host
		self.assertEqual(spira_test_class.getReleaseByVersion(fakeself, "v2"), {"ReleaseId":2,"Name":"fake2", "VersionNumber":"v2"})
		self.assertEqual(fakeConnect.call_count,1)
		self.assertEqual(fakeConnect.call_args[0][0], 'http://fakehost/SpiraTest/Services/v4_0/RestService.svc/projects/3/releases')

	def test_getReleaseByVersion_not_found_case(self):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = [{"ReleaseId":1,"Name":"fake", "VersionNumber": "v1"}, {"ReleaseId":2,"Name":"fake2", "VersionNumber":"v2"}]
		fakeself.connectSpiraTest = fakeConnect
		fakeself.urlprefix = 'http://'+fakeself.host
		self.assertEqual(spira_test_class.getReleaseByVersion(fakeself, "v3"), None)
		self.assertEqual(fakeConnect.call_count,1)
		self.assertEqual(fakeConnect.call_args[0][0], 'http://fakehost/SpiraTest/Services/v4_0/RestService.svc/projects/3/releases')

	@patch.object(spira_test_v4_0,'print')
	def test_CreateNewRelease_release_not_found_case(self, mockPrint):
		fakeself = MagicMock()
		fakeself.host = 'fakehost'
		fakeself.port = 'fakeport'
		fakeself.headers = {}
		fakeself.project_id = 3
		fakeConnect = MagicMock()
		fakeConnect.return_value = {"ReleaseId":1,"Name":"fake", "VersionNumber": "v1"}
		fakeself.connectSpiraTest = fakeConnect
		fakeself.urlprefix = 'http://'+fakeself.host
		self.assertEqual(spira_test_class.CreateNewRelease(fakeself, "fake", "v1"), 1)
		self.assertEqual(fakeConnect.call_count,1)
		self.assertEqual(fakeConnect.call_args[0][0], 'http://fakehost/SpiraTest/Services/v4_0/RestService.svc/projects/3/releases')

if(__name__ == "__main__"):
	unittest.main()
