const files = '<link rel="stylesheet" href="../node_modules/mocha/mocha.css">' +
    '<script src="../node_modules/mocha/mocha.js"></script>' +
    '<script src="../node_modules/chai/chai.js"></script>';
    
    // needs to be on the page to prevent non-block warning:
	// '<script src="//localhost:35750/livereload.js"></script>';

document.write(files);

document.addEventListener('DOMContentLoaded', function () {
	const isIE = /Trident/.test(navigator.userAgent);
	function CustomError (msg) {
		Error.call(this);
		Error.stackTraceLimit = 10;
		Error.prepareStackTrace = function (err, stack) {
			return stack;
		};
		try {
			Error.captureStackTrace(this, arguments.callee);
		} catch (er) {
			// throw new Error(msg);
		}
		if (/to\sequal/.test(msg)) {
			const parts = msg.replace('expected ', '').split(' to equal ');
			msg = 'actual:\n' + parts[0] + '\nshould be:\n' + parts[1];
		}
		console.log(msg);
		this.message = msg;
		this.name = 'CustomError';
	}

	CustomError.prototype.__proto__ = Error.prototype;

	function getFileName (frame) {
		const filename = frame.getFileName();
		return filename ? filename.split('/')[filename.split('/').length - 1] : '';
    }
    
	chai.Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {

		if (!chai.util.test(this, arguments)) {
			msg = chai.util.getMessage(this, arguments);
			let e;

			e = new CustomError(msg);
			if (e.stack) {
				const stack = [msg];
				for (let i = 0; i < e.stack.length; i++) {
					const frame = e.stack[i];
					// method is usually anonymous in expectations because it is in a ready() function
					const method = frame.getFunctionName() || frame.getMethodName() || 'anonymous';
					const filename = getFileName(frame);
					const line = frame.getLineNumber();
					if (!/test-files|chai/.test(filename)) {
						stack.push('    ' + method + ' ' + filename + ':' + line);
					}
				}
				throw new Error(stack.join('\n'));
			} else {
				if (isIE) {
					console.trace('');
				}
				throw new Error(msg);
			}
		}
	};

});
