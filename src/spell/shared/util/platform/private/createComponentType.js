define(
	'spell/shared/util/platform/private/createComponentType',
	[
		'spell/shared/util/createModuleId'
	],
	function(
		createModuleId
	) {
		'use strict'


		var componentIdToType = {}

		return function( moduleLoader, spell, componentId ) {
			var type = componentIdToType[ componentId ]

			if( type === false ) {
				return

			} else if( type === undefined ) {
				try {
					type = moduleLoader.require( createModuleId( componentId ) )
					componentIdToType[ componentId ] = type

				} catch( exception ) {
					componentIdToType[ componentId ] = false

					return
				}
			}

			return new type( spell )
		}
	}
)
