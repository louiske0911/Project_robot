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
RCHtmlParser = imp.load_source('RCHtmlParser', os.path.join(os.path.dirname(__file__), '../../../../deploy/test_management/spira_test/RCHtmlParser.py'))
RCHtmlParserClass = RCHtmlParser.RCHtmlParser
config = configparser.ConfigParser()
config.read(os.path.join(os.path.dirname(__file__),'config.ini'))

class spira_test(unittest.TestCase):

    @patch.object(RCHtmlParser,'print')
    def test_constructor_normal_case(self,mockPrint):
        parser = RCHtmlParserClass('fakepath')
        self.assertEqual(mockPrint.call_count,0)
        self.assertEqual(parser.path, 'fakepath')
    
    def test_removeLineBreak_normal_case(self):
        fakecontent = "<p> test </p> <h1> head </h1> \n <div> line break </div>"
        return_content_should_be = "<p>test </p><h1>head </h1><div>line break </div>"
        return_content = RCHtmlParserClass.removeLineBreak(self,fakecontent)
        self.assertEqual(return_content, return_content_should_be)
    
    @patch.object(RCHtmlParser,'print')
    def test_removeLineBreak_no_content_case(self,mockPrint):
        with self.assertRaises(SystemExit) as cm:
            return_content = RCHtmlParserClass.removeLineBreak(self)
        the_exception = cm.exception
        self.assertEqual(mockPrint.call_count,1)
        self.assertEqual(the_exception.code, 0)

    def test_removeLineBreak_self_content_case(self):
        fakeself = MagicMock()
        fakeself.content = "<p> test </p> <h1> head </h1> \n <div> line break </div>"
        return_content_should_be = "<p>test </p><h1>head </h1><div>line break </div>"
        return_content = RCHtmlParserClass.removeLineBreak(fakeself)
        self.assertEqual(return_content, return_content_should_be)

    def test_getFile_normal_case(self):
        tf = tempfile.NamedTemporaryFile()
        tf.write(b"Hello World!\n")
        tf.seek(0)
        content = RCHtmlParserClass.getFile(self,tf.name)
        self.assertEqual(content, "Hello World!\n")
    
    @patch.object(RCHtmlParser,'print')
    def test_getFile_no_file_case(self,mockPrint):
        with self.assertRaises(SystemExit) as cm:
            RCHtmlParserClass.getFile(self,"file_not_exist")
        the_exception = cm.exception
        self.assertEqual(mockPrint.call_count,1)
        self.assertEqual(the_exception.code, 0)

    @patch('re.sub')
    def test_parsePythonUnitTestReport_normal_case(self,mockReSub):
        start_time = MagicMock()
        start_time.strong.next_sibling = "2016-05-13 10:52:18"

        td = MagicMock()
        td.get_text = MagicMock(return_value = "5")
        tr = MagicMock()
        tr.select = MagicMock(side_effect = [["",td]])
        duration_table = MagicMock()
        duration_table.select = MagicMock(side_effect = [["",tr]])

        case_name = MagicMock()
        case_name.get_text = MagicMock(return_value = "ts1")
        status = MagicMock()
        status.count = MagicMock(return_value = 1)

        step_name1 = MagicMock()
        step_name1.get_text = MagicMock(return_value = "open")
        step_action1 = MagicMock()
        step_action1.get_text = MagicMock(return_value = "/")
        step_message1 = MagicMock()
        step_message1.get_text = MagicMock(return_value = "")
        step1 = MagicMock()
        step1['class'].count = MagicMock(side_effect = (0,1))
        step1.select = MagicMock(return_value = [step_name1,step_action1,step_message1])

        step_name2 = MagicMock()
        step_name2.get_text = MagicMock(return_value = "type")
        step_action2 = MagicMock()
        step_action2.get_text = MagicMock(return_value = "id=UHSearchBox")
        step_message2 = MagicMock()
        step_message2.get_text = MagicMock(return_value = "hello world!")
        step2 = MagicMock()
        step2['class'].count = MagicMock(side_effect = (0,1))
        step2.select = MagicMock(return_value = [step_name2,step_action2,step_message2])

        step_name3 = MagicMock()
        step_name3.get_text = MagicMock(return_value = "clickAndWait")
        step_action3 = MagicMock()
        step_action3.get_text = MagicMock(return_value = "id=UHSearchWeb")
        step_message3 = MagicMock()
        step_message3.get_text = MagicMock(return_value = "")
        step3 = MagicMock()
        step3['class'].count = MagicMock(side_effect = (0,1))
        step3.select = MagicMock(return_value = [step_name3,step_action3,step_message3])

        tbody = MagicMock()
        tbody.select = MagicMock(return_value = [step1,step2,step3])
        table = MagicMock()
        table.select = MagicMock(side_effect = [[case_name],[{'class':status}],[tbody]])
        name_attr = MagicMock()
        name_attr.parent.select = MagicMock(return_value = [table])

        test_cases_link1 = MagicMock()
        test_cases_link1.find = MagicMock(return_value = name_attr)

        suiteTable = MagicMock()
        suiteTable.select = MagicMock(side_effect = [[test_cases_link1]])
        fake_bs4.BeautifulSoup.select = MagicMock(side_effect = [[duration_table],[suiteTable]])
        fake_bs4.BeautifulSoup.find = MagicMock(return_value = name_attr)
        fake_bs4.BeautifulSoup.return_value = fake_bs4.BeautifulSoup
        fakeself = MagicMock()
        fakeself.content =  MagicMock()
        fakeself.removeLineBreak = MagicMock()
        return_content = RCHtmlParserClass.parseRCUnitTestReport(fakeself)
        fake_content = json.loads(config['RCSpiraTestReporter']['examplereport'])
        self.assertEqual(return_content, fake_content)

    @patch.object(RCHtmlParser,'print')
    def test_parsePythonUnitTestReport_cannot_parse(self,mockPrint):
        with self.assertRaises(SystemExit) as cm:
            fakeself = MagicMock()
            fakeself.removeLineBreak = MagicMock()
            fakeself.getFile = MagicMock()
            fake_bs4.BeautifulSoup.return_value = None
            return_content = RCHtmlParserClass.parseRCUnitTestReport(fakeself)
        the_exception = cm.exception
        self.assertEqual(mockPrint.call_count,1)
        self.assertEqual(the_exception.code, 0)
if(__name__ == "__main__"):
    unittest.main()