define(
	'spell/shared/build/ast/isAmdHeader',
	function() {
		'use strict'


		return function( node ) {
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
	}
)
