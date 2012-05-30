define(
	'spell/shared/util/blueprints/createLocalComponentName',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		return function( componentBlueprintId, importName ) {
			if( importName ) return importName

//			return _.last( componentBlueprintId.split( '/' ) )
			return componentBlueprintId
		}
	}
)
