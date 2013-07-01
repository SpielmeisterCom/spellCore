define(
	'spell/shared/util/platform/private/storage/LocalStorage',
	[
		'spell/shared/util/platform/private/storage/decodeValue',
		'spell/shared/util/platform/private/storage/encodeValue'
	],
	function(
		decodeValue,
		encodeValue
	) {
		'use strict'


		var PREFIX = 'SpellJS-'

		var LocalStorage = function() {
			this.store = window.localStorage
		}

		LocalStorage.prototype = {
			clear : function( name ) {
				this.store.removeItem( PREFIX + name )
			},
			set : function( name, value ) {
				if( value === undefined ||
					value === null ) {

					return
				}

				this.store.setItem( PREFIX + name, encodeValue( value ) )
			},
			get : function( name ) {
				return decodeValue( this.store.getItem( PREFIX + name ) )
			}
		}

		return LocalStorage
	}
)
