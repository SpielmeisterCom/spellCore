
define(
	[
		"spell/core/EntityCreator"
	],
	function(
		EntityCreator
	) {
		"use strict";
		
		
		describe( "EntityCreator", function() {
		
			var entities
			var registry
			
			var entityCreator
			
			beforeEach( function() {
				entities = {
					create: function() {}
				}
				registry = {
					componentFactories: [],
					entityFactories: []
				}
								
				entityCreator = EntityCreator.create( entities, registry )
			} )
			
			it( "should retrieve the component factories from the registry, when creating an entity.", function() {
				var componentAValue   = "a"
				var componentBValue   = "b"
				var componentCValue   = "c"
				var componentDValue   = "d"
				var componentAFactory = jasmine.createSpy().andReturn( componentAValue )
				var componentBFactory = jasmine.createSpy().andReturn( componentBValue )
				var componentCFactory = jasmine.createSpy().andReturn( componentCValue )
				var componentDFactory = jasmine.createSpy().andReturn( componentDValue )
				var components = [
					{ id: "spell:namespace/componentA", parameters: { x: "x" } },
					{ id: "spell:componentB", parameters: undefined },
					{ id: "namespace/componentC", parameters: undefined },
					{ id: "componentD", parameters: undefined }
				]
				registry.componentFactories[ "spell:namespace/componentA" ] = componentAFactory
				registry.componentFactories[ "spell:componentB"           ] = componentBFactory
				registry.componentFactories[ "namespace/componentC"       ] = componentCFactory
				registry.componentFactories[ "componentD"                 ] = componentDFactory
				var entityFactory = jasmine.createSpy().andReturn( components )
				registry.entityFactories[ "myEntity" ] = entityFactory
				spyOn( entities, "create" )
				var entityParameters = { arg1: "1", arg2: "2" }

				entityCreator.createEntity( "myEntity", entityParameters )
				entityCreator.commit()
				
				expect( entities.create ).toHaveBeenCalledWith( [
					{ name: "componentA", value: componentAValue },
					{ name: "componentB", value: componentBValue },
					{ name: "componentC", value: componentCValue },
					{ name: "componentD", value: componentDValue }
				] )
				expect( entityFactory ).toHaveBeenCalledWith( entityParameters )
				expect( componentAFactory ).toHaveBeenCalledWith( components[ 0 ].parameters )
				expect( componentBFactory ).toHaveBeenCalledWith( {} )
				expect( componentCFactory ).toHaveBeenCalledWith( {} )
				expect( componentDFactory ).toHaveBeenCalledWith( {} )
			} )
		} )
	}
)
