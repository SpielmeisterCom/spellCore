define(
	'spell/data/component/init',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		return function( componentInstance, componentDefinition ) {
			var attributes = componentDefinition.attributes

			for( var i = 0, n = attributes.length, attributeConfig; i < n; i++ ) {
				attributeConfig = attributes[ i ]

				componentInstance[ attributeConfig.name ] = _.clone( attributeConfig[ 'default' ] )
			}

			return componentInstance
		}
	}
)
