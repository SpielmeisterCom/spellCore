
define(
	[
		"spell/core/Entity"
	],
	function(
		Entity
	) {
		"use strict";
		
		
		describe( "Entity", function() {
			
			it( "should create an entity object from the given id and component array.", function() {
				var entityId = 0
				var componentArray = [
					{ name: "componentA", value: "a" },
					{ name: "componentB", value: "b" }
				]
				
				var entity = Entity.create( entityId, componentArray )
				
				expect( entity.id ).toEqual( entityId )
				expect( entity.componentA ).toEqual( componentArray[ 0 ].value )
				expect( entity.componentB ).toEqual( componentArray[ 1 ].value )
			} )
		} )
	}
)
