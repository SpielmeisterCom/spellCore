define(
	"spell/server/util/network/initializeFlashPolicyFileServer",
	[
		'policyfile'
	],
	function(
		policyfile
	) {
		"use strict"


		return function( port ) {
			var options = {}

			if( port !== undefined ) {
				options.port = port
			}

			var server = policyfile.createServer( options )
			server.listen()
		}
	}
)
