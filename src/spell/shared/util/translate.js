define(
	'spell/shared/util/translate',
	function() {
		'use strict'


		return function( libraryManager, currentLanguage, translationAssetId, text ) {
			if( !translationAssetId ) return

			var translation = libraryManager.get( translationAssetId )
			if( !translation ) return

			var translatedText = translation.config[ text ]
			if( !translatedText ) return

			return translatedText[ currentLanguage ]
		}
	}
)
