
define(
	[
		"spell/core/Entities"
	],
	function(
		Entities
	) {
		performanceTest( "Entities: Create and Query", function() {
			var entities = Entities.create()
			
			// prepare queries
			var    abcQueryId = entities.prepareQuery( [ "a", "b", "c" ] )
			var    defQueryId = entities.prepareQuery( [ "d", "e", "f" ] )
			var    ghiQueryId = entities.prepareQuery( [ "g", "h", "i" ] )
			var abcdefQueryId = entities.prepareQuery( [ "a", "b", "c", "d", "e", "f" ] )
		
			// create entities
			for ( var i = 0; i < 10000; i++ ) {
				entities.create( [
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
				
				entities.create( [
					{ name: "a", value: "a" },
					{ name: "b", value: "b" },
					{ name: "c", value: "c" },
					{ name: "d", value: "d" },
					{ name: "e", value: "e" },
					{ name: "f", value: "f" },
				] )
				
				entities.create( [
					{ name: "a", value: "a" },
					{ name: "b", value: "b" },
					{ name: "c", value: "c" },
					{ name: "g", value: "g" },
					{ name: "h", value: "h" },
					{ name: "i", value: "i" }
				] )
			}
			
			// iteration
			for ( var i = 0; i < 100; i++ ) {
				// query
				var abc    = entities.query( abcQueryId )
				var def    = entities.query( defQueryId )
				var ghi    = entities.query( ghiQueryId )
				var abcdef = entities.query( abcdefQueryId )
			}
		} )
	}
)
