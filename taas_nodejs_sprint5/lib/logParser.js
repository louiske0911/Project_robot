exports.parseLog = function(log){
	// encode some html entities which may cause problem
	var encodeEntitiesRegex = /</g;
	var encodeEntitiesReplacement = '&lt;';
	var encodeEntitiesRegex2 = />/g;
	var encodeEntitiesReplacement2 = '&gt;';
	var encodeEntitiesRegex3 = /\//g;
	var encodeEntitiesReplacement3 = '&sol;';
	// replace every new-line into a html tr tag
	var PrepareRegex = /\n/g;
	var PrepareReplacement = '</td></tr><tr><td></td><td>';
	// fix text that user doesn't need to know
	var CommonRegex = /(Build )?Started by.*Building remotely on.+?<\/td><\/tr>(<tr><td><\/td><td>Restoring workspace from build.+?<\/td><\/tr>)?/;
	var CommonReplacement = 'Starting build</td></tr>';
	// recognize "java."" at the beginning of a line as an error message and print with red color
	var CommonJavaErrorRegex = /<tr><td><\/td><td>(java\..+?<\/td><\/tr>)/g;
	var CommonJavaErrorReplacement = '<tr><td></td><td style="color:red">$1';
	// recognize "Caused by:"" at the beginning of a line as an error message and print with red color
	var CommonJavaErrorRegex2 = /<tr><td><\/td><td>(Caused by:.+?<\/td><\/tr>)/g;
	var CommonJavaErrorReplacement2 = '<tr><td></td><td style="color:red">$1';
	// recognize "	at " at the beginning of a line as an error message and print with red color
	var CommonJavaErrorRegex3 = /<tr><td><\/td><td>(	at .+?<\/td><\/tr>)/g;
	var CommonJavaErrorReplacement3 = '<tr><td class="FoldItem Err"></td><td style="color:red;">$1';
	// recognize "... xx more"(xx is a number) at the beginning of a line as an error message and print with red color
	var CommonJavaErrorRegex4 = /<tr><td><\/td><td>(	... [0-9]* more<\/td><\/tr>)/g;
	var CommonJavaErrorReplacement4 = '<tr><td class="FoldItem Err"></td><td style="color:red;">$1';
	// hide useless information for user
	var CommonHideTextRegex = /<tr><td><\/td><td>\+ set [\+\-][xe]<\/td><\/tr>/g;
	var CommonHideTextRegex2 = /<tr><td><\/td><td>Deleting old workspace snapshot from.+?<\/td><\/tr>/g;
	var CommonHideTextRegex3 = /<tr><td><\/td><td>\+ exit .+?<\/td><\/tr>/g;
	var CommonHideTextRegex4 = /<tr><td><\/td><td>Warning: you have no plugins providing access control for builds, so falling back to legacy behavior of permitting any downstream builds to be triggered<\/td><\/tr>/;
	var CommonHideTextRegex5 = /<tr><td><\/td><td>\+ RETVAL=[0-9]<\/td><\/tr>/g;
	// print warning message with orange color
	var CommonWarnTagRegex = /<tr><td><\/td><td>(\[Warn\] .+?<\/td><\/tr>)/g;
	var CommonWarnTagReplacement = '<tr><td></td><td style="color:orange">$1';
	// print success with green color
	var CommonSuccessRegex = /(<tr><td><\/td><td>Finished: )SUCCESS/;
	var CommonSuccessReplacement = '$1<span style="color:green">Success</span>';
	// print success with red color
	var CommonFailureRegex = /(<tr><td><\/td><td>Finished: )FAILURE/;
	var CommonFailureReplacement = '$1<span style="color:red">Failure</span>';
	// hide useless information for user
	var CommonTriggerRegex = /<tr><td><\/td><td>Triggering a new build of.+?<\/td><\/tr>/;;
	var CommonTriggerReplacement = '<tr><td></td><td>Trigger the next Test Task</td></tr>';
	// attach hyperlink to every url
	var CommonUrlRegex = /(https?:&sol;&sol;(www\.)?[^# ]*)<\/td><\/tr>/g;
	var CommonUrlReplacement = '<a target="_blank" href="$1">$1</a>';
	var CommonUrlRegex2 = /(https?:&sol;&sol;(www\.)?[^<# ]*)([ #])/g;
	var CommonUrlReplacement2 = '<a target="_blank" href="$1">$1</a>$3';
	var CommonTabRegex = /	/g;
	var CommonTabReplacement = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	// simplify the sentence and hide useless information
	var TestSshRegex = /(<tr><td><\/td><td>SSH:.+?<\/td><\/tr>)+/;
	var TestSshReplacement = '<tr><td></td><td>Store test result</td></tr>';

	var PythonHideText = /<tr><td><\/td><td>\[TestPythonUnitTest.+?\$ &sol;bin&sol;bash .+?<\/td><\/tr>/;
	
	// recognize " > " as a command and fold it
	var gitFoldRegex = /<tr><td><\/td><td>(?= &gt; ) &gt; (.+?<\/td><\/tr>)/g;
	var gitFoldReplacement = '<tr><td class="FoldItem"></td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$1';
	// remove unreadable text
	var SeleniumHideText = /<tr><td><\/td><td>\[Selenium.+?\$ &sol;bin&sol;sh .+?<\/td><\/tr>/;
	// remove unreadable text
	var SeleniumHideText2 = /<tr><td><\/td><td>\+ runtest_ret=.+?<\/td><\/tr>/;
	// fold the testing command
	var SeleniumFixTextRegex = /<tr><td><\/td><td>\+ (sudo &sol;root&sol;selenium_lib&sol;taas\-xvfb\-run\.centos.+?<\/td><\/tr>)/;
	var SeleniumFixTextReplacement = '<tr><td></td><td>Start testing..</td></tr><tr><td class="FoldItem"><\/td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$1';
	// fold the file cleaning command
	var SeleniumCleanFileRegex = /<tr><td><\/td><td>\+ (sudo rm.+?<\/td><\/tr>)/g;
	var SeleniumCleanFileReplacement = '<tr><td class="FoldItem"><\/td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$1';

	var SeleniumServerOperationRegex = /<tr><td><\/td><td>([0-9]{2}\:[0-9]{2}\:[0-9]{2}\.[0-9]{3}.+?<\/td><\/tr>)/g;
	var SeleniumServerOperationReplacement = '<tr><td class="FoldItem"><\/td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$1';
	var SeleniumServerOperationRegex2 = /<tr><td><\/td><td>(jar:file:.+?<\/td><\/tr>)/g;
	var SeleniumServerOperationReplacement2 = '<tr><td class="FoldItem"><\/td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$1';
	var SeleniumServerOperationRegex3 = /<tr><td><\/td><td>(registration capabilities Capabilities.+?<\/td><\/tr>)/g;
	var SeleniumServerOperationReplacement3 = '<tr><td class="FoldItem"><\/td><td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$1';

	log = log.replace(encodeEntitiesRegex, encodeEntitiesReplacement);
	log = log.replace(encodeEntitiesRegex2, encodeEntitiesReplacement2);
	log = log.replace(encodeEntitiesRegex3, encodeEntitiesReplacement3);
	// Every log generated by Jenkins will have a \n char in last line which will change into a empty <tr> and cause a empty row output
	log = log.substring(0, log.length-1);
	log = log.replace(PrepareRegex, PrepareReplacement);
	// print log as a table
	log = '<table><tr><td style="width:30px"></td><td>' + log;
	log += '</td></tr></table>';
	log = log.replace(CommonRegex, CommonReplacement);
	log = log.replace(CommonJavaErrorRegex, CommonJavaErrorReplacement);
	log = log.replace(CommonJavaErrorRegex2, CommonJavaErrorReplacement2);
	log = log.replace(CommonJavaErrorRegex3, CommonJavaErrorReplacement3);
	log = log.replace(CommonJavaErrorRegex4, CommonJavaErrorReplacement4);
	log = log.replace(CommonHideTextRegex, '');
	log = log.replace(CommonHideTextRegex2, '');
	log = log.replace(CommonHideTextRegex3, '');
	log = log.replace(CommonHideTextRegex4, '');
	log = log.replace(CommonHideTextRegex5, '');
	log = log.replace(CommonWarnTagRegex, CommonWarnTagReplacement);
	log = log.replace(CommonSuccessRegex, CommonSuccessReplacement);
	log = log.replace(CommonFailureRegex, CommonFailureReplacement);
	log = log.replace(CommonTriggerRegex, CommonTriggerReplacement);
	log = log.replace(CommonTabRegex, CommonTabReplacement);
	log = log.replace(CommonUrlRegex, CommonUrlReplacement);
	log = log.replace(CommonUrlRegex2, CommonUrlReplacement2);
	log = log.replace(TestSshRegex, TestSshReplacement);
	log = log.replace(PythonHideText, '');
	log = log.replace(gitFoldRegex, gitFoldReplacement);
	log = log.replace(SeleniumHideText, '');
	log = log.replace(SeleniumHideText2, '');
	log = log.replace(SeleniumFixTextRegex, SeleniumFixTextReplacement);
	log = log.replace(SeleniumCleanFileRegex, SeleniumCleanFileReplacement);
	log = log.replace(SeleniumServerOperationRegex, SeleniumServerOperationReplacement);
	log = log.replace(SeleniumServerOperationRegex2, SeleniumServerOperationReplacement2);
	log = log.replace(SeleniumServerOperationRegex3, SeleniumServerOperationReplacement3);
	return log;
}
