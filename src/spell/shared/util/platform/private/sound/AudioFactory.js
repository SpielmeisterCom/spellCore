define(
	'spell/shared/util/platform/private/sound/AudioFactory',
	[
		'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
		'spell/shared/util/platform/private/sound/webAudio/createWebAudioContext'
	],
	function(
		createHtml5AudioContext,
		createWebAudioContext
	) {
		'use strict'


		var BACK_END_WEB_AUDIO = 0,
			BACK_END_HTML5_AUDIO = 1

        var context = null

		/*
		 * Creates an audio context
		 *
		 * @param requestedBackEnd - when supplied, overrides the automagic audio back-end detection
		 */
		var createAudioContext = function( requestedBackEnd ) {
			try {
				if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_WEB_AUDIO ) ) {
					context = createWebAudioContext()

				} else if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_HTML5_AUDIO ) ) {
					context = createHtml5AudioContext()
				}

			} catch( e ) {
				context = null
			}

			if( context ) return context

			throw 'Could not create a audio back-end.'
		}

		return {
			BACK_END_HTML5_AUDIO : BACK_END_HTML5_AUDIO,
			BACK_END_WEB_AUDIO : BACK_END_WEB_AUDIO,
			createAudioContext : createAudioContext
		}
	}
)
