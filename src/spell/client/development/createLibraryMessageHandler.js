define(
	'spell/client/development/createLibraryMessageHandler',
	[
		'spell/client/development/createMessageDispatcher',
		'spell/client/development/library/updateAsset',
		'spell/client/development/library/updateScript',

		'spell/functions'
	],
	function(
		createMessageDispatcher,
		updateAsset,
		updateScript,

		_
	) {
		'use strict'


		return function( spell ) {
			return createMessageDispatcher(
				{
					'updateAsset' : _.bind( updateAsset, null, spell ),
					'updateScript' : _.bind( updateScript, null, spell ),
				}
			)
		}
	}
)
