
require(
	[
		"spell/components/collision/collisionRectangle",
		"spell/util/common/Vector"
	],
	function(
		collisionRectangle,
		Vector
	) {
	
		describe( "collisionRectangle", function() {
			it( "should create a default collision rectangle component, if no parameters are given.", function() {
				var defaultCollisionRectangleComponent = collisionRectangle( {} )
				expect( defaultCollisionRectangleComponent ).toEqual( {
					position: Vector.create( -0.5, -0.5 ),
					size:     Vector.create( 1, 1 )
				} )
			} )
			
			it( "should create a collision rectangle component with the given values.", function() {
				var position = Vector.create( -5, -5 )
				var size     = Vector.create( 10, 10 )
				
				var collisionRectangleComponent = collisionRectangle( { position: position, size: size } )
				
				expect( collisionRectangleComponent ).toEqual( {
					position: position,
					size:     size
				} )
			} )
		} )
	}
)
