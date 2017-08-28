import unittest
from unittest.mock import patch
from unittest.mock import MagicMock
from pprint import pprint as p
import sys
import os
import imp
import urllib
import configparser
import json
import tempfile

fake_bs4 =  MagicMock()
fake_bs4.BeautifulSoup = MagicMock()
sys.modules['bs4'] = fake_bs4
PythonHtmlParser = imp.load_source('PythonHtmlParser', os.path.join(os.path.dirname(__file__), '../../../../deploy/test_management/spira_test/PythonHtmlParser.py'))
PythonHtmlParserClass = PythonHtmlParser.PythonHtmlParser
config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__),'config.ini'))

class spira_test(unittest.TestCase):

    @patch.object(PythonHtmlParser,'print')
    def test_constructor_normal_case(self,mockPrint):
        parser = PythonHtmlParserClass('fakepath')
        self.assertEqual(mockPrint.call_count,0)
        self.assertEqual(parser.path, 'fakepath')
    
    def test_removeLineBreak_normal_case(self):
        fakecontent = "<p> test </p> <h1> head </h1> \n <div> line break </div>"
        return_content_should_be = "<p>test </p><h1>head </h1><div>line break </div>"
        return_content = PythonHtmlParserClass.removeLineBreak(self,fakecontent)
        self.assertEqual(return_content, return_content_should_be)
    
    @patch.object(PythonHtmlParser,'print')
    def test_removeLineBreak_no_content_case(self,mockPrint):
        with self.assertRaises(SystemExit) as cm:
            return_content = PythonHtmlParserClass.removeLineBreak(self)
        the_exception = cm.exception
        self.assertEqual(mockPrint.call_count,1)
        self.assertEqual(the_exception.code, 0)

    def test_removeLineBreak_self_content_case(self):
        fakeself = MagicMock()
        fakeself.content = "<p> test </p> <h1> head </h1> \n <div> line break </div>"
        return_content_should_be = "<p>test </p><h1>head </h1><div>line break </div>"
        return_content = PythonHtmlParserClass.removeLineBreak(fakeself)
        self.assertEqual(return_content, return_content_should_be)

    
    def test_getFile_normal_case(self):
        tf = tempfile.NamedTemporaryFile()
        tf.write(b"Hello World!\n")
        tf.seek(0)
        content = PythonHtmlParserClass.getFile(self,tf.name)
        self.assertEqual(content, "Hello World!\n")
    
    @patch.object(PythonHtmlParser,'print')
    def test_getFile_no_file_case(self,mockPrint):
        with self.assertRaises(SystemExit) as cm:
            PythonHtmlParserClass.getFile(self,"file_not_exist")
        the_exception = cm.exception
        self.assertEqual(mockPrint.call_count,1)
        self.assertEqual(the_exception.code, 0)

    def test_parsePythonUnitTestReport_normal_case(self):
        start_time = MagicMock()
        start_time.strong.next_sibling = "2016-05-13 10:52:18"

        duration = MagicMock()
        duration.strong.next_sibling = "0:00:00.000562"

        status_pass = MagicMock()
        status_pass.string = "3"
        status_failure = MagicMock()
        status_failure.string = "1"
        status_error = MagicMock()
        status_error.string = "0"
        status = MagicMock()
        status.select = MagicMock(return_value = ["","",status_pass,status_failure,status_error])

        case_name1 = MagicMock()
        case_name1.string = "tc1.Tc1"
        count1 = MagicMock()
        count1.string = "2"
        passes1 = MagicMock()
        passes1.string = "1"
        fail1 = MagicMock()
        fail1.string = "1"
        error1 =  MagicMock()
        error1.string = "0"

        case_name2 = MagicMock()
        case_name2.string = "tc2.Tc2"
        count2 = MagicMock()
        count2.string = "2"
        passes2 = MagicMock()
        passes2.string = "2"
        fail2 = MagicMock()
        fail2.string = "0"
        error2 =  MagicMock()
        error2.string = "0"

        step_name1 = MagicMock()
        step_name1.get_text = MagicMock(return_value  = "test1")
        step_status1 = MagicMock()
        step_status1.a.string = "error"
        step_status1.pre.get_text = MagicMock(return_value  = "null")

        step_name2 = MagicMock()
        step_name2.get_text = MagicMock(return_value  = "test2")
        step_status2 = MagicMock()
        step_status2.a.string = "fail"
        step_status2.pre.get_text = MagicMock(return_value  = "ft1.2: Traceback (most recent calllast):<br><span style=\"margin-left:15px\"></span>  File \"/root/taas-ci/generic/jenkins/workspace/TestPythonUnitTest-20160513-ab7f2223/tests/tc1.py\", line 8,in test2<br><span style=\"margin-left:15px\"></span>    self.assertEqual(3, 5, 'not equal')<br><span style=\"margin-left:15px\"></span>AssertionError: not equal<br><span style=\"margin-left:15px\"></span><br><span style=\"margin-left:15px\"></span><br><span style=\"margin-left:15px\"></span>        ")

        step_name3 = MagicMock()
        step_name3.get_text = MagicMock(return_value  = "test1")
        step_status3 = MagicMock()
        step_status3.get_text = MagicMock(return_value  = "pass")

        step_name4 = MagicMock()
        step_name4.get_text = MagicMock(return_value  = "test2")
        step_status4 = MagicMock()
        step_status4.get_text = MagicMock(return_value  = "pass")

        case1 = MagicMock()
        case1.get = MagicMock(return_value  = ["hiddenRow"])
        case1.select = MagicMock(return_value  = [step_name1,step_status1])
        case1.td.next_sibling.a = "somthing"

        case2 = MagicMock()
        case2.get = MagicMock(return_value  = ["none"])
        case2.select = MagicMock(return_value  = [step_name2,step_status2])
        case2.td.next_sibling.a = "somthing"

        case3 = MagicMock()
        case3.get = MagicMock(return_value  = ["hiddenRow"])
        case3.select = MagicMock(return_value  = [step_name3,step_status3])
        case3.td.next_sibling.a = None

        case4 = MagicMock()
        case4.get = MagicMock(return_value  = ["none"])
        case4.select = MagicMock(return_value  = [step_name4,step_status4])
        case4.td.next_sibling.a = None

        test_cases_1 = MagicMock()
        test_cases_1.select = MagicMock(return_value = [case_name1,count1,passes1,fail1,error1])
        test_cases_1.next_siblings = [case1,case2]

        test_cases_2 = MagicMock()
        test_cases_2.select = MagicMock(return_value = [case_name2,count2,passes2,fail2,error2])
        test_cases_2.next_siblings = [case3,case4]

        fake_bs4.BeautifulSoup.return_value = fake_bs4.BeautifulSoup
        fake_bs4.BeautifulSoup.select = MagicMock(side_effect = [[start_time],["",duration],[status],[status],[status],[test_cases_2,test_cases_1]])
        fakeself = MagicMock()
        fakeself.content =  MagicMock()
        fakeself.removeLineBreak = MagicMock()
        return_content = PythonHtmlParserClass.parsePythonUnitTestReport(fakeself)
        fake_content = json.loads(config['PythonSpiraTestReporter']['examplereport'])
        self.assertEqual(return_content, fake_content)

    @patch.object(PythonHtmlParser,'print')
    def test_parsePythonUnitTestReport_cannot_parse(self,mockPrint):
        with self.assertRaises(SystemExit) as cm:
            fakeself = MagicMock()
            fakeself.removeLineBreak = MagicMock()
            fakeself.getFile = MagicMock()
            fake_bs4.BeautifulSoup.return_value = None
            return_content = PythonHtmlParserClass.parsePythonUnitTestReport(fakeself)
            print(return_content)
        the_exception = cm.exception
        self.assertEqual(mockPrint.call_count,1)
        self.assertEqual(the_exception.code, 0)
        
if(__name__ == "__main__"):
    unittest.main()