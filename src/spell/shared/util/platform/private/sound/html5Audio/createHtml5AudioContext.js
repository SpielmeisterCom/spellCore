define(
	'spell/shared/util/platform/private/sound/html5Audio/createHtml5AudioContext',
	[
	],
	function(
	) {
		'use strict'


		/*
		 * private
		 */
		var context

		/*
		 * Returns a audio context. Once a context has been created additional calls to this method return the same context instance.
		 *
		 * @param canvas - the audio element
		 */
		var createAudioContext = function( audio ) {
			return createWrapperContext()
		}


		var initWrapperContext = function() {
		}

		/*
		 * Creates a wrapper context from the backend context.
		 */
		var createWrapperContext = function() {
			initWrapperContext()

			return {
				createAudio : createAudio
			}
		}

		/*
		 * public
		 */

		/*
		 * Returns instance of audio class
		 *
		 * @param audio
		 */
		var createAudio = function( audio ) {
			return {
				/*
				 * Public
				 */

				/*
				 * Private
				 *
				 * This is an implementation detail of the class. If you write code that depends on this you better know what you are doing.
				 */
				privateAudioResource : audio
			}
		}

		return createAudioContext
	}
)
