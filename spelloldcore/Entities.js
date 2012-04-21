
define(
	[
		"spell/core/Entity",
		"spell/util/common/dialect",
		"spell/util/common/Map"
	],
	function(
		Entity,
		dialect,
		Map
	) {
		"use strict";
		
	
		function Entities() {
			this._entities     = {}
			this._queries      = {}
			this._nextEntityId = 0
			this._nextQueryId  = 0
		}
		
		
		Entities.NO_SUCH_ENTITY_MESSAGE = "No such entity: "
		Entities.CONFLICTING_CONSTRUCTOR_MESSAGE =
			"Error while preparing a query. The query has already been prepared with a different data structure. Query: "
		Entities.CONFLICTING_CONSTRUCTOR_ARGUMENTS_MESSAGE =
			"Error while preparing a query. The query has already been prepared with the same data structure, but different arguments. Query: "
	
		
		Entities.addToPrototype( {
			prepareQuery: function( componentTypes, dataStructureConstructor, dataStructureArguments ) {
				var queryDataStructure
				if ( dataStructureConstructor === undefined ) {
					queryDataStructure = Map.create()
				}
				else {
					queryDataStructure = dataStructureConstructor.create.apply(
						dataStructureConstructor,
						dataStructureArguments
					)
				}

				var query = {
					componentTypes: componentTypes,
					entities:       queryDataStructure
				}
				
				var queryId = getNextQueryId( this )
				this._queries[ queryId ] = query
				
				return queryId
			},
			
			create: function( idOrComponents, componentsOrUndefined ) {
				var id
				var components
				if ( componentsOrUndefined === undefined ) {
					id         = getNextEntityId( this )
					components = idOrComponents
				}
				else {
					id         = idOrComponents
					components = componentsOrUndefined
				}
				
				var entity = Entity.create( id, components )
				this._entities[ id ] = entity
				
				var componentTypes = components.map( function( component ) { return component.name } )
				this._queries.forEachOwnProperty( function( queryId, query ) {
					var containsAllTypes = true
					
					query.componentTypes.forEach( function( type ) {
						if ( !componentTypes.contains( type ) ) {
							containsAllTypes = false
						}
					} )
					
					if ( containsAllTypes ) {
						query.entities.add( id, entity )
					}
				} )
				
				return id
			},
			
			get: function( id ) {
				var entity = this._entities[ id ]
				
				if ( entity === undefined ) {
					throw Entities.NO_SUCH_ENTITY_MESSAGE + id
				}
				
				return entity
			},
			
			remove: function( id ) {
				delete this._entities[ id ]
				
				this._queries.forEachOwnProperty( function( queryId, query ) {
					if ( query.entities.contains( id ) ) {
						query.entities.remove( id )
					}
				} )
			},
			
			query: function( queryId ) {
				var query = this._queries[ queryId ]
				return query.entities
			}
		} )
		
		
		function getNextEntityId( self ) {
			var id = self._nextEntityId
			self._nextEntityId += 1
			
			return id
		}
		
		function getNextQueryId( self ) {
			var id = self._nextQueryId
			self._nextQueryId += 1
			
			return id
		}
		
		
		return Entities
	}
)
