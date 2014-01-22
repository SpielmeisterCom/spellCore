/**
 * @class spell.system.createTilePhysics
 * @singleton
 */

define(
	'spell/system/createTilePhysics',
	[
		'spell/shared/util/deepClone'
	],
	function(
	    deepClone
	) {
		'use strict'


		var createBlockTileEntity = function( entityManager, translation, dimensions ) {
			return entityManager.createEntity( {
				entityTemplateId : 'spell.entity.physics.collision_block',
				config : {
					"spell.component.2d.transform": {
						translation: translation
					},
					"spell.component.physics.shape.box": {
						dimensions: dimensions
					}
				}
			} )
		}

		var removePhysicsEntities = function( entityManager, entityIds ) {
			for( var i = 0, numEntityIds = entityIds.length; i < numEntityIds; i++ ) {
				var entityId = entityIds[ i ]

				entityManager.removeEntity( entityId )
			}
		}

		var checkForRect = function(
			tilemapData,
		    startX,
		    startY,
		    maxX,
		    maxY,
		    width,
		    height,
		    clear
		) {

			if(startX + width > maxX || startY + height > maxY) {
				return false
			}

			for(var x = startX; x <= startX + width; x++) {
				for (var y = startY; y <= startY + height; y++) {

					if( clear === true && tilemapData[ y ] ) {
						tilemapData[ y ][ x ] = null
					}
					else if( !tilemapData[ y ] || tilemapData[ y ][ x ] === null ) {
						return false
					}
				}
			}

			return true
		}

		var checkForTriangle = function(
			leftSlopeIndex,
			rightSlopeIndex,
			currentSlopeIndex,
			direction,
			tilemapData,
			startX,
			startY,
			numConnectedTiles,
			clear
		) {

			if( numConnectedTiles == 0) {
				return true
			}

			for(var x = startX; x != startX + ( 1 * direction) + numConnectedTiles * direction; x = x + 1 * direction ) {

				var yOffset = startY + ( x - startX ) * direction

				if( !tilemapData[ yOffset ] || tilemapData[ yOffset ][ x ] != currentSlopeIndex ) {
					//check that the upmost tile is the right slope
					return false
				}

				if ( clear === true ) {
					tilemapData[ yOffset ][ x ] = null
				}

				//check that any other tiles beneath are normal tiles
				for(var y = yOffset + 1; y <= startY + numConnectedTiles; y++) {

					if( !tilemapData[ y ] ) {
						continue
					}

					if (tilemapData[ y ][ x ] === null ||
						tilemapData[ y ][ x ] == leftSlopeIndex ||
						tilemapData[ y ][ x ] == rightSlopeIndex) {

						return false

					} else if (clear === true) {

						tilemapData[ y ][ x ] = null
					}
				}
			}

			return true
		}

		var createPhysicsEntities = function( entityManager, tilemapComponent, leftSlopeIndex, rightSlopeIndex ) {
			var tilemapData       = deepClone(tilemapComponent.asset.tilemapData),
				tilemapDimensions = tilemapComponent.asset.tilemapDimensions,
				frameDimensions   = tilemapComponent.asset.spriteSheet.frameDimensions,
				maxX              = parseInt( tilemapDimensions[ 0 ], 10 ),
				maxY              = parseInt( tilemapDimensions[ 1 ], 10 ),
				createdEntityIds  = []

			// first pass: find max triangles for slopes
			for( var y = 0; y < maxY; y++ ) {
				for( var x = 0; x < maxX; x++ ) {
					var tileIndex = tilemapData[ y ][ x ]

					if(tileIndex != rightSlopeIndex && tileIndex != leftSlopeIndex) {
						continue
					}

					var currentSlopeIndex   = tileIndex,
						direction           = (tileIndex == rightSlopeIndex) ? 1 : -1,
						entityTemplate      = (tileIndex == rightSlopeIndex) ? 'spell.entity.physics.slopeRight' : 'spell.entity.physics.slopeLeft',
					    numConnectedTiles   = 0

					while(tilemapData[ y + numConnectedTiles ] &&
						tilemapData[ y + numConnectedTiles ][ x + numConnectedTiles * direction ] == currentSlopeIndex &&
						checkForTriangle(
							leftSlopeIndex,
							rightSlopeIndex,
							currentSlopeIndex,
							direction,
							tilemapData,
							x,
							y,
							numConnectedTiles + 1,
							false)
						) {

						numConnectedTiles++
					}

					//now clear the found triangle (last parameter = true == clear)
					checkForTriangle(
						leftSlopeIndex,
						rightSlopeIndex,
						currentSlopeIndex,
						direction,
						tilemapData,
						x,
						y,
						numConnectedTiles,
						true
					)


					var translation = [
						( x + (numConnectedTiles / 2 * direction ) + 1/2) * frameDimensions[ 0 ],
						frameDimensions[ 1 ] / -2 + tilemapDimensions[ 1 ] * frameDimensions[ 1 ] - (y+ numConnectedTiles/2 ) * frameDimensions[ 1 ]
					]

					var polygonEdge = (frameDimensions[ 0 ] / 2) * (numConnectedTiles + 1)



					var entityId = entityManager.createEntity( {
						entityTemplateId : entityTemplate,
						config : {
							"spell.component.physics.shape.convexPolygon": {
								'vertices':
									[
										[ -1 * polygonEdge,             -1 * polygonEdge ],
                                        [  1 * polygonEdge,             -1 * polygonEdge ],
                                        [ -1 * polygonEdge * direction,  1 * polygonEdge ]
									]
							},
							"spell.component.2d.transform": {
								translation: translation
							}
						}
					} )

					createdEntityIds.push( entityId )
				}
			}

			// second pass: find max rects
			for( var y = 0; y < maxY; y++ ) {
				for( var x = 0; x < maxX; x++ ) {
					var tileIndex = tilemapData[ y ] ? tilemapData[ y ][ x ] : null

					if(tileIndex === null) {
						continue
					}


					var widthInTilemapCoords    = 0,
						heightInTilemapCoord    = 0

					// find max height and width for this rect
					while ( true === checkForRect( tilemapData, x, y, maxX, maxY, widthInTilemapCoords + 1, heightInTilemapCoord, false ) ) {
						widthInTilemapCoords++
					}

					while ( true === checkForRect( tilemapData, x, y, maxX, maxY, widthInTilemapCoords, heightInTilemapCoord + 1, false ) ) {
						heightInTilemapCoord++
					}

					// clear the found rect in the tilemapData
					checkForRect( tilemapData, x, y, maxX, maxY, widthInTilemapCoords, heightInTilemapCoord, true )

					widthInTilemapCoords++
					heightInTilemapCoord++

					var translation = [
						( x + ( widthInTilemapCoords / 2) ) * frameDimensions[ 0 ],
						frameDimensions[ 1 ] / -2 + tilemapDimensions[ 1 ] * frameDimensions[ 1 ] - ( y + heightInTilemapCoord / 2  - 1/2) * frameDimensions[ 1 ]
					]

					var dimensions = [
						widthInTilemapCoords * frameDimensions[ 0 ],
						heightInTilemapCoord * frameDimensions[ 1 ]
					]

					createdEntityIds.push(
						createBlockTileEntity( entityManager, translation, dimensions )
					)
				}
			}

			return createdEntityIds
		}

		/**
		 * Creates an instance of the system.
		 *
		 * @constructor
		 * @param {Object} [spell] The spell object.
		 */
		var createTilePhysics = function( spell ) {
			this.createdEntityIds = []
		}

		createTilePhysics.prototype = {
			/**
		 	 * Gets called when the system is created.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			init: function( spell ) {
				var entityManager    = spell.entityManager,
					eventManager     = spell.eventManager,
					createdEntityIds = this.createdEntityIds,
					tilemaps         = this.tilemaps

				this.leftSlopeIndex  = parseInt( this.config.LEFT_SLOPE_INDEX, 10 )
				this.rightSlopeIndex = parseInt( this.config.RIGHT_SLOPE_INDEX, 10 )

				var leftSlopeIndex  = this.leftSlopeIndex,
					rightSlopeIndex = this.rightSlopeIndex

				eventManager.subscribe(
					[ eventManager.EVENT.ASSET_UPDATED, '2dTileMap' ],
					function( assetId ) {
						// TODO: only process the tilemap components which reference the assetId

						removePhysicsEntities( entityManager, createdEntityIds )
						createdEntityIds.length = 0

						for( var entityId in tilemaps ) {
							var tilemap = tilemaps[ entityId ]

							createdEntityIds.push.apply(
								createdEntityIds,
								createPhysicsEntities( entityManager, tilemap, leftSlopeIndex, rightSlopeIndex )
							)
						}
					}
				)
			},

			/**
		 	 * Gets called when the system is destroyed.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			destroy: function( spell ) {},

			/**
		 	 * Gets called when the system is activated.
		 	 * Gets called when the system is activated.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			activate: function( spell ) {
                var entityManager   = spell.entityManager,
                    leftSlopeIndex  = this.leftSlopeIndex,
                    rightSlopeIndex = this.rightSlopeIndex

                for( var entityId in this.tilemaps ) {
                    this.createdEntityIds.push.apply(
                        this.createdEntityIds,
                        createPhysicsEntities( entityManager, this.tilemaps[ entityId ], leftSlopeIndex, rightSlopeIndex )
                    )
                }
            },

			/**
		 	 * Gets called when the system is deactivated.
		 	 *
		 	 * @param {Object} [spell] The spell object.
			 */
			deactivate: function( spell ) {},

			/**
		 	 * Gets called to trigger the processing of game state.
		 	 *
			 * @param {Object} [spell] The spell object.
			 * @param {Object} [timeInMs] The current time in ms.
			 * @param {Object} [deltaTimeInMs] The elapsed time in ms.
			 */
			process: function( spell, timeInMs, deltaTimeInMs ) {}
		}

		return createTilePhysics
	}
)
