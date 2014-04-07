define(
	'spell/shared/util/platform/private/sound/AudioFactory',
	[
		'spell/shared/util/platform/private/sound/dummyAudio/createDummyAudioContext',
		'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
		'spell/shared/util/platform/private/sound/webAudio/createWebAudioContext',
		'spell/shared/util/platform/private/sound/nativeAudio/createNativeAudioContext',
		'spell/shared/util/platform/private/sound/winPhoneAudio/createWinPhoneAudioContext'
	],
	function(
		createDummyAudioContext,
		createHtml5AudioContext,
		createWebAudioContext,
		createNativeAudioContext,
		createWinPhoneAudioContext
	) {
		'use strict'


		var BACK_END_DUMMY_AUDIO    = 'dummy',
			BACK_END_WEB_AUDIO      = 'web',
			BACK_END_HTML5_AUDIO    = 'html5',
			BACK_END_NATIVE_AUDIO   = 'native',
			BACK_END_WIN_PHONE_AUDIO = 'winPhone'

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

				} else if( requestedBackEnd === undefined ? true : ( requestedBackEnd === BACK_END_WIN_PHONE_AUDIO ) ) {
					context = createWinPhoneAudioContext()
				}

			} catch( e ) {
				context = null
			}

			if( !context ) {
				//use the dummy audio context as fallback
				context = createDummyAudioContext()
			}

			if( context ) return context
		}

		return {
			BACK_END_DUMMY_AUDIO : BACK_END_DUMMY_AUDIO,
			BACK_END_HTML5_AUDIO : BACK_END_HTML5_AUDIO,
			BACK_END_WEB_AUDIO : BACK_END_WEB_AUDIO,
			BACK_END_NATIVE_AUDIO : BACK_END_NATIVE_AUDIO,
			BACK_END_WIN_PHONE_AUDIO : BACK_END_WIN_PHONE_AUDIO,
			createAudioContext : createAudioContext
		}
	}
)
