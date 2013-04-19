define(
	'spell/system/render',
	[
		'spell/client/2d/graphics/drawCoordinateGrid',
		'spell/client/2d/graphics/physics/drawBox',
		'spell/client/2d/graphics/physics/drawCircle',
		'spell/client/2d/graphics/physics/drawPoint',
		'spell/client/2d/graphics/physics/drawOrigin',
		'spell/client/2d/graphics/drawShape',
		'spell/client/2d/graphics/drawText',
		'spell/client/2d/graphics/drawTitleSafeOutline',
		'spell/client/util/createComprisedRectangle',
		'spell/client/util/createIncludedRectangle',
		'spell/Defines',
		'spell/Events',
		'spell/shared/util/translate',
		'spell/shared/util/platform/PlatformKit',

		'spell/math/vec2',
		'spell/math/vec4',
		'spell/math/mat3',

		'spell/functions'
	],
	function(
		drawCoordinateGrid,
		drawPhysicsBox,
		drawPhysicsCircle,
		drawPhysicsPoint,
		drawPhysicsOrigin,
		drawShape,
		drawText,
		drawTitleSafeOutline,
		createComprisedRectangle,
		createIncludedRectangle,
		Defines,
		Events,
		translate,
		PlatformKit,

		vec2,
		vec4,
		mat3,

		_
	) {
		'use strict'


		var tmpVec2           = vec2.create(),
			tmpVec2_1         = vec2.create(),
			tmpMat3           = mat3.identity(),
			clearColor        = vec4.create( [ 0, 0, 0, 1 ] ),
			markerColor       = vec4.create( [ 0.45, 0.45, 0.45, 1.0 ] ),
			debugFontAssetId  = 'font:spell.OpenSans14px',
			drawDebugShapes   = true,
			defaultDimensions = vec2.create( [ 1.0, 1.0 ] ),
			tmpViewFrustum    = { bottomLeft : vec2.create(), topRight : vec2.create() },
			currentCameraId

//		var statisticsManager,
//			performance = window.performance

		var translateTextAppearance = function( libraryManager, currentLanguage, textAppearance ) {
			var text = translate( libraryManager, currentLanguage, textAppearance.translationAssetId, textAppearance.text )
			if( !text ) return

			textAppearance.renderText = text
		}

		var layerCompareFunction = function( a, b ) {
			return a.layer - b.layer
		}

		/**
		 * Returns an array of root entity ids. "root" in this context means an entity which has a parent which is not in the set of entities.
		 *
		 * @param entities
		 * @return {Array}
		 */
		var getRootEntities = function( entities ) {
			var result = []

			for( var id in entities ) {
				if( !entities[ entities[ id ].parent ] ) {
					result.push( id )
				}
			}

			return result
		}

		var createVisualObjectsInDrawOrder = function( visibleEntities, entityIds ) {
			var result = []

			for( var i = 0, id, visibleEntity, n = entityIds.length; i < n; i++ ) {
				id = entityIds[ i ]
				visibleEntity = visibleEntities[ id ]

				if( !visibleEntity ) continue

				result.push( visibleEntity )
			}

			result.sort( layerCompareFunction )

			return result
		}

		var createEntityIdsInDrawOrder = function( visibleEntities, entityIds, result ) {
			var childrenIds,
				id,
				visibleEntity,
				visibleEntitiesSorted = createVisualObjectsInDrawOrder( visibleEntities, entityIds )

			for( var i = 0, n = visibleEntitiesSorted.length; i < n; i++ ) {
				visibleEntity = visibleEntitiesSorted[ i ]
				id = visibleEntity.id

				result.push( id )

				childrenIds = visibleEntity.children

				if( childrenIds && childrenIds.length > 0 ) {
					createEntityIdsInDrawOrder( visibleEntities, childrenIds, result )
				}
			}
		}

		var createVisibleEntityIdsSorted = function( entities ) {
			var result = []

			createEntityIdsInDrawOrder(
				entities,
				getRootEntities( entities ),
				result
			)

			return result
		}

		var createOffset = function( deltaTimeInMs, offset, replaySpeed, numFrames, frameDuration, loop ) {
			var animationLengthInMs = numFrames * frameDuration,
				offsetInMs = Math.floor( numFrames * frameDuration * offset ) + deltaTimeInMs * replaySpeed

			if( offsetInMs > animationLengthInMs ) {
				if( !loop ) return 1

				offsetInMs %= animationLengthInMs
			}

			return animationLengthInMs === 0 ?
				0 :
				offsetInMs / animationLengthInMs
		}

		var updatePlaying = function( animationLengthInMs, offsetInMs, looped ) {
			return looped ?
				true :
				offsetInMs < animationLengthInMs
		}

		var transformTo2dTileMapCoordinates = function( worldToLocalMatrix, tilemapDimensions, frameDimensions, maxTileMapY, point ) {
			var transformedPoint = vec2.divide(
				mat3.multiplyVec2(
					worldToLocalMatrix,
					point,
					tmpVec2
				),
				frameDimensions,
				tmpVec2
			)

			vec2.add(
				vec2.scale( tilemapDimensions, 0.5, tmpVec2_1 ),
				transformedPoint
			)

			transformedPoint[ 1 ] = maxTileMapY - transformedPoint[ 1 ]

			return transformedPoint
		}

		var draw2dTileMap = function( context, texture, viewFrustum, asset, transform, worldToLocalMatrix ) {
			var tilemapData = asset.tilemapData

			if( !tilemapData ) return

			var assetSpriteSheet  = asset.spriteSheet,
				tilemapDimensions = asset.tilemapDimensions,
				frameOffsets      = assetSpriteSheet.frameOffsets,
				frameDimensions   = assetSpriteSheet.frameDimensions,
				maxTileMapX       = tilemapDimensions[ 0 ] - 1,
				maxTileMapY       = tilemapDimensions[ 1 ] - 1

			// transform the view frustum to tile map coordinates, clamp to effective range
			var lowerLeft = transformTo2dTileMapCoordinates(
                worldToLocalMatrix,
				tilemapDimensions,
				frameDimensions,
				maxTileMapY,
				viewFrustum.bottomLeft
			)

			var minTileMapSectionX = Math.max( Math.floor( lowerLeft[ 0 ] ), 0 ),
				maxTileMapSectionY = Math.min( Math.ceil( lowerLeft[ 1 ] ), maxTileMapY )

			var topRight = transformTo2dTileMapCoordinates(
                worldToLocalMatrix,
				tilemapDimensions,
				frameDimensions,
				maxTileMapY,
				viewFrustum.topRight
			)

			var minTileSectionMapY = Math.max( Math.floor( topRight[ 1 ] ), 0 ),
				maxTileSectionMapX = Math.min( Math.ceil( topRight[ 0 ] ), maxTileMapX )

			context.save()
			{
				context.scale( frameDimensions )

				for( var y = minTileSectionMapY; y <= maxTileMapSectionY ; y++ ) {
					var tilemapRow = tilemapData[ y ]
					if( !tilemapRow ) continue

					for( var x = minTileMapSectionX; x <= maxTileSectionMapX; x++ ) {
						var frameId = tilemapRow[ x ]
						if( frameId === null ) continue

						tmpVec2[ 0 ] = x - maxTileMapX * 0.5 - 0.5
						tmpVec2[ 1 ] = ( maxTileMapY - y ) - maxTileMapY * 0.5 - 0.5

						context.drawSubTexture(
							texture,
							frameOffsets[ frameId ],
							frameDimensions,
							tmpVec2,
							defaultDimensions
						)
					}
				}
			}
			context.restore()
		}

        var worldToLocalMatrixCache = {}

		var drawVisualObject = function(
			entityManager,
			context,
			transforms,
			appearances,
			textureMatrices,
			animatedAppearances,
			textAppearances,
			tilemaps,
			spriteSheetAppearances,
			childrenComponents,
			quadGeometries,
			visualObjects,
			rectangles,
			deltaTimeInMs,
			id,
			viewFrustum
		) {
			var tilemap      = tilemaps[ id ],
				appearance   = appearances[ id ] || animatedAppearances[ id ] || tilemap || textAppearances[ id ] || spriteSheetAppearances[ id ],
				transform    = transforms[ id ],
				visualObject = visualObjects[ id ],
				quadGeometry = quadGeometries[ id ]

			context.save()
			{
				if( transform ) {
					context.setTransform( transform.worldMatrix )
				}

				if( visualObject ) {
					var worldOpacity = visualObject.worldOpacity

					if( worldOpacity < 1.0 ) {
						context.setGlobalAlpha( worldOpacity )
					}

					if( appearance ) {
						var asset   = appearance.asset,
							texture = asset.resource

						if( !texture ) throw 'The resource id \'' + asset.resourceId + '\' could not be resolved.'

						if( asset.type === 'appearance' ) {
							var textureMatrix  = textureMatrices[ id ],
								quadDimensions = quadGeometry ?
									quadGeometry.dimensions :
									texture.dimensions

//							var start = performance.now()

							// static appearance
							context.save()
							{
								context.drawTexture(
									texture,
									vec2.scale( quadDimensions, -0.5, tmpVec2 ),
									quadDimensions,
									textureMatrix && !textureMatrix.isIdentity ?
										textureMatrix.matrix :
										undefined
								)
							}
							context.restore()

//							var elapsed = performance.now() - start

						} else if( asset.type === 'font' ) {
//							var start = performance.now()

							// text appearance
							drawText(
								context,
								asset,
								texture,
								0.0,
								0.0,
								appearance.renderText || appearance.text,
								appearance.spacing,
								appearance.align
							)

//							var elapsed = performance.now() - start

						} else if( asset.type === '2dTileMap' ) {
//							var start = performance.now()

                            if( !worldToLocalMatrixCache[ id ] ) {
                                worldToLocalMatrixCache[ id ] = mat3.create()
                                mat3.inverse( transform.worldMatrix, worldToLocalMatrixCache[ id ] )

                            }

							draw2dTileMap( context, texture, viewFrustum, asset, transform, worldToLocalMatrixCache[ id ] )

//							var elapsed = performance.now() - start

						} else if( asset.type === 'animation' ) {
							// animated appearance
							var assetFrameDimensions = asset.frameDimensions,
								assetNumFrames       = asset.numFrames,
								assetFrameDuration   = asset.frameDuration,
								animationLengthInMs  = assetNumFrames * assetFrameDuration

							var quadDimensions = quadGeometry ?
								quadGeometry.dimensions :
								assetFrameDimensions

							if( appearance.playing === true && appearance.offset == 0 ) {
								entityManager.triggerEvent( id, 'animationStart', [ 'animation', appearance ] )
							}

							appearance.offset = createOffset(
								deltaTimeInMs,
								appearance.offset,
								appearance.replaySpeed,
								assetNumFrames,
								asset.frameDuration,
								appearance.looped
							)

							var frameId     = Math.round( appearance.offset * ( assetNumFrames - 1 ) ),
								frameOffset = asset.frameOffsets[ frameId ]

//							var start = performance.now()

							context.save()
							{
								context.drawSubTexture(
									texture,
									frameOffset,
									assetFrameDimensions,
									vec2.scale( quadDimensions, -0.5, tmpVec2 ),
									quadDimensions
								)
							}
							context.restore()

//							var elapsed = performance.now() - start

							var isPlaying = updatePlaying( animationLengthInMs, appearance.offset * animationLengthInMs, appearance.looped )

							if( isPlaying !== appearance.playing ) {
								appearance.playing = isPlaying

								if( isPlaying === false ) {
									entityManager.triggerEvent( id, 'animationEnd', [ 'animation', appearance ] )
								}
							}

						} else if( asset.type === 'spriteSheet' ) {
							var frames            = appearance.drawAllFrames ? asset.frames : appearance.frames,
								frameDimensions   = asset.frameDimensions,
								frameOffsets      = asset.frameOffsets,
								frameOffset       = undefined,
								quadDimensions    = quadGeometry ? quadGeometry.dimensions :  [ ( frames.length -0 ) * frameDimensions[ 0 ], frameDimensions[ 1 ] ],
								numFramesInQuad   = [
									Math.floor( quadDimensions[ 0 ] / frameDimensions[ 0 ] ),
									Math.floor( quadDimensions[ 1 ] / frameDimensions[ 1 ] )
								],
								totalFramesInQuad = numFramesInQuad[ 0 ] * numFramesInQuad[ 1 ]

							if( totalFramesInQuad > 0 ) {
								// only draw spriteSheet if we have at least space to draw one tile

//								var start = performance.now()

								context.save()
								{
									context.scale( frameDimensions )

									for(
										var x = 0, length = frames.length;
									     x < length &&
										 x < totalFramesInQuad;
									     x++
										) {

										frameId     = frames[ x ]
										frameOffset = frameOffsets[ frameId ]

										tmpVec2[ 0 ] = -( quadDimensions[ 0 ] / frameDimensions[ 0 ] ) * 0.5 + x % numFramesInQuad[ 0 ]
										tmpVec2[ 1 ] = -( quadDimensions[ 1 ] / frameDimensions[ 1 ] ) * 0.5 + Math.floor( x / numFramesInQuad[ 0 ] )

										context.drawSubTexture(
											texture,
											frameOffset,
											frameDimensions,
											tmpVec2,
											defaultDimensions
										)
									}
								}
								context.restore()

//								var elapsed = performance.now() - start
							}
						}

//						statisticsManager.updateNode( 'platform drawing', elapsed )
					}

					var shape = rectangles[ id ]

					if( shape ) {
						drawShape.rectangle( context, shape )
					}
				}
			}
			context.restore()
		}

		var drawDebug = function( context, childrenComponents, debugBoxes, debugCircles, transforms, deltaTimeInMs, id ) {
			var debugBox    = debugBoxes[ id ],
				debugCircle = debugCircles[ id ],
				transform   = transforms[ id ]

			if( !debugBox && !debugCircle ) return

			context.save()
			{
				if( transform ) {
					context.setTransform( transform.worldMatrix )
				}

				if( debugBox ) {
					drawPhysicsBox( context, debugBox.width, debugBox.height, debugBox.color, 1 )

				} else {
					drawPhysicsCircle( context, debugCircle.radius, debugCircle.color, 1 )
				}

				context.setColor( markerColor )
				drawPhysicsPoint( context, 0.2 )

				context.setLineColor( markerColor )
				drawPhysicsOrigin( context, 0.25 )
			}
			context.restore()
		}

		var setCamera = function( context, cameraDimensions, position ) {
			// setting up the camera geometry
			var halfWidth  = cameraDimensions[ 0 ] * 0.5,
				halfHeight = cameraDimensions[ 1 ] * 0.5

			mat3.ortho( -halfWidth, halfWidth, -halfHeight, halfHeight, tmpMat3 )

			// translating with the inverse camera position
			mat3.translate( tmpMat3, vec2.negate( position, tmpVec2 ) )

			context.setViewMatrix( tmpMat3 )
		}

		var initColorBuffer = function( context, screenDimensions ) {
			context.resizeColorBuffer( screenDimensions[ 0 ], screenDimensions[ 1 ] )
			context.viewport( 0, 0, screenDimensions[ 0 ], screenDimensions [ 1 ] )
		}

		var createViewFrustum = function( cameraDimensions, cameraTranslation ) {
			var halfCameraDimensions = vec2.scale( cameraDimensions, 0.5, tmpVec2 )

			vec2.subtract(
				cameraTranslation,
				halfCameraDimensions,
				tmpViewFrustum.bottomLeft
			)

			vec2.add(
				cameraTranslation,
				halfCameraDimensions,
				tmpViewFrustum.topRight
			)

			return tmpViewFrustum
		}

		var init = function( spell ) {
			var eventManager = this.eventManager

			this.screenResizeHandler = _.bind(
				function( size ) {
					this.screenSize = size
					initColorBuffer( this.context, size )
				},
				this
			)

			eventManager.subscribe( Events.SCREEN_RESIZE, this.screenResizeHandler )


			this.cameraChangedHandler = _.bind(
				function( camera, entityId ) {
					 currentCameraId = camera.active ? entityId : undefined
				},
				this
			)

			eventManager.subscribe( [ Events.COMPONENT_CREATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )
			eventManager.subscribe( [ Events.COMPONENT_UPDATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )


			// HACK: textAppearances should get translated when they are created or when the current language is changed
			this.translateTextAppearanceHandler = _.bind(
				translateTextAppearance,
				null,
				spell.libraryManager,
				spell.configurationManager.getValue( 'currentLanguage' )
			)

			eventManager.subscribe( [ Events.COMPONENT_CREATED, Defines.TEXT_APPEARANCE_COMPONENT_ID ], this.translateTextAppearanceHandler )


//			statisticsManager = spell.statisticsManager
//
//			statisticsManager.addNode( 'compiling entity list', 'spell.system.render' )
//			statisticsManager.addNode( '# entities drawn', 'spell.system.render' )

//			statisticsManager.addNode( 'drawing', 'spell.system.render' )
//			statisticsManager.addNode( 'sort', 'spell.system.render' )
//			statisticsManager.addNode( 'platform drawing', 'drawing' )
		}

		var destroy = function( spell ) {
			var eventManager = this.eventManager

			eventManager.unsubscribe( Events.SCREEN_RESIZE, this.screenResizeHandler )
			eventManager.unsubscribe( [ Events.COMPONENT_CREATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )
			eventManager.unsubscribe( [ Events.COMPONENT_UPDATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )
			eventManager.unsubscribe( [ Events.COMPONENT_CREATED, Defines.TEXT_APPEARANCE_COMPONENT_ID ], this.translateTextAppearanceHandler )

			this.context.clear()
		}

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var context                = this.context,
				screenSize             = this.screenSize,
				entityManager          = spell.entityManager,
				transforms             = this.transforms,
				appearances            = this.appearances,
				textureMatrices        = this.textureMatrices,
				animatedAppearances    = this.animatedAppearances,
				textAppearances        = this.textAppearances,
				tilemaps               = this.tilemaps,
				spriteSheetAppearances = this.spriteSheetAppearances,
				childrenComponents     = this.childrenComponents,
				quadGeometries         = this.quadGeometries,
				visualObjects          = this.visualObjects,
				rectangles             = this.rectangles,
				viewFrustum

			// clear color buffer
			context.clear()

			// set the camera
			var camera          = this.cameras[ currentCameraId ],
				cameraTransform = transforms[ currentCameraId ]

			if( !camera || !cameraTransform ) {
				throw 'No valid camera available.'
			}


			var aspectRatio = screenSize[ 0 ] / screenSize[ 1 ]

			var effectiveCameraDimensions = vec2.multiply(
				cameraTransform.scale,
				createComprisedRectangle( [ camera.width, camera.height ], aspectRatio )
			)

			viewFrustum = createViewFrustum( effectiveCameraDimensions, cameraTransform.translation )


			// draw visual objects in background pass
			setCamera( context, effectiveCameraDimensions, [ 0, 0 ] )

			var visibleEntityIdsSorted = createVisibleEntityIdsSorted( spell.backgroundPassEntities )

			for( var i = 0, n = visibleEntityIdsSorted.length; i < n; i++ ) {
				drawVisualObject(
					entityManager,
					context,
					transforms,
					appearances,
					textureMatrices,
					animatedAppearances,
					textAppearances,
					tilemaps,
					spriteSheetAppearances,
					childrenComponents,
					quadGeometries,
					visualObjects,
					rectangles,
					deltaTimeInMs,
					visibleEntityIdsSorted[ i ],
					viewFrustum
				)
			}


			// draw visual objects in world pass
			context.save()
			{
				setCamera( context, effectiveCameraDimensions, cameraTransform.translation )

				visibleEntityIdsSorted = createVisibleEntityIdsSorted( spell.worldPassEntities )

				for( var i = 0, n = visibleEntityIdsSorted.length; i < n; i++ ) {
					drawVisualObject(
						entityManager,
						context,
						transforms,
						appearances,
						textureMatrices,
						animatedAppearances,
						textAppearances,
						tilemaps,
						spriteSheetAppearances,
						childrenComponents,
						quadGeometries,
						visualObjects,
						rectangles,
						deltaTimeInMs,
						visibleEntityIdsSorted[ i ],
						viewFrustum
					)
				}
			}
			context.restore()


			// draw visual objects in ui pass
			setCamera( context, effectiveCameraDimensions, [ 0, 0 ] )

			visibleEntityIdsSorted = createVisibleEntityIdsSorted( spell.uiPassEntities )

			for( var i = 0, n = visibleEntityIdsSorted.length; i < n; i++ ) {
				drawVisualObject(
					entityManager,
					context,
					transforms,
					appearances,
					textureMatrices,
					animatedAppearances,
					textAppearances,
					tilemaps,
					spriteSheetAppearances,
					childrenComponents,
					quadGeometries,
					visualObjects,
					rectangles,
					deltaTimeInMs,
					visibleEntityIdsSorted[ i ],
					viewFrustum
				)
			}


//			var elapsed = performance.now() - start

//			spell.statisticsManager.updateNode( 'drawing', elapsed )


			if( effectiveCameraDimensions ) {
				setCamera( context, effectiveCameraDimensions, cameraTransform.translation )
			}

			if( this.config.debug &&
				drawDebugShapes ) {

				var debugBoxes   = this.debugBoxes,
					debugCircles = this.debugCircles

				for( var i = 0, n = visibleEntityIdsSorted.length; i < n; i++ ) {
					drawDebug( context, childrenComponents, debugBoxes, debugCircles, transforms, deltaTimeInMs, visibleEntityIdsSorted[ i ] )
				}
			}

			// clear unsafe area
			if( camera && camera.clearUnsafeArea && cameraTransform ) {
				var cameraDimensions             = [ camera.width, camera.height ],
					scaledCameraDimensions       = vec2.multiply( cameraDimensions, cameraTransform.scale, tmpVec2 ),
					cameraAspectRatio            = scaledCameraDimensions[ 0 ] / scaledCameraDimensions[ 1 ],
					effectiveTitleSafeDimensions = createIncludedRectangle( screenSize, cameraAspectRatio, true )

				vec2.scale(
					vec2.subtract( screenSize, effectiveTitleSafeDimensions, tmpVec2 ),
					0.5
				)

				var offset = tmpVec2

				offset[ 0 ] = Math.round( offset[ 0 ] )
				offset[ 1 ] = Math.round( offset[ 1 ] )

				context.save()
				{
					// world to view matrix
					mat3.ortho( 0, screenSize[ 0 ], 0, screenSize[ 1 ], tmpMat3 )
					context.setViewMatrix( tmpMat3 )

					context.setColor( clearColor )

					if( offset[ 0 ] > 0 ) {
						context.fillRect( 0, 0, offset[ 0 ], screenSize[ 1 ] )
						context.fillRect( screenSize[ 0 ] - offset[ 0 ], 0, offset[ 0 ], screenSize[ 1 ] )

					} else if( offset[ 1 ] > 0 ) {
						context.fillRect( 0, 0, screenSize[ 0 ], offset[ 1 ] )
						context.fillRect( 0, screenSize[ 1 ] - offset[ 1 ], screenSize[ 0 ], offset[ 1 ] )
					}
				}
				context.restore()
			}

			if( this.isDevelopment &&
				effectiveCameraDimensions &&
				cameraTransform ) {

				context.save()
				{
					if( this.configurationManager.getValue( 'drawCoordinateGrid' ) ) {
						drawCoordinateGrid( context, this.debugFontAsset, screenSize, effectiveCameraDimensions, cameraTransform )
					}

					if( this.configurationManager.getValue( 'drawTitleSafeOutline' ) ) {
						drawTitleSafeOutline( context, screenSize, [ camera.width, camera.height ], cameraTransform )
					}
				}
				context.restore()
			}
		}


		var Render = function( spell ) {
			this.configurationManager = spell.configurationManager
			this.context              = spell.renderingContext
			this.eventManager         = spell.eventManager
			this.debugFontAsset       = spell.assetManager.get( debugFontAssetId )
			this.screenSize           = spell.configurationManager.getValue( 'currentScreenSize' )
			this.isDevelopment        = spell.configurationManager.getValue( 'mode' ) !== 'deployed'

			// world to view matrix
			mat3.ortho( 0.0, this.screenSize[ 0 ], 0.0, this.screenSize[ 1 ], tmpMat3 )
			this.context.setViewMatrix( tmpMat3 )

			this.context.setClearColor( clearColor )
			initColorBuffer( this.context, this.screenSize )
		}

		Render.prototype = {
			init : init,
			destroy : destroy,
			activate : function( spell ) {},
			deactivate : function( spell ) {},
			process : process
		}

		return Render
	}
)
