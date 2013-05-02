define(
	'spell/data/entity/createAmbiguousSiblingName',
	function() {
		'use strict'


		return function( entityConfig ) {
			var children = entityConfig.children
			if( !children ) return false

			var names = {}

			for( var i = 0, n = children.length; i < n; i++ ) {
				var name = children[ i ].name

				if( name ) {
					if( !names[ name ] ) {
						names[ name ] = true

					} else {
						return name
					}
				}
			}

			return false
		}
	}
)
