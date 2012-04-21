
define(
	[
		"spell/components/base/orientation",
		"spell/components/base/position",
		"spell/components/rendering/appearance",
		"spell/systems/browser/rendering/Renderer",
		"spell/util/common/Vector"
	],
	function(
		orientation,
		position,
		appearance,
		Renderer,
		Vector
	) {
		"use strict";
				
		
		describe( "Renderer", function() {
		
			var render = null;
			
			var sceneView = null;
			
			var images = {
				imageA: { isImageA: true },
				imageB: { isImageB: true }
			}
			
			beforeEach( function() {
				var renderer = new Renderer( images );
				render = renderer.render
				
				sceneView = {
					width: 100,
					height: 100,
					position: {
						x: 0,
						y: 0
					},
					viewSize: {
						x: 100,
						y: 100
					},
					clear: function() {},
					drawImage: function() {},
					saveState: function() {},
					restoreState: function() {},
					scale: function() {},
					translate: function() {},
					rotate: function() {}
				}
			} )
			
			describe( "SceneView interaction", function() {
				
				var entity = {
					position: position( { x: 10, y: 10 } ),
					orientation: orientation( { angle: 0 } ),
					appearance: appearance( { image: "imageA" } )
				}
				
				it( "should clear the scene view before drawing anything.", function() {
					spyOn( sceneView, "clear" );
					
					render( sceneView, [ entity ] );
					
					expect( sceneView.clear ).toHaveBeenCalled();
				} );
				
				it( "should draw an image unscaled and at its actual position, if the scene view has default values.", function() {
					spyOn( sceneView, "translate" );
					spyOn( sceneView, "drawImage" );
					
					render( sceneView, [ entity ] );
					
					expect( sceneView.translate ).toHaveBeenCalledWith( 10, 10 );
					expect( sceneView.drawImage ).toHaveBeenCalledWith( images.imageA, 0, 0 );
				} );
				
				it( "should translate an image's position before drawing it, if the scene view's position isn't at the origin", function() {
					sceneView.position = {
						x: 5,
						y: 5
					};
					spyOn( sceneView, "translate" );
					spyOn( sceneView, "drawImage" );
					
					render( sceneView, [ entity ] );
					
					expect( sceneView.translate ).toHaveBeenCalledWith( 5, 5 );
					expect( sceneView.drawImage ).toHaveBeenCalledWith( images.imageA, 0, 0 );
				} );
				
				it( "should scale an image before drawing it, if the scene view's size is smaller than then canvas it's rendered on.", function() {
					sceneView.viewSize = {
						x: 50,
						y: 25
					};
					spyOn( sceneView, "saveState" );
					spyOn( sceneView, "restoreState" );
					spyOn( sceneView, "scale" );
					
					render( sceneView, [ entity ] );
					
					expect( sceneView.scale ).toHaveBeenCalledWith( 2, 4 );
					expect( sceneView.saveState ).toHaveBeenCalled();
					expect( sceneView.restoreState ).toHaveBeenCalled();
				} )
			} )
			
			describe( "offset", function() {
				it( "should take the appearance's offset into account when drawing the image.", function() {
					var entity = {
						position: position( { x: 10, y: 10 } ),
						appearance: appearance( { image: "imageA", offset: Vector.create( 5, 5 ) } ),
						orientation: orientation( { angle: 0 } )
					}
					
					spyOn( sceneView, "translate" );
					spyOn( sceneView, "drawImage" );
					
					render( sceneView, [ entity ] );
					
					expect( sceneView.translate ).toHaveBeenCalledWith( 10, 10 );
					expect( sceneView.translate ).toHaveBeenCalledWith( 5, 5 );
					expect( sceneView.drawImage ).toHaveBeenCalledWith( images.imageA, 0, 0 );
				} )
			} )
			
			describe( "scaling", function() {
				it( "should take the scale of an image into account when drawing.", function() {
					var entity = {
						position: position( { x: 10, y: 10 } ),
						appearance: appearance( { image: "imageA", scale: Vector.create( 2, 3 ) } ),
						orientation: orientation( { angle: 0 } )
					}
					
					spyOn( sceneView, "scale" );
					
					render( sceneView, [ entity ] );
					
					expect( sceneView.scale ).toHaveBeenCalledWith( 2, 3 );
				} )
			} )
			
			describe( "rotating", function() {
				it( "should take orientation into account when drawing an image.", function() {
					var entity = {
						position: position( { x: 10, y: 10 } ),
						orientation: orientation( { angle: 1 } ),
						appearance: appearance( { image: "imageA" } )
					}
					
					spyOn( sceneView, "rotate" );
					
					render( sceneView, [ entity ] );
					
					expect( sceneView.rotate ).toHaveBeenCalledWith( 1 );
				} )
			} )
		} )
	}
)
