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
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',

		'spell/math/util',

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
		Events,
		PlatformKit,

		mathUtil,
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
			isInInterval      = mathUtil.isInInterval,
			currentCameraId

		var roundVec2 = function( v ) {
			v[ 0 ] = Math.round( v[ 0 ] )
			v[ 1 ] = Math.round( v[ 1 ] )

			return v
		}

		var layerCompareFunction = function( a, b ) {
			var layer1 = a.layer || 0,
				layer2 = b.layer || 0

			return ( layer1 < layer2 ? -1 : ( layer1 > layer2 ? 1 : 0 ) )
		}

		var createSortedByLayer = function( visualObjects, ids ) {
			return _.pluck(
				_.reduce(
					ids,
					function( memo, id ) {
						var visualObject = visualObjects[ id ]

						return memo.concat( {
							id    : id,
							layer : visualObject ? visualObject.layer : 0
						} )
					},
					[]
				).sort( layerCompareFunction ),
				'id'
			)
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

						tmpVec2[ 0 ] = x - maxTileMapX / 2 - 0.5
						tmpVec2[ 1 ] = ( maxTileMapY - y ) - maxTileMapY / 2 - 0.5

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
			viewFrustum,
			next
		) {
			var visualObject = visualObjects[ id ],
				transform    = transforms[ id ]

			if(appearances[ id ] && transform) {
				var appearance      = appearances[ id ],
					quadGeometry    = quadGeometries[ id ],
					dimensions      = quadGeometry ? quadGeometry.dimensions : appearance.asset.resource.dimensions,

					halfTextureWidth    = dimensions[0] / 2,
					halfTextureHeight   = dimensions[1] / 2,

					minX                = viewFrustum.bottomLeft[0] - halfTextureWidth,
					maxX                = viewFrustum.topRight[0] + halfTextureWidth,
					minY                = viewFrustum.bottomLeft[1] - halfTextureHeight,
					maxY                = viewFrustum.topRight[1] + halfTextureHeight,

					curX                = transform.worldTranslation[0],
					curY                = transform.worldTranslation[1]

				if (curX < minX || curX > maxX || curY < minY || curY > maxY) {
					return
				}

			}

			context.save()
			{
				if( transform ) {
					// object to world space transformations go here
					context.translate( transform.translation )
					context.rotate( -transform.rotation )
					context.scale( transform.scale )
				}

				if( visualObject ) {
					var visualObjectOpacity = visualObject.opacity

					if( visualObjectOpacity !== 1.0 ) {
						context.setGlobalAlpha( visualObjectOpacity )
					}

					var appearance   = appearances[ id ] || animatedAppearances[ id ] || tilemaps[ id ] || textAppearances[ id ] ||  spriteSheetAppearances[ id ],
						shape        = rectangles[ id ],
						quadGeometry = quadGeometries[ id ]

					if( appearance ) {
						var asset   = appearance.asset,
							texture = asset.resource

						if( !texture ) throw 'The resource id \'' + asset.resourceId + '\' could not be resolved.'

						if( asset.type === 'appearance' ) {
							var appearanceTransform = appearanceTransforms[ id ],
								quadDimensions = quadGeometry ?
								quadGeometry.dimensions :
									texture.dimensions

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

						} else if( asset.type === 'font' ) {
							// text appearance
							drawText( context, asset, texture, 0, 0, appearance.text, appearance.spacing, appearance.align )

						} else if( asset.type === '2dTileMap' ) {
							draw2dTileMap( context, texture, viewFrustum, asset, transform )

						} else if( asset.type === 'animation' ) {
							// animated appearance
							var assetFrameDimensions = asset.frameDimensions,
								assetNumFrames       = asset.numFrames,
								assetFrameDuration   = asset.frameDuration,
								animationLengthInMs  = assetNumFrames * assetFrameDuration

							var quadDimensions = quadGeometry ?
								quadGeometry.dimensions :
								assetFrameDimensions

							if( appearance.playing === true && appearance.offset == 0) {
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
								//only draw spriteSheet if we have at least space to draw one tile

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

										tmpVec2[ 0 ] = -(quadDimensions[ 0 ] / frameDimensions[ 0 ]) / 2 + x % numFramesInQuad[ 0 ]
										tmpVec2[ 1 ] = -(quadDimensions[ 1 ] / frameDimensions[ 1 ]) / 2 + Math.floor( x / numFramesInQuad[ 0 ] )

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
							}
						}
					}

					if( shape ) {
						drawShape.rectangle( context, shape )
					}
				}

				// draw children
				var children = childrenComponents[ id ]

				if( children ) {
					var childrenIds    = createSortedByLayer( visualObjects, children.ids ),
						numChildrenIds = childrenIds.length

					for( var i = 0; i < numChildrenIds; i++ ) {
						next( deltaTimeInMs, childrenIds[ i ], viewFrustum, next )
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

		var getActiveCameraId = function( cameras ) {
			if( _.size( cameras ) === 0 ) return

			// Gets the first active camera. More than one camera being active is an undefined state and the first found active is used.
			var activeCameraId = undefined

			_.any(
				cameras,
				function( camera, id ) {
					if( camera.active ) {
						activeCameraId = id

						return true
					}

					return false
				}
			)

			if( currentCameraId !== activeCameraId ) currentCameraId = activeCameraId

			return currentCameraId
		}

		var setCamera = function( context, cameraDimensions, position ) {
			// setting up the camera geometry
			var halfWidth  = cameraDimensions[ 0 ] / 2,
				halfHeight = cameraDimensions[ 1 ] / 2

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

			this.screeAspectRatioHandler =_.bind(
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

			eventManager.subscribe( Events.SCREEN_RESIZE, this.screenResizeHandler )
			eventManager.subscribe( Events.SCREEN_ASPECT_RATIO, this.screeAspectRatioHandler )
		}

		var destroy = function( spell ) {
			var eventManager = spell.eventManager

			eventManager.unsubscribe( Events.SCREEN_RESIZE, this.screenResizeHandler )
			eventManager.unsubscribe( Events.SCREEN_ASPECT_RATIO, this.screeAspectRatioHandler )
		}

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var cameras                 = this.cameras,
				context                 = this.context,
				drawVisualObjectPartial = this.drawVisualObjectPartial,
				screenSize              = this.screenSize,
				viewFrustum

			var screenAspectRatio = ( this.debugSettings && this.debugSettings.screenAspectRatio ?
				this.debugSettings.screenAspectRatio :
				( this.screenSize[ 0 ] / this.screenSize[ 1 ] )
			)

			// set the camera
			var activeCameraId  = getActiveCameraId( cameras ),
				camera          = cameras[ activeCameraId ],
				cameraTransform = this.transforms[ activeCameraId ]

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

			var rootTransforms = _.intersection(
				_.keys( this.roots ),
				_.keys( this.transforms )
			)

			// draw scene
			var sortedVisualObjects = createSortedByLayer( this.visualObjects, rootTransforms )

			for( var i in sortedVisualObjects ) {
				drawVisualObjectPartial( deltaTimeInMs, sortedVisualObjects[ i ], viewFrustum, drawVisualObjectPartial )
			}

			if( this.config.debug &&
				drawDebugShapes ) {

				var drawDebugPartial = this.drawDebugPartial

				for( var i in sortedVisualObjects ) {
					drawDebugPartial( deltaTimeInMs, sortedVisualObjects[ i ], drawDebugPartial )
				}
			}

			// clear unsafe area
			if( camera && camera.clearUnsafeArea && cameraTransform ) {
				var cameraDimensions       = [ camera.width, camera.height ],
					scaledCameraDimensions = vec2.multiply( cameraDimensions, cameraTransform.scale, tmpVec2 ),
					cameraAspectRatio      = scaledCameraDimensions[ 0 ] / scaledCameraDimensions[ 1 ],
					effectiveTitleSafeDimensions = createIncludedRectangle( screenSize, cameraAspectRatio, true )

				var offset = roundVec2(
					vec2.scale(
						vec2.subtract( screenSize, effectiveTitleSafeDimensions, tmpVec2 ),
						0.5
					)
				)

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
			this.configurationManager = spell.configurationManager
			this.context              = spell.renderingContext
			this.debugFontAsset       = spell.assets[ debugFontAssetId ]
			this.screenSize           = spell.configurationManager.currentScreenSize
			this.debugSettings        = spell.configurationManager.debug ? spell.configurationManager.debug : false

			this.drawVisualObjectPartial = _.bind(
				drawVisualObject,
				null,
				spell.entityManager,
				this.context,
				this.transforms,
				this.appearances,
				this.appearanceTransforms,
				this.animatedAppearances,
				this.textAppearances,
				this.tilemaps,
				this.spriteSheetAppearances,
				this.childrenComponents,
				this.quadGeometries,
				this.visualObjects,
				this.rectangles
			)

			if( this.config.debug ) {
				this.drawDebugPartial = _.bind(
					drawDebug,
					null,
					this.context,
					this.childrenComponents,
					this.debugBoxes,
					this.debugCircles,
					this.transforms
				)
			}

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
			activate : function() {},
			deactivate : function() {},
			process : process
		}

		return Renderer
	}
)
