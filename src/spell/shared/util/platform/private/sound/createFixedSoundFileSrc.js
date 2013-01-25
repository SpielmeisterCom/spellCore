define(
	'spell/shared/util/platform/private/sound/createFixedSoundFileSrc',
	[
		'spell/shared/util/platform/private/sound/getFileExtOfSupportedFormat'
	],
	function(
		getFileExtOfSupportedFormat
	) {
		'use strict'


		/**
		 * This function removes the extension from the supplied sound resource file and adds an extension which is
		 * supported by the audio back-end. The proper solution would be to not include the file extension in the
		 * library path to the sound resource file.
		 *
		 * @param src
		 * @return {String}
		 */
		var createFixedSoundFileSrc = function( src ) {
			var srcParts = src.split( '.' )

			srcParts.pop()
			srcParts.push( getFileExtOfSupportedFormat() )

			return srcParts.join( '.' )
		}

        return createFixedSoundFileSrc
	}
)
