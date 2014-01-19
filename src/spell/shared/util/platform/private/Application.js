define(
	'spell/shared/util/platform/private/Application',
	[
		'spell/shared/util/platform/private/environment/isHtml5TeaLeaf',
		'spell/shared/util/platform/private/environment/isHtml5Tizen',
		'spell/shared/util/platform/private/environment/isHtml5WinPhone'
	],
	function(
		isHtml5TeaLeaf,
	    isHtml5Tizen,
		isHtml5WinPhone
	) {
		'use strict'


		return {
			close : function() {
				if( isHtml5TeaLeaf ) {
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
