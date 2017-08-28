from bs4 import BeautifulSoup
import sys
import re

class PythonHtmlParser:
    """PythonHtmlParser

    Read content of python html report file ,then parse content to dict.

    Attributes:
        path(string): file path
        content(string): html format
        result(dict): parse from content
    """
    def __init__(self,path = None):
        """Inits PythonHtmlParser with path."""
        if path is None:
            self.path = ""
        else:
            self.path = path

    def getFile(self,path = None):
        """ Read the file from path and set content.
            
        Args:
            path(string): Optional variable, the file path.

        Returns:
            content(string): the content of the file.

        Raises:
            Error:if file isn't exist.

        """
        if path is not None:self.path = path
        try:
            with open(self.path, 'r', encoding='UTF-8') as file :
                self.content = file.read()
                file.close()
                return self.content
        except:
            print('[Error] Open File:',self.path,' fail')
            sys.exit(0)

    def removeLineBreak(self,content = None):
        """ Remove the line break and format html from the content.

        Formatting html for Beautiful Soup parse.Use re(regular expression) module.
            
        Args:
            content(string): Optional variable.

        Returns:
            content(string): could be parsed by Beautiful Soup .

        Raises:
            Error: if content isn't set.

        """
        if content is None:
            try:
                content = self.content
            except:
                print('[Error] Python Parser: No Content to Execute')
                sys.exit(0)
        content = content.replace(">\n",">")
        content = re.sub(r'(?is)>\s+<', '><', content)
        content = re.sub(r'(?is)>\s+', '>', content)
        self.content = content
        return content

    def parsePythonUnitTestReport(self,content = None):
        """ Parse the formatted string to dictionary.

        Check whether content is exist and format it.
            
        Args:
            content(string): Optional variable.

        Returns:
            result(dict):
            A dict mapping keys to the corresponding content.
            For example:

            {'duration': '0:00:00.000562',
             'start_time': '2016-05-13 10:52:18',
             'status': {'error': '0', 'failure': '1', 'pass': '2'},
             'test_suites': [{'suite_name': 'tc1.Tc1',
                             'count': '3',
                             'error': '0',
                             'fail': '1',
                             'pass': '2',
                             'test_cases': [ {'status': 'pass', 'case_name': 'test1'},
                                            {'status': 'pass', 'case_name': 'test2'},
                                            {'status': 'fail', 'case_name': 'test2' , 'message': 'something wrong'}]}]}

        Raises:
            Error: content's format is wrong,so parser cannot find the element.

        """
        if content is None:
            if hasattr(self, 'content'):
                content = self.content
            else:
                content = self.getFile()
        content = self.removeLineBreak(content)
        try:
            soup = BeautifulSoup(content, 'html.parser')
            start_time = soup.select(".attribute")[0].strong.next_sibling
            duration = soup.select(".attribute")[1].strong.next_sibling
            status_pass = soup.select("#total_row")[0].select("td")[2].string
            status_failure = soup.select("#total_row")[0].select("td")[3].string
            status_error = soup.select("#total_row")[0].select("td")[4].string

            result_test_suites = []

            test_suites_all = soup.select(".passClass , .failClass , .errorClass")
            for test_suites in test_suites_all:
                result_test_case = dict()
                result_test_case['suite_name'] = test_suites.select("td")[0].string
                result_test_case['count'] = test_suites.select("td")[1].string
                result_test_case['pass'] = test_suites.select("td")[2].string
                result_test_case['fail'] = test_suites.select("td")[3].string
                result_test_case['error'] = test_suites.select("td")[4].string
                result_test_case['test_cases'] = []
                test_case = test_suites.next_siblings
                for steps in test_case:
                    if steps.get('class') is None : break
                    if steps.get('class')[0] != "none" and steps.get('class')[0] != "hiddenRow" : break
                    step = dict()
                    step['case_name'] = steps.select("td")[0].get_text()
                    #remove string after ':' to prevent from docstring
                    step['case_name'] = step['case_name'].split(':')[0]
                    if steps.td.next_sibling.a is None : 
                        step['status'] = steps.select("td")[1].get_text()
                    else: 
                        step['status'] = steps.select("td")[1].a.string
                        rawMessage = steps.select("td")[1].pre.get_text()
                        step['message'] = rawMessage#.replace("\n",'<br><span style="margin-left:15px"></span>')
                    result_test_case['test_cases'].append(step)
                result_test_suites.append(result_test_case)

            result = dict()
            result['start_time'] = start_time
            result['duration'] = duration
            result['status'] = {'pass':status_pass , 'failure':status_failure , 'error':status_error}
            result['test_suites'] = result_test_suites
            self.result = result
            return result
        except:
            print('[Error] Python Parser: Cannot parse this HTML file')
            sys.exit(0)