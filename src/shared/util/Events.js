define(
	'spell/shared/util/Events',
	[
		'spell/shared/util/createEnumesqueObject'
	],
	function(
		createEnumesqueObject
	) {
		'use strict'


		return createEnumesqueObject( [
			// CONNECTION
			'SERVER_CONNECTION_ESTABLISHED',
			'MESSAGE_RECEIVED',

			// clock synchronization
			'CLOCK_SYNC_ESTABLISHED',

			// EventManager
			'SUBSCRIBE',
			'UNSUBSCRIBE',

			// ResourceLoader
			'RESOURCE_PROGRESS',
			'RESOURCE_LOADING_COMPLETED',
			'RESOURCE_ERROR',

			// MISC
			'RENDER_UPDATE',
			'LOGIC_UPDATE',
			'CREATE_ZONE',
			'DESTROY_ZONE',
			'SCREEN_RESIZED'
		] )
	}
)
