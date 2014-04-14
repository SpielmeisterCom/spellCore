/*
 * @class spell.shared.util.platform.PlatformKit
 * @singleton
 */
define(
	'spell/shared/util/platform/PlatformKit',
	[
		'spell/shared/util/createAssetId',
		'spell/shared/util/platform/private/Application',
		'spell/shared/util/platform/private/callNextFrame',
		'spell/shared/util/platform/private/createHost',
		'spell/shared/util/platform/private/jsonCoder',
		'spell/shared/util/platform/private/network/createSocket',
		'spell/shared/util/platform/private/network/performHttpRequest',
		'spell/shared/util/platform/private/getAvailableScreenSize',
		'spell/shared/util/platform/private/ModuleLoader',
		'spell/shared/util/platform/private/graphics/RenderingFactory',
		'spell/shared/util/platform/private/graphics/createSplashScreenImage',
		'spell/shared/util/platform/private/sound/AudioFactory',
		'spell/shared/util/platform/private/registerTimer',
		'spell/shared/util/platform/private/loader/ImageLoader',
		'spell/shared/util/platform/private/loader/SoundLoader',
		'spell/shared/util/platform/private/loader/TextLoader',
		'spell/shared/util/platform/private/input/support',
		'spell/shared/util/platform/private/Input',
		'spell/shared/util/platform/private/Environment',
		'spell/shared/util/platform/private/configurationOptions',
		'spell/shared/util/platform/private/storage/PersistentStorage',
		'spell/shared/util/platform/private/openURL',
		'spell/shared/util/platform/private/platformDetails',
		'spell/shared/util/platform/private/graphics/initViewport',
		'spell/shared/util/platform/private/advertisement',
		'spell/shared/util/platform/private/flurry',
		'spell/shared/util/platform/private/ouya',
        'spell/shared/util/platform/private/iap/web',
        'spell/shared/util/platform/private/iap/windows',
		'spell/shared/util/platform/private/createComponentType',
		'spell/shared/util/platform/private/environment/isHtml5Ejecta',
		'spell/shared/util/platform/private/environment/isHtml5TeaLeaf',
        'spell/shared/util/platform/private/environment/isHtml5WinStore',
		'spell/functions'
	],
	function(
		createAssetId,
		Application,
		callNextFrame,
		createHost,
		jsonCoder,
		createSocket,
		performHttpRequest,
		getAvailableScreenSize,
		ModuleLoader,
		RenderingFactory,
		createSplashScreenImage,
		AudioFactory,
		registerTimer,
		ImageLoader,
		SoundLoader,
		TextLoader,
		support,
		Input,
		Environment,
		configurationOptions,
		PersistentStorage,
		openURL,
		platformDetails,
		initViewport,
		advertisement,
		flurry,
		ouya,
        webIap,
        windowsIap,
		createComponentType,
		isHtml5Ejecta,
		isHtml5TeaLeaf,
        isHtml5WinStore,
		_
	) {
		'use strict'


		var getHost = function() {
			return createHost()
		}

		var createInput = function( configurationManager, renderingContext ) {
			return new Input( configurationManager, renderingContext )
		}

		var createEnvironment = function( configurationManager, eventManager ) {
			var environment = new Environment( configurationManager, eventManager )

			environment.init()

			return environment
		}

		return {
			/*
			 *
			 */
			callNextFrame : callNextFrame,

			/*
			 *
			 */
			registerTimer : registerTimer,

			/*
			 *
			 */
			network : {
				createSocket : createSocket,
				performHttpRequest : performHttpRequest
			},

			/*
			 *
			 */
			AudioFactory : AudioFactory,

			/*
			 *
			 */
			RenderingFactory : RenderingFactory,

			/*
			 *
			 */
			getHost : getHost,

			/*
			 *
			 */
			ModuleLoader : ModuleLoader,

			/*
			 *
			 */
			configurationOptions : configurationOptions,

			/*
			 *
			 */
			platformDetails : platformDetails,

			/*
			 *
			 */
			jsonCoder : jsonCoder,

			/*
			 *
			 */
			createInput : createInput,

			/*
			 *
			 */
			createEnvironment : createEnvironment,

			/*
			 *
			 */
			getAvailableScreenSize : getAvailableScreenSize,

			openURL : openURL,

			createPersistentStorage : function() {
				return new PersistentStorage()
			},

			createImageLoader : function( renderingContext ) {
				return new ImageLoader( renderingContext )
			},

			createSoundLoader : function( audioContext ) {
				return new SoundLoader( audioContext )
			},

			createTextLoader : function( ) {
				return new TextLoader( )
			},

			flurry : flurry,

			createComponentType : createComponentType,

			Application : Application,

			createSplashScreenImage : createSplashScreenImage,

			init : function( spell, next ) {
				initViewport(
					spell.eventManager,
					spell.configurationManager.getValue( 'id' ),
					spell.configurationManager.getValue( 'currentScreenSize' )
				)

				support.init(
					spell,
					_.bind( advertisement.init, advertisement, spell, next )
				)
			},

			getPlugins : function() {
				if( isHtml5Ejecta ) {
					return {}

				} else if ( isHtml5TeaLeaf ) {

					return {
						admob : advertisement,
						admobWithChartboost : advertisement,
						ouya: ouya
					}

				} else if( isHtml5WinStore ) {
					return {
                        iap: windowsIap
                    }

				} else {
                    return {
                        iap: webIap
                    }
                }
			}
		}
	}
)
