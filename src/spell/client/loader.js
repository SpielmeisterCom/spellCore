define(
	'spell/client/loader',
	[
		'modernizr',

		'spell/shared/util/platform/underscore'
	],
	function(
		modernizr,

		_
	) {
		'use strict'


		var isBadFirefox = function() {
			var match = navigator.userAgent.match( /.*Firefox\/(\d+)/ )

			if( !match ) return


			var version = match[ '1' ]

			return ( version <= 11 )
		}

		var createConfig = function() {
			var config = {}

			var isAudioSupported = !!_.find(
				modernizr.audio,
				function( iter ) {
					return iter !== ''
				}
			)

			if( isAudioSupported &&
				modernizr.canvas &&
				modernizr.websockets ) {

				config.platform         = 'html5'
				config.renderingBackEnd = ( isBadFirefox() ?
					'canvas-2d' :
					( modernizr.webgl ? 'webgl' : 'canvas-2d' )
				)
			}

			return config
		}

		var createUrl = function( config ) {
			if( _.size( config ) === 0 ) throw "Invalid configuration"

			var url

			if( config.platform === 'flash' ) {
				url = 'flash.html'

			} else if( config.platform === 'html5' ) {
				url = 'html5.html'
			}

			if( _.size( config ) > 1 ) {
				var counter = 1

				if( !!config.renderingBackEnd ) {
					url += ( counter++ === 1 ? '?' : '&' ) + 'renderingBackEnd=' + config.renderingBackEnd
				}
			}

			return url
		}


		var defaultConfig = {
			platform: 'flash'
		}

		var config = _.defaults(
			createConfig(),
			defaultConfig
		)

        $.getJSON(
			'http://spelljs.com/geolocator.php?do=getHost',
			function( data ) {
				config.host = data.hostIp
				window.location.href = ( config.host ? config.host + "/" : "" ) + createUrl( config )
			}
		)
	}
)
