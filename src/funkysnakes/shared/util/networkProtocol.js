define(
	"funkysnakes/shared/util/networkProtocol",
	[
		"spell/shared/util/network/Messages",
		"spell/shared/util/platform/PlatformKit",

		"underscore"
	],
	function(
		Messages,
		PlatformKit,

		_
	) {
		"use strict"


		var jsonCoder = PlatformKit.getJsonCoder()

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
