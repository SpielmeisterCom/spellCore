define(
	'spell/shared/util/platform/PlatformKit',
	[
		'spell/shared/util/platform/private/callNextFrame',
		'spell/shared/util/platform/private/createSocket',
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
		'spell/shared/util/platform/private/sound/SoundManager',
		'spell/shared/util/math',

		'spell/shared/util/platform/underscore'
	],
	function(
		callNextFrame,
		createSocket,
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
		SoundManager,
		math,

		_
	) {
		'use strict'


		var getHost = function() {
			return document.location.host
		}

		var getPlatformInfo = function() {
			return 'html5'
		}

		var getJson = function() {
			return {
				encode : _.bind( JSON.stringify, JSON ),
				decode : _.bind( JSON.parse, JSON )
			}
		}

		var createInput = function( eventManager, Events ) {
			return new Input( eventManager, Events )
		}

        var registerOnScreenResize = function( callback ) {
            Viewporter.renderViewport( callback )
        }

		var createSoundManager = function() {
			return new SoundManager()
		}

		return {
			callNextFrame          : callNextFrame,
			registerTimer          : registerTimer,
			createSocket           : createSocket,
			createSoundManager     : createSoundManager,
			RenderingFactory       : RenderingFactory,
			getHost                : getHost,
			configurationOptions   : configurationOptions,
			getPlatformInfo        : getPlatformInfo,
			getJsonCoder           : getJson,
			createInput            : createInput,
			features               : features,
			registerOnScreenResize : registerOnScreenResize,

			createImageLoader : function( eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback ) {
				return createLoader( ImageLoader, eventManager, host, resourceBundleName, resourceUri, loadingCompletedcallback, timedOutCallback )
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
