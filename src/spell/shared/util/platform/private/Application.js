define(
	'spell/shared/util/platform/private/Application',
	[
		'spell/shared/util/platform/private/environment/isHtml5GameClosure',
		'spell/shared/util/platform/private/environment/isHtml5Tizen',
		'spell/shared/util/platform/private/environment/isHtml5WinPhone'
	],
	function(
		isHtml5GameClosure,
	    isHtml5Tizen,
		isHtml5WinPhone
	) {
		'use strict'


		return {
			close : function() {
				if( isHtml5GameClosure ) {
					NATIVE.sendActivityToBack()

				} else if ( isHtml5Tizen ) {
					tizen.application.getCurrentApplication().exit()

				} else if ( isHtml5WinPhone ) {
					window.external.notify( 'endApplication' )
				}
			}
		}
	}
)
