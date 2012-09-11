/**
 * @class spell.shared.util.platform.PlatformKit
 * @singleton
 */
define(
	'spell/shared/util/platform/PlatformKit',
	[
		'spell/shared/util/platform/private/callNextFrame',
		'spell/shared/util/platform/private/createHost',
		'spell/shared/util/platform/private/jsonCoder',
		'spell/shared/util/platform/private/createSocket',
		'spell/shared/util/platform/private/getAvailableScreenSize',
		'spell/shared/util/platform/private/graphics/RenderingFactory',
		'spell/shared/util/platform/private/registerTimer',
		'spell/shared/util/platform/private/loader/ImageLoader',
		'spell/shared/util/platform/private/loader/SoundLoader',
		'spell/shared/util/platform/private/loader/TextLoader',
		'spell/shared/util/platform/private/createLoader',
		'spell/shared/util/platform/private/Input',
		'spell/shared/util/platform/private/configurationOptions',
		'spell/shared/util/platform/private/system/features',
        'spell/shared/util/platform/private/graphics/Viewporter',
		'spell/shared/util/platform/private/sound/SoundManager'
	],
	function(
		callNextFrame,
		createHost,
		jsonCoder,
		createSocket,
		getAvailableScreenSize,
		RenderingFactory,
		registerTimer,
		ImageLoader,
		SoundLoader,
		TextLoader,
		createLoader,
		Input,
		configurationOptions,
		features,
        Viewporter,
		SoundManager
	) {
		'use strict'


		var getHost = function() {
			return createHost()
		}

		var getPlatformInfo = function() {
			return 'html5'
		}

		var createInput = function( eventManager, Events ) {
			return new Input( eventManager, Events )
		}

        var registerOnScreenResize = function( id, callback ) {
			var viewporter = new Viewporter( id )
			viewporter.renderViewport( callback )
        }

		var createSoundManager = function() {
			return new SoundManager()
		}

		return {
			/**
			 *
			 */
			callNextFrame : callNextFrame,

			/**
			 *
			 */
			registerTimer : registerTimer,

			/**
			 *
			 */
			createSocket : createSocket,

			/**
			 *
			 */
			createSoundManager : createSoundManager,

			/**
			 *
			 */
			RenderingFactory : RenderingFactory,

			/**
			 *
			 */
			getHost : getHost,

			/**
			 *
			 */
			configurationOptions : configurationOptions,

			/**
			 *
			 */
			getPlatformInfo : getPlatformInfo,

			/**
			 *
			 */
			jsonCoder : jsonCoder,

			/**
			 *
			 */
			createInput : createInput,

			/**
			 *
			 */
			features : features,

			/**
			 *
			 */
			getAvailableScreenSize : getAvailableScreenSize,

			/**
			 *
			 */
			registerOnScreenResize : registerOnScreenResize,

			createImageLoader : function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback, renderingContext ) {
				return createLoader( ImageLoader, eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback, renderingContext )
			},

			createSoundLoader : function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback, soundManager ) {
				return createLoader( SoundLoader, eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback, soundManager )
			},

			createTextLoader : function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback ) {
				return createLoader( TextLoader, eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback )
			}
		}
	}
)
