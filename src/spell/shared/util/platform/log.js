define(
	'spell/shared/util/platform/log',
	[
		'spell/shared/util/platform/private/log'
	],
	function(
		log
	) {
		'use strict'


		var logWrapper = function( message ) {
			var now = new Date()

			log( '[' + now.toDateString() + ' ' + now.toLocaleTimeString() + '] ' +  message )
		}

		return logWrapper
	}
)
