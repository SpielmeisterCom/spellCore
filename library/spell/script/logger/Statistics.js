define(
	'spell/script/logger/statistics',
	[
		'spell/script/logger/sendLogRequest',
		'spell/math/random/UUID',
		'spell/shared/util/createId',

		'spell/functions'
	],
	function(
		sendLogRequest,
		UUID,
		createId,

		_
		) {
		'use strict'


		var initData = function( spell, sceneConfig ) {
			var storage   = spell.storage,
				projectId = spell.configurationManager.getValue( 'projectId' ),
				sceneId   = createId( sceneConfig.namespace, sceneConfig.name ),
				clientId  = !storage.get( 'clientId' ) ? UUID.generate() : storage.get( 'clientId' )

			storage.set( 'clientId', clientId )

			return {
				UUID      : clientId,
				scene_id  : sceneId,
				project_id: projectId,
				platform  : navigator.platform,
				user_agent: navigator.userAgent
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