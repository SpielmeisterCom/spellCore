define(
	"spell/shared/util/entities/Entities",
	[
		"spell/shared/util/map",
		
		"underscore"
	],
	function(
		map,
		
		_
	) {
		"use strict"
		
		
		function Entities() {
			this.entities = map.create()
			this.queries  = {}
			
			this.nextQueryId = 0
		}
		
		
		Entities.prototype = {
			add: function( entity ) {
				map.add( this.entities, entity.id, entity )
				
				_.each( this.queries, function( query ) {
					addIfHasAllComponents(
						query.entities,
						entity,
						query.componentTypes,
						query.dataStructure
					)
				} )
			},
			
			remove: function( entity ) {
				map.remove( this.entities, entity.id )
				
				_.each( this.queries, function( query ) {
					map.remove( query.entities, entity.id, query.dataStructure )
				} )
			},
			
			update: function( entity ) {
				_.each( this.queries, function( query ) {
					if ( hasAllComponents( entity, query.componentTypes ) ) {
						map.add( query.entities, entity.id, entity, query.dataStructure )
					}
					else {
						map.remove( query.entities, entity.id, query.dataStructure )
					}
				} )
			},
			
			prepareQuery: function( componentTypes, dataStructure ) {
				var queryId = getNextQueryId( this )
				
				var query = {
					componentTypes: componentTypes,
					entities      : map.create( [], dataStructure ),
					dataStructure : dataStructure
				}
				
				this.queries[ queryId ] = query
				
				_.each( this.entities.elements, function( entity ) {
					addIfHasAllComponents(
						query.entities,
						entity,
						query.componentTypes,
						dataStructure
					)
				} )
				
				return queryId
			},
			
			executeQuery: function( queryId ) {
				return this.queries[ queryId ].entities
			}
		}
		
		
		function getNextQueryId( self ) {
			var id = self.nextQueryId
			
			self.nextQueryId += 1
			
			return id
		}
		
		function addIfHasAllComponents(
			entityMap,
			entity,
			componentTypes,
			dataStructure
		) {
			if ( hasAllComponents( entity, componentTypes ) ) {
				map.add( entityMap, entity.id, entity, dataStructure )
			}
		}
		
		function hasAllComponents( entity, componentTypes ) {
			return _.all( componentTypes, function( componentType ) {
				return entity[ componentType ] !== undefined
			} )
		}
		
		
		return Entities
	}
)
