/**
 * Spell includes the following rendering context implementations:
 *
 * + **canvas-2d** - uses the 2d context supplied by the canvas element *(html5 target only)*
 * + **webgl** - uses the webgl context supplied by the canvas element *(html5 target only)*
 * + **display-list** - uses flash's display list API *(flash target only)*
 *
 * All drawing methods of the rendering context take the current drawing state into account. The current drawing state consists of the properties *color*,
 * *line color*, *opacity*, *transformation* and *view transformation*. The current state can be pushed and popped to and from the state stack with the
 * methods *save* and *restore* similar to the fixed function OpenGL API or 2d context of the canvas element in HTML5.
 *
 * @class spell.renderingContext
 * @singleton
 */
var RenderingContext = function() {}

RenderingContext.prototype = {
	/**
	 * Clears the color buffer with the clear color.
	 */
	clear : function() {},

	/**
	 * Creates a texture object from *image*. Objects of type Image are created with the ImageLoader.
	 *
	 * @param {Image} image
	 * @return {Texture}
	 */
	createTexture : function( image ) {},

	/**
	 * Draws a circle at the point *(dx, dy)*.
	 *
	 * @param {Number} dx
	 * @param {Number} dy
	 * @param {Number} radius
	 * @param {Number} lineWidth
	 */
	drawCircle : function( dx, dy, radius, lineWidth ) {},


	/**
	 * Draws a line between the points *(ax, ay)* and *(bx, by)*.
	 *
	 * @param {Number} ax
	 * @param {Number} ay
	 * @param {Number} bx
	 * @param {Number} by
	 * @param {Number} lineWidth
	 */
	drawLine : function( ax, ay, bx, by, lineWidth ) {},

	/**
	 * Draws a rectangle at point *(dx, dy)* with the dimensions *(dw, dh)*.
	 *
	 * @param {Number} dx
	 * @param {Number} dy
	 * @param {Number} dw
	 * @param {Number} dh
	 * @param {Number} lineWidth
	 */
	drawRect : function( dx, dy, dw, dh, lineWidth ) {},

	/**
	 * Draws a sub texture to the destination point *(dx, dy)* and the destination dimensions *(dw, dh)*. The sub texture is a section in the supplied
	 * *texture* defined by the source point *(sx, sy)* and the source dimensions *(sw, sh)*. Both of which are supplied in absolute texture coordinates.
	 * Absolute texture coordinates can be created by multiplying the relative texture * coordinates with the dimensions of the *texture*.
	 *
	 * @param {Texture} texture
	 * @param {Number} sx
	 * @param {Number} sy
	 * @param {Number} sw
	 * @param {Number} sh
	 * @param {Number} dx
	 * @param {Number} dy
	 * @param {Number} dw
	 * @param {Number} dh
	 */
	drawSubTexture : function( texture, sx, sy, sw, sh, dx, dy, dw, dh ) {},

	/**
	 * Draws the *texture* to the destination specified by *destinationPosition* and *destinationDimensions*. When a *textureMatrix* parameter is supplied it is
	 * used to transform the texture coordinates.
	 *
	 * @param {Texture} texture
	 * @param {vec2} destinationPosition
	 * @param {vec2} destinationDimensions
	 * @param {mat3} textureMatrix
	 */
	drawTexture : function( texture, destinationPosition, destinationDimensions, textureMatrix ) {},

	/**
	 * Draws a rectangle at point *(dx, dy)* with the dimensions *(dw, dh)*. Uses the currently set color to fill it.
	 *
	 * @param {Number} dx
	 * @param {Number} dy
	 * @param {Number} dw
	 * @param {Number} dh
	 */
	fillRect : function( dx, dy, dw, dh ) {},

	/**
	 * Returns a object with information about the rendering context.
	 *
	 * Example of configuration object:
	 * 	{
	 * 		type : "webgl",
	 * 		width : 300, // width of color buffer
	 * 		height : 200, // height of color buffer
	 * 		info : "WebKit;WebKit WebGL;WebGL 1.0 (OpenGL ES 2.0 Chromium);WebGL GLSL ES 1.0 (OpenGL ES GLSL ES 1.0 Chromium)"
	 * 	}
	 *
	 * @return {Object}
	 */
	getConfiguration : function() {},

	/**
	 * Resizes the color buffer to the supplied *width* and *height*.
	 *
	 * @param {Number} width
	 * @param {Number} height
	 */
	resizeColorBuffer : function( width, height ) {},

	/**
	 * Sets the current drawing state to the head of the drawing state stack and pops it of the stack.
	 */
	restore : function() {},

	/**
	 * Rotates the current transformation by *rad* radians.
	 *
	 * @param {Number} rad
	 */
	rotate : function( rad ) {},

	/**
	 * Pushes the current drawing state onto the drawing state stack.
	 */
	save : function() {},

	/**
	 * Scales the current transformation by *v*.
	 *
	 * @param {vec2} v
	 */
	scale : function( v ) {},

	/**
	 * Sets the clear color to *v*.
	 *
	 * Example:
	 *  magicPink = [ 1.0, 0.0, 1.0 ]
	 *
	 * @param {vec3} v
	 */
	setClearColor : function( v ) {},

	/**
	 * Sets the current color to *v*.
	 *
	 * Example:
	 *  magicPink = [ 1.0, 0.0, 1.0 ]
	 *
	 * @param {vec3} v
	 */
	setColor : function( v ) {},

	/**
	 * Sets the current opacity.
	 *
	 * Example:
	 *  opaque = 1.0,
	 *  almostTransparent = 0.1
	 *
	 * @param {vec3} v
	 */
	setGlobalAlpha : function( o ) {},

	/**
	 * Sets the current line color to *v*.
	 *
	 * Example:
	 *  magicPink = [ 1.0, 0.0, 1.0 ]
	 *
	 * @param {vec3} v
	 */
	setLineColor : function( v ) {},

	/**
	 * Sets the current transformation to *m*.
	 *
	 * @param {mat3} m
	 */
	setTransform : function( m ) {},

	/**
	 * Sets the current view transformation to *m*.
	 *
	 * @param {mat3} m
	 */
	setViewMatrix : function( m ) {},

	/**
	 * Transforms the current transformation by *m*.
	 *
	 * @param {mat3} m
	 */
	transform : function( m ) {},

	/**
	 * Transforms the supplied vector *v* from screen to world coordinates.
	 *
	 * @param {vec2} v
	 */
	transformScreenToWorld : function( v ) {},

	/**
	 * Translates the current transformation by *v*.
	 *
	 * @param {vec2} v
	 */
	translate : function( v ) {},

	/**
	 * Sets the current viewport to the color buffer section described by point *(dx, dy)* and dimensions *(dw, dh)*.
	 *
	 * **WARNING: Viewport clipping is not supported by all rendering context implementations. This makes this function kind of useless.**
	 *
	 * @param {Number} dx
	 * @param {Number} dy
	 * @param {Number} dw
	 * @param {Number} dh
	 */
	viewport : function( dx, dy, dw, dh ) {}
}
