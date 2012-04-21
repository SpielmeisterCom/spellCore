define(
	[
		"spell/shared/util/entities/EntityManager"
	],
	function(
		EntityManager
	) {
		"use strict"
		
		
		describe( "EntityManager", function() {
		
			var entity = function( value ) {
				this.componentA = value
			}
			var entityConstructors = {
				"entity": entity
			}
			
			var componentA = function( value ) {
				this.a = value
			}
			var componentB = function( value ) {
				this.b = value
			}
			var componentConstructors = {
				"componentA": componentA,
				"componentB": componentB
			}
			
			var entityManager
			
			beforeEach( function() {
				entityManager = new EntityManager(
					entityConstructors,
					componentConstructors
				)
			} )
		
			describe( "createEntity", function() {
				it( "should return the created entity.", function() {
					var entity = entityManager.createEntity( "entity", [ "value" ] )
					
					expect( entity ).toEqual( { id: 0, componentA: "value" } )
				} )
				
				it( "should set the entity id of every created entity.", function() {
					var entityA = entityManager.createEntity( "entity", [ "value" ] )
					var entityB = entityManager.createEntity( "entity", [ "value" ] )
					
					expect( entityA.id ).toEqual( 0 )
					expect( entityB.id ).toEqual( 1 )
				} )
			} )

			describe( "addComponent", function() {
				it( "should add a component to an entity.", function() {
					var entity = entityManager.createEntity( "entity", [ "value" ] )
					
					var component = entityManager.addComponent( entity, "componentB", [ "b" ] )
					
					expect( component ).toEqual( { b: "b" } )
					expect( entity.componentB ).toEqual( component )
				} )
				
				it( "should overwrite an existing component, if one already exists.", function() {
					var entity = entityManager.createEntity( "entity", [ "value" ] )
					
					entityManager.addComponent( entity, "componentA", [ "a" ] )
					
					expect( entity.componentA ).toEqual( { a: "a" } )
				} )
			} )
			
			it( "should remove a component from an entity", function() {
				var entity    = entityManager.createEntity( "entity", [ "value" ] )
				var component = entityManager.addComponent( entity, "componentB", [ "b" ] )
				
				var removedComponent = entityManager.removeComponent( entity, "componentB" )
				
				expect( component ).toEqual( removedComponent )
				expect( entity.hasOwnProperty( "componentB" ) ).toEqual( false )
			} )
			
			describe( "robustness", function() {
				it( "should throw an error, if an entity constructor is not known.", function() {
					var invalidEntityType = "invalidEntity"
					
					var exception
					try {
						entityManager.createEntity( invalidEntityType )
					}
					catch ( e ) {
						exception = e
					}
					
					expect( exception ).toContain( EntityManager.ENTITY_TYPE_NOT_KNOWN )
					expect( exception ).toContain( invalidEntityType )
				} )
				
				it( "should throw an error, if a component constructor is not known.", function() {
					var invalidComponentType = "invalidComponent"
					var entity = entityManager.createEntity( "entity", [ "value" ] )
					
					var exception
					try {
						entityManager.addComponent( entity, invalidComponentType )
					}
					catch( e ) {
						exception = e
					}
					
					expect( exception ).toContain( EntityManager.COMPONENT_TYPE_NOT_KNOWN )
					expect( exception ).toContain( invalidComponentType )
				} )
			} )
		} )
	}
)
