/**
 * The ConfigurationManager offers access to various engine internal configuration options.
 *
 * Example:
 *     var screenSize = spell.configurationManager.getValue( 'currentScreenSize' )
 *
 *     spell.logger.debug( screenSize )
 *
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

		'spell/functions'
	],
	function(
		createIncludedRectangle,
		mathUtil,
		vec2,
		PlatformKit,

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

		// These are the platform agnostic options.
		//
		// The property "configurable" controls if the option can be overridden by the environment configuration set up by the stage-0-loader.
		var validOptions = _.extend(
			{
				// The screen mode which the user requested. Can be either "fit" or "fixed". If set to "fit" the maximum available screen area is used and the
				// option "screenSize" is ignored. If set to "fixed" the option "screenSize" is used to determine the used screen size. The default is "fit".
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
				},
				quality : {
					configurable : true
				},
				qualityLevels : {
					configurable : true
				},
				currentQualityLevel : {
					configurable : true
				}
			},
			PlatformKit.configurationOptions.validOptions
		)

		// These options are used when they are not overridden by the environment configuration set up by the stage-0-loader.
		var defaultOptions = _.extend(
			{
				screenMode              : 'fixed',
				screenSize              : [ 300, 200 ],
				currentScreenSize       : [ 300, 200 ],
				quadTreeSize            : 1048576, // 2^20
				projectId               : '',
				id                      : 'spell', // dom node id
				'platform.id'           : PlatformKit.platformDetails.getPlatform(),
				'platform.hasPlentyRAM' : PlatformKit.platformDetails.hasPlentyRAM()
			},
			PlatformKit.configurationOptions.defaultOptions
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
					( option.extractor ?
						option.extractor( option.validValues, defaultOptions[ name ] ) :
						result ) :
					result

			} else {
				config[ name ] = value
			}
		}


		var ConfigurationManager = function( eventManager ) {
			this.config       = defaultOptions
			this.eventManager = eventManager

			eventManager.subscribe(
				[ eventManager.EVENT.AVAILABLE_SCREEN_SIZE_CHANGED ],
				_.bind(
					function( availableScreenSize ) {
						var config               = this.config,
							screenMode           = config.screenMode || 'fixed',
							aspectRatioOverwrite = config.screenAspectRatio > 0 ,
							screenSize           = config.screenSize

						if( aspectRatioOverwrite ) {
							config.currentScreenSize = createScreenSize( availableScreenSize, config.screenAspectRatio )

						} else if( screenMode === 'fit' ) {
							// set the screen size up to the limits provided by the "screenSize" configuration option
							var clampedAvailableScreenSize = [
								mathUtil.clamp( availableScreenSize[ 0 ], 0, screenSize[ 0 ] ),
								mathUtil.clamp( availableScreenSize[ 1 ], 0, screenSize[ 1 ] )
							]

							config.currentScreenSize = createScreenSize(
								clampedAvailableScreenSize,
								screenSize[ 0 ] / screenSize[ 1 ]
							)

						} else if( screenMode === 'fixed' ) {
							config.currentScreenSize = screenSize

						} else if( screenMode === 'fill' ) {
							config.currentScreenSize = [ availableScreenSize[ 0 ], availableScreenSize[ 1 ] ]

						} else {
							throw 'Error: Screen mode \'' + screenMode + '\' is not supported.'
						}

						eventManager.publish(
							eventManager.EVENT.SCREEN_RESIZE,
							[ config.currentScreenSize ]
						)
					},
					this
				)
			)
		}

		ConfigurationManager.prototype = {
			/**
			 * Sets the configuration option key to value.
			 *
			 * @private
			 * @param {String} key
			 * @param {String} value
			 */
			setValue : function( key, value ) {
				var config = this.config

				if( key === 'defaultLanguage' ) {
					config.currentLanguage = value

				} else if( key === 'currentLanguage' ) {
					if( _.contains( config.supportedLanguages, value ) ) {
						config.currentLanguage = value
					}

					return

				} else if( key === 'quality' &&
					config.qualityLevels ) {

					var qualityLevel = config.qualityLevels[ value ]

					if( qualityLevel ) {
						config.currentQualityLevel = qualityLevel
					}

					return
				}

				update( config, defaultOptions, validOptions, key, value )

				if( key === 'screenAspectRatio' ||
					key === 'screenMode' ) {

					this.eventManager.publish(
						this.eventManager.EVENT.AVAILABLE_SCREEN_SIZE_CHANGED,
						[ PlatformKit.getAvailableScreenSize( this.getValue( 'id' ) ) ]
					)

				} else if( key === 'screenSize' ) {
					vec2.copy( config.currentScreenSize, value )
				}
			},

			/**
			 * Returns the configuration option specified by key.
			 *
			 * @param {String} key
			 * @return {String}
			 */
			getValue : function( key ) {
				return this.config[ key ]
			},

			/**
			 * Sets mutliple configuration options at once.
			 *
			 * @private
			 * @param {Object} x the configuration
			 */
			setConfig : function( x ) {
				for( var key in x ) {
					if( key === 'supportedLanguages' ||
						key === 'defaultLanguage' ||
						key === 'currentLanguage' ||
						key === 'quality' ||
						key === 'qualityLevels' ||
						key === 'currentQualityLevel' ) {

						continue
					}

					this.setValue( key, x[ key ] )
				}

				// HACK: these configuration options have dependencies amongst each other and must therefore be processed in the right order
				if( x.supportedLanguages ) this.setValue( 'supportedLanguages', x.supportedLanguages )
				if( x.defaultLanguage ) this.setValue( 'defaultLanguage', x.defaultLanguage )
				if( x.currentLanguage ) this.setValue( 'currentLanguage', x.currentLanguage )

				if( x.qualityLevels ) this.setValue( 'qualityLevels', x.qualityLevels )
				if( x.quality ) this.setValue( 'quality', x.quality )

				if( !this.config.currentQualityLevel ) {
					this.setValue( 'currentQualityLevel', 1 )
				}
			}
		}

		return ConfigurationManager
	}
)
