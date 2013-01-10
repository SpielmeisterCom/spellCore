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
		PlatformKit,

		vec2,
		vec4,
		mat3,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var tmpVec2           = vec2.create(),
			tmpVec2_1         = vec2.create(),
			tmpMat3           = mat3.identity(),
			clearColor        = vec4.create( [ 0, 0, 0, 1 ] ),
			markerColor       = vec4.create( [ 0.45, 0.45, 0.45, 1 ] ),
			debugFontAssetId  = 'font:spell.OpenSans14px',
			drawDebugShapes   = true,
			defaultDimensions = vec2.create( [ 1, 1 ] ),
			tmpViewFrustum    = { bottomLeft : vec2.create(), topRight : vec2.create() },
			currentCameraId

//		var statisticsManager

		var layerCompareFunctionOld = function( a, b ) {
			var d1 = a.d,
				d2 = b.d,
				l1 = a.l,
				l2 = b.l

			if( d1 == d2 ) {
				return ( l1 < l2 ? -1 : ( l1 > l2 ? 1 : 0 ) )
			}

			return 0
		}

		var createVisualObjectsInDrawOrder = function( visualObjects, ids, parentId, depth ) {
			var result = []

			for( var i = 0, id, visualObject, n = ids.length; i < n; i++ ) {
				id = ids[ i ]
				visualObject = visualObjects[ id ]

				result.push( {
					i : id,
					l : visualObject ? visualObject.layer : 0
				} )
			}

			result.sort( layerCompareFunctionOld )

			return result
		}

		var createEntityIdsInDrawOrder = function( childrenComponents, visualObjects, roots, parentId, depth ) {
			if( !depth ) depth = 0
			if( !parentId ) parentId = 0

			var nextDepth = depth + 1,
				childrenComponent,
				id,
				result = [],
				visualObject,
				visualObjectsInDrawOrder = createVisualObjectsInDrawOrder( visualObjects, roots, parentId, depth )

			for( var i = 0, n = visualObjectsInDrawOrder.length; i < n; i++ ) {
				visualObject = visualObjectsInDrawOrder[ i ]
				id = visualObject.i

				result.push( id )

				childrenComponent = childrenComponents[ id ]

				if( childrenComponent ) {
					result = result.concat(
						createEntityIdsInDrawOrder( childrenComponents, visualObjects, childrenComponent.ids, id, nextDepth )
					)
				}
			}

			return result
		}

		var createOffset = function( deltaTimeInMs, offset, replaySpeed, numFrames, frameDuration, loop ) {
			var animationLengthInMs = numFrames * frameDuration,
				offsetInMs = Math.floor( numFrames * frameDuration * offset ) + deltaTimeInMs * replaySpeed

			if( offsetInMs > animationLengthInMs ) {
				if( !loop ) return 1.0

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

		var draw2dTileMap = function( context, texture, viewFrustum, asset, transform ) {
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
				transform.worldToLocalMatrix,
				tilemapDimensions,
				frameDimensions,
				maxTileMapY,
				viewFrustum.bottomLeft
			)

			var minTileMapSectionX = Math.max( Math.floor( lowerLeft[ 0 ] ), 0 ),
				maxTileMapSectionY = Math.min( Math.ceil( lowerLeft[ 1 ] ), maxTileMapY )

			var topRight = transformTo2dTileMapCoordinates(
				transform.worldToLocalMatrix,
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

					for( var x = minTileMapSectionX; x <= maxTileSectionMapX; x++ ) {
						if( !tilemapRow ) continue

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

		var drawVisualObject = function(
			entityManager,
			context,
			transforms,
			appearances,
			appearanceTransforms,
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

			if( appearance && transform && visualObject && !tilemap ) {
				var dimensions        = quadGeometry ? quadGeometry.dimensions : appearance.asset.resource.dimensions,
					halfTextureWidth  = dimensions[ 0 ] * 0.5,
					halfTextureHeight = dimensions[ 1 ] * 0.5,
					minX              = viewFrustum.bottomLeft[ 0 ] - halfTextureWidth,
					maxX              = viewFrustum.topRight[ 0 ] + halfTextureWidth,
					minY              = viewFrustum.bottomLeft[ 1 ] - halfTextureHeight,
					maxY              = viewFrustum.topRight[ 1 ] + halfTextureHeight,
					curX              = transform.worldTranslation[ 0 ],
					curY              = transform.worldTranslation[ 1 ]

				if( curX < minX || curX > maxX || curY < minY || curY > maxY ) {
					return
				}
			}

			context.save()
			{
				if( transform ) {
					// object to world space transformations go here
					context.translate( transform.worldTranslation )
					context.rotate( -transform.worldRotation )
					context.scale( transform.worldScale )
				}

				if( visualObject ) {
					var visualObjectOpacity = visualObject.opacity

					if( visualObjectOpacity !== 1.0 ) {
						context.setGlobalAlpha( visualObjectOpacity )
					}

					if( appearance ) {
						var asset   = appearance.asset,
							texture = asset.resource

//						var performance = window.performance

						if( !texture ) throw 'The resource id \'' + asset.resourceId + '\' could not be resolved.'

						if( asset.type === 'appearance' ) {
							var appearanceTransform = appearanceTransforms[ id ],
								quadDimensions = quadGeometry ?
								quadGeometry.dimensions :
									texture.dimensions

//							var start = performance.webkitNow()

							// static appearance
							context.save()
							{
								var textureMatrix = appearanceTransform && !appearanceTransform.isIdentity ?
									appearanceTransform.matrix :
									undefined

								context.drawTexture(
									texture,
									vec2.scale( quadDimensions, -0.5, tmpVec2 ),
									quadDimensions,
									textureMatrix
								)
							}
							context.restore()

//							var elapsed = performance.webkitNow() - start

						} else if( asset.type === 'font' ) {
//							var start = performance.webkitNow()

							// text appearance
							drawText( context, asset, texture, 0, 0, appearance.text, appearance.spacing, appearance.align )

//							var elapsed = performance.webkitNow() - start

						} else if( asset.type === '2dTileMap' ) {
//							var start = performance.webkitNow()

							draw2dTileMap( context, texture, viewFrustum, asset, transform )

//							var elapsed = performance.webkitNow() - start

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

//							var start = performance.webkitNow()

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

//							var elapsed = performance.webkitNow() - start

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
								frameOffset       = null,
								quadDimensions    = quadGeometry ? quadGeometry.dimensions :  [ ( frames.length -0 ) * frameDimensions[ 0 ], frameDimensions[ 1 ] ],
								numFramesInQuad   = [
									Math.floor( quadDimensions[ 0 ] / frameDimensions[ 0 ] ),
									Math.floor( quadDimensions[ 1 ] / frameDimensions[ 1 ] )
								],
								totalFramesInQuad = numFramesInQuad[ 0 ] * numFramesInQuad[ 1 ]

							if( totalFramesInQuad > 0 ) {
								// only draw spriteSheet if we have at least space to draw one tile

//								var start = performance.webkitNow()

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

//								var elapsed = performance.webkitNow() - start
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

		var drawDebug = function( context, childrenComponents, debugBoxes, debugCircles, transforms, deltaTimeInMs, id, next ) {
			var debugBox    = debugBoxes[ id ],
				debugCircle = debugCircles[ id ],
				transform   = transforms[ id ]

			if( !debugBox && !debugCircle ) return

			context.save()
			{
				if( transform ) {
					// object to world space transformations go here
					context.translate( transform.translation )
					context.rotate( -transform.rotation )
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

		var createScreenSize = function( availableScreenSize, aspectRatio ) {
			return aspectRatio ?
				createIncludedRectangle( availableScreenSize, aspectRatio, true ) :
				availableScreenSize
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

		var createRootTransformIds = function( roots, transforms ) {
			var result = []

			for( var rootId in roots ) {
				if( !( rootId in transforms ) ) continue

				result.push( rootId )
			}

			return result
		}

		var init = function( spell ) {
			var eventManager = spell.eventManager

			this.screenResizeHandler = _.bind(
				function( size ) {
					var aspectRatio = ( this.debugSettings && this.debugSettings.screenAspectRatio ?
						this.debugSettings.screenAspectRatio :
						size[ 0 ] / size[ 1 ]
					)

					this.screenSize = createScreenSize( size, aspectRatio )

					initColorBuffer( this.context, this.screenSize )
				},
				this
			)

			this.screeAspectRatioHandler = _.bind(
				function( aspectRatio ) {
					this.screenSize = createScreenSize(
						PlatformKit.getAvailableScreenSize(
							this.configurationManager.id
						),
						aspectRatio
					)

					initColorBuffer( this.context, this.screenSize )
				},
				this
			)

			this.cameraChangedHandler = function( camera, entityId ) {
				currentCameraId = camera.active ? entityId : null
			}

			eventManager.subscribe( Events.SCREEN_RESIZE, this.screenResizeHandler )
			eventManager.subscribe( Events.SCREEN_ASPECT_RATIO, this.screeAspectRatioHandler )
			eventManager.subscribe( [ Events.COMPONENT_CREATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )
			eventManager.subscribe( [ Events.COMPONENT_UPDATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )

//			statisticsManager = spell.statisticsManager
//
//			statisticsManager.addNode( 'drawing', 'spell.system.render' )
//			statisticsManager.addNode( 'sort', 'spell.system.render' )
//			statisticsManager.addNode( 'platform drawing', 'drawing' )
		}

		var destroy = function( spell ) {
			var eventManager = spell.eventManager

			eventManager.unsubscribe( Events.SCREEN_RESIZE, this.screenResizeHandler )
			eventManager.unsubscribe( Events.SCREEN_ASPECT_RATIO, this.screeAspectRatioHandler )
			eventManager.unsubscribe( [ Events.COMPONENT_CREATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )
			eventManager.unsubscribe( [ Events.COMPONENT_UPDATED, Defines.CAMERA_COMPONENT_ID ], this.cameraChangedHandler )
		}

		var activate = function( spell ) {
			this.sortedVisualObjectIds = createEntityIdsInDrawOrder(
				this.childrenComponents,
				this.visualObjects,
				createRootTransformIds( this.roots, this.transforms )
			)

			this.updateSortedVisualObjectIds = _.bind(
				function() {
					this.sortedVisualObjectIds = createEntityIdsInDrawOrder(
						this.childrenComponents,
						this.visualObjects,
						createRootTransformIds( this.roots, this.transforms )
					)
				},
				this
			)

			spell.eventManager.subscribe( Events.ENTITY_CREATED, this.updateSortedVisualObjectIds )
		}

		var deactivate = function( spell ) {
			spell.eventManager.unsubscribe( Events.ENTITY_CREATED, this.updateSortedVisualObjectIds )
		}

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var cameras                = this.cameras,
				context                = this.context,
				screenSize             = this.screenSize,
				context                = this.context,
				entityManager          = spell.entityManager,
				transforms             = this.transforms,
				appearances            = this.appearances,
				appearanceTransforms   = this.appearanceTransforms,
				animatedAppearances    = this.animatedAppearances,
				textAppearances        = this.textAppearances,
				tilemaps               = this.tilemaps,
				spriteSheetAppearances = this.spriteSheetAppearances,
				childrenComponents     = this.childrenComponents,
				quadGeometries         = this.quadGeometries,
				visualObjects          = this.visualObjects,
				rectangles             = this.rectangles,
				sortedVisualObjectIds  = this.sortedVisualObjectIds,
				viewFrustum

			var screenAspectRatio = ( this.debugSettings && this.debugSettings.screenAspectRatio ?
				this.debugSettings.screenAspectRatio :
				( this.screenSize[ 0 ] / this.screenSize[ 1 ] )
			)

			// set the camera
			var camera          = cameras[ currentCameraId ],
				cameraTransform = this.transforms[ currentCameraId ]

			if( camera && cameraTransform ) {
				var effectiveCameraDimensions = vec2.multiply(
					cameraTransform.scale,
					createComprisedRectangle( [ camera.width, camera.height ] , screenAspectRatio )
				)

				if( effectiveCameraDimensions ) {
					setCamera( context, effectiveCameraDimensions, cameraTransform.translation )
					viewFrustum = createViewFrustum( effectiveCameraDimensions, cameraTransform.translation )
				}
			}

			// clear color buffer
			context.clear()

//			var start = performance.webkitNow()

			for( var i = 0, n = sortedVisualObjectIds.length; i < n; i++ ) {
				drawVisualObject(
					entityManager,
					context,
					transforms,
					appearances,
					appearanceTransforms,
					animatedAppearances,
					textAppearances,
					tilemaps,
					spriteSheetAppearances,
					childrenComponents,
					quadGeometries,
					visualObjects,
					rectangles,
					deltaTimeInMs,
					sortedVisualObjectIds[ i ],
					viewFrustum
				)
			}

//			var elapsed = performance.webkitNow() - start

//			spell.statisticsManager.updateNode( 'drawing', elapsed )


			if( this.config.debug &&
				drawDebugShapes ) {

				var debugBoxes   = this.debugBoxes,
					debugCircles = this.debugCircles

				for( var i = 0, n = sortedVisualObjectIds.length; i < n; i++ ) {
					drawDebug( context, childrenComponents, debugBoxes, debugCircles, transforms )
				}
			}

			// clear unsafe area
			if( camera && camera.clearUnsafeArea && cameraTransform ) {
				var cameraDimensions       = [ camera.width, camera.height ],
					scaledCameraDimensions = vec2.multiply( cameraDimensions, cameraTransform.scale, tmpVec2 ),
					cameraAspectRatio      = scaledCameraDimensions[ 0 ] / scaledCameraDimensions[ 1 ],
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

			if( this.debugSettings &&
				effectiveCameraDimensions &&
				cameraTransform ) {

				context.save()
				{
					if( this.debugSettings.drawCoordinateGrid ) {
						drawCoordinateGrid( context, this.debugFontAsset, screenSize, effectiveCameraDimensions, cameraTransform )
					}

					if( this.debugSettings.drawTitleSafeOutline ) {
						drawTitleSafeOutline( context, screenSize, [ camera.width, camera.height ], cameraTransform )
					}
				}
				context.restore()
			}
		}


		/**
		 * public
		 */

		var Renderer = function( spell ) {
			this.configurationManager        = spell.configurationManager
			this.context                     = spell.renderingContext
			this.debugFontAsset              = spell.assets[ debugFontAssetId ]
			this.screenSize                  = spell.configurationManager.currentScreenSize
			this.debugSettings               = spell.configurationManager.debug ? spell.configurationManager.debug : false
			this.sortedVisualObjectIds       = []
			this.updateSortedVisualObjectIds = null

			var context    = this.context,
				screenSize = this.screenSize

			context.setClearColor( clearColor )

			// world to view matrix
			mat3.ortho( 0, screenSize[ 0 ], 0, screenSize[ 1 ], tmpMat3 )

			context.setViewMatrix( tmpMat3 )


			if( this.debugSettings &&
				this.debugSettings.screenAspectRatio ) {

				this.screenSize = createScreenSize(
					PlatformKit.getAvailableScreenSize(
						this.configurationManager.id
					),
					this.debugSettings.screenAspectRatio
				)
			}

			initColorBuffer( this.context, this.screenSize )
		}

		Renderer.prototype = {
			init : init,
			destroy : destroy,
			activate : activate,
			deactivate : deactivate,
			process : process
		}

		return Renderer
	}
)
