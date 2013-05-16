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


		var createScreenSize = function( availableScreenSize, aspectRatio ) {
			return aspectRatio ?
				createIncludedRectangle( availableScreenSize, aspectRatio, true ) :
				availableScreenSize
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
		 * The property "configurable" controls if the option can be overridden by the environment configuration set up by the stage-0-loader.
		 */
		var validOptions = _.extend(
			PlatformKit.configurationOptions.validOptions,
			{
				/**
				 * The screen mode which the user requested. Can be either "fit" or "fixed". If set to "fit" the maximum available screen area is used and the
				 * option "screenSize" is ignored. If set to "fixed" the option "screenSize" is used to determine the used screen size. The default is "fit".
				 */
				screenMode : {
					validValues : [ 'fill', 'fit', 'fixed' ],
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
				id : {
					configurable : true
				},
				mode : {
					validValues : [ 'deployed', 'development_embedded', 'development_standalone' ],
					configurable : true
				},
				quadTreeSize : {
					configurable : true
				},
				projectId : {
					configurable : true
				},
				supportedLanguages : {
					configurable : true
				},
				defaultLanguage : {
					configurable : true
				},
				currentLanguage : {
					configurable : true
				},
				loadingScene : {
					configurable : true
				}
			}
		)

		/*
		 * These options are used when they are not overridden by the environment configuration set up by the stage-0-loader.
		 */
		var defaultOptions = _.extend(
			PlatformKit.configurationOptions.defaultOptions,
			{
				screenMode              : 'fixed',
				screenSize              : [ 300, 200 ],
				currentScreenSize       : [ 300, 200 ],
				quadTreeSize            : 1048576, // 2^20
				projectId               : '',
				id                      : 'spell', // dom node id
				'platform.id'           : PlatformKit.platformDetails.getPlatform(),
				'platform.hasPlentyRAM' : PlatformKit.platformDetails.hasPlentyRAM()
			}
		)

		var update = function( config, defaultOptions, validOptions, name, value ) {
			var option = validOptions[ name ]

			if( option ) {
				if( !option.configurable ) {
					return config
				}

				var result = option.extractor ?
					option.extractor( option.validValues, value ) :
					value

				config[ name ] = result === undefined ?
					option.extractor( option.validValues, defaultOptions[ name ] ) :
					result

			} else {
				config[ name ] = value
			}
		}


		var ConfigurationManager = function( eventManager ) {
			this.config       = defaultOptions
			this.eventManager = eventManager

			eventManager.subscribe(
				[ Events.AVAILABLE_SCREEN_SIZE_CHANGED ],
				_.bind(
					function( availableScreenSize ) {
						var screenMode           = this.config.screenMode || 'fixed',
							aspectRatioOverwrite = this.config.screenAspectRatio > 0 ,
							screenSize           = this.config.screenSize

						if( aspectRatioOverwrite ) {
							this.config.currentScreenSize = createScreenSize( availableScreenSize, this.config.screenAspectRatio )

						} else if( screenMode === 'fit' ) {
							// set the screen size up to the limits provided by the "screenSize" configuration option
							var clampedAvailableScreenSize = [
								mathUtil.clamp( availableScreenSize[ 0 ], 0, screenSize[ 0 ] ),
								mathUtil.clamp( availableScreenSize[ 1 ], 0, screenSize[ 1 ] )
							]

							this.config.currentScreenSize = createScreenSize(
								clampedAvailableScreenSize,
								screenSize[ 0 ] / screenSize[ 1 ]
							)

						} else if( screenMode === 'fixed' ) {
							this.config.currentScreenSize = screenSize

						} else if( screenMode === 'fill' ) {
							this.config.currentScreenSize = [ availableScreenSize[ 0 ], availableScreenSize[ 1 ] ]

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
			setValue : function( key, value ) {
				update( this.config, defaultOptions, validOptions, key, value )

				if( key === 'currentLanguage' &&
					!_.contains( this.config.supportedLanguages, value ) ) {

					this.config.currentLanguage = value

				} else if( key === 'screenAspectRatio' ||
						key === 'screenMode' ) {

					this.eventManager.publish(
						Events.AVAILABLE_SCREEN_SIZE_CHANGED,
						[ PlatformKit.getAvailableScreenSize( this.getValue( 'id' ) ) ]
					)

				} else if( key === 'screenSize' ) {
					vec2.copy( this.config.currentScreenSize, value )
				}
			},
			getValue : function( key ) {
				return this.config[ key ]
			},
			setConfig : function( x ) {
				var value

				for( var key in x ) {
					value = x[ key ]

					this.setValue( key, value )
				}
			}
		}

		return ConfigurationManager
	}
)
