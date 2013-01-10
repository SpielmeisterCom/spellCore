/**
 * @class parallax
 * @singleton
 */

define(
	'spell/system/parallax',
	[
		'spell/math/vec2'
	],
	function(
		vec2
	) {
		'use strict'


		var entityLookupMap = {}

		var lookupEntityId = function( entityManager, entityName ) {
			var entityId = entityLookupMap[ entityName ]

			if( entityId ) {
				return entityId
			}

			entityId = entityManager.getEntityIdsByName( entityName )[ 0 ]

			if( !entityId ) {
				throw 'Could not find entity with the name ' + entityName
			}

			entityLookupMap[ entityName ] = entityId

			return entityId
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
				var entityManager        = spell.entityManager,
					parallaxComponents   = this.parallaxComponents,
					quads                = this.quads,
					transforms           = this.transforms,
					appearanceTransforms = this.appearanceTransforms

				for( var entityId in parallaxComponents ) {
					var parallax            = parallaxComponents[ entityId ],
						layerQuad           = quads[ entityId ],
						layerTransform      = transforms[ entityId ],
						refEntityTranslation  = transforms[ lookupEntityId( entityManager, parallax.refEntityName ) ].translation,
						appearanceTranslation = appearanceTransforms[ entityId ].translation

					if( !layerTransform || !refEntityTranslation || !layerQuad ) {
						throw 'could not get a valid parallax configuration for entity id ' + entityId
					}

					var offsetToRefEntity     = parallax.offsetToRefEntity,
						layerTranslation      = layerTransform.translation

					// if configured: stick the parallax layer to the current camera position (plus specified offsetToCamera)
					if( parallax.stickToRefX ) {
						layerTranslation[ 0 ] = refEntityTranslation[ 0 ] + offsetToRefEntity[ 0 ]
					}

					if( parallax.stickToRefY ) {
						layerTranslation[ 1 ] = refEntityTranslation[ 1 ] + offsetToRefEntity[ 1 ]
                    }


					// set the texture coordinates to the new position, according to speed, camera position and texture offset
					vec2.multiply( refEntityTranslation, parallax.moveSpeed, appearanceTranslation )
					vec2.divide( appearanceTranslation, layerQuad.dimensions, appearanceTranslation )
					vec2.add( appearanceTranslation, parallax.textureOffset, appearanceTranslation )

					// clamp x,y values if we don't want to repeat the texture
					if( !parallax.repeatX ) {
						if( appearanceTranslation[ 0 ] < 0 ) {
							appearanceTranslation[ 0 ] = 0
						}

						if( appearanceTranslation[ 0 ] > 1 ) {
							appearanceTranslation[ 0 ] = 1
						}
					}

					if( !parallax.repeatY ) {
						if( appearanceTranslation[ 1 ] < 0 ) {
							appearanceTranslation[ 1 ] = 0
						}

						if( appearanceTranslation[ 1 ] > 1 ) {
							appearanceTranslation[ 1 ] = 1
						}
					}

					entityManager.updateAppearanceTransform( entityId )
					entityManager.updateWorldTransform( entityId )
				}
			}
		}

		return parallax
	}
)
