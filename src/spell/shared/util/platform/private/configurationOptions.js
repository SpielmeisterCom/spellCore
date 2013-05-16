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


		/*
		 * These are the platform specific options.
		 */
		var validOptions = {
			renderingBackEnd : {
				validValues  : [
					RenderingFactory.BACK_END_CANVAS,
					RenderingFactory.BACK_END_WEBGL
				],
				configurable : true
			},
			audioBackEnd : {
				validValues  : [
					AudioFactory.BACK_END_DUMMY_AUDIO,
					AudioFactory.BACK_END_WEB_AUDIO,
					AudioFactory.BACK_END_HTML5_AUDIO,
					AudioFactory.BACK_END_NATIVE_AUDIO
				],
				configurable : true
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
