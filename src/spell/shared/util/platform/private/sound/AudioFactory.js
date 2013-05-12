define(
	'spell/shared/util/platform/private/sound/AudioFactory',
	[
		'spell/shared/util/platform/private/sound/dummyAudio/createDummyAudioContext',
		'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
		'spell/shared/util/platform/private/sound/webAudio/createWebAudioContext',
        'spell/shared/util/platform/private/sound/nativeAudio/createNativeAudioContext'
    ],
	function(
		createDummyAudioContext,
		createHtml5AudioContext,
		createWebAudioContext,
        createNativeAudioContext
	) {
		'use strict'


		var BACK_END_DUMMY_AUDIO = 0,
			BACK_END_WEB_AUDIO   = 1,
			BACK_END_HTML5_AUDIO = 2,
            BACK_END_NATIVE_AUDIO= 3

        var context = null

		/*
		 * Creates an audio context
		 *
		 * @param requestedBackEnd - when supplied, overrides the automagic audio back-end detection
		 */
		var createAudioContext = function( requestedBackEnd ) {
			try {
				if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_DUMMY_AUDIO ) ) {
					context = createDummyAudioContext()

				} else if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_WEB_AUDIO ) ) {
					context = createWebAudioContext()

				} else if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_HTML5_AUDIO ) ) {
					context = createHtml5AudioContext()

				} else if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_NATIVE_AUDIO ) ) {
                    context = createNativeAudioContext()
                }

			} catch( e ) {
				context = null
			}

			if( context ) return context

			throw 'Could not create a audio back-end.'
		}

		return {
			BACK_END_DUMMY_AUDIO : BACK_END_DUMMY_AUDIO,
			BACK_END_HTML5_AUDIO : BACK_END_HTML5_AUDIO,
			BACK_END_WEB_AUDIO : BACK_END_WEB_AUDIO,
            BACK_END_NATIVE_AUDIO : BACK_END_NATIVE_AUDIO,
			createAudioContext : createAudioContext
		}
	}
)
