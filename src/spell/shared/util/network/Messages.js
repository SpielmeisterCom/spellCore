define(
	'spell/shared/util/network/Messages',
	[
		'spell/shared/util/createEnumesqueObject'
	],
	function(
		createEnumesqueObject
	) {
		'use strict'


		return createEnumesqueObject( [
			/**
			 * The client sends this message to the server. The server responds with a SCENE_CHANGE message.
			 */
			'JOIN_ANY_GAME',

			/**
			 * The server sends this message to the client.
			 */
			'DELTA_STATE_UPDATE'
		] )
	}
)
