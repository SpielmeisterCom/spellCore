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

		return function( moduleLoader, componentId, spell ) {
			var type = componentIdToType[ componentId ]

			if( !type ) {
				type = moduleLoader.require( createModuleId( componentId ) )
				componentIdToType[ componentId ] = type
			}

			return new type( spell )
		}
	}
)
