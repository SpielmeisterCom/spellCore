define(
	"spell/client/util/network/createServerConnection",
	[
		"spell/shared/util/Events",
		"spell/shared/util/platform/PlatformKit",
		"spell/shared/util/createLogger"
	],
	function(
		Events,
		PlatformKit,
		createLogger
	) {
		"use strict"


		var logger = createLogger()

		return function( eventManager, statisticsManager, host, protocol ) {
			statisticsManager.addSeries( "charsSent", "chars/s" )
			statisticsManager.addSeries( "charsReceived", "chars/s" )

			var socket = PlatformKit.createSocket( host )

			var connection = {
				protocol : protocol,
				socket   : socket,
				messages : {},
				handlers : {},
				send : function( messageType, messageData ) {
					var message = connection.protocol.encode( messageType, messageData )

					statisticsManager.updateSeries( "charsSent", message.length )

					try {
						socket.send( message )

					} catch ( e ) {
						logger.debug( 'FIXME: Could not send message, because the socket is not connected yet. Will retry in 0.5 sec' )

						PlatformKit.registerTimer(
							function() {
								socket.send( message )
							},
							500
						)
					}
				}
			}

			socket.setOnMessage(
				function( messageData ) {
					var message = protocol.decode( messageData )

					statisticsManager.updateSeries( "charsReceived", messageData.length )

					eventManager.publish(
						[ Events.MESSAGE_RECEIVED, message.type ],
						[ message.type, message.data ]
					)

					if( connection.handlers[ message.type ] === undefined ) {
						if ( !connection.messages.hasOwnProperty( message.type ) ) {
							connection.messages[ message.type ] = []
						}
						connection.messages[ message.type ].push( message.data )

					} else {
						connection.handlers[ message.type ]( message.type, message.data )
					}
				}
			)

			socket.setOnConnected(
				function() {
					eventManager.publish( Events.SERVER_CONNECTION_ESTABLISHED )
				}
			)

			return connection
		}
	}
)
