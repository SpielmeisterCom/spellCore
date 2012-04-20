define(
	"spell/shared/util/entities/datastructures/singleton",
	function() {
		"use strict"
		
		
		return {
			SINGLETON_ALREADY_EXISTS_ERROR: "There already is an instance of this singleton.",
			
			onCreate: function( map ) {
				map.singleton = null
			},
			
			onAdd: function( map, entityId, entity ) {
				if ( map.singleton === null ) {
					map.singleton = entity
				}
				else {
					throw this.SINGLETON_ALREADY_EXISTS_ERROR
				}
			},
			
			onUpdate: function( map, entityId, originalEntity, updatedEntity ) {
				this.onRemove( map, entityId, originalEntity )
				this.onAdd( map, entityId, updatedEntity )
			},
			
			onRemove: function( map, entityId, entity ) {
				map.singleton = null
			}
		}
	}
)
