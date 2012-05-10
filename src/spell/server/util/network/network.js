define(
	"spell/server/util/network/network",
	[
		"./initializeClientHandling",
		"./initializeClockSyncService",
		"./initializeFlashPolicyFileServer",
		"./initializePathService"
	],
	function(
		initializeClientHandling,
		initializeClockSyncService,
		initializeFlashPolicyFileServer,
		initializePathService
	) {
		"use strict"


		return {
			initializeClientHandling        : initializeClientHandling,
			initializeClockSyncService      : initializeClockSyncService,
			initializeFlashPolicyFileServer : initializeFlashPolicyFileServer,
			initializePathService           : initializePathService
		}
	}
)
