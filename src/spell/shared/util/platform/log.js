define(
	'spell/shared/util/platform/log',
	function() {
		'use strict'


		var log = function( message ) {
			if( console === undefined ) return


			var now = new Date()

			console.log( '[' + now.toDateString() + ' ' + now.toLocaleTimeString() + '] ' +  message )
		}

		return log
	}
)
