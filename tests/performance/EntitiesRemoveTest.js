
define(
	[
		"spell/core/Entities"
	],
	function(
		Entities
	) {
		"use strict";
		
		
		var entities = Entities.create()
			
		// prepare queries
		var    abcQueryId = entities.prepareQuery( [ "a", "b", "c" ] )
		var    defQueryId = entities.prepareQuery( [ "d", "e", "f" ] )
		var    ghiQueryId = entities.prepareQuery( [ "g", "h", "i" ] )
		var abcdefQueryId = entities.prepareQuery( [ "a", "b", "c", "d", "e", "f" ] )
		
		var entityIds = []
	
		// create entities
		for ( var i = 0; i < 2000; i++ ) {
			var id1 = entities.create( [
				{ name: "a", value: "a" },
				{ name: "b", value: "b" },
				{ name: "c", value: "c" },
				{ name: "d", value: "d" },
				{ name: "e", value: "e" },
				{ name: "f", value: "f" },
				{ name: "g", value: "g" },
				{ name: "h", value: "h" },
				{ name: "i", value: "i" }
			] )
			
			var id2 = entities.create( [
				{ name: "a", value: "a" },
				{ name: "b", value: "b" },
				{ name: "c", value: "c" },
				{ name: "d", value: "d" },
				{ name: "e", value: "e" },
				{ name: "f", value: "f" },
			] )
			
			var id3 = entities.create( [
				{ name: "a", value: "a" },
				{ name: "b", value: "b" },
				{ name: "c", value: "c" },
				{ name: "g", value: "g" },
				{ name: "h", value: "h" },
				{ name: "i", value: "i" }
			] )
			
			entityIds.push( id1 )
			entityIds.push( id2 )
			entityIds.push( id3 )
		}
		
		shuffleArray( entityIds )
		
		
		
		performanceTest( "Entities: Remove", function() {
			
			entityIds.forEach( function( entityId ) {
				entities.remove( entityId )
			} )
		} )
		
		
		function shuffleArray( array ) {
			array.forEach( function( element, index ) {
				var randomIndex = Math.floor( Math.random() * array.length )
				var tmp = array[ randomIndex ]
				array[ randomIndex ] = element
				array[ index ] = tmp
			} )
		}
	}
)
