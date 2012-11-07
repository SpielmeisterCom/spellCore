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
			drawSubTexture          : function() {},

			/**
			 *
			 */
			drawRect                : function() {},

			/**
			 *
			 */
			drawCircle              : function() {},

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
			setColor                : function() {},

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
			 *
			 */
			viewport                : function() {},

			/**
			 *
			 */
			getWorldToScreenMatrix  : function() {}
		}

		return RenderingContext
	}
)
