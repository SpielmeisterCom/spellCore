define(
	'spell/shared/util/blueprints/createLocalComponentName',
	[
		'underscore'
	],
	function(
		_
	) {
		'use strict'


		return function( componentBlueprintId, importName ) {
			if( importName ) return importName

			return _.last( componentBlueprintId.split( '/' ) )
		}
	}
)
