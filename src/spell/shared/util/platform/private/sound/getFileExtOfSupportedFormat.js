define(
	'spell/shared/util/platform/private/sound/getFileExtOfSupportedFormat',
	function() {
		'use strict'


		var fileExtensionToMimeTypes = {
			ogg : [
				'audio/ogg; codecs=vorbis'
			],
			mp3 : [
				'audio/mpeg; codecs="mp3"',
				'audio/mpeg',
				'audio/mp3',
				'audio/MPA',
				'audio/mpa-robust'
			],
			wav : [
				'audio/wav; codecs="1"',
				'audio/wav',
				'audio/wave',
				'audio/x-wav'
			]
		}

		var fileExtOfSupportedFormat

		var getFileExtOfSupportedFormat = function() {
			if( fileExtOfSupportedFormat ) return fileExtOfSupportedFormat

			var probe = new Audio()

			for( var fileExtension in fileExtensionToMimeTypes ) {
				var mimeTypes = fileExtensionToMimeTypes[ fileExtension ]

				for( var i = 0, n = mimeTypes.length, mimeType; i < n; i++ ) {
					mimeType = mimeTypes[ i ]

					if( probe.canPlayType( mimeTypes[ i ] ) ) {
						fileExtOfSupportedFormat = fileExtension

						return fileExtension
					}
				}
			}
		}

        return getFileExtOfSupportedFormat
	}
)
