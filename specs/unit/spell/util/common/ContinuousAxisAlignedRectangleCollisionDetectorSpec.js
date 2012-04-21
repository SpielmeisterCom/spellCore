
define(
	[
		"spell/util/common/ContinuousAxisAlignedRectangleCollisionDetector",
		"spell/util/common/Vector"
	],
	function(
		ContinuousAxisAlignedRectangleCollisionDetector,
		Vector
	) {

		describe( "ContinuousAxisAlignedRectangleCollisionDetector", function() {
			
			var rectangle = {
				position: new Vector( -2, -2 ),
				size: new Vector( 4, 4 )
			};
			
			var collisionDetector = null;
			
			beforeEach( function() {
				collisionDetector = new ContinuousAxisAlignedRectangleCollisionDetector();
			} );
			
			it( "shouldn't detect any collisions if no collision pairs are passed.", function() {
				var collisionPairs = [];
				
				var positionA = new Vector( 0, 0 );
				var positionB = new Vector( 2, 2 );
				var speedA = new Vector( 0, 0 );
				var speedB = new Vector( 0, 0 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results.length ).toEqual( 0 );
			} );
			
			it( "shouldn't detect any collisions if the rectangles don't move and don't touch.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 0, 0 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 0, 0 );
				var speedB = new Vector( 0, 0 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ].touchesOnXAxis ).toEqual( false );
				expect( results[ 0 ].touchesOnYAxis ).toEqual( false );
			} );
			
			it( "should detect a collision if the rectangles don't move and touch on both axes.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 1, 1 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 0, 0 );
				var speedB = new Vector( 0, 0 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ] ).toEqual( {
					touchesOnXAxis: true,
					touchesOnYAxis: true,
					t: 0.0
				} );
			} );
			
			it( "should detect a collision if the rectangles don't move and touch on both axes from the opposite direction.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 9, 9 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 0, 0 );
				var speedB = new Vector( 0, 0 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ] ).toEqual( {
					touchesOnXAxis: true,
					touchesOnYAxis: true,
					t: 0.0
				} );
			} );
			
			it( "should detect a collision if the rectangles don't move and intersect on both axes.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 2, 2 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 0, 0 );
				var speedB = new Vector( 0, 0 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ] ).toEqual( {
					touchesOnXAxis: true,
					touchesOnYAxis: true,
					t: 0.0
				} );
			} );
			
			it( "should detect a collision if the rectangles and intersect on both axes, even if they move.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 2, 2 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 1, 1 );
				var speedB = new Vector( -1, -1 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ] ).toEqual( {
					touchesOnXAxis: true,
					touchesOnYAxis: true,
					t: 0.0
				} );
			} );
			
			it( "shouldn't detect a collision if the rectangles don't move and are separated on the x axis.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 0, 2 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 0, 0 );
				var speedB = new Vector( 0, 0 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ].touchesOnXAxis ).toEqual( false );
				expect( results[ 0 ].touchesOnYAxis ).toEqual( false );
			} );
			
			it( "shouldn't detect a collision if the rectangles don't move and are separated on the y axis.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 2, 0 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 0, 0 );
				var speedB = new Vector( 0, 0 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ].touchesOnXAxis ).toEqual( false );
				expect( results[ 0 ].touchesOnYAxis ).toEqual( false );
			} );
			
			it( "shouldn't detect a collision if the rectangles don't move and are separated on the x axis on the opposite side.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 10, 2 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 0, 0 );
				var speedB = new Vector( 0, 0 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ].touchesOnXAxis ).toEqual( false );
				expect( results[ 0 ].touchesOnYAxis ).toEqual( false );
			} );
			
			it( "should detect a collision if the rectangles move towards each other.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 0, 0 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 1, 1 );
				var speedB = new Vector( -1, -1 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ] ).toEqual( {
					touchesOnXAxis: true,
					touchesOnYAxis: true,
					t: 0.5
				} );
			} );
			
			it( "should detect a collision if the rectangles move towards each other from the opposite direction.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 10, 10 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( -1, -1 );
				var speedB = new Vector( 1, 1 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ] ).toEqual( {
					touchesOnXAxis: true,
					touchesOnYAxis: true,
					t: 0.5
				} );
			} );
			
			it( "shouldn't detect a collision if the rectangles move away from each other.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 0, 0 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( -1, -1 );
				var speedB = new Vector( 1, 1 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ].touchesOnXAxis ).toEqual( false );
				expect( results[ 0 ].touchesOnYAxis ).toEqual( false );
			} );
			
			it( "shouldn't detect a collision if the rectangles move away from each other in the opposite direction.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 10, 10 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 1, 1 );
				var speedB = new Vector( -1, -1 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ].touchesOnXAxis ).toEqual( false );
				expect( results[ 0 ].touchesOnYAxis ).toEqual( false );
			} );
			
			it( "should detect a collision if the rectangles move towards each other and touch on the x axis.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 0, 2 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 1, 1 );
				var speedB = new Vector( -1, -1 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ] ).toEqual( {
					touchesOnXAxis: true,
					touchesOnYAxis: false,
					t: 0.5
				} );
			} );
			
			it( "should detect a collision if the rectangles move towards each other and touch on the y axis.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 2, 0 );
				var positionB = new Vector( 5, 5 );
				var speedA = new Vector( 1, 1 );
				var speedB = new Vector( -1, -1 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ] ).toEqual( {
					touchesOnXAxis: false,
					touchesOnYAxis: true,
					t: 0.5
				} );
			} );
			
			it( "should detect a collision if the rectangles move towards each other, but only on the x axis.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 0, 0 );
				var positionB = new Vector( 5, 0 );
				var speedA = new Vector( 1, 0 );
				var speedB = new Vector( -1, 0 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ] ).toEqual( {
					touchesOnXAxis: true,
					touchesOnYAxis: false,
					t: 0.5
				} );
			} );
			
			it( "should detect a collision if the rectangles move towards each other, but only on the y axis.", function() {
				var collisionPairs = [ [ 0, 1 ] ];
				
				var positionA = new Vector( 0, 0 );
				var positionB = new Vector( 0, 5 );
				var speedA = new Vector( 0, 1 );
				var speedB = new Vector( 0, -1 );
				
				var results = collisionDetector.detectCollisions(
						collisionPairs,
						[ positionA, positionB ],
						[ speedA, speedB ],
						[ rectangle, rectangle ] );
				
				expect( results[ 0 ] ).toEqual( {
					touchesOnXAxis: false,
					touchesOnYAxis: true,
					t: 0.5
				} );
			} );
		} );
	}
)
