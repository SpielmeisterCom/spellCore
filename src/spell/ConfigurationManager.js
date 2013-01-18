/**
 * @class spell.configurationManager
 * @singleton
 */
define(
	'spell/ConfigurationManager',
	[
		'spell/client/util/createIncludedRectangle',
		'spell/math/util',
		'spell/math/vec2',
		'spell/shared/util/platform/PlatformKit',
		'spell/Events',

		'spell/functions'
	],
	function(
		createIncludedRectangle,
		mathUtil,
		vec2,
		PlatformKit,
		Events,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var createScreenSize = function( availableScreenSize, aspectRatio ) {
			return aspectRatio ?
				createIncludedRectangle( availableScreenSize, aspectRatio, true ) :
				availableScreenSize
		}

		/*
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

		var extractDefault = function( validValues, value ) {
			return _.contains( validValues, value ) ? value : false
		}

		var extractVec2 =  function( validValues, value ) {
			if( _.isArray( value ) &&
				value.length === 2 ) {

				value[ 0 ] =  parseFloat( value[ 0 ] )
				value[ 1 ] =  parseFloat( value[ 1 ] )

				return value
			}

			return false
		}

		/**
		 * These are the platform agnostic options.
		 *
		 * gameserver/resourceServer - "internal" means "same as the server that the client was delivered from"; "*" matches any valid host/port combination, i.e. "acme.org:8080"
		 *
		 * The property "configurable" controls if the option can be overridden by the environment configuration set up by the stage-0-loader.
		 */
		var validOptions = {
			/**
			 * The screen mode which the user requested. Can be either "fit" or "fixed". If set to "fit" the maximum available screen area is used and the
			 * option "screenSize" is ignored. If set to "fixed" the option "screenSize" is used to determine the used screen size. The default is "fit".
			 */
			screenMode : {
				validValues : [ 'fit', 'fixed' ],
				configurable : true,
				extractor : extractDefault
			},
			// The screen size which the user requested.
			screenSize : {
				configurable : true,
				extractor : extractVec2
			},
			// The screen size which is currently used.
			currentScreenSize : {
				configurable : false
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
			},
			id : {
				configurable : true
			},
			mode : {
				validValues : [ 'deployed', 'development_embedded', 'development_standalone' ],
				configurable : true
			},
			quadTreeSize : {
				configurable : true
			}
		}

		/*
		 * These options are used when they are not overridden by the environment configuration set up by the stage-0-loader.
		 */
		var defaultOptions = {
			screenMode        : 'fixed',
			screenSize        : [ 300, 200 ],
			currentScreenSize : [ 300, 200 ],
			quadTreeSize      : 1048576, // 2^20
			gameServer        : 'internal',
			resourceServer    : 'internal',
			id                : 'spell' // dom node id
		}

		var createConfiguration = function( parameters, defaultOptions, validOptions ) {
			if( !defaultOptions ) defaultOptions = {}
			if( !validOptions ) validOptions = {}

			// PlatformKit.configurationOptions.* holds the platform specific options
			_.defaults( defaultOptions, PlatformKit.configurationOptions.defaultOptions )
			_.defaults( validOptions, PlatformKit.configurationOptions.validOptions )

			var suppliedParameters = parameters

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
					var option = validOptions[ optionName ],
						configValue = false

					if( !option ) throw 'Error: Configuration option \'' + optionName + '\' is not supported.'

					if( option.extractor ) {
						configValue = option.extractor( option.validValues, optionValue )

					} else {
						configValue = optionValue
					}


					if( configValue !== undefined ) {
						memo[ optionName ] = configValue

					} else {
						// use the default value
						memo[ optionName ] = option.extractor( option.validValues, defaultOptions[ optionName ] )
					}

					return memo
				},
				{}
			)

			config.platform = PlatformKit.getPlatformInfo()

			// initialize currentScreenSize with screenSize
			vec2.set( config.screenSize, config.currentScreenSize )

			return config
		}

		/*
		 * public
		 */

		var ConfigurationManager = function( eventManager, loaderConfig, projectConfig ) {
			this.config = {}
			this.eventManager = eventManager

			_.extend(
				this.config,
				createConfiguration(
					_.extend(
						loaderConfig || {},
						projectConfig || {}
					),
					defaultOptions,
					validOptions
				)
			)

			eventManager.subscribe(
				[ Events.AVAILABLE_SCREEN_SIZE_CHANGED ],
				_.bind(
					function( availableScreenSize ) {
						var screenMode           = this.config.screenMode || 'fixed',
							aspectRatioOverwrite = this.config.debug && this.config.screenAspectRatio

						if( aspectRatioOverwrite ) {
							this.config.currentScreenSize = createScreenSize( availableScreenSize, this.config.screenAspectRatio )

						} else if( screenMode === 'fit' ) {
							this.config.currentScreenSize = createScreenSize( availableScreenSize, availableScreenSize[ 0 ] / availableScreenSize[ 1 ] )

						} else if( screenMode === 'fixed' ) {
							this.config.currentScreenSize = this.config.screenSize

						} else {
							throw 'Error: Screen mode \'' + screenMode + '\' is not supported.'
						}

						eventManager.publish( Events.SCREEN_RESIZE, [ this.config.currentScreenSize ] )
					},
					this
				)
			)
		}

		ConfigurationManager.prototype = {
			setValue : function( name, value ) {
				if( name === 'screenAspectRatio' ) {
					this.config.currentScreenSize = createScreenSize(
						PlatformKit.getAvailableScreenSize(
							this.getValue( 'id' )
						),
						value
					)

					this.eventManager.publish( Events.SCREEN_RESIZE, [ this.config.currentScreenSize ] )
				}

				this.config[ name ] = value
			},
			getValue : function( name ) {
				return this.config[ name ]
			}
		}

		return ConfigurationManager
	}
)
