define(
	'spell/shared/util/platform/private/openURL',
	[
		'spell/shared/util/platform/private/isHtml5CocoonJS',
		'spell/shared/util/platform/private/isHtml5Ejecta'
	],
	function(
		isHtml5CocoonJS,
		isHtml5Ejecta
	) {
		'use strict'


		return function( url, message ) {
			if( isHtml5Ejecta() ) {
				ejecta.openURL( url, message )

			} else if( isHtml5CocoonJS() ) {
				CocoonJS.App.openURL( url )

			} else {
				window.open( url, message )
			}
		}
	}
)
