define(
	"spell/shared/util/ConfigurationManager",
	[
		"spell/shared/util/platform/PlatformKit",
		"spell/shared/util/Events",

		"underscore"
	],
	function(
		PlatformKit,
		Events,

		_
	) {
		"use strict"


		/**
		 * private
		 */

		/**
		 * Generates a structure holding server host configuration information
		 *
		 * The returned structure looks like this:
		 * {
		 * 	host - the host, i.e. "acme.org:8080"
		 * 	type - This can take the value "internal" (same host as client was delivered from) or "external" (different host that the client was delivered from).
		 * }
		 *
		 * @param validValues
		 * @param value
		 */
		var extractServer = function( validValues, value ) {
			if( _.indexOf( validValues, '*' ) === -1 ) return false

			// TODO: validate that the value is a valid host
			var host = ( value === 'internal' ? PlatformKit.getHost() : value )
			var type = ( value === 'internal' ? 'internal' : 'external' )

			return {
				host : host,
				type : type
			}
		}

		var extractScreenSize = function( validValues, value ) {
			if( _.indexOf( validValues, value ) === -1 ) return false

			var parts = value.split( 'x' )

			return {
				width  : parseInt( parts[ 0 ] ),
				height : parseInt( parts[ 1 ] )
			}
		}

		/**
		 * These are the platform agnostic options.
		 *
		 * gameserver/resourceServer - "internal" means "same as the server that the client was delivered from"; "*" matches any valid host/port combination, i.e. "acme.org:8080"
		 *
		 * The property "configurable" controls if the option can be overwriten by the environment configuration set up by the stage-0-loader.
		 */
		var validOptions = {
			screenSize : {
				validValues  : [ '640x480', '800x600', '1024x768' ],
				configurable : false,
				extractor    : extractScreenSize
			},
			gameServer : {
				validValues  : [ 'internal', '*' ],
				configurable : true,
				extractor    : extractServer
			},
			resourceServer : {
				validValues  : [ 'internal', '*' ],
				configurable : true,
				extractor    : extractServer
			}
		}

		/**
		 * These options are used when they are not overridden by the environment configuration set up by the stage-0-loader.
		 */
		var defaultOptions = {
			screenSize     : '1024x768',
			gameServer     : 'internal',
			resourceServer : 'internal'
		}

		var createConfiguration = function( defaultOptions, validOptions ) {
			if( !defaultOptions ) defaultOptions = {}
			if( !validOptions ) validOptions = {}

			// PlatformKit.configurationOptions.* holds the platform specific options
			_.defaults( defaultOptions, PlatformKit.configurationOptions.defaultOptions )
			_.defaults( validOptions, PlatformKit.configurationOptions.validOptions )


			var suppliedParameters = PlatformKit.getUrlParameters()

			// filter out parameters that are not configurable
			suppliedParameters = _.reduce(
				suppliedParameters,
				function( memo, value, key ) {
					var option = validOptions[ key ]

					if( option &&
						!!option.configurable ) {

						memo[ key ] = value
					}

					return memo
				},
				{}
			)

			_.defaults( suppliedParameters, defaultOptions )

			var config = _.reduce(
				suppliedParameters,
				function( memo, optionValue, optionName ) {
					var option = validOptions[ optionName ]

					var configValue = option.extractor(
						option.validValues,
						optionValue
					)

					if( configValue !== false ) {
						memo[ optionName ] = configValue

					} else {
						// use the default value
						memo[ optionName ] = option.extractor(
							option.validValues,
							defaultOptions[ optionName ]
						)
					}

					return memo
				},
				{}
			)

			config.platform = PlatformKit.getPlatformInfo()

			return config
		}


		/**
		 * public
		 */

		var ConfigurationManager = function( eventManager ) {
			_.extend( this, createConfiguration( defaultOptions, validOptions ) )

			eventManager.subscribe(
				[ Events.SCREEN_RESIZED ],
				_.bind(
					function( width, height ) {
						this.screenSize.width  = width
						this.screenSize.height = height
					},
					this
				)
			)
		}

		return ConfigurationManager
	}
)
