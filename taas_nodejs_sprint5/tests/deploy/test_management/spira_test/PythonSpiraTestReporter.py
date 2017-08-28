import unittest
from unittest.mock import patch
from unittest.mock import MagicMock
import os
import imp
import sys
import configparser
import json

fake_spira_test_v4_0 = MagicMock()
fake_python_html_parser = MagicMock()
sys.modules['spira_test_v4_0'] = fake_spira_test_v4_0
sys.modules['PythonHtmlParser'] = fake_python_html_parser
spira_test_lib_base_dir = os.path.join(os.path.dirname(__file__), '../../../../deploy/test_management/spira_test')
sys.path.append(spira_test_lib_base_dir)
spira_python_reportor = imp.load_source('PythonSpiraTestReporter', os.path.join(spira_test_lib_base_dir, 'PythonSpiraTestReporter.py'))

config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__),'config.ini'))

class PythonSpiraTestReporter(unittest.TestCase):
	@patch('time.strptime')
	@patch('sys.argv')
	@patch('time.mktime')
	@patch.object(spira_python_reportor,'print')
	def test_main_normal_case(self, mockPrint, mktime, sysArgv, strptime):
		fake_python_html_parser.PythonHtmlParser = MagicMock(return_value = fake_python_html_parser)
		fake_python_html_parser.parsePythonUnitTestReport = MagicMock(return_value = json.loads(config['PythonSpiraTestReporter']['examplereport']))
		mktime.return_value = 1234567890

		def getsysArgv(name):
			fakeargv = ['', 'fakereport', 'localhost', '80', '', 'TaaS', 'bbbb8264', '{3C958F7C-1F43-4D3B-BDA2-BFB21BAACE0D}', 'fakefolder', '', '', '0', 'AutoCreateTestCase', '0', '', '']
			return fakeargv[name]

		sysArgv.__len__.return_value = 16
		sysArgv.__getitem__.side_effect = getsysArgv

		fake_taas_folder = {"TestCaseId": 34, "Name": "fakefolder", "IndentLevel": "AAC"}
		fake_testcase_folder1 = {"Name":"fakefolder2","TestCaseId":38, "IndentLevel": "AACAAA"}
		fake_testcase1 = {"Name":"fakecase","TestCaseId":39, "IndentLevel": "AACAAAAAA"}
		fake_testcase2 = {"Name":"fakecase2","TestCaseId":40, "IndentLevel": "AACAAAAAB"}
		fake_testcase_folder2 = {"Name":"fakefolder3","TestCaseId":44, "IndentLevel": "AACAAB"}
		fake_testcase3 = {"Name":"fakecase","TestCaseId":42, "IndentLevel": "AACAABAAA"}
		fake_testcase4 = {"Name":"fakecase2","TestCaseId":43, "IndentLevel": "AACAABAAB"}

		def getTestcaseInFolder(id):
			if id == 34:
				return [fake_testcase1, fake_testcase2, fake_testcase3, fake_testcase4]
			elif id == 38:
				return [fake_testcase1, fake_testcase2]
			elif id == 44:
				return [fake_testcase3, fake_testcase4]
			else:
				return None

		fake_spira_test_v4_0.spira_test = MagicMock(return_value = fake_spira_test_v4_0)
		fake_spira_test_v4_0.getTestCaseFolders = MagicMock(return_value = [fake_taas_folder, fake_testcase_folder1, fake_testcase_folder2])
		fake_spira_test_v4_0.getUserId = MagicMock(return_value=3)
		fake_spira_test_v4_0.getTestCasesByFolder = MagicMock(side_effect = getTestcaseInFolder)
		fake_spira_test_v4_0.createNewTestRun = MagicMock()
		fake_spira_test_v4_0.createTestCaseFolder = MagicMock()
		fake_spira_test_v4_0.createTestCase = MagicMock()
		fake_spira_test_v4_0.CreateNewRelease = MagicMock()
		spira_python_reportor.main()
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_count, 4)
		self.assertEqual(fake_spira_test_v4_0.createTestCaseFolder.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.createTestCase.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.CreateNewRelease.call_count, 0)
		self.assertEqual(mockPrint.call_count, 0)
	
	@patch('time.strptime')
	@patch('sys.argv')
	@patch('time.mktime')
	@patch.object(spira_python_reportor,'print')
	def test_main_no_TaaS_folder_case(self, mockPrint, mktime, sysArgv, strptime):
		fake_python_html_parser.PythonHtmlParser = MagicMock(return_value = fake_python_html_parser)
		fake_python_html_parser.parsePythonUnitTestReport = MagicMock(return_value = json.loads(config['PythonSpiraTestReporter']['examplereport']))
		mktime.return_value = 1234567890

		def getsysArgv(name):
			fakeargv = ['', 'fakereport', 'localhost', '80', '', 'TaaS', 'bbbb8264', '{3C958F7C-1F43-4D3B-BDA2-BFB21BAACE0D}', 'fakefolder', '', '', '0', 'AutoCreateTestCase', '0', '', '']
			return fakeargv[name]

		sysArgv.__len__.return_value = 16
		sysArgv.__getitem__.side_effect = getsysArgv

		fake_taas_folder = {"TestCaseId": 34, "Name": "ffakefolder", "IndentLevel": "AAC"}
		fake_testcase_folder1 = {"Name":"fakefolder2","TestCaseId":38, "IndentLevel": "AACAAA"}
		fake_testcase1 = {"Name":"fakecase","TestCaseId":39, "IndentLevel": "AACAAAAAA"}
		fake_testcase2 = {"Name":"fakecase2","TestCaseId":40, "IndentLevel": "AACAAAAAB"}
		fake_testcase_folder2 = {"Name":"fakefolder3","TestCaseId":44, "IndentLevel": "AACAAB"}
		fake_testcase3 = {"Name":"fakecase","TestCaseId":42, "IndentLevel": "AACAABAAA"}
		fake_testcase4 = {"Name":"fakecase2","TestCaseId":43, "IndentLevel": "AACAABAAB"}

		def getTestcaseInFolder(id):
			if id == 34:
				return [fake_testcase1, fake_testcase2, fake_testcase3, fake_testcase4]
			elif id == 38:
				return [fake_testcase1, fake_testcase2]
			elif id == 44:
				return [fake_testcase3, fake_testcase4]
			else:
				return None

		fake_spira_test_v4_0.spira_test = MagicMock(return_value = fake_spira_test_v4_0)
		fake_spira_test_v4_0.getTestCaseFolders = MagicMock(return_value = [fake_taas_folder, fake_testcase_folder1, fake_testcase_folder2])
		fake_spira_test_v4_0.getUserId = MagicMock(return_value=3)
		fake_spira_test_v4_0.getTestCasesByFolder = MagicMock(side_effect = getTestcaseInFolder)
		fake_spira_test_v4_0.createNewTestRun = MagicMock()
		fake_spira_test_v4_0.createTestCaseFolder = MagicMock()
		fake_spira_test_v4_0.createTestCase = MagicMock()
		fake_spira_test_v4_0.CreateNewRelease = MagicMock()
		with self.assertRaises(SystemExit):
			spira_python_reportor.main()
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.createTestCaseFolder.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.createTestCase.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.CreateNewRelease.call_count, 0)
		self.assertNotEqual(mockPrint.call_count, 0)

	@patch('time.strptime')
	@patch('sys.argv')
	@patch('time.mktime')
	@patch.object(spira_python_reportor,'print')
	def test_main_no_fit_test_case_folder_case(self, mockPrint, mktime, sysArgv, strptime):
		fake_python_html_parser.PythonHtmlParser = MagicMock(return_value = fake_python_html_parser)
		fake_python_html_parser.parsePythonUnitTestReport = MagicMock(return_value = json.loads(config['PythonSpiraTestReporter']['examplereport']))
		mktime.return_value = 1234567890

		def getsysArgv(name):
			fakeargv = ['', 'fakereport', 'localhost', '80', '', 'TaaS', 'bbbb8264', '{3C958F7C-1F43-4D3B-BDA2-BFB21BAACE0D}', 'fakefolder', '', '', '0', 'NotAutoCreateTestCase', '0', '', '']
			return fakeargv[name]

		sysArgv.__len__.return_value = 16
		sysArgv.__getitem__.side_effect = getsysArgv

		fake_taas_folder = {"TestCaseId": 34, "Name": "fakefolder", "IndentLevel": "AAC"}
		fake_testcase_folder1 = {"Name":"fakefolder2","TestCaseId":38, "IndentLevel": "AACAAA"}
		fake_testcase1 = {"Name":"fakecase","TestCaseId":39, "IndentLevel": "AACAAAAAA"}
		fake_testcase2 = {"Name":"fakecase2","TestCaseId":40, "IndentLevel": "AACAAAAAB"}
		fake_testcase_folder2 = {"Name":"fakefolder3","TestCaseId":44, "IndentLevel": "AACAAB"}
		fake_testcase3 = {"Name":"fakecase","TestCaseId":42, "IndentLevel": "AACAABAAA"}
		fake_testcase4 = {"Name":"fakecase2","TestCaseId":43, "IndentLevel": "AACAABAAB"}

		def getTestcaseInFolder(id):
			if id == 34:
				return [fake_testcase1, fake_testcase2, fake_testcase3, fake_testcase4]
			elif id == 38:
				return [fake_testcase1, fake_testcase2]
			elif id == 44:
				return [fake_testcase3, fake_testcase4]
			else:
				return None

		fake_spira_test_v4_0.spira_test = MagicMock(return_value = fake_spira_test_v4_0)
		fake_spira_test_v4_0.getTestCaseFolders = MagicMock(return_value = [fake_taas_folder, fake_testcase_folder1])
		fake_spira_test_v4_0.getUserId = MagicMock(return_value=3)
		fake_spira_test_v4_0.getTestCasesByFolder = MagicMock(side_effect = getTestcaseInFolder)
		fake_spira_test_v4_0.createNewTestRun = MagicMock()
		fake_spira_test_v4_0.createTestCaseFolder = MagicMock()
		fake_spira_test_v4_0.createTestCase = MagicMock()
		fake_spira_test_v4_0.CreateNewRelease = MagicMock()
		spira_python_reportor.main()
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_count, 2)
		self.assertEqual(fake_spira_test_v4_0.createTestCaseFolder.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.createTestCase.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.CreateNewRelease.call_count, 0)
		self.assertNotEqual(mockPrint.call_count, 0)

	@patch('time.strptime')
	@patch('sys.argv')
	@patch('time.mktime')
	@patch.object(spira_python_reportor,'print')
	def test_main_no_fit_test_case_case(self, mockPrint, mktime, sysArgv, strptime):
		fake_python_html_parser.PythonHtmlParser = MagicMock(return_value = fake_python_html_parser)
		fake_python_html_parser.parsePythonUnitTestReport = MagicMock(return_value = json.loads(config['PythonSpiraTestReporter']['examplereport']))
		mktime.return_value = 1234567890

		def getsysArgv(name):
			fakeargv = ['', 'fakereport', 'localhost', '80', '', 'TaaS', 'bbbb8264', '{3C958F7C-1F43-4D3B-BDA2-BFB21BAACE0D}', 'fakefolder', '', '', '0', 'NotAutoCreateTestCase', '0', '', '']
			return fakeargv[name]

		sysArgv.__len__.return_value = 16
		sysArgv.__getitem__.side_effect = getsysArgv

		fake_taas_folder = {"TestCaseId": 34, "Name": "fakefolder", "IndentLevel": "AAC"}
		fake_testcase_folder1 = {"Name":"fakefolder2","TestCaseId":38, "IndentLevel": "AACAAA"}
		fake_testcase1 = {"Name":"fakecase","TestCaseId":39, "IndentLevel": "AACAAAAAA"}
		fake_testcase2 = {"Name":"fakecase2","TestCaseId":40, "IndentLevel": "AACAAAAAB"}
		fake_testcase_folder2 = {"Name":"fakefolder3","TestCaseId":44, "IndentLevel": "AACAAB"}
		fake_testcase3 = {"Name":"fakecase","TestCaseId":42, "IndentLevel": "AACAABAAA"}
		fake_testcase4 = {"Name":"fakecase2","TestCaseId":43, "IndentLevel": "AACAABAAB"}

		def getTestcaseInFolder(id):
			if id == 34:
				return [fake_testcase1, fake_testcase3]
			elif id == 38:
				return [fake_testcase1]
			elif id == 44:
				return [fake_testcase3]
			else:
				return None

		fake_spira_test_v4_0.spira_test = MagicMock(return_value = fake_spira_test_v4_0)
		fake_spira_test_v4_0.getTestCaseFolders = MagicMock(return_value = [fake_taas_folder, fake_testcase_folder1, fake_testcase_folder2])
		fake_spira_test_v4_0.getUserId = MagicMock(return_value=3)
		fake_spira_test_v4_0.getTestCasesByFolder = MagicMock(side_effect = getTestcaseInFolder)
		fake_spira_test_v4_0.createNewTestRun = MagicMock()
		fake_spira_test_v4_0.createTestCaseFolder = MagicMock()
		fake_spira_test_v4_0.createTestCase = MagicMock()
		fake_spira_test_v4_0.CreateNewRelease = MagicMock()
		spira_python_reportor.main()
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_count, 2)
		self.assertEqual(fake_spira_test_v4_0.createTestCaseFolder.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.createTestCase.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.CreateNewRelease.call_count, 0)
		self.assertNotEqual(mockPrint.call_count, 0)

	@patch('time.strptime')
	@patch('sys.argv')
	@patch('time.mktime')
	@patch.object(spira_python_reportor,'print')
	def test_main_autocreate_test_case_and_folder_case(self, mockPrint, mktime, sysArgv, strptime):
		fake_python_html_parser.PythonHtmlParser = MagicMock(return_value = fake_python_html_parser)
		fake_python_html_parser.parsePythonUnitTestReport = MagicMock(return_value = json.loads(config['PythonSpiraTestReporter']['examplereport']))
		mktime.return_value = 1234567890

		def getsysArgv(name):
			fakeargv = ['', 'fakereport', 'localhost', '80', '', 'TaaS', 'bbbb8264', '{3C958F7C-1F43-4D3B-BDA2-BFB21BAACE0D}', 'fakefolder', '', '', '0', 'AutoCreateTestCase', '0', '', '']
			return fakeargv[name]

		sysArgv.__len__.return_value = 16
		sysArgv.__getitem__.side_effect = getsysArgv

		fake_taas_folder = {"TestCaseId": 34, "Name": "fakefolder", "IndentLevel": "AAC"}
		fake_testcase_folder1 = {"Name":"fakefolder2","TestCaseId":38, "IndentLevel": "AACAAA"}
		fake_testcase1 = {"Name":"fakecase","TestCaseId":39, "IndentLevel": "AACAAAAAA"}
		fake_testcase2 = {"Name":"fakecase2","TestCaseId":40, "IndentLevel": "AACAAAAAB"}
		fake_testcase_folder2 = {"Name":"fakefolder3","TestCaseId":44, "IndentLevel": "AACAAB"}
		fake_testcase3 = {"Name":"fakecase","TestCaseId":42, "IndentLevel": "AACAABAAA"}
		fake_testcase4 = {"Name":"fakecase2","TestCaseId":43, "IndentLevel": "AACAABAAB"}

		def getTestcaseInFolder(id):
			if id == 34:
				return [fake_testcase1, fake_testcase2]
			elif id == 38:
				return [fake_testcase1, fake_testcase2]
			else:
				return None

		newTestcaseID = [50]
		totalfolders = [fake_taas_folder, fake_testcase_folder1]

		def fakeCreateNewTestcaseFolder(parentfolderid, name):
			newfolder = {"Name": name, "TestCaseId":newTestcaseID[0], "IndentLevel": None}
			newTestcaseID[0] = newTestcaseID[0] + 1
			totalfolders.append(newfolder)
			return newfolder

		def fakeCreateNewTestcase(parentfolderid, name):
			newtestcase = {"Name": name, "TestCaseId":newTestcaseID[0], "IndentLevel": None}
			newTestcaseID[0] = newTestcaseID[0] + 1
			return newtestcase

		fake_spira_test_v4_0.spira_test = MagicMock(return_value = fake_spira_test_v4_0)
		fake_spira_test_v4_0.getTestCaseFolders = MagicMock(return_value = totalfolders)
		fake_spira_test_v4_0.getUserId = MagicMock(return_value=3)
		fake_spira_test_v4_0.getTestCasesByFolder = MagicMock(side_effect = getTestcaseInFolder)
		fake_spira_test_v4_0.createNewTestRun = MagicMock()
		fake_spira_test_v4_0.createTestCaseFolder = MagicMock(side_effect = fakeCreateNewTestcaseFolder)
		fake_spira_test_v4_0.createTestCase = MagicMock(side_effect = fakeCreateNewTestcase)
		fake_spira_test_v4_0.CreateNewRelease = MagicMock()
		spira_python_reportor.main()
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_count, 4)
		self.assertEqual(fake_spira_test_v4_0.createTestCaseFolder.call_count, 1)
		self.assertEqual(fake_spira_test_v4_0.createTestCase.call_count, 2)
		self.assertEqual(fake_spira_test_v4_0.CreateNewRelease.call_count, 0)
		self.assertNotEqual(mockPrint.call_count, 0)

	@patch('time.strptime')
	@patch('sys.argv')
	@patch('time.mktime')
	@patch.object(spira_python_reportor,'print')
	def test_main_apply_release_with_releaseID_case(self, mockPrint, mktime, sysArgv, strptime):
		fake_python_html_parser.PythonHtmlParser = MagicMock(return_value = fake_python_html_parser)
		fake_python_html_parser.parsePythonUnitTestReport = MagicMock(return_value = json.loads(config['PythonSpiraTestReporter']['examplereport']))
		mktime.return_value = 1234567890

		def getsysArgv(name):
			fakeargv = ['', 'fakereport', 'localhost', '80', '', 'TaaS', 'bbbb8264', '{3C958F7C-1F43-4D3B-BDA2-BFB21BAACE0D}', 'fakefolder', '', '', '0', 'AutoCreateTestCase', '1', '11', '']
			return fakeargv[name]

		sysArgv.__len__.return_value = 16
		sysArgv.__getitem__.side_effect = getsysArgv

		fake_taas_folder = {"TestCaseId": 34, "Name": "fakefolder", "IndentLevel": "AAC"}
		fake_testcase_folder1 = {"Name":"fakefolder2","TestCaseId":38, "IndentLevel": "AACAAA"}
		fake_testcase1 = {"Name":"fakecase","TestCaseId":39, "IndentLevel": "AACAAAAAA"}
		fake_testcase2 = {"Name":"fakecase2","TestCaseId":40, "IndentLevel": "AACAAAAAB"}
		fake_testcase_folder2 = {"Name":"fakefolder3","TestCaseId":44, "IndentLevel": "AACAAB"}
		fake_testcase3 = {"Name":"fakecase","TestCaseId":42, "IndentLevel": "AACAABAAA"}
		fake_testcase4 = {"Name":"fakecase2","TestCaseId":43, "IndentLevel": "AACAABAAB"}

		def getTestcaseInFolder(id):
			if id == 34:
				return [fake_testcase1, fake_testcase2, fake_testcase3, fake_testcase4]
			elif id == 38:
				return [fake_testcase1, fake_testcase2]
			elif id == 44:
				return [fake_testcase3, fake_testcase4]
			else:
				return None

		release1 = {"Name":"fakerelease1", "VersionNumber":"f1", "ReleaseID": 10}
		release2 = {"Name":"fakerelease2", "VersionNumber":"f2", "ReleaseID": 11}
		release3 = {"Name":"fakerelease3", "VersionNumber":"f3", "ReleaseID": 12}

		def fakeCheckReleaseID(id):
			if id == "10":
				return 10
			elif id == "11":
				return 11
			elif id == "12":
				return 12
			else:
				print('[Error] SpiraTest: The release corresponding to the given Release ID %s is not found.' % id)
				sys.exit(0)

		fake_spira_test_v4_0.spira_test = MagicMock(return_value = fake_spira_test_v4_0)
		fake_spira_test_v4_0.getTestCaseFolders = MagicMock(return_value = [fake_taas_folder, fake_testcase_folder1, fake_testcase_folder2])
		fake_spira_test_v4_0.getUserId = MagicMock(return_value=3)
		fake_spira_test_v4_0.getTestCasesByFolder = MagicMock(side_effect = getTestcaseInFolder)
		fake_spira_test_v4_0.createNewTestRun = MagicMock()
		fake_spira_test_v4_0.createTestCaseFolder = MagicMock()
		fake_spira_test_v4_0.createTestCase = MagicMock()
		fake_spira_test_v4_0.CreateNewRelease = MagicMock()
		fake_spira_test_v4_0.checkReleaseIDCorrect = MagicMock(side_effect = fakeCheckReleaseID)
		fake_spira_test_v4_0.getReleaseByVersion = MagicMock()
		spira_python_reportor.main()
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_count, 4)
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_args[0][0]["ReleaseId"], 11)
		self.assertEqual(fake_spira_test_v4_0.createTestCaseFolder.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.createTestCase.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.CreateNewRelease.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.checkReleaseIDCorrect.call_count, 1)
		self.assertEqual(fake_spira_test_v4_0.getReleaseByVersion.call_count, 0)
		self.assertEqual(mockPrint.call_count, 0)

	@patch('time.strptime')
	@patch('sys.argv')
	@patch('time.mktime')
	@patch.object(spira_python_reportor,'print')
	def test_main_apply_release_with_releaseVersion_case(self, mockPrint, mktime, sysArgv, strptime):
		fake_python_html_parser.PythonHtmlParser = MagicMock(return_value = fake_python_html_parser)
		fake_python_html_parser.parsePythonUnitTestReport = MagicMock(return_value = json.loads(config['PythonSpiraTestReporter']['examplereport']))
		mktime.return_value = 1234567890

		def getsysArgv(name):
			fakeargv = ['', 'fakereport', 'localhost', '80', '', 'TaaS', 'bbbb8264', '{3C958F7C-1F43-4D3B-BDA2-BFB21BAACE0D}', 'fakefolder', '', '', '0', 'AutoCreateTestCase', '2', 'f3', '']
			return fakeargv[name]

		sysArgv.__len__.return_value = 16
		sysArgv.__getitem__.side_effect = getsysArgv

		fake_taas_folder = {"TestCaseId": 34, "Name": "fakefolder", "IndentLevel": "AAC"}
		fake_testcase_folder1 = {"Name":"fakefolder2","TestCaseId":38, "IndentLevel": "AACAAA"}
		fake_testcase1 = {"Name":"fakecase","TestCaseId":39, "IndentLevel": "AACAAAAAA"}
		fake_testcase2 = {"Name":"fakecase2","TestCaseId":40, "IndentLevel": "AACAAAAAB"}
		fake_testcase_folder2 = {"Name":"fakefolder3","TestCaseId":44, "IndentLevel": "AACAAB"}
		fake_testcase3 = {"Name":"fakecase","TestCaseId":42, "IndentLevel": "AACAABAAA"}
		fake_testcase4 = {"Name":"fakecase2","TestCaseId":43, "IndentLevel": "AACAABAAB"}

		def getTestcaseInFolder(id):
			if id == 34:
				return [fake_testcase1, fake_testcase2, fake_testcase3, fake_testcase4]
			elif id == 38:
				return [fake_testcase1, fake_testcase2]
			elif id == 44:
				return [fake_testcase3, fake_testcase4]
			else:
				return None

		release1 = {"Name":"fakerelease1", "VersionNumber":"f1", "ReleaseId": 10}
		release2 = {"Name":"fakerelease2", "VersionNumber":"f2", "ReleaseId": 11}
		release3 = {"Name":"fakerelease3", "VersionNumber":"f3", "ReleaseId": 12}

		def fakeCheckReleaseID(id):
			if id == "10":
				return 10
			elif id == "11":
				return 11
			elif id == "12":
				return 12
			else:
				print('[Error] SpiraTest: The release corresponding to the given Release ID %s is not found.' % id)
				sys.exit(0)

		def fakeGetReleaseByVersion(versionnumber):
			if versionnumber == "f1":
				return release1
			elif versionnumber == "f2":
				return release2
			elif versionnumber == "f3":
				return release3
			else:
				return None

		fake_spira_test_v4_0.spira_test = MagicMock(return_value = fake_spira_test_v4_0)
		fake_spira_test_v4_0.getTestCaseFolders = MagicMock(return_value = [fake_taas_folder, fake_testcase_folder1, fake_testcase_folder2])
		fake_spira_test_v4_0.getUserId = MagicMock(return_value=3)
		fake_spira_test_v4_0.getTestCasesByFolder = MagicMock(side_effect = getTestcaseInFolder)
		fake_spira_test_v4_0.createNewTestRun = MagicMock()
		fake_spira_test_v4_0.createTestCaseFolder = MagicMock()
		fake_spira_test_v4_0.createTestCase = MagicMock()
		fake_spira_test_v4_0.CreateNewRelease = MagicMock()
		fake_spira_test_v4_0.checkReleaseIDCorrect = MagicMock(side_effect = fakeCheckReleaseID)
		fake_spira_test_v4_0.getReleaseByVersion = MagicMock(side_effect = fakeGetReleaseByVersion)
		spira_python_reportor.main()
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_count, 4)
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_args[0][0]["ReleaseId"], 12)
		self.assertEqual(fake_spira_test_v4_0.createTestCaseFolder.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.createTestCase.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.CreateNewRelease.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.checkReleaseIDCorrect.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.getReleaseByVersion.call_count, 1)
		self.assertEqual(mockPrint.call_count, 0)

	@patch('time.strptime')
	@patch('sys.argv')
	@patch('time.mktime')
	@patch.object(spira_python_reportor,'print')
	def test_main_autocreate_release_case(self, mockPrint, mktime, sysArgv, strptime):
		fake_python_html_parser.PythonHtmlParser = MagicMock(return_value = fake_python_html_parser)
		fake_python_html_parser.parsePythonUnitTestReport = MagicMock(return_value = json.loads(config['PythonSpiraTestReporter']['examplereport']))
		mktime.return_value = 1234567890

		def getsysArgv(name):
			fakeargv = ['', 'fakereport', 'localhost', '80', '', 'TaaS', 'bbbb8264', '{3C958F7C-1F43-4D3B-BDA2-BFB21BAACE0D}', 'fakefolder', '', '', '0', 'AutoCreateTestCase', '3', 'fakerelease', 'fakereleasev']
			return fakeargv[name]

		sysArgv.__len__.return_value = 16
		sysArgv.__getitem__.side_effect = getsysArgv

		fake_taas_folder = {"TestCaseId": 34, "Name": "fakefolder", "IndentLevel": "AAC"}
		fake_testcase_folder1 = {"Name":"fakefolder2","TestCaseId":38, "IndentLevel": "AACAAA"}
		fake_testcase1 = {"Name":"fakecase","TestCaseId":39, "IndentLevel": "AACAAAAAA"}
		fake_testcase2 = {"Name":"fakecase2","TestCaseId":40, "IndentLevel": "AACAAAAAB"}
		fake_testcase_folder2 = {"Name":"fakefolder3","TestCaseId":44, "IndentLevel": "AACAAB"}
		fake_testcase3 = {"Name":"fakecase","TestCaseId":42, "IndentLevel": "AACAABAAA"}
		fake_testcase4 = {"Name":"fakecase2","TestCaseId":43, "IndentLevel": "AACAABAAB"}

		def getTestcaseInFolder(id):
			if id == 34:
				return [fake_testcase1, fake_testcase2, fake_testcase3, fake_testcase4]
			elif id == 38:
				return [fake_testcase1, fake_testcase2]
			elif id == 44:
				return [fake_testcase3, fake_testcase4]
			else:
				return None

		release1 = {"Name":"fakerelease1", "VersionNumber":"f1", "ReleaseId": 10}
		release2 = {"Name":"fakerelease2", "VersionNumber":"f2", "ReleaseId": 11}
		release3 = {"Name":"fakerelease3", "VersionNumber":"f3", "ReleaseId": 12}
		newReleaseID = [20]

		def fakeCheckReleaseID(id):
			if id == "10":
				return 10
			elif id == "11":
				return 11
			elif id == "12":
				return 12
			else:
				print('[Error] SpiraTest: The release corresponding to the given Release ID %s is not found.' % id)
				sys.exit(0)

		def fakeGetReleaseByVersion(versionnumber):
			if versionnumber == "f1":
				return release1
			elif versionnumber == "f2":
				return release2
			elif versionnumber == "f3":
				return release3
			else:
				return None

		def fakeCreateNewRelease(name, versionnumber):
			newRelease = {"Name": name, "VersionNumber": versionnumber, "ReleaseId": newReleaseID[0]}
			newReleaseID[0] += 1
			return newRelease["ReleaseId"]

		fake_spira_test_v4_0.spira_test = MagicMock(return_value = fake_spira_test_v4_0)
		fake_spira_test_v4_0.getTestCaseFolders = MagicMock(return_value = [fake_taas_folder, fake_testcase_folder1, fake_testcase_folder2])
		fake_spira_test_v4_0.getUserId = MagicMock(return_value=3)
		fake_spira_test_v4_0.getTestCasesByFolder = MagicMock(side_effect = getTestcaseInFolder)
		fake_spira_test_v4_0.createNewTestRun = MagicMock()
		fake_spira_test_v4_0.createTestCaseFolder = MagicMock()
		fake_spira_test_v4_0.createTestCase = MagicMock()
		fake_spira_test_v4_0.CreateNewRelease = MagicMock(side_effect = fakeCreateNewRelease)
		fake_spira_test_v4_0.checkReleaseIDCorrect = MagicMock(side_effect = fakeCheckReleaseID)
		fake_spira_test_v4_0.getReleaseByVersion = MagicMock(side_effect = fakeGetReleaseByVersion)
		spira_python_reportor.main()
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_count, 4)
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_args[0][0]["ReleaseId"], 20)
		self.assertEqual(fake_spira_test_v4_0.createTestCaseFolder.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.createTestCase.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.CreateNewRelease.call_count, 1)
		self.assertEqual(fake_spira_test_v4_0.checkReleaseIDCorrect.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.getReleaseByVersion.call_count, 1)
		self.assertEqual(mockPrint.call_count, 0)

	@patch('time.strptime')
	@patch('sys.argv')
	@patch('time.mktime')
	@patch.object(spira_python_reportor,'print')
	def test_main_regular_expression_change_test_case_case(self, mockPrint, mktime, sysArgv, strptime):
		fake_python_html_parser.PythonHtmlParser = MagicMock(return_value = fake_python_html_parser)
		fake_python_html_parser.parsePythonUnitTestReport = MagicMock(return_value = json.loads(config['PythonSpiraTestReporter']['examplereport']))
		mktime.return_value = 1234567890

		def getsysArgv(name):
			fakeargv = ['', 'fakereport', 'localhost', '80', '', 'TaaS', 'bbbb8264', '{3C958F7C-1F43-4D3B-BDA2-BFB21BAACE0D}', 'fakefolder', 'fake', '', '0', 'AutoCreateTestCase', '0', '', '']
			return fakeargv[name]

		sysArgv.__len__.return_value = 16
		sysArgv.__getitem__.side_effect = getsysArgv

		fake_taas_folder = {"TestCaseId": 34, "Name": "fakefolder", "IndentLevel": "AAC"}
		fake_testcase_folder1 = {"Name":"fakefolder2","TestCaseId":38, "IndentLevel": "AACAAA"}
		fake_testcase1 = {"Name":"fakecase","TestCaseId":39, "IndentLevel": "AACAAAAAA"}
		fake_testcase2 = {"Name":"fakecase2","TestCaseId":40, "IndentLevel": "AACAAAAAB"}
		fake_testcase_folder2 = {"Name":"fakefolder3","TestCaseId":44, "IndentLevel": "AACAAB"}
		fake_testcase3 = {"Name":"fakecase","TestCaseId":42, "IndentLevel": "AACAABAAA"}
		fake_testcase4 = {"Name":"fakecase2","TestCaseId":43, "IndentLevel": "AACAABAAB"}

		def getTestcaseInFolder(id):
			if id == 34:
				return [fake_testcase1, fake_testcase2]
			elif id == 38:
				return [fake_testcase1, fake_testcase2]
			else:
				return None

		newTestcaseID = [50]
		totalfolders = [fake_taas_folder, fake_testcase_folder1]

		def fakeCreateNewTestcaseFolder(parentfolderid, name):
			newfolder = {"Name": name, "TestCaseId":newTestcaseID[0], "IndentLevel": None}
			newTestcaseID[0] = newTestcaseID[0] + 1
			totalfolders.append(newfolder)
			return newfolder

		def fakeCreateNewTestcase(parentfolderid, name):
			newtestcase = {"Name": name, "TestCaseId":newTestcaseID[0], "IndentLevel": None}
			newTestcaseID[0] = newTestcaseID[0] + 1
			return newtestcase

		fake_spira_test_v4_0.spira_test = MagicMock(return_value = fake_spira_test_v4_0)
		fake_spira_test_v4_0.getTestCaseFolders = MagicMock(return_value = totalfolders)
		fake_spira_test_v4_0.getUserId = MagicMock(return_value=3)
		fake_spira_test_v4_0.getTestCasesByFolder = MagicMock(side_effect = getTestcaseInFolder)
		fake_spira_test_v4_0.createNewTestRun = MagicMock()
		fake_spira_test_v4_0.createTestCaseFolder = MagicMock(side_effect = fakeCreateNewTestcaseFolder)
		fake_spira_test_v4_0.createTestCase = MagicMock(side_effect = fakeCreateNewTestcase)
		fake_spira_test_v4_0.CreateNewRelease = MagicMock()
		spira_python_reportor.main()
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_args[0][0]["RunnerTestName"], "case2")
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_count, 4)
		self.assertEqual(fake_spira_test_v4_0.createTestCaseFolder.call_count, 1)
		self.assertEqual(fake_spira_test_v4_0.createTestCase.call_count, 4)
		self.assertEqual(fake_spira_test_v4_0.CreateNewRelease.call_count, 0)
		self.assertNotEqual(mockPrint.call_count, 0)

	@patch('time.strptime')
	@patch('sys.argv')
	@patch('time.mktime')
	@patch.object(spira_python_reportor,'print')
	def test_main_suppress_level_1_case(self, mockPrint, mktime, sysArgv, strptime):
		fake_python_html_parser.PythonHtmlParser = MagicMock(return_value = fake_python_html_parser)
		fake_python_html_parser.parsePythonUnitTestReport = MagicMock(return_value = json.loads(config['PythonSpiraTestReporter']['examplereport']))
		mktime.return_value = 1234567890

		def getsysArgv(name):
			fakeargv = ['', 'fakereport', 'localhost', '80', '', 'TaaS', 'bbbb8264', '{3C958F7C-1F43-4D3B-BDA2-BFB21BAACE0D}', 'fakefolder', '', '', '1', 'AutoCreateTestCase', '0', '', '']
			return fakeargv[name]

		sysArgv.__len__.return_value = 16
		sysArgv.__getitem__.side_effect = getsysArgv

		fake_taas_folder = {"TestCaseId": 34, "Name": "fakefolder", "IndentLevel": "AAC"}
		fake_testcase1 = {"Name":"fakecase","TestCaseId":39, "IndentLevel": "AACAAA"}
		fake_testcase2 = {"Name":"fakecase2","TestCaseId":40, "IndentLevel": "AACAAB"}
		fake_testcase3 = {"Name":"fakecase","TestCaseId":42, "IndentLevel": "AACAABAAA"}
		fake_testcase4 = {"Name":"fakecase2","TestCaseId":43, "IndentLevel": "AACAABAAB"}

		def getTestcaseInFolder(id):
			if id == 34:
				return [fake_testcase1, fake_testcase2]
			else:
				return None

		newTestcaseID = [50]
		totalfolders = [fake_taas_folder]

		def fakeCreateNewTestcaseFolder(parentfolderid, name):
			newfolder = {"Name": name, "TestCaseId":newTestcaseID[0], "IndentLevel": None}
			newTestcaseID[0] = newTestcaseID[0] + 1
			totalfolders.append(newfolder)
			return newfolder

		def fakeCreateNewTestcase(parentfolderid, name):
			newtestcase = {"Name": name, "TestCaseId":newTestcaseID[0], "IndentLevel": None}
			newTestcaseID[0] = newTestcaseID[0] + 1
			return newtestcase

		fake_spira_test_v4_0.spira_test = MagicMock(return_value = fake_spira_test_v4_0)
		fake_spira_test_v4_0.getTestCaseFolders = MagicMock(return_value = totalfolders)
		fake_spira_test_v4_0.getUserId = MagicMock(return_value=3)
		fake_spira_test_v4_0.getTestCasesByFolder = MagicMock(side_effect = getTestcaseInFolder)
		fake_spira_test_v4_0.createNewTestRun = MagicMock()
		fake_spira_test_v4_0.createTestCaseFolder = MagicMock(side_effect = fakeCreateNewTestcaseFolder)
		fake_spira_test_v4_0.createTestCase = MagicMock(side_effect = fakeCreateNewTestcase)
		fake_spira_test_v4_0.CreateNewRelease = MagicMock()
		spira_python_reportor.main()
		self.assertEqual(fake_spira_test_v4_0.createNewTestRun.call_count, 4)
		self.assertEqual(fake_spira_test_v4_0.createTestCaseFolder.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.createTestCase.call_count, 0)
		self.assertEqual(fake_spira_test_v4_0.CreateNewRelease.call_count, 0)
		self.assertEqual(mockPrint.call_count, 0)


if(__name__ == "__main__"):
	unittest.main()
