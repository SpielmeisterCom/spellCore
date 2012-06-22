define(
	'spell/shared/util/template/createLocalComponentName',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		return function( componentTemplateId, importName ) {
			if( importName ) return importName

//			return _.last( componentTemplateId.split( '/' ) )
			return componentTemplateId
		}
	}
)
