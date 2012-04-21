define(
	[
		"spell/shared/util/entities/datastructures/singleton"
	],
	function(
		singleton
	) {
		"use strict"
		
		
		describe( "singleton", function() {
			it( "should initialize the variable on creation.", function() {
				var map = {}
				
				singleton.onCreate( map )
				
				expect( map ).toEqual( { singleton: null } )
			} )
			
			it( "should add the singleton.", function() {
				var map    = { singleton: null }
				var entity = { value: "an entity" }
				
				singleton.onAdd( map, "entity id", entity )
				
				expect( map ).toEqual( { singleton: entity } )
			} )
			
			it( "should update the singleton.", function() {
				var map            = { singleton: null }
				var originalEntity = { value: "original entity" }
				var updatedEntity  = { value: "updated entity" }
				
				singleton.onAdd( map, "entity id", originalEntity )
				singleton.onUpdate( map, "entity id", originalEntity, updatedEntity )
				
				expect( map ).toEqual( { singleton: updatedEntity } )
			} )
			
			it( "should throw an exception, if there already is a singleton value.", function() {
				var map = { singleton: { value: "an entity" } }
				
				var exception
				try {
					singleton.onAdd( map, "entity id", {} )
				}
				catch ( e ) {
					exception = e
				}
				
				expect( exception ).toContain( singleton.SINGLETON_ALREADY_EXISTS_ERROR )
			} )
			
			it( "should remove the singleton.", function() {
				var entity = { value: "an entity" }
				var map    = { singleton: entity }
				
				singleton.onRemove( map, "entity id", entity )
				
				expect( map ).toEqual( { singleton: null } )
			} )
		} )
	}
)
