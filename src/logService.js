(function () {
	angular.module('ngCrashReport')
		.service('logService', LogService);

	LogService.$inject = ['$injector', 'ngCrashReportSettings'];
	function LogService($injector, options) {
		var self = this;

		var defaultOptions = {
			url: '',
			application: 'Unknown',
			applicationVersion: '0.0'
		}

		self.options = angular.extend({}, defaultOptions, options);

		self.log = log;
		self.trace = trace;
		self.logException = logException;

		var logLevels = {
			Fatal: 0,
			Error: 1,
			Warn: 2,
			Info: 3,
			Debug: 4,
			Trace: 5
		};

		function log(message) {
			var resultMessage = angular.extend({
				Version: self.options.applicationVersion
			}, message);

			var http = $injector.get('$http');

			return http.post(
				self.options.url + '/api/' + self.options.application + '/log',
				resultMessage);
		};

		function trace(messageText, additionalInformation) {
			var message = {
				TimeStamp: null,
				LogLevel: logLevels.Trace,
				MessageText: messageText,
				StackTrace: null,
				AdditionalInformation: additionalInformation ? JSON.stringify(additionalInformation) : null,
				InnerException: null
			}

			return self.log(message);
		};

		function logException(messageText, url, lineNumber, columnNumber, errorObject) {
			var formattedMessage = messageText + '\r\n[' + url + '] [' + lineNumber + ':' + columnNumber + ']';
			var additionalInformation = {
				currentLocation: window.location.href,
				userAgent: navigator.userAgent
			};

			var message = {
				TimeStamp: null,
				LogLevel: logLevels.Fatal,
				MessageText: formattedMessage,
				StackTrace: (errorObject.stack || 'no stack available'),
				AdditionalInformation: JSON.stringify(additionalInformation),
				InnerException: null
			}

			return self.log(message);
		};
	}
})();