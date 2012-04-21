
define(
	[
		"spell/components/rendering/appearance",
		"spell/util/common/Vector"
	],
	function(
		appearance,
		Vector
	) {
		"use strict";
		
		
		describe( "appearance", function() {
			it( "should build an appearance component with default values.", function() {
				var image = "example.png";
				
				var appearanceComponent = appearance( { image: image } )
				
				expect( appearanceComponent ).toEqual( {
					image:  image,
					offset: Vector.create( 0, 0 ),
					scale:  Vector.create( 1, 1 ),
					zIndex: 0
				} )
			} )
			
			it( "should build an appearance component with the given values.", function() {
				var image  = "example.png"
				var offset = Vector.create( -16, -16 )
				var scale  = Vector.create( 2, 2 )
				var zIndex = 1
				
				var appearanceComponent = appearance( {
					image:  image,
					offset: offset,
					scale:  scale,
					zIndex: zIndex
				} )
				
				var expectedAppearanceComponent = {
					image:  image,
					offset: offset,
					scale:  scale,
					zIndex: zIndex
				}
				expect( appearanceComponent ).toEqual( expectedAppearanceComponent )
			} )
		} )
	}
)
