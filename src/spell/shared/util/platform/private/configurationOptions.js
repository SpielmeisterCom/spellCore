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
			if( value === 'canvas-2d' ) {
				return RenderingFactory.BACK_END_CANVAS

			} else if( value === 'webgl' ) {
				return RenderingFactory.BACK_END_WEBGL
			}

			return false
		}

		var extractAudioBackEnd = function( validValues, value ) {
			if( value === 'dummy' ) {
				return AudioFactory.BACK_END_DUMMY_AUDIO

			} else if( value === 'html5' ) {
				return AudioFactory.BACK_END_HTML5_AUDIO

			} else if( value === 'web' ) {
				return AudioFactory.BACK_END_WEB_AUDIO
			}

			return false
		}

		/*
		 * These are the platform specific options.
		 */
		var validOptions = {
			renderingBackEnd : {
				validValues  : [ 'canvas-2d', 'webgl' ],
				configurable : true,
				extractor    : extractRenderingBackEnd
			},
			audioBackEnd : {
				validValues  : [ 'dummy', 'html5', 'web' ],
				configurable : true,
				extractor    : extractAudioBackEnd
			},
			libraryUrl : {
				configurable : true
			}
		}

		/*
		 * These options are used when they are not overridden by the environment configuration set up by the stage-0-loader.
		 */
		var defaultOptions = {
			renderingBackEnd : 'canvas-2d',
			audioBackEnd : 'html5',
			libraryUrl : 'library'
		}

		return {
			defaultOptions : defaultOptions,
			validOptions   : validOptions
		}
	}
)
