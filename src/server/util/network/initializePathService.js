define(
	"spell/server/util/network/initializePathService",
	[
		"spell/server/util/returnFilesInDirectory"
	],
	function(
		returnFilesInDirectory
	) {
		"use strict"


		return function( connection ) {
			connection.listeners.push( {
				onConnect: function( client ) {},
				onDisconnect: function( client ) {},

				onMessage: function( client, message ) {
					if ( message.type === "pathService" ) {

						var filesInDirectory = returnFilesInDirectory( message.data.path )
						client.send( "pathService", {
							path: message.data.path,
							files: filesInDirectory
						} )
					}
				}
			} )
		}
	}
)
