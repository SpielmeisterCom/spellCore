define(
	'spell/shared/util/platform/private/Application',
	[
		'spell/shared/util/platform/private/isHtml5GameClosure',
		'spell/shared/util/platform/private/isHtml5Tizen'
	],
	function(
		isHtml5GameClosure,
	    isHtml5Tizen
	) {
		'use strict'


		return {
			close : function() {
				if( isHtml5GameClosure ) {
					NATIVE.sendActivityToBack()

				} else if ( isHtml5Tizen ) {
					tizen.application.getCurrentApplication().exit()
				}
			}
		}
	}
)
