define(
	'spell/shared/util/platform/private/Application',
	[
		'spell/shared/util/platform/private/isHtml5GameClosure'
	],
	function(
		isHtml5GameClosure
	) {
		'use strict'


		return {
			close : function() {
				if( isHtml5GameClosure ) {
					NATIVE.sendActivityToBack()
				}
			}
		}
	}
)
