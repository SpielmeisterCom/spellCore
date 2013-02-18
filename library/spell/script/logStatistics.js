define(
	'spell/script/logStatistics',
	[
		'spell/shared/util/platform/PlatformKit',
		'spell/math/random/UUID'
	],
	function(
		PlatformKit,
		UUID
	) {
		'use strict'


		var sendLogRequest = function( url, data ) {
			PlatformKit.network.performHttpRequest(
				'POST',
				url,
				function() {},
				function() {},
				data
			)
		}

		var platformDetails = PlatformKit.platformDetails

		var createMessage = function( spell, sceneId, type ) {
			var renderingContext     = spell.renderingContext,
				configurationManager = spell.configurationManager,
				storage              = spell.storage,
				clientId             = !storage.get( 'clientId' ) ? UUID.generate() : storage.get( 'clientId' )

			storage.set( 'clientId', clientId )

			return {
				renderingBackEnd : renderingContext.getConfiguration().type,
				renderingInfo    : renderingContext.getConfiguration().info,
				averageFrameTime : spell.statisticsManager.getAverageTickTime(),
				uuid             : clientId,
				scene_id         : sceneId,
				projectId        : configurationManager.getValue( 'projectId' ),
				screenHeight     : platformDetails.getScreenHeight(),
				screenWidth      : platformDetails.getScreenWidth(),
				screenColorDepth : platformDetails.getColorDepth(),
				os               : platformDetails.getOS(),
				platform         : platformDetails.getPlatform(),
				platformAdapter  : platformDetails.getPlatformAdapter(),
				language         : configurationManager.getValue( 'currentLanguage' ),
				logType          : type
			}
		}

		return function( spell, sceneId, url, messageType ) {
			sendLogRequest(
				url,
				createMessage( spell, sceneId, messageType )
			)
		}
	}
)
