define(
	'spell/shared/build/ast/anonymizeModuleIdentifiers',
	[
		'spell/shared/build/hashModuleIdentifier',
		'spell/functions',

		'uglify-js'
	],
	function(
		hashModuleIdentifier,
		_,

		uglify
) {
		'use strict'



		var uglifyProcessor = uglify.uglify,
			w = uglifyProcessor.ast_walker()

		var isAmdHeader = function( node ) {
			var type = node[ 0 ]

			if( type !== 'stat' ) return false

			var value = node[ 1 ],
				action = value[ 0 ]

			if( action !== 'call' ) return false

			var op = value[ 1 ]

			if( op[ 0 ] !== 'name' || op[ 1 ] !== 'define' ) return false

			var args = value[ 2 ]

			if( args[ 0 ][ 0 ] !== 'string' ) return false

			if( args.length === 2 ) {
				if( args[ 1 ][ 0 ] !== 'function' ) return false

			} else if( args.length === 3 ) {
				if( args[ 1 ][ 0 ] !== 'array' || args[ 2 ][ 0 ] !== 'function' ) return false

			} else {
				return false
			}

			return true
		}

		var hasModuleDependencies = function( args ) {
			return args[ 1 ][ 0 ] === 'array'
		}

		/**
		 * Takes an abstract syntax tree in uglifyjs format and returns it with anonymized amd module identifiers.
		 */
		return function( ast ) {
			return w.with_walkers(
				{
					'stat' : function() {
						var node = this

						if( !isAmdHeader( node ) ) return

						var args = node[ 1 ][ 2 ]

						// update module identifier
						args[ 0 ][ 1 ] = hashModuleIdentifier( args[ 0 ][ 1 ] )

						// update module dependencies
						if( hasModuleDependencies( args ) ) {
							args[ 1 ][ 1 ] = _.map(
								args[ 1 ][ 1 ],
								function( dependency ) {
									dependency[ 1 ] = hashModuleIdentifier( dependency[ 1 ] )

									return dependency
								}
							)
						}

						return node
					}
				},
				function(){
					return w.walk( ast )
				}
			)
		}
	}
)
