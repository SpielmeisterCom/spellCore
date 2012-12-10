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
		'spell/shared/util/platform/private/createSocket',
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
		'spell/shared/util/platform/private/system/features',
        'spell/shared/util/platform/private/graphics/Viewporter'
	],
	function(
		Box2D,
		callNextFrame,
		createHost,
		jsonCoder,
		createSocket,
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
		features,
        Viewporter
	) {
		'use strict'


		var getHost = function() {
			return createHost()
		}

		var getPlatformInfo = function() {
			return 'html5'
		}

		var createInput = function( spell, configurationManager ) {
			return new Input( spell, configurationManager )
		}

        var registerOnScreenResize = function( eventManager, id, initialScreenSize ) {
			var viewporter = new Viewporter( eventManager, id )
			viewporter.renderViewport()
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
			createSocket : createSocket,

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
			getPlatformInfo : getPlatformInfo,

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
			features : features,

			/*
			 *
			 */
			getAvailableScreenSize : getAvailableScreenSize,

			/*
			 *
			 */
			registerOnScreenResize : registerOnScreenResize,

			createImageLoader : function( resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
				return new ImageLoader( resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback )
			},

			createSoundLoader : function( resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
				return new SoundLoader( resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback )
			},

			createTextLoader : function( resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback ) {
				return new TextLoader( resourcePath, resourceName, onLoadCallback, onErrorCallback, onTimedOutCallback )
			}
		}
	}
)
