define(
	'spell/shared/util/platform/private/storage/StorageManager',
	[
		'spell/shared/util/platform/private/storage/CookieStorage',
		'spell/shared/util/platform/private/storage/LocalStorage',

		'spell/functions'
	],
	function(
		CookieStorage,
		LocalStorage,

		_
	) {
		'use strict'

		var storage = undefined

		/*
		 * private
		 */

		var hasLocalStorage = function() {
			return 'localStorage' in window && window['localStorage'] !== null
		}

		/*
		 * public
		 */

		var StorageManager = function() {
			storage = ( hasLocalStorage() ) ? new LocalStorage() : new CookieStorage()
		}

		StorageManager.prototype = {
			set: function( key, value ) {
				storage.set( key, value )
			},
			get: function( key ) {
				return storage.get( key )
			},
			clear: function( key ) {
				storage.clear( key )
			}
		}

		return StorageManager
	}
)
