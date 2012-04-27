define(
	"spell/server/util/network/network",
	[
		"./initializeClientHandling",
		"./initializeClockSyncService",
		"./initializeFlashPolicyFileServer",
		"./initializeHttpServer",
		"./initializePathService"
	],
	function(
		initializeClientHandling,
		initializeClockSyncService,
		initializeFlashPolicyFileServer,
		initializeHttpServer,
		initializePathService
	) {
		"use strict"


		return {
			initializeClientHandling        : initializeClientHandling,
			initializeClockSyncService      : initializeClockSyncService,
			initializeFlashPolicyFileServer : initializeFlashPolicyFileServer,
			initializeHttpServer            : initializeHttpServer,
			initializePathService           : initializePathService
		}
	}
)
