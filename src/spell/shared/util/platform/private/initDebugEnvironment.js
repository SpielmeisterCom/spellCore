define(
	'spell/shared/util/platform/private/initDebugEnvironment',
	function() {
		'use strict'


		return function( logger ) {
			// rewiring console.log

			console.originalLog = console.log
			console.log = function() {

				if ( console.originalLog ) {

					//trigger a warning for using console.log once and then allow console.log usage
					console.log = console.originalLog
					delete console.originalLog

					var warning = 'console.log can be only used during development because it is not cross-platform save. Be sure to remove this call when you finished your debugging. Use the spell.logger function to enable cross-platform logging.'
					logger.warn( warning )
					console.warn ( warning )

					console.log.apply( this, arguments )
				}
			}

			// putting global error handler in place
			if( window ) {
				window.onerror = function( message, url, line ) {
					logger.error( '\'' + message + '\' in ' + url + ':' + line )

					return true
				}
			}
		}
	}
)
