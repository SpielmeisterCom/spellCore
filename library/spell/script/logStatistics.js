define(
	'spell/script/logStatistics',
	[
		'spell/shared/util/platform/PlatformKit'
	],
	function(
		PlatformKit
	) {
		'use strict'


		var platformDetails = PlatformKit.platformDetails

		var rpcBuffer = []

		var sendLogRequest = function( url, data ) {
			PlatformKit.network.performHttpRequest(
				'POST',
				url,
				function() {},
				function() {},
				data
			)
		}

		var createLogData = function( spell, sceneId, clientId, payload ) {
			var renderingContext     = spell.renderingContext,
				configurationManager = spell.configurationManager

			return PlatformKit.jsonCoder.encode( {
				renderingBackEnd : renderingContext.getConfiguration().type,
				renderingInfo    : renderingContext.getConfiguration().info,
				averageFrameTime : spell.statisticsManager.getAverageTickTime(),
				uuid             : clientId,
				scene_id         : sceneId,
				projectId        : configurationManager.getValue( 'projectId' ),
				screenHeight     : platformDetails.getScreenHeight(),
				screenWidth      : platformDetails.getScreenWidth(),
				device           : platformDetails.getDevice(),
				os               : platformDetails.getOS(),
				payload          : payload,
				platform         : platformDetails.getPlatform(),
				platformAdapter  : platformDetails.getPlatformAdapter(),
				language         : configurationManager.getValue( 'currentLanguage' )
			} )
		}

		var processBuffer = function( spell, clientId, buffer ) {
			var rpc = buffer.shift()

			while( rpc ) {
				sendLogRequest(
					rpc.url,
					{
						type : rpc.messageType,
						data : createLogData( spell, rpc.sceneId, clientId, rpc.payload )
					}
				)

				rpc = buffer.shift()
			}
		}

		return function( spell, sceneId, url, messageType, payload ) {
			var clientId = spell.storage.get( 'clientId' )

			if( !clientId ) {
				rpcBuffer.push( { sceneId : sceneId, url : url, messageType: messageType, payload : payload } )

			} else {
				processBuffer( spell, clientId, rpcBuffer )

				sendLogRequest(
					url,
					{
						type : messageType,
						data : createLogData( spell, sceneId, clientId, payload )
					}
				)
			}
		}
	}
)
