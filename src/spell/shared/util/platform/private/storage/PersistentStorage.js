define(
	'spell/shared/util/platform/private/storage/PersistentStorage',
	[
		'spell/shared/util/platform/private/storage/CookieStorage',
		'spell/shared/util/platform/private/storage/LocalStorage'
	],
	function(
		CookieStorage,
		LocalStorage
	) {
		'use strict'


		var hasLocalStorage = function() {
			return 'localStorage' in window && window[ 'localStorage' ] !== null
		}

		var PersistentStorage = function() {
			this.storage = hasLocalStorage() ? new LocalStorage() : new CookieStorage()
		}

		PersistentStorage.prototype = {
			set: function( key, value ) {
				this.storage.set( key, value )
			},
			get: function( key ) {
				return this.storage.get( key )
			},
			clear: function( key ) {
				this.storage.clear( key )
			}
		}

		return PersistentStorage
	}
)
