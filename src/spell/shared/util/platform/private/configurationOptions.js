define(
	'spell/shared/util/platform/private/configurationOptions',
	[
		'spell/shared/util/platform/private/graphics/RenderingFactory',
		'spell/shared/util/platform/private/sound/AudioFactory'
	],
	function(
		RenderingFactory,
		AudioFactory
	) {
		'use strict'


		var extractRenderingBackEnd = function( validValues, value ) {
			if( value === 'webgl' ) {
				return RenderingFactory.BACK_END_WEBGL

			} else if( value === 'canvas-2d' ) {
				return RenderingFactory.BACK_END_CANVAS
			}

			return false
		}

		var extractAudioBackEnd = function( validValues, value ) {
			if( value === 'webAudio' ) {
				return AudioFactory.BACK_END_WEB_AUDIO

			} else if( value === 'html5Audio' ) {
				return AudioFactory.BACK_END_HTML5_AUDIO
			}

			return false
		}

		/*
		 * These are the platform specific options.
		 */
		var validOptions = {
			renderingBackEnd : {
				validValues  : [ 'webgl', 'canvas-2d' ],
				configurable : true,
				extractor    : extractRenderingBackEnd
			},
			audioBackEnd : {
				validValues  : [ 'webAudio', 'html5Audio' ],
				configurable : true,
				extractor    : extractAudioBackEnd
			},
			baseUrlPrefix : {
				configurable : false
			}
		}

		/*
		 * These options are used when they are not overridden by the environment configuration set up by the stage-0-loader.
		 */
		var defaultOptions = {
			renderingBackEnd : 'canvas-2d',
			audioBackEnd : 'html5Audio',
			baseUrlPrefix : ''
		}

		return {
			defaultOptions : defaultOptions,
			validOptions   : validOptions
		}
	}
)
