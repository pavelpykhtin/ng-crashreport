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
* **url**: Location of the CrashReport server which will collect errors
* **application**: The key which identifies your application
* **version**: Version of your application
