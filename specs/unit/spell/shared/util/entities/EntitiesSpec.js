define(
	[
		"spell/shared/util/map",
		"spell/shared/util/entities/Entities"
	],
	function(
		map,
		Entities
	) {
		"use strict"
		
		
		describe( "Entities", function() {
		
			var ab
			var ac
			
			beforeEach( function() {
				ab = { id: 8, a: "a1", b: "b1" }
				ac = { id: 9, a: "a2", c: "c2" }
			} )
			
			it( "should return the only entity with all requested components.", function() {
				var entities = new Entities()
				var queryId  = entities.prepareQuery( [ "a", "b" ] )
				
				entities.add( ab )
				entities.add( ac )
				
				var result = entities.executeQuery( queryId )
				
				expect( result ).toEqual( map.create( [
					[ ab.id, ab ]
				] ) )
			} )
			
			it( "should return all entities with the requested component.", function() {
				var entities = new Entities()
				var queryId  = entities.prepareQuery( [ "a" ] )
				
				entities.add( ab )
				entities.add( ac )
				
				var result = entities.executeQuery( queryId )
				
				expect( result ).toEqual( map.create( [
					[ ab.id, ab ],
					[ ac.id, ac ]
				] ) )
			} )
			
			it( "should not return a removed entity in subsequent queries.", function() {
				var entities = new Entities()
				var queryId  = entities.prepareQuery( [ "a" ] )
				
				entities.add( ab )
				entities.add( ac )
				
				entities.remove( ac )
				var result = entities.executeQuery( queryId )
				
				expect( result ).toEqual( map.create( [
					[ ab.id, ab ]
				] ) )
			} )
			
			it( "should support preparing a query after entities have been added.", function() {
				var entities = new Entities()
				
				entities.add( ab )
				entities.add( ac )
				
				var queryId = entities.prepareQuery( [ "a" ] )
				var result  = entities.executeQuery( queryId )

				expect( result ).toEqual( map.create( [
					[ ab.id, ab ],
					[ ac.id, ac ]
				] ) )
			} )
			
			it( "should update an entity.", function() {
				var entities = new Entities()
				var abQueryId = entities.prepareQuery( [ "a", "b" ] )
				var acQueryId = entities.prepareQuery( [ "a", "c" ] )
				
				entities.add( ab )
				delete ab.b
				ab.c = "c1"
				entities.update( ab )
				
				var abEntities = entities.executeQuery( abQueryId )
				var acEntities = entities.executeQuery( acQueryId )
				
				expect( abEntities ).toEqual( map.create() )
				expect( acEntities ).toEqual( map.create( [
					[ ab.id, ab ]
				] ) )
			} )

			describe( "custom data structures", function() {
			
				var customDataStructure = {
					onCreate: function( map ) {
						map.customData = {}
					},
					onAdd: function( map, key, value ) {
						map.customData[ key ] = value
					},
					onRemove: function( map, key ) {
						delete map.customData[ key ]
					}
				}
				
				it( "should correctly add an entity.", function() {
					var entities = new Entities()
					var queryId  = entities.prepareQuery( [ "a", "b" ], customDataStructure )
					
					entities.add( ab )
					var result = entities.executeQuery( queryId )

					expect( result.customData[ ab.id ] ).toEqual( ab )
				} )
				
				it( "should correctly remove an entity.", function() {
					var entities = new Entities()
					var queryId  = entities.prepareQuery( [ "a", "b" ], customDataStructure )
					
					entities.add( ab )
					entities.remove( ab )
					var result = entities.executeQuery( queryId )
										
					expect( result.customData[ ab.id ] ).toBeUndefined()
				} )
				
				it( "should correctly update an entity.", function() {
					var entities  = new Entities()
					var abQueryId = entities.prepareQuery( [ "a", "b" ], customDataStructure )
					var acQueryId = entities.prepareQuery( [ "a", "c" ], customDataStructure )
					
					entities.add( ab )
					
					delete ab.b
					ab.c = "c1"
					entities.update( ab )
					
					var abResult = entities.executeQuery( abQueryId )
					var acResult = entities.executeQuery( acQueryId )

					expect( abResult.customData[ ab.id ] ).toBeUndefined()
					expect( acResult.customData[ ab.id ] ).toEqual( ab )
				} )
				
				it( "should work correctly when preparing a query after a singleton has been added.", function() {
					var entities = new Entities()
					
					entities.add( ab )
					var queryId = entities.prepareQuery( [ "a", "b" ], customDataStructure )
					var result = entities.executeQuery( queryId )
					
					expect( result.customData[ ab.id ] ).toEqual( ab )
				} )
			} )
		} )
	}
)
