define(
	'spell/shared/util/platform/private/network/createSocket',
	function() {
		'use strict'


		return function( host ) {
			var WebSocket = window.MozWebSocket || window.WebSocket,
				socket    = new WebSocket( 'ws://' + host + '/', 'socketrocket-0.1')

			return {
				send : function( message ) {
					socket.send( message )
				},
				setOnMessage : function( callback ) {
					socket.onmessage = function( event ) {
						callback( event.data )
					}
				},
				setOnConnected : function( callback ) {
					socket.onopen = function( event ) {
						callback( event.data )
					}
				}
			}
		}
	}
)
