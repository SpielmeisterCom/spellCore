define(
	'spell/shared/util/platform/private/createJsonCoder',
	function() {
		'use strict'


		return function() {
			return {
				encode : _.bind( JSON.stringify, JSON ),
				decode : _.bind( JSON.parse, JSON )
			}
		}
	}
)
