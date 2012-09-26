define(
	'spell/shared/util/hashModuleId',
	[
		'spell/math/hash/SHA256'
	],
	function(
		SHA256
	) {
		'use strict'


		return function( text ) {
			var shaObj = new SHA256( text, 'ASCII' )

			return shaObj.getHash( 'SHA-256', 'B64' )
		}
	}
)
