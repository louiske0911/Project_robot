var assert = require('chai').assert;
var sinon = require('sinon');
var logParser = require('../../lib/logParser.js');

suite('lib/logParser.js',function(){
	// There is always a \n at the end of text because log generated by Jenkins always has a \n at the end
	test('html entities case', function(){
		assert.equal(logParser.parseLog('>\n'), '<table><tr><td style="width:30px"></td><td>&gt;</td></tr></table>');
		assert.equal(logParser.parseLog('<\n'), '<table><tr><td style="width:30px"></td><td>&lt;</td></tr></table>');
		assert.equal(logParser.parseLog('/\n'), '<table><tr><td style="width:30px"></td><td>&sol;</td></tr></table>');
		assert.equal(logParser.parseLog('<a href="123.html">123</a>\n'), '<table><tr><td style="width:30px"></td><td>&lt;a href="123.html"&gt;123&lt;&sol;a&gt;</td></tr></table>');
	});
	// If there is a \n at the beginning of text, it means the testing text is supposed not to be processed as first line.
	// There will be an additional css property in first line.
	test('Table tag preparation case', function(){
		assert.equal(logParser.parseLog('\n\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td></td></tr></table>');
		assert.equal(logParser.parseLog('\nline text\nline text\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td>line text</td></tr><tr><td></td><td>line text</td></tr></table>');
	});

	test('Simplify common text case', function(){
		assert.equal(logParser.parseLog('Started by upstream project "ScmGit-20170324-24d63cab" build number 6\noriginally caused by:\n Started by user anonymous\nBuilding remotely on taas-slave-base-cd651f0d (swarm taas base) in workspace /var/lib/jenkins/workspace/Selenium-20170324-b716d36a\nRestoring workspace from build #6 of project ScmGit-20170324-24d63cab\n'), '<table><tr><td style="width:30px"></td><td>Starting build</td></tr></table>');
	});

	test('Hide common text case', function(){
		assert.equal(logParser.parseLog('\n+ set +x\n'), '<table><tr><td style="width:30px"></td><td></td></tr></table>');
		assert.equal(logParser.parseLog('\nDeleting old workspace snapshot from #1.\n'), '<table><tr><td style="width:30px"></td><td></td></tr></table>');
		assert.equal(logParser.parseLog('\n+ exit 0\n'), '<table><tr><td style="width:30px"></td><td></td></tr></table>');
		assert.equal(logParser.parseLog('\nWarning: you have no plugins providing access control for builds, so falling back to legacy behavior of permitting any downstream builds to be triggered\n'), '<table><tr><td style="width:30px"></td><td></td></tr></table>');
		assert.equal(logParser.parseLog('\n+ RETVAL=0\n'), '<table><tr><td style="width:30px"></td><td></td></tr></table>');
	});

	test('Handle common java error case', function(){
		assert.equal(logParser.parseLog('\njava.nio.file.AccessDeniedException: /home/ubuntu/jenkins/workspace/Selenium-20161115-ca99dd3e/tests/integration/__pycache__/tc1_wd.cpython-35.pyc\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td style="color:red">java.nio.file.AccessDeniedException: &sol;home&sol;ubuntu&sol;jenkins&sol;workspace&sol;Selenium-20161115-ca99dd3e&sol;tests&sol;integration&sol;__pycache__&sol;tc1_wd.cpython-35.pyc</td></tr></table>');
		assert.equal(logParser.parseLog('\nCaused by: java.nio.file.AccessDeniedException: /home/ubuntu/jenkins/workspace/Selenium-20161115-ca99dd3e/tests/integration/__pycache__/tc1_wd.cpython-35.pyc\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td style="color:red">Caused by: java.nio.file.AccessDeniedException: &sol;home&sol;ubuntu&sol;jenkins&sol;workspace&sol;Selenium-20161115-ca99dd3e&sol;tests&sol;integration&sol;__pycache__&sol;tc1_wd.cpython-35.pyc</td></tr></table>');
		assert.equal(logParser.parseLog('\n	at org.jenkinsci.plugins.gitclient.CliGitAPIImpl.launchCommandIn(CliGitAPIImpl.java:1723)\n	at org.jenkinsci.plugins.gitclient.CliGitAPIImpl.launchCommandWithCredentials(CliGitAPIImpl.java:1459)\n	at org.jenkinsci.plugins.gitclient.CliGitAPIImpl.access$300(CliGitAPIImpl.java:63)\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td class="FoldItem Err"></td><td style="color:red;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;at org.jenkinsci.plugins.gitclient.CliGitAPIImpl.launchCommandIn(CliGitAPIImpl.java:1723)</td></tr><tr><td class="FoldItem Err"></td><td style="color:red;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;at org.jenkinsci.plugins.gitclient.CliGitAPIImpl.launchCommandWithCredentials(CliGitAPIImpl.java:1459)</td></tr><tr><td class="FoldItem Err"></td><td style="color:red;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;at org.jenkinsci.plugins.gitclient.CliGitAPIImpl.access$300(CliGitAPIImpl.java:63)</td></tr></table>');
		assert.equal(logParser.parseLog('\n	... 11 more\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td class="FoldItem Err"></td><td style="color:red;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;... 11 more</td></tr></table>');
	});

	test('Handle tag case', function(){
		assert.equal(logParser.parseLog('\n[Warn] SpiraTest: The release corresponding to the given release version number is found, so use the original one instead\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td style="color:orange">[Warn] SpiraTest: The release corresponding to the given release version number is found, so use the original one instead</td></tr></table>');
	});

	test('Handle finish status case', function(){
		assert.equal(logParser.parseLog('\nFinished: SUCCESS\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td>Finished: <span style="color:green">Success</span></td></tr></table>');
		assert.equal(logParser.parseLog('\nFinished: FAILURE\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td>Finished: <span style="color:red">Failure</span></td></tr></table>');
	});

	test('Handle url case', function(){
		assert.equal(logParser.parseLog('\ntext http://140.96.27.78:10080/A50003/example_selenium.git\ntext http://140.96.27.78:10080/A50003/example_selenium.git text\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td>text <a target="_blank" href="http:&sol;&sol;140.96.27.78:10080&sol;A50003&sol;example_selenium.git">http:&sol;&sol;140.96.27.78:10080&sol;A50003&sol;example_selenium.git</a><tr><td></td><td>text <a target="_blank" href="http:&sol;&sol;140.96.27.78:10080&sol;A50003&sol;example_selenium.git">http:&sol;&sol;140.96.27.78:10080&sol;A50003&sol;example_selenium.git</a> text</td></tr></table>');
	});

	test('Hide python text case', function(){
		assert.equal(logParser.parseLog('\n[TestPythonUnitTest-20170302-ef93812d] $ /bin/bash /tmp/hudson6976298457166987115.sh\n'), '<table><tr><td style="width:30px"></td><td></td></tr></table>');
	});

	test('Fold git text case', function(){
		assert.equal(logParser.parseLog('\nCloning repository\n > git command\nFetching upstream changes from\n > git command2\n > git command3\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td>Cloning repository</td></tr><tr><td class="FoldItem"></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;git command</td></tr><tr><td></td><td>Fetching upstream changes from</td></tr><tr><td class="FoldItem"></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;git command2</td></tr><tr><td class="FoldItem"></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;git command3</td></tr></table>');
	});

	test('Hide selenium text case', function(){
		assert.equal(logParser.parseLog('\n[Selenium-20161128-09f1e05e] $ /bin/sh -xe /tmp/hudson7240044131741230886.sh\n'), '<table><tr><td style="width:30px"></td><td></td></tr></table>');
		assert.equal(logParser.parseLog('\n+ runtest_ret=0\n'), '<table><tr><td style="width:30px"></td><td></td></tr></table>');
	});

	test('Fold selenium text case', function(){
		assert.equal(logParser.parseLog('\n+ sudo /root/selenium_lib/taas-xvfb-run.centos -s -screen 0 1024x768x8 python3 /root/test_lib/python/runtest.py tests/integration tc1_wd.py Selenium-WD-results-Selenium-20161128-09f1e05e.html\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td>Start testing..</td></tr><tr><td class="FoldItem"></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;sudo &sol;root&sol;selenium_lib&sol;taas-xvfb-run.centos -s -screen 0 1024x768x8 python3 &sol;root&sol;test_lib&sol;python&sol;runtest.py tests&sol;integration tc1_wd.py Selenium-WD-results-Selenium-20161128-09f1e05e.html</td></tr></table>');
		assert.equal(logParser.parseLog('\nClean up run files...\n+ sudo rm -f Selenium-*-results-*Selenium-20161128-09f1e05e*.html Selenium-*-results-*Selenium-20161128-09f1e05e*.txt\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td></td><td>Clean up run files...</td></tr><tr><td class="FoldItem"></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;sudo rm -f Selenium-*-results-*Selenium-20161128-09f1e05e*.html Selenium-*-results-*Selenium-20161128-09f1e05e*.txt</td></tr></table>');
		assert.equal(logParser.parseLog('\n02:23:08.206 INFO - Launching a standalone Selenium Server\n02:23:08.258 INFO - Java: Oracle Corporation 25.111-b14\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td class="FoldItem"></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;02:23:08.206 INFO - Launching a standalone Selenium Server</td></tr><tr><td class="FoldItem"></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;02:23:08.258 INFO - Java: Oracle Corporation 25.111-b14</td></tr></table>');
		assert.equal(logParser.parseLog('\njar:file:/root/selenium_lib/selenium-server.jar!/customProfileDirCUSTFFCHROME\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td class="FoldItem"></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;jar:file:&sol;root&sol;selenium_lib&sol;selenium-server.jar!&sol;customProfileDirCUSTFFCHROME</td></tr></table>');
		assert.equal(logParser.parseLog('\nregistration capabilities Capabilities [{ensureCleanSession=true, browserName=internet explorer, version=, platform=WINDOWS}] does not match the current platform LINUX\n'), '<table><tr><td style="width:30px"></td><td></td></tr><tr><td class="FoldItem"></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;registration capabilities Capabilities [{ensureCleanSession=true, browserName=internet explorer, version=, platform=WINDOWS}] does not match the current platform LINUX</td></tr></table>');
	});
});