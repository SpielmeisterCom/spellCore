define(
	"spell/shared/util/entities/datastructures/entityMap",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"
		
		
		/**
		 * A map that uses an arbitrary property of an entity as its key.
		 * This data structure should be used, if you need to efficiently access entities based on a specific property.
		 *
		 * Let's say, for example, that you have entities with a "profile" component. The profile component has a
		 * "name" property. If you need to access entities efficiently using their name, you can use this data
		 * structure to do it.
		 *
		 * First, initialize the data structure for your specific use case:
		 * var nameMap = entityMap( function( entity ) { return entity.profile.name } )
		 *
		 * When the nameMap is passed into your system later, you can use just access the entities within by their
		 * name:
		 * var entity = entities[ name ]
		 *
		 * Attention: Changing the property afterwards is not supported and will lead to unexpected results! A
		 * workaround for this is to remove the component from the entity and re-add it with the changed property.
		 */
			
		return function( keyAccessor ) {
			return {
				onCreate: function( map ) {
					map.entityMap = {}
				},
				onAdd: function( map, entityId, entity ) {
					var key = keyAccessor( entity )
					map.entityMap[ key ] = entity
				},
				onUpdate: function( map, entityId, originalEntity, updatedEntity ) {
					delete map.entityMap[ keyAccessor( originalEntity ) ]
					map.entityMap[ keyAccessor( updatedEntity ) ] = updatedEntity
				},
				onRemove: function( map, entityId, entityToRemove ) {
					var key = keyAccessor( entityToRemove )
					if ( key === undefined ) {
						// Key can no longer be retrieved from the entity. We have to rely on brute force.
						_.each( map.entityMap, function( entity, entityKey ) {
							if ( entity === entityToRemove ) {
								key = entityKey
							}
						} )
					}
					
					delete map.entityMap[ key ]
				}
			}
		}
	}
)
