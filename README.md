# ng-crashreport
This library provides adapter for angularJS applications for catching and sending crash reports to the CrashReport logging system.

# Getting started
Download the package using bower:
```bash
bower install ng-crashreport --save
```
then add ng-crashreport as a dependency of your main module
```js
angular.module('MyApplication', ['ngCrashReport']);
```
and then setup constants for configuration options:
```js
angular.module('MyApplication')
    .constant('ngCrashReportSettings', {
		url: 'https://crashreport.collector.com',
		application: 'your-application-key',
		applicationVersion: '1.2.3.4'
	});
```
Options are:
* **url**: Location of the CrashReport server which will collect errors. Could be a string containing list of urls separated with semicolon or an array of urls.
* **application**: The key which identifies your application
* **version**: Version of your application

This will configure a handler which will catch the errors thrown in angular code and send them to the reporting server. Errors will be logged with a 'Fatal' log level.
Errors thrown outside of angular digest loop will not be logged this way.

## Tips
### Fallback urls
You can specify more than one url in **url** option. In this case logger will iterate over specified urls until it find working one or reach end of the list.
List of urls might be specified either:
```js
angular.module('MyApplication')
    .constant('ngCrashReportSettings', {
		url: 'https://crashreport.collector.com;https://crashreport.collector2.com',
		application: 'your-application-key',
		applicationVersion: '1.2.3.4'
	});
```
or
```js
angular.module('MyApplication')
    .constant('ngCrashReportSettings', {
		url: [
		    'https://crashreport.collector.com', 
		    'https://crashreport.collector2.com'
	    ],
		application: 'your-application-key',
		applicationVersion: '1.2.3.4'
	});
```