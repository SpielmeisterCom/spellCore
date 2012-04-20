define(
	'spell/server/util/network/nextNetworkId',
	function() {
		'use strict'


		var nextNetworkId = 0

		var getNextNetworkId = function() {
			return ++nextNetworkId
		}

		return getNextNetworkId
	}
)
