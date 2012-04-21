define(
	[
		"spell/shared/util/entities/datastructures/multiMap"
	],
	function(
		multiMap
	) {
		"use strict"
		
		
		describe( "multiMap", function() {
			
			var keyMultiMap = multiMap( function( entity ) { return entity.key } )
			
			describe( "onCreate", function() {
				it( "should create an empty multi map.", function() {
					var map = {}
					
					keyMultiMap.onCreate( map )
					
					expect( map.multiMap ).toEqual( {} )
				} )
			} )
			
			describe( "onAdd", function() {
				it( "should add the entity using the key accessor to determine the key.", function() {
					var map    = { multiMap: {} }
					var entity = { key: "the key" }
					
					keyMultiMap.onAdd( map, "wrong key", entity )
					
					expect( map.multiMap[ entity.key ] ).toEqual( [ entity ] )
				} )
				
				it( "should add multiple entities with the same key.", function() {
					var map     = { multiMap: {} }
					var entityA = { key: "the key" }
					var entityB = { key: "the key" }
					
					keyMultiMap.onAdd( map, "wrong key", entityA )
					keyMultiMap.onAdd( map, "wrong key", entityB )
					
					expect( map.multiMap[ entityA.key ] ).toEqual( [ entityA, entityB ] )
				} )
			} )
			
			describe( "onUpdate", function() {
				it( "should update an entity.", function() {
					var map = { multiMap: {} }
					var originalEntity = { key: "original key" }
					var updatedEntity  = { key: "updated key"  }
					
					keyMultiMap.onAdd( map, "wrong key", originalEntity )
					keyMultiMap.onUpdate( map, "wrong key", originalEntity, updatedEntity )
					
					expect( map.multiMap.hasOwnProperty( originalEntity.key ) ).toEqual( false )
					expect( map.multiMap[ updatedEntity.key ] ).toEqual( [ updatedEntity ] )
				} )
			} )
			
			describe( "onRemove", function() {
				it( "should remove one of multiple entities with the same key.", function() {
					var map     = { multiMap: {} }
					var entityA = { key: "the key" }
					var entityB = { key: "the key" }
					map.multiMap[ entityA.key ] = [ entityA, entityB ]
					
					keyMultiMap.onRemove( map, "wrong key", entityA )
					
					expect( map.multiMap[ entityB.key ] ).toEqual( [ entityB ] )
				} )
				
				it( "should remove the complete array, if all entities with the key have been removed.", function() {
					var map    = { multiMap: {} }
					var entity = { key: "the key" }
					map.multiMap[ entity.key ] = [ entity ]
					
					keyMultiMap.onRemove( map, "wrong key", entity )
					
					expect( map.multiMap.hasOwnProperty( entity.key ) ).toEqual( false )
				} )
				
				it ( "should still work, if the key can no longer be retrieved from the entity.", function() {
					var map     = { multiMap: {} }
					var key     = "the key"
					var entityA = {}
					var entityB = { key: key }
					map.multiMap[ key ] = [ entityA, entityB ]
					
					keyMultiMap.onRemove( map, "wrong key", entityA )
					
					expect( map.multiMap[ entityB.key ] ).toEqual( [ entityB ] )
				} )
			} )
		} )
	}
)
