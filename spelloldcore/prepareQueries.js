
define(
	function() {
		"use strict";
		
		
		function prepareQueries( entities, manifest ) {
			manifest.arguments.forEach( function( argument ) {
				if ( argument.type === "entities" ) {
					var queryId
					if ( argument.dataStructure === undefined ) {
						queryId = entities.prepareQuery( argument.componentTypes )
					}
					else {
						queryId = entities.prepareQuery(
							argument.componentTypes,
							argument.dataStructure.constructor,
							argument.dataStructure.constructorArguments
						)
					}
					
					argument.queryId = queryId
				}
			} )
		}
		
		
		return prepareQueries
	}
)
