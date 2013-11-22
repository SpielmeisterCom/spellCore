/*
 * @class spell.shared.util.platform.PlatformKit
 * @singleton
 */
define(
	'spell/shared/util/platform/PlatformKit',
	[
		'spell/shared/util/createAssetId',
		'spell/shared/util/platform/private/Application',
		'spell/shared/util/platform/private/Box2D',
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
		'spell/shared/util/platform/private/createComponentType'
	],
	function(
		createAssetId,
		Application,
		Box2D,
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
		createComponentType
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

        var registerOnScreenResize = function( eventManager, id, initialScreenSize ) {
			initViewport( eventManager, id, initialScreenSize )
        }

		return {
			/*
			 *
			 */
			Box2D : Box2D,

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

			/*
			 *
			 */
			registerOnScreenResize : registerOnScreenResize,

			openURL : openURL,

			createPersistentStorage : function() {
				return new PersistentStorage()
			},

			createImageLoader : function( renderingContext, assetManager, libraryId, url, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
				return new ImageLoader( renderingContext, url, onLoadCallback, onErrorCallback, onTimedOutCallback )
			},

			createSoundLoader : function( audioContext, assetManager, libraryId, url, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
				var asset = assetManager.get( createAssetId( 'sound', libraryId ) )

				return new SoundLoader( audioContext, asset, url, onLoadCallback, onErrorCallback, onTimedOutCallback )
			},

			createTextLoader : function( postProcess, assetManager, libraryId, url, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
				return new TextLoader( postProcess, url, onLoadCallback, onErrorCallback, onTimedOutCallback )
			},

			loadInterstitial : advertisement.loadInterstitial,
			showInterstitial : advertisement.showInterstitial,

			flurry : flurry,

			createComponentType : createComponentType,

			Application : Application,

			createSplashScreenImage : createSplashScreenImage,

			init : support.init
		}
	}
)
