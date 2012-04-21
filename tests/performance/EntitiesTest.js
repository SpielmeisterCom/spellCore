define(
	[
		"spell/shared/util/create",
		"spell/shared/util/entities/Entities",
		
		"underscore"
	],
	function(
		create,
		Entities,
		
		_
	) {
		"use strict"
		
		
		performanceTest( "Entities", function() {
			
			var entities = create( Entities )
			
			_.times( 1000, function( i ) {
				var ab = {
					id: i * 3 + 0,
					a : "a",
					b : "b"
				}
				
				var ac = {
					id: i * 3 + 1,
					a : "a",
					c : "c"
				}
				
				var ad = {
					id: i * 3 + 2,
					a : "a",
					d : "d"
				}
				
				entities.add( ab )
				entities.add( ac )
				entities.add( ad )
			} )
			
			var aQueryId  = entities.prepareQuery( [ "a" ] )
			var abQueryId = entities.prepareQuery( [ "a", "b" ] )
			var acQueryId = entities.prepareQuery( [ "a", "c" ] )
			var adQueryId = entities.prepareQuery( [ "a", "d" ] )
			
			var nextToRemove = 0
			_.times( 1000, function( i ) {
				entities.executeQuery( aQueryId  )
				entities.executeQuery( abQueryId )
				entities.executeQuery( acQueryId )
				entities.executeQuery( adQueryId )
				
				if ( i % 20 === 0 ) {
					entities.add( {
						id: 100000 + i,
						a : "a",
						b : "b"
					} )
					
					entities.remove( {
						id: nextToRemove++
					} )
				}
			} )
		} )
	}
)
