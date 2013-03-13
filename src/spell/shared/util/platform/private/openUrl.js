define(
	'spell/shared/util/platform/private/openUrl',
	[
		'spell/shared/util/platform/private/isHtml5Ejecta'
	],
	function(
		isHtml5Ejecta
	) {
		'use strict'


		return function( url, message ) {

			console.log( 'openUrl: ' + url + ', ' + message )

			if( isHtml5Ejecta() ) {
				ejecta.openURL( url, message )

			} else {
				window.open( url, message )
			}
		}
	}
)
