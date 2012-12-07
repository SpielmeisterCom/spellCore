define(
	"spell/shared/util/platform/private/sound/SoundManager",
	[
		'spell/functions'
	],
	function(
		_
		) {
		"use strict"

		var maxAvailableChannels = 8
        var context              = undefined

		var checkMaxAvailableChannels = function() {
			if( (/iPhone|iPod|iPad/i).test( navigator.userAgent ) ) {
				maxAvailableChannels = 1

			} else {
				maxAvailableChannels = 8
			}

			return maxAvailableChannels
		}

		var channels = {}

		var getFreeChannel = function( resource, isBackground ) {
			var channel = _.find(
				channels,
				function( channel ) {
					if( channel.resource === resource &&
						!channel.playing &&
						!channel.selected )  {

						if( maxAvailableChannels === 1 ) {
							if(	isBackground ) return true
						} else {
							return true
						}
					}

					return false
				}
			)

			if( !!channel ) {
				channel.selected = true
				channel.playing = false
			}

			return channel
		}

		var audioFormats = {
			ogg: {
				mimeTypes: ['audio/ogg; codecs=vorbis']
			},
			mp3: {
				mimeTypes: ['audio/mpeg; codecs="mp3"', 'audio/mpeg', 'audio/mp3', 'audio/MPA', 'audio/mpa-robust']
			},
			wav: {
				mimeTypes: ['audio/wav; codecs="1"', 'audio/wav', 'audio/wave', 'audio/x-wav']
			}
		}

		var detectExtension = function() {

			var probe = new Audio()

			return _.reduce(
				audioFormats,
				function( memo, format, key ) {
					if( !!memo ) return memo

					var supportedMime = _.find(
						format.mimeTypes,
						function( mimeType ) {
							return probe.canPlayType( mimeType )
						}
					)

					return ( !!supportedMime ) ? key : null
				},
				null
			)
		}

		var createHTML5Audio = function ( config ) {
			var html5Audio = new Audio()

			if( !!config.onloadeddata ) {
				var html5callback = function() {
					html5Audio.removeEventListener( "canplaythrough", html5callback, false )
					config.onloadeddata( html5Audio )
				}

				html5Audio.addEventListener( "canplaythrough", html5callback, false )
			}

			html5Audio.addEventListener( "error", function() {
				throw "Error: Could not load sound resource '" + html5Audio.src + "'"
			}, false )

			html5Audio.playing  = false
			html5Audio.src      = config.resource

			// old WebKit
			html5Audio.autobuffer = "auto"

			// new WebKit
			html5Audio.preload = "auto"
			html5Audio.load()

			return html5Audio
		}

        var createWebkitHTML5Audio = function ( config ) {
            var request = new XMLHttpRequest()
            request.open('GET', config.resource, true)
            request.responseType = 'arraybuffer'

            if( !!config.onloadeddata ) {

                // Decode asynchronously
                request.onload = function() {
                  context.decodeAudioData( request.response,
                      function( buffer ) {
                          config.onloadeddata( buffer )
                      }

                  )
                }
            }

            request.onError = function() {
                throw "Error: Could not load sound resource '" + config.resource + "'"
            }

            request.send()

            return request
        }

        var hasWebAudioSupport = function() {
            try {
				var hasWebkitAudio = !!window.webkitAudioContext

				if( !hasWebkitAudio ) return false

                context = new webkitAudioContext()

                return true

            } catch ( e ) {
                return false
            }
        }

        var SoundManager = function() {

            if( !hasWebAudioSupport() ) {
                this.createAudio = createHTML5Audio

            }else {
                this.createAudio = createWebkitHTML5Audio
            }

        }

        SoundManager.prototype = {
	        detectExtension           : detectExtension,
            audioFormats              : audioFormats,
            getFreeChannel            : getFreeChannel,
            checkMaxAvailableChannels : checkMaxAvailableChannels,
            maxAvailableChannels      : maxAvailableChannels
        }

        return SoundManager
	}
)
