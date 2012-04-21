
define(
	[
		"spell/util/browser/rendering/defineAnimations"
	],
	function(
		defineAnimations
	) {
		"use strict";
		
		describe( "defineAnimations", function() {
			it( "should create an animation from a simple definition with id, frames and delay.", function() {
				var animationId = "walkLeft";
				var frame1 = "walkLeft1";
				var frame2 = "walkLeft2";
				var delay = 100;
				
				var animations = defineAnimations( function( defineAnimation ) {
					defineAnimation( animationId ).withFrames( frame1, frame2 ).withDelay( delay );
				} );
				
				expect( animations[ animationId ] ).toEqual( {
					id: animationId,
					frames: [ frame1, frame2 ],
					delay: delay,
					tags: []
				} );
			} );
			
			it( "should create an animation from a complete definition.", function() {
				var animationId = "walkLeft";
				var frame1 = "walkLeft1";
				var frame2 = "walkLeft2";
				var delay = 100;
				var tag1 = "walking";
				var tag2 = "left";
				
				var animations = defineAnimations( function( defineAnimation ) {
					defineAnimation( animationId )
							.withFrames( frame1, frame2 )
							.withDelay( delay )
							.andTags( tag1, tag2 );
				} );
				
				expect( animations[ animationId ] ).toEqual( {
					id: animationId,
					frames: [ frame1, frame2 ],
					delay: delay,
					tags: [ tag1, tag2 ]
				} );
			} );
			
			it( "should allow querying of animations by tags.", function() {
				var animationId = "walkLeft";
				var frame1 = "walkLeft1";
				var frame2 = "walkLeft2";
				var delay = 100;
				var tag1 = "walking";
				var tag2 = "left";
				
				var animations = defineAnimations( function( defineAnimation ) {
					defineAnimation( animationId )
							.withFrames( frame1, frame2 )
							.withDelay( delay )
							.andTags( tag1, tag2 );
					
					defineAnimation( "walkRight" )
							.withFrames( "walkRight1", "walkRight2" )
							.withDelay( 100 )
							.andTags( "walking", "right" );
				} );
				
				expect( animations.queryByTags( [ tag1, tag2 ] ) ).toEqual( {
					id: animationId,
					frames: [ frame1, frame2 ],
					delay: delay,
					tags: [ tag1, tag2 ]
				} );
			} );
		} );
	}
)
