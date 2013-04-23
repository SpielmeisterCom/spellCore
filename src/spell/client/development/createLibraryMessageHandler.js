define(
	'spell/client/development/createLibraryMessageHandler',
	[
		'spell/client/development/createMessageDispatcher',
		'spell/client/development/library/updateAsset',
		'spell/client/development/library/updateEntityTemplate',
		'spell/client/development/library/updateScript',

		'spell/functions'
	],
	function(
		createMessageDispatcher,
		updateAsset,
		updateEntityTemplate,
		updateScript,

		_
	) {
		'use strict'


		return function( spell ) {
			return createMessageDispatcher( {
				updateAsset : _.bind( updateAsset, null, spell ),
				updateEntityTemplate : _.bind( updateEntityTemplate, null, spell ),
				updateScript : _.bind( updateScript, null, spell )
			} )
		}
	}
)
