define(
	'spell/shared/util/platform/private/initDebugEnvironment',
	function() {
		'use strict'


		return function( spellConsole ) {
			// rewiring console.log
			console.originalLog = console.log

			console.log = function() {
				if( console.originalLog ) {
					// trigger a warning for using console.log once and then allow console.log usage
					console.log = console.originalLog
					delete console.originalLog

					var warning = 'console.log can be used only during development because it is not cross-platform save. Be sure to remove this call when you finished your debugging. Use spell.console to enable cross-platform logging.'
					spellConsole.warn( warning )
					console.warn( warning )

					console.log.apply( this, arguments )
				}
			}
		}
	}
)
