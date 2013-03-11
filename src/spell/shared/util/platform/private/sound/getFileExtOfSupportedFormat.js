define(
	'spell/shared/util/platform/private/sound/getFileExtOfSupportedFormat',
	function() {
		'use strict'


		var fileExtensionToMimeTypes = [
			{
				fileExtension : 'ogg',
				mimeTypes : [
					'audio/ogg; codecs=vorbis'
				]
			},
			{
				fileExtension : 'mp3',
				mimeTypes : [
					'audio/mpeg; codecs="mp3"',
					'audio/mpeg',
					'audio/mp3',
					'audio/MPA',
					'audio/mpa-robust'
				]
			}
		]

		var fileExtOfSupportedFormat

		var getFileExtOfSupportedFormat = function() {
			if( fileExtOfSupportedFormat ) return fileExtOfSupportedFormat

			var probe = new Audio()

			for( var i = 0, n = fileExtensionToMimeTypes.length; i < n; i++ ) {
				var fileExtension = fileExtensionToMimeTypes[ i ].fileExtension,
					mimeTypes     = fileExtensionToMimeTypes[ i ].mimeTypes

				for( var j = 0, m = mimeTypes.length; j < m; j++ ) {
					if( probe.canPlayType( mimeTypes[ j ] ) ) {
						fileExtOfSupportedFormat = fileExtension

						return fileExtension
					}
				}
			}
		}

        return getFileExtOfSupportedFormat
	}
)
