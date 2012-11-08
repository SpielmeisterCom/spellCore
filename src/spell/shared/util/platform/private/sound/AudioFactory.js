define(
	'spell/shared/util/platform/private/sound/AudioFactory',
	[
		'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
		'spell/shared/util/platform/private/sound/webkitAudio/createWebKitAudioContext'
	],
	function(
		createHtml5AudioContext,
		createWebKitAudioContext
	) {
		'use strict'


		var BACK_END_HTML5  = 0
		var BACK_END_WEBKIT = 1

        var context = null

		/*
		 * Creates a audio context
		 *
		 * @param requestedBackEnd - when supplied, overrides the automagic audio back-end detection
		 */
		var createAudioContext = function( requestedBackEnd ) {
			// webkit audio api
			if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_WEBKIT ) ) {
				try {
					context = createWebKitAudioContext()
				} catch ( e ) { context = null }

				if( context ) return context
			}

			// native html5 audio
			if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_HTML5 ) ) {
				context = createHtml5AudioContext()

				if( context ) return context
			}

			throw 'Could not create a audio back-end.'
		}

		return {
			BACK_END_HTML5     : BACK_END_HTML5,
			BACK_END_WEBKIT    : BACK_END_WEBKIT,
			createAudioContext : createAudioContext
		}
	}
)
