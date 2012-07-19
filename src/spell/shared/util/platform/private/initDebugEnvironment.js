define(
	'spell/shared/util/platform/private/initDebugEnvironment',
	function() {
		'use strict'


		return function( logger ) {
			// rewiring console.log
			console.originalLog = console.log

			console.log = function() {
				logger.error( 'Usage of console.log is prohibited within the SpellJS framework. You can use the built-in logging functionality instead.' )
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
