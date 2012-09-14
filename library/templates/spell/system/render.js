define(
	'spell/system/render',
	[
		'spell/client/2d/graphics/drawCoordinateGrid',
		'spell/client/2d/graphics/drawText',
		'spell/client/2d/graphics/drawTitleSafeOutline',
		'spell/client/util/createComprisedRectangle',
		'spell/client/util/createIncludedRectangle',
		'spell/shared/util/Events',
		'spell/shared/util/platform/PlatformKit',

		'spell/math/vec2',
		'spell/math/vec4',
		'spell/math/mat3',

		'spell/functions'
	],
	function(
		drawCoordinateGrid,
		drawText,
		drawTitleSafeOutline,
		createComprisedRectangle,
		createIncludedRectangle,
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

		var tmpVec2          = vec2.create(),
			tmpMat3          = mat3.identity(),
			clearColor       = vec4.create( [ 0, 0, 0, 1 ] ),
			debugFontAssetId = 'font:spell.OpenSans14px',
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

				offsetInMs = offsetInMs % animationLengthInMs
			}

			return offsetInMs / animationLengthInMs
		}

		var drawVisualObject = function(
			context,
			transforms,
			appearances,
			animatedAppearances,
			textAppearances,
			childrenComponents,
			visualObjects,
			deltaTimeInMs,
			id,
			next
		) {
			var visualObject = visualObjects[ id ],
				transform    = transforms[ id ]

			context.save()
			{
				if( transform ) {
					// object to world space transformation go here
					context.translate( transform.translation )
					context.rotate( transform.rotation )
					context.scale( transform.scale )
				}

				if( visualObject ) {
					var visualObjectOpacity = visualObject.opacity

					if( visualObjectOpacity !== 1.0 ) {
						context.setGlobalAlpha( visualObjectOpacity )
					}

					var appearance = appearances[ id ] || animatedAppearances[ id ] || textAppearances[ id ]

					if( appearance ) {
						var asset   = appearance.asset,
							texture = asset.resource

						if( !texture ) throw 'The resource id \'' + asset.resourceId + '\' could not be resolved.'

						if( asset.type === 'appearance' ) {
							// static appearance
							context.save()
							{
								context.scale( texture.dimensions )

								context.drawTexture( texture, -0.5, -0.5, 1, 1 )
							}
							context.restore()

						} else if( asset.type === 'font' ) {
							// text appearance
							drawText( context, asset, texture, 0, 0, appearance.text, appearance.spacing )

						} else if( asset.type === 'animation' ) {
							// animated appearance
							var assetFrameDimensions = asset.frameDimensions,
								assetNumFrames       = asset.numFrames

							appearance.offset = createOffset(
								deltaTimeInMs,
								appearance.offset,
								appearance.replaySpeed,
								assetNumFrames,
								asset.frameDuration,
								asset.looped
							)

							var frameId = Math.round( appearance.offset * ( assetNumFrames - 1 ) ),
								frameOffset = asset.frameOffsets[ frameId ]

							context.save()
							{
								context.scale( assetFrameDimensions )

								context.drawSubTexture( texture, frameOffset[ 0 ], frameOffset[ 1 ], assetFrameDimensions[ 0 ], assetFrameDimensions[ 1 ], -0.5, -0.5, 1, 1 )
							}
							context.restore()
						}
					}
				}

				// draw children
				var children = childrenComponents[ id ]

				if( children ) {
					var childrenIds    = createSortedByLayer( visualObjects, children.ids ),
						numChildrenIds = childrenIds.length

					for( var i = 0; i < numChildrenIds; i++ ) {
						next( deltaTimeInMs, childrenIds[ i ], next )
					}
				}
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

		var process = function( spell, timeInMs, deltaTimeInMs ) {
			var cameras                 = this.cameras,
				context                 = this.context,
				drawVisualObjectPartial = this.drawVisualObjectPartial,
				screenSize              = this.screenSize,
				screenAspectRatio       = this.debug.screenAspectRatio || screenSize[ 0 ] / screenSize[ 1 ]

			// set the camera
			var activeCameraId            = getActiveCameraId( cameras ),
				camera                    = cameras[ activeCameraId ],
				cameraTransform           = this.transforms[ activeCameraId ]

			if( camera && cameraTransform ) {
				var effectiveCameraDimensions = vec2.multiply(
					cameraTransform.scale,
					createComprisedRectangle( [ camera.width, camera.height ] , screenAspectRatio )
				)

				if( effectiveCameraDimensions ) {
					setCamera( context, effectiveCameraDimensions, cameraTransform.translation )
				}
			}

			// clear color buffer
			context.clear()

			var rootTransforms = _.intersection(
				_.keys( this.roots ),
				_.keys( this.transforms )
			)

			_.each(
				createSortedByLayer( this.visualObjects, rootTransforms ),
				function( id ) {
					drawVisualObjectPartial( deltaTimeInMs, id, drawVisualObjectPartial )
				}
			)

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

					context.setFillStyleColor( clearColor )

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

			if( this.debug &&
				effectiveCameraDimensions &&
				cameraTransform ) {

				if( this.debug.drawCoordinateGrid ) {
					drawCoordinateGrid( context, this.debugFontAsset, screenSize, effectiveCameraDimensions, cameraTransform )
				}

				if( this.debug.drawTitleSafeOutline ) {
					drawTitleSafeOutline( context, screenSize, [ camera.width, camera.height ], cameraTransform )
				}
			}
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

		var init = function( spell ) {}

		var cleanUp = function( spell ) {}


		/**
		 * public
		 */

		var Renderer = function( spell ) {
			this.configurationManager = spell.configurationManager
			this.context              = spell.renderingContext
			this.debugFontAsset       = spell.assets[ debugFontAssetId ]
			this.screenSize           = spell.configurationManager.currentScreenSize
			this.debug                = !!spell.configurationManager.debug ? spell.configurationManager.debug : false

			this.drawVisualObjectPartial = _.bind(
				drawVisualObject,
				null,
				this.context,
				this.transforms,
				this.appearances,
				this.animatedAppearances,
				this.textAppearances,
				this.childrenComponents,
				this.visualObjects
			)

			var eventManager = spell.eventManager,
				context      = this.context,
				screenSize   = this.screenSize

			context.setClearColor( clearColor )

			// world to view matrix
			mat3.ortho( 0, screenSize[ 0 ], 0, screenSize[ 1 ], tmpMat3 )

			context.setViewMatrix( tmpMat3 )


			if( this.debug &&
				this.debug.screenAspectRatio !== undefined ) {

				this.screenSize = createScreenSize(
					PlatformKit.getAvailableScreenSize(
						this.configurationManager.id
					),
					this.debug.screenAspectRatio
				)
			}

			initColorBuffer( this.context, this.screenSize )


			// registering event handlers
			eventManager.subscribe(
				Events.SCREEN_RESIZE,
				_.bind(
					function( size ) {
						var aspectRatio = ( this.debug && this.debug.screenAspectRatio !== undefined ?
							this.debug.screenAspectRatio :
							size[ 0 ] / size[ 1 ]
						)

						this.screenSize = createScreenSize( size, aspectRatio )

						initColorBuffer( this.context, this.screenSize )
					},
					this
				)
			)

			eventManager.subscribe(
				Events.SCREEN_ASPECT_RATIO,
				_.bind(
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
			)
		}

		Renderer.prototype = {
			cleanup : cleanUp,
			init : init,
			process : process
		}

		return Renderer
	}
)
