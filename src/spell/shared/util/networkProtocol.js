define(
	'spell/shared/util/networkProtocol',
	[
		'spell/shared/util/platform/PlatformKit'
	],
	function(
		PlatformKit
	) {
		'use strict'


		var jsonCoder = PlatformKit.jsonCoder

		return {
			encode: function( messageType, messageData ) {
				var message = {
					type : messageType,
					data : messageData
				}

				return jsonCoder.encode( message )
			},

			decode: function( encodedMessage ) {
				return jsonCoder.decode( encodedMessage )
			}
		}
	}
)
