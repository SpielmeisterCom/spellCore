
define(
	[
		"spell/util/browser/rendering/defineImages"
	],
	function(
		defineImages
	) {
		"use strict";
		
		

		describe( "defineImages", function() {
		
			it( "should create image information with a default id from a simple definition.", function() {
				var id = "imageX";
				var path = "path/to/" +id+ ".png";
				
				var imageInformation = defineImages( function( fromFile ) {
					fromFile( path ).takeImage();
				} );
				
				expect( imageInformation[ id ].path ).toEqual( path );
			} );
			
			it( "should correctly extract the id from a path without slashes.", function() {
				var id = "imageX";
				var path = id+ ".png";
				
				var imageInformation = defineImages( function( fromFile ) {
					fromFile( path ).takeImage();
				} );
				
				expect( imageInformation[ id ].path ).toEqual( path );
			} );
			
			it( "should set the id to the one explicitely given.", function() {
				var id = "imageX";
				var path = "path/to/image-x.png";
				
				var imageInformation = defineImages( function( fromFile ) {
					fromFile( path ).takeImageAs( id );
				} );
				
				expect( imageInformation[ id ].path ).toEqual( path );
			} );
			
			it( "should set the position and size of the image, if it was provided.", function() {
				var id = "imageX";
				
				var x = 32;
				var y = 0;
				var width = 32;
				var height = 32;
				
				var imageInformation = defineImages( function( fromFile ) {
					fromFile( "path/to/image-x.png" ).takeImageAs( id ).startingAt( x, y ).withSize( width, height );
				} );
				
				expect( imageInformation[ id ].x ).toEqual( x );
				expect( imageInformation[ id ].y ).toEqual( y );
				expect( imageInformation[ id ].width ).toEqual( width );
				expect( imageInformation[ id ].height ).toEqual( height );
			} );
			
			it( "should also set position and size when using a default id.", function() {
				var id = "imageX";
				var path = "path/to/" +id+ ".png";
				
				var x = 32;
				var y = 0;
				var width = 32;
				var height = 32;
				
				var imageInformation = defineImages( function( fromFile ) {
					fromFile( path ).takeImage().startingAt( x, y ).withSize( width, height );
				} );
				
				expect( imageInformation[ id ].x ).toEqual( x );
				expect( imageInformation[ id ].y ).toEqual( y );
				expect( imageInformation[ id ].width ).toEqual( width );
				expect( imageInformation[ id ].height ).toEqual( height );
			} );
			
			it( "should set paths, positions and sizes of several images.", function() {
				var firstId = "imageX";
				var secondId = "imageY";
				
				var path = "path/to/image-x.png";
				
				var x = 32;
				var y = 0;
				var width = 32;
				var height = 32;
				
				var imageInformation = defineImages( function( fromFile ) {
					fromFile( path ).takeImagesAs( firstId, secondId ).startingAt( x, y ).withSize( width, height );
				} );
				
				expect( imageInformation[ firstId ] ).toEqual( {
					path: path,
					x: x,
					y: y,
					width: width,
					height: height
				} );
				
				expect( imageInformation[ secondId ] ).toEqual( {
					path: path,
					x: x + width,
					y: y,
					width: width,
					height: height
				} );
			} );
			
			it( "should set positions and sizes of images in several rows.", function() {
				var firstId = "imageX";
				var secondId = "imageY";
				var thirdId = "imageQ";
				var fourthId = "imageR";
				
				var path = "path/to/image-x.png";
				
				var x = 32;
				var y = 0;
				var width = 32;
				var height = 32;
				
				var imageInformation = defineImages( function( fromFile ) {
					fromFile( path )
							.takeImagesAs( firstId, secondId ).startingAt( x, y ).withSize( width, height )
							.takeImagesAs( thirdId, fourthId ).startingAt( x, y + height ).withSize( width, height );
				} );
				
				expect( imageInformation[ firstId ] ).toEqual( {
					path: path,
					x: x,
					y: y,
					width: width,
					height: height
				} );
				
				expect( imageInformation[ secondId ] ).toEqual( {
					path: path,
					x: x + width,
					y: y,
					width: width,
					height: height
				} );
				
				expect( imageInformation[ thirdId ] ).toEqual( {
					path: path,
					x: x,
					y: y + height,
					width: width,
					height: height
				} );
				
				expect( imageInformation[ fourthId ] ).toEqual( {
					path: path,
					x: x + width,
					y: y + height,
					width: width,
					height: height
				} );
			} );
		} );
	}
)
