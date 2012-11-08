/**
 * This file is a documentation stub for the rendering context. The concrete renderingContext will be determined
 * by SpellJS and injected as spell.renderingContext. All rendering-contexts implement this interface.
 *
 * Spell supports render contexts for:
 * * Canvas2D (HTML5)
 * * WebGL (HTML5)
 * * Flash (DisplayList API)
 *
 * *TBD* How to force a render context
 *
 * @class spell.renderingContext
 * @singleton
 */
define(
	'spell/renderingContext',
	[ ],
	function() {
		'use strict'

		var RenderingContext = function() { }


		RenderingContext.prototype = {
			/**
			 *
			 */
			clear                   : function() {},


			/**
			 *
			 */
			createTexture           : function() {},

			/**
			 *
			 */
			drawTexture             : function() {},

			/**
			 *
			 */
			drawSubTexture          : function(texture, sx, sy, sw, sh, dx, dy, dw, dh) {},

			/**
			 *
			 */
			drawRect                : function(dx, dy, dw, dh, lineWidth) {},

			/**
			 *
			 */
			drawCircle              : function(dx, dy, radius, lineWidth) {},

			/**
			 *
			 */
			drawLine                : function() {},

			/**
			 *
			 */
			fillRect                : function() {},

			/**
			 *
			 */
			getConfiguration        : function() {},

			/**
			 *
			 */
			resizeColorBuffer       : function() {},

			/**
			 *
			 */
			restore                 : function() {},

			/**
			 *
			 */
			rotate                  : function() {},

			/**
			 *
			 */
			save                    : function() {},

			/**
			 *
			 */
			scale                   : function() {},

			/**
			 *
			 */
			setClearColor           : function() {},

			/**
			 *
			 */
			setColor                : function(vec) {},

			/**
			 *
			 */
			setLineColor            : function() {},

			/**
			 *
			 */
			setGlobalAlpha          : function() {},

			/**
			 *
			 */
			setTransform            : function() {},

			/**
			 *
			 */
			setViewMatrix           : function() {},

			/**
			 *
			 */
			transform               : function() {},

			/**
			 *
			 */
			translate               : function() {},

			/**
			 * @return void
			 */
			viewport                : function( x, y, width, height ) {

			},

			/**
			 * @return vec2
			 */
			transformScreenToWorld  : function( vec ) {

			}
		}

		return RenderingContext
	}
)
