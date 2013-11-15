define(
	'spell/shared/util/platform/private/openURL',
	[
		'spell/shared/util/platform/private/isHtml5CocoonJS',
		'spell/shared/util/platform/private/isHtml5Ejecta',
		'spell/shared/util/platform/private/isHtml5Tizen'
	],
	function(
		isHtml5CocoonJS,
		isHtml5Ejecta,
	    isHtml5Tizen
	) {
		'use strict'


		return function( url, message ) {
			if( isHtml5Ejecta ) {
				ejecta.openURL( url, message )

			} else if( isHtml5CocoonJS ) {
				CocoonJS.App.openURL( url )

			} else if ( isHtml5Tizen ) {
				var appControl = new tizen.ApplicationControl(
					'http://tizen.org/appcontrol/operation/view',
					url
				)

				tizen.application.launchAppControl(
					appControl,
					null,
					function() { },
					function( e ) { }
				)

			} else {
				window.open( url, message )
			}
		}
	}
)
