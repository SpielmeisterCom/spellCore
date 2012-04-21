define(
	[
		"spell/shared/util/entities/datastructures/entityMap"
	],
	function(
		entityMap
	) {
		"use strict"
		
		
		describe( "entityMap", function() {
			
			var keyMap = entityMap( function( entity ) { return entity.key } )
			
			it( "should create an empty map.", function() {
				var map = {}
				
				keyMap.onCreate( map )
				
				expect( map.entityMap ).toEqual( {} )
			} )
			
			it( "should add the entity, using the key accessor to determine the key.", function() {
				var map    = { entityMap: {} }
				var entity = { key: "the key" }
				
				keyMap.onAdd( map, "wrong key", entity )
				
				expect( map.entityMap[ entity.key ] ).toEqual( entity )
			} )
			
			it( "should update the entity, using the key accessor to determine the key.", function() {
				var map            = { entityMap: {} }
				var originalEntity = { key: "original key", value: "original value" }
				var updatedEntity  = { key: "updated key" , value: "updated value"  }
				
				keyMap.onAdd( map, "wrong key", originalEntity )
				keyMap.onUpdate( map, "wrong key", originalEntity, updatedEntity )
				
				expect( map.entityMap.hasOwnProperty( originalEntity.key ) ).toEqual( false )
				expect( map.entityMap[ updatedEntity.key ] ).toEqual( updatedEntity )
			} )
			
			it( "should remove the entity.", function() {
				var map    = { entityMap: {} }
				var entity = { key: "the key" }
				map.entityMap[ entity.key ] = entity
				
				keyMap.onRemove( map, "wrong key", entity )
				
				expect( map.entityMap.hasOwnProperty( entity.key ) ).toEqual( false )
			} )
			
			it( "should still be able to remove an entity, if its key is no longer present.", function() {
				var map    = { entityMap: {} }
				var key    = "the key"
				var entity = { key: key }
				
				keyMap.onAdd( map, "wrong key", entity )
				delete entity.key
				keyMap.onRemove( map, "wrong key", entity )
				
				expect( map.entityMap.hasOwnProperty( key ) ).toEqual( false )
			} )
		} )
	}
)
