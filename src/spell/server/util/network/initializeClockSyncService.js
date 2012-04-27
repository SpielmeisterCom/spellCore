define(
	"spell/server/util/network/initializeClockSyncService",
	[
		"spell/shared/util/platform/Types"
	],
	function(
		Types
	) {
		"use strict"


		return function( connection ) {
			connection.listeners.push( {
				onConnect: function( client ) {},
				onDisconnect: function( client ) {},

				onMessage: function( client, message ) {
					if( message.type === "clockSync" ) {
						client.send(
							"clockSync",
							{
								clientTime: message.data.clientTime,
								serverTime: Types.Time.getCurrentInMs()
							}
						)
					}
				}
			} )
		}
	}
)
