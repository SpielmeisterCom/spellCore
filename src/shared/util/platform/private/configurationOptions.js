define(
	"spell/shared/util/platform/private/configurationOptions",
	[
		"spell/shared/util/platform/private/graphics/RenderingFactory"
	],
	function(
		RenderingFactory
	) {
		"use strict"


		var extractRenderingBackEnd = function( validValues, value ) {
			if( value === 'webgl' ) {
				return RenderingFactory.BACK_END_WEBGL

			} else if( value === 'canvas-2d' ) {
				return RenderingFactory.BACK_END_CANVAS
			}

			return false
		}

		/**
		 * These are the platform specific options.
		 */
		var validOptions = {
			renderingBackEnd : {
				validValues  : [ 'webgl', 'canvas-2d' ],
				configurable : true,
				extractor    : extractRenderingBackEnd
			}
		}

		/**
		 * These options are used when they are not overridden by the environment configuration set up by the stage-0-loader.
		 */
		var defaultOptions = {
			renderingBackEnd : 'canvas-2d'
		}

		return {
			defaultOptions : defaultOptions,
			validOptions   : validOptions
		}
	}
)
