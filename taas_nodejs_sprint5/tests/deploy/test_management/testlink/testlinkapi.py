import unittest
from unittest.mock import patch
from unittest.mock import MagicMock
import sys
import os
import imp
import urllib
import faketestlink

fakeunderscore = MagicMock()
fakeunderscore._.find = MagicMock()
fakeunderscore._.filter = MagicMock()
sys.modules['underscore'] = fakeunderscore
sys.modules['testlink'] = faketestlink
testlinkapi_source = imp.load_source('testlinkapi', os.path.join(os.path.dirname(__file__), '../../../../deploy/test_management/testlink/testlinkapi.py'))

class testlinkapi(unittest.TestCase):
	def test_constructor_normal_case(self):
		fakeurl = "fakeurl"
		fakeapikey = "fakeapikey"
		faketestlink.TestLinkHelper = MagicMock(return_value = faketestlink)
		faketestlink.connect = MagicMock(return_value = faketestlink)
		faketestlink.__init__ = MagicMock(return_value = faketestlink)
		faketestlink.TestlinkAPIClient = "fakeclient"
		testlinkapi_source.testlink(fakeurl, fakeapikey)
		self.assertEqual(faketestlink.connect.call_count, 1)
		faketestlink.__init__.assert_called_with(fakeurl, fakeapikey)

	def test_handlingFunction_normal_case(self):
		fakefunction = MagicMock(return_value = 'fake')
		fakeself = MagicMock()
		self.assertEqual(testlinkapi_source.testlink.handlingFunction(fakeself, fakefunction), 'fake')

	def test_handlingFunction_args_case(self):
		fakefunction = MagicMock(return_value = 'fake')
		fakeself = MagicMock()
		self.assertEqual(testlinkapi_source.testlink.handlingFunction(fakeself, fakefunction, 1, 2, 3), 'fake')
		fakefunction.assert_called_with(1, 2, 3)

	@patch.object(testlinkapi_source,'print')
	def test_handlingFunction_TLResponseError_case(self, mockPrint):
		fakefunction = MagicMock(side_effect = faketestlink.testlinkerrors.TLResponseError)
		fakeself = MagicMock()
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.handlingFunction(fakeself, fakefunction)
		self.assertEqual(mockPrint.call_count, 1)

	@patch.object(testlinkapi_source,'print')
	def test_handlingFunction_TLConnectionError_case(self, mockPrint):
		fakefunction = MagicMock(side_effect = faketestlink.testlinkerrors.TLConnectionError)
		fakeself = MagicMock()
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.handlingFunction(fakeself, fakefunction)
		self.assertEqual(mockPrint.call_count, 1)

	@patch.object(testlinkapi_source,'print')
	def test_handlingFunction_TLArgErroror_case(self, mockPrint):
		fakefunction = MagicMock(side_effect = faketestlink.testlinkerrors.TLArgError)
		fakeself = MagicMock()
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.handlingFunction(fakeself, fakefunction)
		self.assertEqual(mockPrint.call_count, 1)

	@patch.object(testlinkapi_source,'print')
	def test_handlingFunction_TLAPIError_case(self, mockPrint):
		fakefunction = MagicMock(side_effect = faketestlink.testlinkerrors.TLAPIError)
		fakeself = MagicMock()
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.handlingFunction(fakeself, fakefunction)
		self.assertEqual(mockPrint.call_count, 1)

	def test_getProjectId_normal_case(self):
		fakeprojects = [
			{
				"name": "fakep",
				"id": "1"
			},
			{
				"name": "fakep2",
				"id": "2"
			},
			{
				"name": "fakep3",
				"id": "3"
			}
		]
		fakeproject = {
			"name": "fakep",
			"id": "1"
		}
		fakeunderscore._.find.return_value = fakeproject
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = fakeprojects)
		self.assertEqual(testlinkapi_source.testlink.getProjectId(fakeself, 'fakep'), 1)

	@patch.object(testlinkapi_source,'print')
	def test_getProjectId_none_case(self, mockPrint):
		fakeprojects = [
			{
				"name": "fakep1",
				"id": "1"
			},
			{
				"name": "fakep2",
				"id": "2"
			},
			{
				"name": "fakep3",
				"id": "3"
			}
		]
		fakeproject = None
		fakeunderscore._.find.return_value = fakeproject
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = fakeprojects)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.getProjectId(fakeself, 'fakep')
		self.assertEqual(mockPrint.call_count, 1)

	def test_getTestPlanId_normal_case(self):
		faketestplans = [
			{
				"name": "faketp",
				"id": "1",
				"active":"1"
			},
			{
				"name": "faketp2",
				"id": "2",
				"active":"1"
			},
			{
				"name": "faketp3",
				"id": "3",
				"active":"1"
			}
		]
		faketestplan = {
			"name": "faketp",
			"id": "1",
			"active":"1"
		}
		fakeunderscore._.find.return_value = faketestplan
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = faketestplans)
		self.assertEqual(testlinkapi_source.testlink.getTestPlanId(fakeself, 1, 'faketp'), 1)

	@patch.object(testlinkapi_source, 'print')
	def test_getTestPlanId_none_case(self, mockPrint):
		faketestplans = [
			{
				"name": "faketp1",
				"id": "1",
				"active":"1"
			},
			{
				"name": "faketp2",
				"id": "2",
				"active":"1"
			},
			{
				"name": "faketp3",
				"id": "3",
				"active":"1"
			}
		]
		faketestplan = None		
		fakeunderscore._.find.return_value = faketestplan
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = faketestplans)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.getTestPlanId(fakeself, 1, 'faketp')
		self.assertEqual(mockPrint.call_count, 1)

	@patch.object(testlinkapi_source, 'print')
	def test_getTestPlanId_notactive_case(self, mockPrint):
		faketestplans = [
			{
				"name": "faketp",
				"id": "1",
				"active":"0"
			},
			{
				"name": "faketp2",
				"id": "2",
				"active":"1"
			},
			{
				"name": "faketp3",
				"id": "3",
				"active":"1"
			}
		]
		faketestplan = {
			"name": "faketp",
			"id": "1",
			"active":"0"
		}
		fakeunderscore._.find.return_value = faketestplan
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = faketestplans)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.getTestPlanId(fakeself, 1, 'faketp')
		self.assertEqual(mockPrint.call_count, 1)

	def test_getBuildId_normal_case(self):
		fakebuilds = [
			{
				"name": "fakeb",
				"id": "1",
				"active":"1",
				"is_open":"1"
			},
			{
				"name": "fakeb2",
				"id": "2",
				"active":"1",
				"is_open":"1"
			},
			{
				"name": "fakeb3",
				"id": "3",
				"active":"1",
				"is_open":"1"
			}
		]
		fakebuild = {
			"name": "fakeb",
			"id": "1",
			"active":"1",
			"is_open":"1"
		}
		fakeunderscore._.find.return_value = fakebuild
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = fakebuilds)
		self.assertEqual(testlinkapi_source.testlink.getBuildId(fakeself, 1, 'fakeb'), 1)

	@patch.object(testlinkapi_source, 'print')
	def test_getBuildId_none_case(self, mockPrint):
		fakebuilds = [
			{
				"name": "fakeb1",
				"id": "1",
				"active":"1",
				"is_open":"1"
			},
			{
				"name": "fakeb2",
				"id": "2",
				"active":"1",
				"is_open":"1"
			},
			{
				"name": "fakeb3",
				"id": "3",
				"active":"1",
				"is_open":"1"
			}
		]
		fakebuild = None
		fakeunderscore._.find.return_value = fakebuild
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = fakebuilds)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.getBuildId(fakeself, 1, 'fakeb')
		self.assertEqual(mockPrint.call_count, 1)

	@patch.object(testlinkapi_source, 'print')
	def test_getBuildId_notactive_case(self, mockPrint):
		fakebuilds = [
			{
				"name": "fakeb",
				"id": "1",
				"active":"0",
				"is_open":"1"
			},
			{
				"name": "fakeb2",
				"id": "2",
				"active":"1",
				"is_open":"1"
			},
			{
				"name": "fakeb3",
				"id": "3",
				"active":"1",
				"is_open":"1"
			}
		]
		fakebuild = {
			"name": "fakeb",
			"id": "1",
			"active":"0",
			"is_open":"1"
		}
		fakeunderscore._.find.return_value = fakebuild
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = fakebuilds)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.getBuildId(fakeself, 1, 'fakeb')
		self.assertEqual(mockPrint.call_count, 1)

	@patch.object(testlinkapi_source, 'print')
	def test_getBuildId_notopen_case(self, mockPrint):
		fakebuilds = [
			{
				"name": "fakeb",
				"id": "1",
				"active":"1",
				"is_open":"0"
			},
			{
				"name": "fakeb2",
				"id": "2",
				"active":"1",
				"is_open":"1"
			},
			{
				"name": "fakeb3",
				"id": "3",
				"active":"1",
				"is_open":"1"
			}
		]
		fakebuild = {
			"name": "fakeb",
			"id": "1",
			"active":"1",
			"is_open":"0"
		}
		fakeunderscore._.find.return_value = fakebuild
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = fakebuilds)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.getBuildId(fakeself, 1, 'fakeb')
		self.assertEqual(mockPrint.call_count, 1)

	def test_getPlatformId_normal_case(self):
		fakeplatforms = [
			{
				"name": "fakep",
				"id": "1"			
			},
			{
				"name": "fakep2",
				"id": "2"			
			},
			{
				"name": "fakep3",
				"id": "3"
			}
		]
		fakeplatform = {
			"name": "fakep",
			"id": "1"
		}
		fakeunderscore._.find.return_value = fakeplatform
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = fakeplatforms)
		self.assertEqual(testlinkapi_source.testlink.getPlatformId(fakeself, 1, 'fakep'), 1)

	@patch.object(testlinkapi_source, 'print')
	def test_getPlatformId_none_case(self, mockPrint):
		fakeplatforms = [
			{
				"name": "fakep",
				"id": "1"			
			},
			{
				"name": "fakep2",
				"id": "2"			
			},
			{
				"name": "fakep3",
				"id": "3"
			}
		]
		fakeplatform = None
		fakeunderscore._.find.return_value = fakeplatform
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = fakeplatforms)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.getPlatformId(fakeself, 1, 'fakep')
		self.assertEqual(mockPrint.call_count, 1)

	def test_getTestCaseSuiteId_normal_case(self):
		faketestsuites = [
			{
				"name": "fakets",
				"id": "1",
				"parent_id": "4"
			},
			{
				"name": "fakets2",
				"id": "2",
				"parent_id": "5"			
			},
			{
				"name": "fakets3",
				"id": "3",
				"parent_id": "6"
			}
		]
		faketestsuite = {
			"name": "fakets",
			"id": "1"
		}
		fakeunderscore._.find.return_value = faketestsuite
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = faketestsuites)
		self.assertEqual(testlinkapi_source.testlink.getTestCaseSuiteId(fakeself, 1, 'fakets', 4), 1)

	@patch.object(testlinkapi_source, 'print')
	def test_getTestCaseSuiteId_none_case(self, mockPrint):
		faketestsuites = [
			{
				"name": "fakets1",
				"id": "1",
				"parent_id": "4"
			},
			{
				"name": "fakets2",
				"id": "2",
				"parent_id": "5"			
			},
			{
				"name": "fakets3",
				"id": "3",
				"parent_id": "6"
			}
		]
		faketestsuite = None
		fakeunderscore._.find.return_value = faketestsuite
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = faketestsuites)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.getTestCaseSuiteId(fakeself, 1, 'fakets', 4)
		self.assertEqual(mockPrint.call_count, 1)

	def test_getTestCaseSuites_normal_case(self):
		faketestsuites = [
			{
				"name": "fakets",
				"id": "1",
				"parent_id": "4"
			},
			{
				"name": "fakets2",
				"id": "2",
				"parent_id": "4"
			},
			{
				"name": "fakets3",
				"id": "3",
				"parent_id": "6"
			}
		]
		faketestsuite = {
			"name": "fakets",
			"id": "1",
			"parent_id": "4"
		}
		fakeunderscore._.filter.return_value = faketestsuite
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = faketestsuites)
		self.assertEqual(testlinkapi_source.testlink.getTestCaseSuites(fakeself, 1, 4), faketestsuite)

	def test_getTestCases_normal_case(self):
		faketestcases = [
			{
				"name": "faketc1",
				"id": "1"
			},
			{
				"name": "fakets2",
				"id": "2"
			},
			{
				"name": "fakets3",
				"id": "3"
			}
		]
		fakeself = MagicMock()
		fakeself.handlingFunction = MagicMock(return_value = faketestcases)
		self.assertEqual(testlinkapi_source.testlink.getTestCases(fakeself, 1), faketestcases)

	def test_testCaseExcute_normal_case(self):
		fakeself = MagicMock()
		fakeself.tls.reportTCResult = MagicMock()
		testlinkapi_source.testlink.testCaseExcute(fakeself, 1, 1, 'p', 'fakeb', 'passed', 1)

	@patch.object(testlinkapi_source,'print')
	def test_testCaseExcute_TLResponseError_case(self, mockPrint):
		fakeself = MagicMock()
		fakeself.tls.reportTCResult = MagicMock(side_effect = faketestlink.testlinkerrors.TLResponseError)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.testCaseExcute(fakeself, 1, 1, 'p', 'fakeb', 'passed', 1)
		self.assertEqual(mockPrint.call_count, 1)

	@patch.object(testlinkapi_source,'print')
	def test_testCaseExcute_TLConnectionError_case(self, mockPrint):
		fakeself = MagicMock()
		fakeself.tls.reportTCResult = MagicMock(side_effect = faketestlink.testlinkerrors.TLConnectionError)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.testCaseExcute(fakeself, 1, 1, 'p', 'fakeb', 'passed', 1)
		self.assertEqual(mockPrint.call_count, 1)

	@patch.object(testlinkapi_source,'print')
	def test_testCaseExcute_TLArgError_case(self, mockPrint):
		fakeself = MagicMock()
		fakeself.tls.reportTCResult = MagicMock(side_effect = faketestlink.testlinkerrors.TLArgError)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.testCaseExcute(fakeself, 1, 1, 'p', 'fakeb', 'passed', 1)
		self.assertEqual(mockPrint.call_count, 1)

	@patch.object(testlinkapi_source,'print')
	def test_testCaseExcute_TLAPIError_case(self, mockPrint):
		fakeself = MagicMock()
		fakeself.tls.reportTCResult = MagicMock(side_effect = faketestlink.testlinkerrors.TLAPIError)
		with self.assertRaises(SystemExit):
			testlinkapi_source.testlink.testCaseExcute(fakeself, 1, 1, 'p', 'fakeb', 'passed', 1)
		self.assertEqual(mockPrint.call_count, 1)


if(__name__ == "__main__"):
	unittest.main()
