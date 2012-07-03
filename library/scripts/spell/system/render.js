define(
	'spell/system/render',
	[
		'spell/client/2d/graphics/createWorldToViewMatrix',
		'spell/client/2d/graphics/drawCoordinateGrid',
		'spell/shared/util/Events',

		'spell/math/vec2',
		'spell/math/vec3',
		'spell/math/mat4',

		'spell/shared/util/platform/underscore'
	],
	function(
		createWorldToViewMatrix,
		drawCoordinateGrid,
		Events,

		vec2,
		vec3,
		mat4,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var tmpVec3 = vec3.create(),
			tmpMat4 = mat4.identity(),
			currentCameraId

		var createSortedByLayer = function( roots, visualObjects ) {
			return _.reduce(
				roots,
				function( memo, root, id ) {
					var visualObject = visualObjects[ id ]

					if( !visualObject ) return memo

					return memo.concat( {
						id : id,
						layer : visualObject.layer
					} )
				},
				[]
			).sort(
				function( a, b ) {
					var layerA = a.layer
					var layerB = b.layer

					return ( layerA < layerB ? -1 : ( layerA > layerB ? 1 : 0 ) )
				}
			)
		}

		var createAnimationOffset = function( deltaTimeInMs, animationOffset, animationSpeedFactor, numFrames, frameDuration, loop ) {
			var animationLengthInMs = numFrames * frameDuration,
				animationOffsetInMs = Math.floor( numFrames * frameDuration * animationOffset ) + deltaTimeInMs * animationSpeedFactor

			if( animationOffsetInMs > animationLengthInMs ) {
				if( !loop ) return 1.0

				animationOffsetInMs = animationOffsetInMs % animationLengthInMs
			}

			return animationOffsetInMs / animationLengthInMs
		}

		var drawVisualObject = function(
			context,
			assets,
			resources,
			transforms,
			appearances,
			animatedAppearances,
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
				var appearance          = appearances[ id ] || animatedAppearances[ id ],
					asset               = assets[ appearance.assetId ],
					texture             = resources[ asset.resourceId ],
					visualObjectOpacity = visualObject.opacity

				if( !texture ) throw 'The resource id \'' + asset.resourceId + '\' could not be resolved.'


				if( visualObjectOpacity !== 1.0 ) {
					context.setGlobalAlpha( visualObjectOpacity )
				}

				// object to world space transformation go here
				vec2.set( transform.translation, tmpVec3 )
				context.translate( tmpVec3 )

				context.rotate( transform.rotation )

				if( asset.type === 'appearance' ) {
					vec2.multiply( transform.scale, [ texture.width, texture.height ], tmpVec3 )
					context.scale( tmpVec3 )

					context.drawTexture( texture, -0.5, -0.5, 1, 1 )

				} else {
					// asset.type === 'animation'

					var assetFrameWidth  = asset.frameWidth,
						assetFrameHeight = asset.frameHeight,
						assetNumFrames   = asset.numFrames

					vec2.multiply( transform.scale, [ assetFrameWidth, assetFrameHeight ], tmpVec3 )
					context.scale( tmpVec3 )

					appearance.animationOffset = createAnimationOffset(
						deltaTimeInMs,
						appearance.animationOffset,
						appearance.animationSpeedFactor,
						assetNumFrames,
						asset.frameDuration,
						asset.looped
					)

					var frameId = Math.round( appearance.animationOffset * ( assetNumFrames - 1 ) ),
						frameOffset = asset.frameOffsets[ frameId ]

					context.drawSubTexture( texture, frameOffset[ 0 ], frameOffset[ 1 ], assetFrameWidth, assetFrameHeight, -0.5, -0.5, 1, 1 )
				}

				// draw children
				var children = childrenComponents[ id ]

				if( children ) {
					var childrenIds    = children.ids,
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

		var createCameraDimensions = function( camera, transform ) {
			return ( camera && transform ?
				[ camera.width * transform.scale[ 0 ], camera.height * transform.scale[ 1 ] ] :
				undefined
			)
		}

		var setCamera = function( context, cameraDimensions, position ) {
			// setting up the camera geometry
			var halfWidth  = cameraDimensions[ 0 ] / 2,
				halfHeight = cameraDimensions[ 1 ] / 2

			mat4.ortho( -halfWidth, halfWidth, -halfHeight, halfHeight, 0, 100, tmpMat4 )

			// translating with the inverse camera position
			vec2.set( position, tmpVec3 )
			mat4.translate( tmpMat4, vec2.negate( tmpVec3 ) )

			context.setViewMatrix( tmpMat4 )
		}

		var process = function( globals, timeInMs, deltaTimeInMs ) {
			var context = this.context,
				cameras = this.cameras,
				drawVisualObjectPartial = this.drawVisualObjectPartial

			// set the camera
			var activeCameraId   = getActiveCameraId( cameras ),
				camera           = cameras[ activeCameraId ],
				cameraTransform  = this.transforms[ activeCameraId ],
				cameraDimensions = createCameraDimensions( camera, cameraTransform )

			if( cameraDimensions && cameraTransform ) {
				setCamera( context, cameraDimensions, cameraTransform.translation )
			}

			// clear color buffer
			context.clear()

			// TODO: visualObjects should be presorted on the component list level by a user defined index, not here on every rendering tick
			_.each(
				createSortedByLayer( this.roots, this.visualObjects ),
				function( visualObject ) {
					drawVisualObjectPartial( deltaTimeInMs, visualObject.id, drawVisualObjectPartial )
				}
			)

			// draw coordinate grid
			var configurationManager = this.configurationManager

			if( configurationManager.drawCoordinateGrid &&
				cameraDimensions &&
				cameraTransform ) {

				drawCoordinateGrid( context, configurationManager.screenSize, cameraDimensions, cameraTransform )
			}
		}

		var init = function( globals ) {}

		var cleanUp = function( globals ) {}


		/**
		 * public
		 */

		var Renderer = function( globals ) {
			this.configurationManager = globals.configurationManager
			this.assets               = globals.assets
			this.resources            = globals.resources
			this.context              = globals.renderingContext
			this.drawVisualObjectPartial = _.bind(
				drawVisualObject,
				null,
				this.context,
				this.assets,
				this.resources,
				this.transforms,
				this.appearances,
				this.animatedAppearances,
				this.childrenComponents,
				this.visualObjects
			)

			var eventManager = globals.eventManager,
				context = this.context,
				screenSize = this.configurationManager.screenSize

			// setting up the view space matrix
			context.setViewMatrix( createWorldToViewMatrix( tmpMat4, screenSize ) )

			// setting up the viewport
			var viewportPositionX = 0,
				viewportPositionY = 0

			context.viewport( viewportPositionX, viewportPositionY, screenSize[ 0 ], screenSize[ 1 ] )

			eventManager.subscribe(
				Events.SCREEN_RESIZED,
				_.bind(
					function( screenWidth, screenHeight ) {
						context.resizeColorBuffer( screenWidth, screenHeight )
						context.viewport( viewportPositionX, viewportPositionY, screenWidth, screenHeight )
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
