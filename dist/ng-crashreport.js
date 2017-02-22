(function() {
	angular.module('ngCrashReport', []);
})();
(function() {
	angular.module('ngCrashReport')
		.service('$exceptionHandler', ExceptionHandler);

	ExceptionHandler.$inject = ['$log', 'logService'];
	function ExceptionHandler($log, logService) {
		var self = this;

		self.throttling = true;
		self.throttleTimeout = 2000;
		self.lastError = null;
		self.throttleTimer = null;

		init();

		function init() {
			window.onerror = onError;
		}

		function onError(messageText, url, lineNumber, columnNumber, errorObject) {
			if (self.throttling) {
				var errorDescriptor = getErrorDescriptor(messageText, url, lineNumber, columnNumber);

				if (errorDescriptor == self.lastError)
					return;

				clearTimeout(self.throttleTimer);
				self.throttleTimer = setTimeout(function () { self.lastError = null; }, self.throttleTimeout);

				self.lastError = errorDescriptor;
			}

			logService.logException(messageText, url, lineNumber, columnNumber, errorObject);
		};

		function getErrorDescriptor(messageText, url, lineNumber, columnNumber) {
			return messageText + url + lineNumber + columnNumber;
		}

		return function(exception, cause) {
			$log.error(exception);

			onError(exception.message + '\r\n' + cause, null, null, null, { stack: exception.stack });
		}
	}
})();
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
		var currentUrlIndex = 0;
		var _options;
		
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

		init();

		function init() {
			_options = angular.extend({}, defaultOptions, options);

			_options.urls = parseUrl(_options.url);
		}

		function log(message, fallbackStep) {
			fallbackStep = fallbackStep || 0;

			var resultMessage = angular.extend({
				Version: _options.applicationVersion
			}, message);

			var http = $injector.get('$http');

			return http
				.post(
					_options.urls[currentUrlIndex] + '/api/' + _options.application + '/log',
					resultMessage)
				.then(
					function () { },
					function (result) {
						if (fallbackStep + 1 < _options.urls.length) {
							currentUrlIndex++;
							return log(message, fallbackStep + 1);
						}
						else
							return result;
					});
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

		function parseUrl(url) {
			if(!url)
				console.error('Url must be provided!');

			switch(Object.prototype.toString.call(url)) {
				case '[object Array]':
					return url;
				case '[object String]':
					var urls = url.split(';');
					var i = 0;
					while (i < urls.length) {
						urls[i] = urls[i].replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

						if (urls[i]) {
							i++;
							continue;
						}

						urls.splice(i, 1);
					}

					return urls;

				default:
					console.error('Collection of urls must be a string or an array');
			}

			return [];
		}
	}
})();