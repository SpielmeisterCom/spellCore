define(
	'spell/shared/util/Events',
	[
		'spell/shared/util/createEnumesqueObject'
	],
	function(
		createEnumesqueObject
	) {
		'use strict'


		var Events = createEnumesqueObject( [
			// CONNECTION
			'SERVER_CONNECTION_ESTABLISHED',
			'MESSAGE_RECEIVED',

			// clock synchronization
			'CLOCK_SYNC_ESTABLISHED',

			// Entity
			'ENTITY_CREATED',
			'ENTITY_DESTROYED',

			// Action
			'ACTION_STARTED',
			'ACTION_STOPPED',

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
			'CREATE_SCENE',
			'DESTROY_SCENE',
			'AVAILABLE_SCREEN_SIZE_CHANGED',
			'SCREEN_RESIZE',

			// DEVELOPMENT
			'DRAW_COORDINATE_GRID',
			'DRAW_TITLE_SAFE_OUTLINE',
			'SCREEN_ASPECT_RATIO'
		] )

		Events.getNameById = function( id ) {
			for( var key in Events ) {
				var value = Events[ key ]

				if( id === value ) return key
			}
		}

		return Events
	}
)
