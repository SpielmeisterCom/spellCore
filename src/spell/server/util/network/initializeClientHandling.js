define(
	'spell/server/util/network/initializeClientHandling',
	[
		'spell/shared/util/Logger',

		'websocket',
		'spell/shared/util/platform/underscore'
	],
	function(
		Logger,

		websocket,
		_
	) {
		'use strict'


		/**
		 * private
		 */

		var clientNumber = 0
		var protocolName = 'socketrocket-0.1'

		/**
		 * Returns true if at least one of the requested protocols is supported, false otherwise.
		 *
		 * @param requestedProtocols
		 */
		var supportsRequestedProtocol = function( requestedProtocols ) {
			return ( _.include( requestedProtocols, protocolName ) )
		}

		var createClient = function( clientId, protocol, websocketConnection  ) {
			var clientPlayerName = 'unnamedPlayer' + ++clientNumber

			return {
				protocol    : protocol,
				socket      : websocketConnection.socket,
				id          : clientId,
				playerName  : clientPlayerName,
				messages    : {},

				// When the client has received a state update the client is not pristine anymore.
				isPristine  : true,

				initialized : false,
				zone        : null,

				send: function( type, data ) {
					websocketConnection.sendUTF( this.protocol.encode( type, data ) )
				}
			}
		}


		/**
		 * public
		 */

		return function( httpServer, protocol ) {
			var clients = {}

			var connection = {
				clients  : clients,
				listeners: []
			}

			var WebSocketServer = websocket.server

			var wsServer = new WebSocketServer({
			    httpServer: httpServer,
			    autoAcceptConnections: false
			})

			wsServer.on( 'request' , function( request ) {
				if( !supportsRequestedProtocol( request.requestedProtocols ) ) {
				    request.reject()

					return
				}

			    var wsConnection = request.accept( protocolName, request.origin )
				var clientId = wsConnection.socket._peername.address + ':' + wsConnection.socket._peername.port,
					client = createClient( clientId, protocol, wsConnection )

				Logger.info( 'client ' + clientId + ' connected' )


				clients[ clientId ] = client
				client.send( 'setName', client.playerName )

				_.invoke(
					connection.listeners,
					'onConnect',
					clients[ clientId ]
				)

				wsConnection.on('message', function( messageObject ) {
			        if (messageObject.type === 'utf8') {

						var messageAsString = messageObject.utf8Data

						var message = protocol.decode( messageAsString )

						var messages = clients[ clientId ].messages

						if ( !messages.hasOwnProperty( message.type ) ) {
							messages[ message.type ] = []
						}

						messages[ message.type ].push( message.data )

						_.invoke(
							connection.listeners,
							'onMessage',
							clients[ clientId ],
							message
						)

			        } else if (messageObject.type === 'binary') {
			            Logger.warn( 'Received Binary Message of ' + message.binaryData.length + ' bytes (which is not implemented)' );
			        }
			    });

				wsConnection.on('close', function(reasonCode, description) {
					_.invoke(
						connection.listeners,
						'onDisconnect',
						clients[ clientId ]
					)
			    });
			});

			return connection
		}
	}
)
