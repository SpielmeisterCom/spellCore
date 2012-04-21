
define(
	[
		"spell/util/common/dialect"
	],
	function(
		dialect
	) {
		"use strict";
		
		
		function EntityCreator( entities, registry ) {
			this.entities = entities
			this.registry = registry
			
			this.entitiesToCreate = []
		}
		
		EntityCreator.addToPrototype( {
			createEntity: function( entityId, parameters ) {
				this.entitiesToCreate.push( { id: entityId, parameters: parameters } )
			},
			
			commit: function() {
				var self = this
				
				self.entitiesToCreate.forEach( function( entityIdAndParameters ) {
					var entityId   = entityIdAndParameters.id
					var parameters = entityIdAndParameters.parameters
					
					var entityDescriptor = self.registry.entityFactories[ entityId ]( parameters )
					
					var components = entityDescriptor.map( function( componentIdAndParameters ) {
						var id         = componentIdAndParameters.id
						var parameters
						if ( componentIdAndParameters.parameters === undefined ) {
							parameters = {}
						}
						else {
							parameters = componentIdAndParameters.parameters
						}
						
						var componentFactory = self.registry.componentFactories[ id ]
						
						var lastSlash = id.lastIndexOf( "/" )
						var lastColon = id.lastIndexOf( ":" )
						
						var name
						if ( lastSlash === lastColon === -1 ) {
							name = id
						}
						else if( lastSlash > lastColon ) {
							name = id.slice( lastSlash + 1, id.length )
						}
						else {
							name = id.slice( lastColon + 1, id.length )
						}

						return {
							name:  name,
							value: componentFactory( parameters )
						}
					} )
					
					self.entities.create( components )
				} )
			}
		} )
		
		
		return EntityCreator
	}
)
