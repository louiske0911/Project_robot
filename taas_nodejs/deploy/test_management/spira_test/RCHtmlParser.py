from bs4 import BeautifulSoup
import sys
import re

class RCHtmlParser:
    """RCHtmlParser

    Read content of RC-selenium html report file ,then parse content to dict.

    Attributes:
        path(string): file path
        content(string): html format
        result(dict): parse from content
    """
    def __init__(self,path = None):
        """Inits RCHtmlParser with path."""
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
            Error: if file isn't exist.

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

    def parseRCUnitTestReport(self,content = None):
        """ Parse the formatted string to dictionary.

        Check whether content is exist and format it.
            
        Args:
            content(string): Optional variable.

        Returns:
            result(dict):
            A dict mapping keys to the corresponding content.
            For example:

            {'duration': '5',
             'test_suites': [{'suite_name': 'ts1',
                             'status': 'pass',
                             'test_cases': [{'action': '/',
                                            'message': '',
                                            'status': 'pass',
                                            'case_name': 'open'},
                                           {'action': 'id=UHSearchBox',
                                            'message': 'hello world!',
                                            'status': 'pass',
                                            'case_name': 'type'},
                                           {'action': 'id=UHSearchWeb',
                                            'message': '',
                                            'status': 'pass',
                                            'case_name': 'clickAndWait'}]}]}
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
            result = dict()
            result['duration']  = soup.select('table')[0].select('tr')[1].select('td')[1].get_text()
            test_suites = []
            test_suites_links = soup.select("#suiteTable")[0].select("td a")
            for link in test_suites_links:
                test_case = dict()
                name_attr = re.sub(r'(?is)#', '', link['href'])
                table = soup.find("a",{"name":name_attr}).parent.select("table")[0]
                test_case['suite_name'] = table.select('.title')[0].get_text()
                if table.select('.title')[0]['class'].count('status_passed'):
                    test_case['status'] = "pass"
                elif table.select('.title')[0]['class'].count('status_failed'):
                    test_case['status'] = "fail"
                else:
                    test_case['status'] = "Parsing Wrong"

                test_case['test_cases'] = []
                steps = table.select('tbody')[0].select('tr')
                for stp in steps:
                    step = dict()
                    status_classes = stp['class']
                    if status_classes.count('status_failed'): 
                        step['status'] = "fail"
                    elif status_classes.count('status_done'): 
                        step['status'] = "pass"
                    else:
                        step['status'] = "Not Run"
                    step['case_name'] = stp.select('td')[0].get_text()
                    step['action'] = stp.select('td')[1].get_text()
                    step['message'] = stp.select('td')[2].get_text()
                    test_case['test_cases'].append(step)
                test_suites.append(test_case)
            result['test_suites'] = test_suites
            return result
        except:
            print('[Error] Python Parser: Cannot parse this HTML file')
            sys.exit(0)