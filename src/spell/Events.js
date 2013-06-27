define(
	'spell/Events',
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

			// Component
			'COMPONENT_CREATED',
			'COMPONENT_UPDATED',

			// Entity
			'ENTITY_CREATED',
			'ENTITY_DESTROYED',

			// Asset
			'ASSET_UPDATED',

			// Action
			'ACTION_STARTED',
			'ACTION_STOPPED',

			// EventManager
			'SUBSCRIBE',
			'UNSUBSCRIBE',

			// LibraryManager
			'RESOURCE_PROGRESS',
			'RESOURCE_LOADING_COMPLETED',
			'RESOURCE_ERROR',

			// KEY
			'KEY_DOWN',
			'KEY_UP',

			// MISC
			'RENDER_UPDATE',
			'LOGIC_UPDATE',
			'CREATE_SCENE',
			'DESTROY_SCENE',
			'AVAILABLE_SCREEN_SIZE_CHANGED',
			'SCREEN_RESIZE'
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
