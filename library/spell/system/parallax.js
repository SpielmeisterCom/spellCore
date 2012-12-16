/**
 * @class parallax
 * @singleton
 */

define(
	'spell/system/parallax',
	[
		'spell/math/vec2',

		'spell/functions'
	],
	function(
		vec2,

		_
	) {
		'use strict'


		var entityLookupMap = {}

		var lookupEntityId = function( entityName ) {
			if( entityLookupMap[ entityName ] ) {
				return entityLookupMap[ entityName ]
			}

			var entityIds = this.spell.entityManager.getEntityIdsByName( entityName )

			if( !entityIds.length > 0 ) {
				throw 'Could not find entity with the name ' + entityName
			}

			entityLookupMap[ entityName ] = entityIds[ 0 ]

			return entityLookupMap[ entityName ]
		}


		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var parallax = function( spell ) {}

		parallax.prototype = {
			/**
			 * Gets called when the system is created.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {
				this.spell = spell
				entityLookupMap = {}
			},

			/**
			 * Gets called when the system is destroyed.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			destroy: function( spell ) {

			},

			/**
			 * Gets called when the system is activated.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			activate: function( spell ) {

			},

			/**
			 * Gets called when the system is deactivated.
			 *
			 * @param {Object} [spell] The spell object.
			 */
			deactivate: function( spell ) {

			},

			/**
			 * Gets called to trigger the processing of game state.
			 *
			 * @param {Object} [spell] The spell object.
			 * @param {Object} [timeInMs] The current time in ms.
			 * @param {Object} [deltaTimeInMs] The elapsed time in ms.
			 */
			process: function( spell, timeInMs, deltaTimeInMs ) {
				var entityManager = spell.entityManager

				for( var entityId in this.parallax ) {
					var parallax            = this.parallax[ entityId ],
						layerQuad           = this.quads[ entityId ],
						layerTransform      = this.transforms[ entityId ],
						refEntityName       = parallax.refEntityName,
						refEntityId         = lookupEntityId.call( this, refEntityName ),
						refEntityTransform  = this.transforms[ refEntityId ],
						appearanceTransform = this.appearanceTransforms[ entityId ]


					if( !layerTransform || !refEntityTransform || !layerQuad ) {
						throw 'could not get a valid parallax configuration for entity id ' + entityId
					}

					var moveSpeed             = parallax.moveSpeed,
						offsetToRefEntity     = parallax.offsetToRefEntity,
						stickToRefX           = parallax.stickToRefX,
						stickToRefY           = parallax.stickToRefY,
						textureOffset         = parallax.textureOffset,
						repeatX               = parallax.repeatX,
						repeatY               = parallax.repeatY,
						refEntityTranslation  = refEntityTransform.translation,
						layerTranslation      = layerTransform.translation,
                        layerWorldTranslation = layerTransform.worldTranslation,
						layerQuadDimensions   = layerQuad.dimensions,
						appearanceTranslation = appearanceTransform.translation


					// if configured: stick the parallax layer to the current camera position (plus specified offsetToCamera)
					if( stickToRefX === true ) {
						layerTranslation[0] = refEntityTranslation[0] + offsetToRefEntity[0]
                        layerWorldTranslation[0] = layerTranslation[0]
					}

					if( stickToRefY === true ) {
						layerTranslation[1] = refEntityTranslation[1] + offsetToRefEntity[1]
                        layerWorldTranslation[1] = layerTranslation[1]
                    }


					// set the texture coordinates to the new position, according to speed, camera position and texture offset
					vec2.multiply( refEntityTranslation, moveSpeed, appearanceTranslation )
					vec2.divide( appearanceTranslation, layerQuadDimensions, appearanceTranslation )
					vec2.add( appearanceTranslation, textureOffset, appearanceTranslation )

					// clamp x,y values if we don't want to repeat the texture
					if( repeatX === false ) {
						if( appearanceTranslation[0] < 0 ) {
							appearanceTranslation[0] = 0
						}

						if( appearanceTranslation[0] > 1 ) {
							appearanceTranslation[0] = 1
						}
					}

					if( repeatY === false ) {
						if( appearanceTranslation[1] < 0 ) {
							appearanceTranslation[1] = 0
						}

						if( appearanceTranslation[1] > 1 ) {
							appearanceTranslation[1] = 1
						}
					}

					entityManager.updateAppearanceTransform( entityId )
				}
			}
		}

		return parallax
	}
)
