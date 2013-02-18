define(
	'spell/shared/util/translate',
	[
		'spell/shared/util/createLibraryFilePathFromId'
	],
	function(
		createLibraryFilePathFromId
	) {
		'use strict'


		return function( libraryManager, currentLanguage, translationAssetId, text ) {
			if( !translationAssetId ) return

			var translation = libraryManager.get( createLibraryFilePathFromId( translationAssetId ) )
			if( !translation ) return

			var translatedText = translation.config[ text ]
			if( !translatedText ) return

			return translatedText[ currentLanguage ]
		}
	}
)
