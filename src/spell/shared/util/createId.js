define(
	'spell/shared/util/createId',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		return function( args ) {
			var numArgs = arguments.length

			if( numArgs === 1 ) {
				if( !_.isArray( args ) ) {
					args = [ args ]
				}

			} else if( numArgs > 1 ) {
				args = _.toArray( arguments )
			}

			if( !args || args.length === 0 ) throw 'Error: Missing name and or namespace.'

			return _.reduce(
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
