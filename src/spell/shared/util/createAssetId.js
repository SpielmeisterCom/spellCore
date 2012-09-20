define(
	'spell/shared/util/createAssetId',
	[
		'spell/shared/util/createId',

		'spell/functions'
	],
	function(
		createId,

		_
	) {
		'use strict'


		return function( scheme ) {
			if( !scheme ) throw 'Error: Missing argument \'scheme\'.'

			return scheme + ':' + createId(
				_.toArray( arguments ).slice( 1 )
			)
		}
	}
)
