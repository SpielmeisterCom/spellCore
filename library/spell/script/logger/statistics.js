define(
	'spell/script/logger/statistics',
	[
		'spell/shared/util/platform/PlatformKit',
		'spell/script/logger/sendLogRequest',
		'spell/math/random/UUID',
		'spell/shared/util/createId'
	],
	function(
		PlatformKit,
		sendLogRequest,
		UUID,
		createId
	) {
		'use strict'


		var platformDetails = PlatformKit.platformDetails

		var initData = function( spell, sceneConfig ) {
			var renderingContext     = spell.renderingContext,
				storage              = spell.storage,
				configurationManager = spell.configurationManager,
				sceneId              = createId( sceneConfig.namespace, sceneConfig.name ),
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
				language         : configurationManager.getValue( 'currentLanguage' )
			}
		}

		return {
			logInitScene: function( spell, host, sceneConfig ) {
				var data = initData( spell, sceneConfig )

				sendLogRequest( host + '/scene/init', data )
			},
			logDestroyScene: function( spell, host, sceneConfig ) {
				var data = initData( spell, sceneConfig )

				sendLogRequest( host + '/scene/destroy', data )
			}
		}
	}
)
