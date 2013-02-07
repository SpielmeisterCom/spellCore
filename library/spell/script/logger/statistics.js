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

		var getBrowser = function() {
			var N= navigator.appName, ua= navigator.userAgent, tem;
			var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
			if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
			M= M? [M[1], M[2]]: [N, navigator.appVersion, '-?'];

			return M;
		}

		var initData = function( spell, sceneConfig ) {
			var storage   = spell.storage,
				projectId = spell.configurationManager.getValue( 'projectId' ),
				sceneId   = createId( sceneConfig.namespace, sceneConfig.name ),
				clientId  = !storage.get( 'clientId' ) ? UUID.generate() : storage.get( 'clientId' )

			storage.set( 'clientId', clientId )

			return {
				screenHeight    : screen.height,
				screenWidth     : screen.width,
				screenColorDepth: screen.colorDepth,
				renderingBackEnd: '',
				uuid      : clientId,
				scene_id  : sceneId,
				projectId : projectId,
				platform  : navigator.platform,
				browser   : getBrowser()[0],
				browserVersion : getBrowser()[1],
				userAgent : navigator.userAgent,
				language  : navigator.language || navigator.browserLanguage
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