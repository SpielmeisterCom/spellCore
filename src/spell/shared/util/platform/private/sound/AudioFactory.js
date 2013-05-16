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


		var BACK_END_DUMMY_AUDIO  = 'dummy',
			BACK_END_WEB_AUDIO    = 'web',
			BACK_END_HTML5_AUDIO  = 'html5',
			BACK_END_NATIVE_AUDIO = 'native'

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
