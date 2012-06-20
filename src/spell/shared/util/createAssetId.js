define(
	'spell/shared/util/createAssetId',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		return function( scheme ) {
			if( !scheme ) throw 'Error: Missing argument \'scheme\'.'

			var args = _.toArray( arguments ).slice( 1 )

			if( args.length === 0 ) throw 'Error: Missing name and or namespace.'

			return scheme + ':' + _.reduce(
				args,
				function( memo, argument ) {
					if( argument === '' ) return memo

					return memo + ( memo !== '' ? '.' : '' )  + argument
				},
				''
			)
		}
	}
)
