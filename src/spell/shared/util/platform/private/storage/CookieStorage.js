define(
	'spell/shared/util/platform/private/storage/CookieStorage',
	[
		'spell/shared/util/platform/private/storage/decodeValue',
		'spell/shared/util/platform/private/storage/encodeValue'
	],
	function(
		decodeValue,
		encodeValue
	) {
		'use strict'

		var PREFIX  = "SpellJS-"

		/*
		 * public
		 */
		var CookieStorage = function() {
			var me = this

			me.path    = "/"
			me.expires = new Date(new Date().getTime()+(1000*60*60*24*7)) //7 days
			me.domain  = null
			me.secure  = false
			me.state   = me.readCookies()
		}

		CookieStorage.prototype = {
			clear : function( name ){
				this.clearCookie( name )
			},
			set : function( name, value ){
				var me = this

				me.clear( name )

				if ( typeof value == "undefined" || value === null ) return

				me.setCookie(name, value)
			},
			get : function( name ){
				return decodeValue( this.state[ PREFIX + name ] )
			},
			readCookies : function(){
				var cookies = {},
					c = document.cookie + ";",
					re = /\s?(.*?)=(.*?);/g,
					len = PREFIX.length,
					matches,
					name,
					value

				while((matches = re.exec(c)) != null){
					name = matches[1]
					value = matches[2]
					if (name && name.substring(0, len) == PREFIX){
						cookies[name.substr(len)] = decodeValue(value)
					}
				}
				return cookies
			},
			// private
			setCookie : function ( name, value ){
				var me     = this,
					prefix = PREFIX + name

				document.cookie = prefix + "=" + encodeValue(value) +
					((me.expires == null) ? "" : ("; expires=" + me.expires.toGMTString())) +
					((me.path == null) ? "" : ("; path=" + me.path)) +
					((me.domain == null) ? "" : ("; domain=" + me.domain)) +
					((me.secure == true) ? "; secure" : "")

				me.state[ prefix ] = value
			},
			// private
			clearCookie : function( name ){
				var me     = this,
					prefix = PREFIX + name

				document.cookie = prefix + "=null; expires=Thu, 01-Jan-70 00:00:01 GMT" +
					((me.path == null) ? "" : ("; path=" + me.path)) +
					((me.domain == null) ? "" : ("; domain=" + me.domain)) +
					((me.secure == true) ? "; secure" : "")

				delete me.state[ prefix ]
			}
		}

		return CookieStorage
	}
)
