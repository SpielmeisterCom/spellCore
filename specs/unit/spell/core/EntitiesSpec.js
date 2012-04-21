
define(
	[
		"spell/core/Entities",
		"spell/core/Entity",
		"spell/util/common/Map"
	],
	function(
		Entities,
		Entity,
		Map
	) {
		"use strict";
		

		describe( "Entities", function() {
		
			var ExtendedMap = Map.extend( function( parameter ) {
				this.parameter = parameter
			} )
			var extendedMapParameter = "parameter"
		
			// components
			var a1 = "a1"
			var a2 = "a2"
			var b1 = "b1"
			var c2 = "c2"
		
			var componentsA = [
				{ name: "a", value: a1 },
				{ name: "b", value: b1 }
			]
			var componentsB = [
				{ name: "a", value: a2 },
				{ name: "c", value: c2 }
			]
			
			var entities
			
			var aQueryId
			var abQueryId
			var abWithDataStructureQueryId
			
			beforeEach( function() {
				entities = Entities.create()
				
				aQueryId                   = entities.prepareQuery( [ "a" ] )
				abQueryId                  = entities.prepareQuery( [ "a", "b" ] )
				abWithDataStructureQueryId = entities.prepareQuery( [ "a", "b" ], ExtendedMap, [ extendedMapParameter ] )
			} )
			
			describe( "create/get/remove", function() {
				it( "should make an added entity accessible using the returned id.", function() {
					var entityId = entities.create( componentsA )
					entities.create( componentsB )
					var returnedEntity = entities.get( entityId )
				
					var expectedEntity = Entity.create( entityId, componentsA )
					expect( returnedEntity ).toEqual( expectedEntity )
				} )
			
				it( "should make an entity accessible using an explicitely specified id.", function() {
					var entityId = "entityA"
					
					entities.create( entityId, componentsA )
					var returnedEntity = entities.get( entityId )
					
					var expectedEntity = Entity.create( entityId, componentsA )
					expect( returnedEntity ).toEqual( expectedEntity )
				} )
			
				it( "should throw an exception if a removed entity is accessed.", function() {
					var entityId = entities.create( componentsA )
					entities.remove( entityId )
					
					var caughtException
					try {
						entities.get( entityId )
					}
					catch ( exception ) {
						caughtException = exception
					}
	
					expect( caughtException ).toBeDefined()
					expect( caughtException ).toContain( Entities.NO_SUCH_ENTITY_MESSAGE )
					expect( caughtException ).toContain( entityId )
				} )
			} )
			
			describe( "queries", function() {
			
				var entityAId
				var entityBId
							
				beforeEach( function() {
					entityAId = entities.create( componentsA )
					entityBId = entities.create( componentsB )
				} )
				
				describe( "query", function() {
					it( "should return all entities that have the given component types.", function() {
						var returnedEntities = entities.query( aQueryId )
						
						expect( returnedEntities ).toEqual( Map.create(
							[ entityAId, Entity.create( entityAId, componentsA ) ],
							[ entityBId, Entity.create( entityBId, componentsB ) ]
						) )
					} )
					
					it( "should not return any entities that don't have the given component types.", function() {
						var returnedEntities = entities.query( abQueryId )
						
						var entityA = Entity.create( entityAId, componentsA )
						expect( returnedEntities ).toEqual( Map.create( [ entityAId, entityA ] ) )
					} )
					
					it( "should not return any entities that have been removed.", function() {
						var componentsC = [
							{ name: "a", value: "a3" },
							{ name: "b", value: "b3" }
						]
						var entityCId = entities.create( componentsC )
						entities.remove( entityAId )
						entities.remove( entityCId )
						var returnedEntities = entities.query( aQueryId )
						
						var entityB = Entity.create( entityBId, componentsB )
						expect( returnedEntities ).toEqual( Map.create( [ entityBId, entityB ] ) )
					} )
				} )
			} )
			
			describe( "data structures", function() {
				it( "should return the results of a query in a data structure that was previously specified.", function() {
					var entityAId = entities.create( componentsA )
					entities.create( componentsB )
					
					var result = entities.query( abWithDataStructureQueryId )
					
					expect( result.size() ).toEqual( 1 )
					expect( result.get( entityAId ) ).toEqual( entities.get( entityAId ) )
					expect( result.parameter ).toEqual( extendedMapParameter )
				} )
			} )
		} )
	}
)
