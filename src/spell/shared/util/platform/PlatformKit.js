/*
 * @class spell.shared.util.platform.PlatformKit
 * @singleton
 */
define(
	'spell/shared/util/platform/PlatformKit',
	[
		'spell/shared/util/platform/private/Box2D',
		'spell/shared/util/platform/private/callNextFrame',
		'spell/shared/util/platform/private/createHost',
		'spell/shared/util/platform/private/jsonCoder',
		'spell/shared/util/platform/private/network/createSocket',
		'spell/shared/util/platform/private/network/performHttpRequest',
		'spell/shared/util/platform/private/getAvailableScreenSize',
		'spell/shared/util/platform/private/ModuleLoader',
		'spell/shared/util/platform/private/graphics/RenderingFactory',
		'spell/shared/util/platform/private/sound/AudioFactory',
		'spell/shared/util/platform/private/registerTimer',
		'spell/shared/util/platform/private/loader/ImageLoader',
		'spell/shared/util/platform/private/loader/SoundLoader',
		'spell/shared/util/platform/private/loader/TextLoader',
		'spell/shared/util/platform/private/Input',
		'spell/shared/util/platform/private/configurationOptions',
		'spell/shared/util/platform/private/storage/PersistentStorage',
		'spell/shared/util/platform/private/Window',
		'spell/shared/util/platform/private/platformDetails',
		'spell/shared/util/platform/private/graphics/initViewport'
	],
	function(
		Box2D,
		callNextFrame,
		createHost,
		jsonCoder,
		createSocket,
		performHttpRequest,
		getAvailableScreenSize,
		ModuleLoader,
		RenderingFactory,
		AudioFactory,
		registerTimer,
		ImageLoader,
		SoundLoader,
		TextLoader,
		Input,
		configurationOptions,
		PersistentStorage,
		Window,
		platformDetails,
		initViewport
	) {
		'use strict'


		var getHost = function() {
			return createHost()
		}

		var createInput = function( configurationManager, renderingContext ) {
			return new Input( configurationManager, renderingContext )
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
			getAvailableScreenSize : getAvailableScreenSize,

			/*
			 *
			 */
			registerOnScreenResize : registerOnScreenResize,

			createWindow: function() {
				return new Window()
			},
			createPersistentStorage : function() {
				return new PersistentStorage()
			},

			createImageLoader : function( renderingContext, resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
				return new ImageLoader( renderingContext, resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback )
			},

			createSoundLoader : function( audioContext, resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
				return new SoundLoader( audioContext, resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback )
			},

			createTextLoader : function( postProcess, resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
				return new TextLoader( postProcess, resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback )
			}
		}
	}
)
