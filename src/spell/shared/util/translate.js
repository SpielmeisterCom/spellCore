define(
	'spell/shared/util/translate',
	function() {
		'use strict'


		return function( assetManager, currentLanguage, translationAssetId, text ) {
			if( !translationAssetId ) return

            if(translationAssetId.split(':').length <= 1) {
                translationAssetId = 'translation:' + translationAssetId
            }

			var translation = assetManager.get( translationAssetId )
			if( !translation ) return

			var translatedText = translation.config[ text ]
			if( !translatedText ) return

			return translatedText[ currentLanguage ]
		}
	}
)
