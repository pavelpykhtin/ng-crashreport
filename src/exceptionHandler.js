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