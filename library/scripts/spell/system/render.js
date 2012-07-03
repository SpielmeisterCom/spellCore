define(
	'spell/system/render',
	[
		'spell/shared/util/Events',

		'spell/math/vec2',
		'spell/math/vec3',
		'spell/math/mat4',

		'spell/shared/util/platform/underscore'
	],
	function(
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

		var tmp             = vec3.create(),
			currentCameraId = undefined

		var createWorldToViewMatrix = function( matrix, aspectRatio ) {
			// world space to view space matrix
			var cameraWidth  = 1024,
				cameraHeight = 768

			mat4.ortho(
				0,
				cameraWidth,
				0,
				cameraHeight,
				0,
				1000,
				matrix
			)

			mat4.translate( matrix, [ 0, 0, 0 ] ) // camera is located at (0/0/0); WATCH OUT: apply inverse translation
		}

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
				vec2.set( transform.translation, tmp )
				context.translate( tmp )

				context.rotate( transform.rotation )

				if( asset.type === 'appearance' ) {
					vec2.multiply( transform.scale, [ texture.width, texture.height ], tmp )
					context.scale( tmp )

					context.drawTexture( texture, -0.5, -0.5, 1, 1 )

				} else {
					// asset.type === 'animation'

					var assetFrameWidth  = asset.frameWidth,
						assetFrameHeight = asset.frameHeight,
						assetNumFrames   = asset.numFrames

					vec2.multiply( transform.scale, [ assetFrameWidth, assetFrameHeight ], tmp )
					context.scale( tmp )

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

		var setCamera = function( context, cameras, transforms, worldToView ) {
			if( _.size( cameras ) === 0 ) return

			// Gets the first active camera. More than one camera being active is an undefined state and the first found active is used.
			var activeCameraId = undefined

			var activeCamera = _.find(
				cameras,
				function( camera, id ) {
					if( camera.active ) {
						activeCameraId = id

						return true
					}

					return false
				}
			)

			if( currentCameraId === activeCameraId ) return

			currentCameraId = activeCameraId

			// setting up the camera geometry
			var halfWidth  = activeCamera.width / 2,
				halfHeight = activeCamera.height / 2

			mat4.ortho( -halfWidth, halfWidth, -halfHeight, halfHeight, 0, 100, worldToView )

			// translating with the inverse camera position
			vec2.set( transforms[ currentCameraId ].translation, tmp )
			mat4.translate( worldToView, vec2.negate( tmp ) )

			context.setViewMatrix( worldToView )
		}

		var process = function( globals, timeInMs, deltaTimeInMs ) {
			var context = this.context,
				drawVisualObjectPartial = this.drawVisualObjectPartial

			// clear color buffer
			context.clear()

			setCamera( context, this.cameras, this.transforms, this.worldToView )

			// TODO: visualObjects should be presorted on the component list level by a user defined index, not here on every rendering tick
			_.each(
				createSortedByLayer( this.roots, this.visualObjects ),
				function( visualObject ) {
					drawVisualObjectPartial( deltaTimeInMs, visualObject.id, drawVisualObjectPartial )
				}
			)
		}

		var init = function( globals ) {}

		var cleanUp = function( globals ) {}


		/**
		 * public
		 */

		var Renderer = function( globals ) {
			this.assets    = globals.assets
			this.resources = globals.resources
			this.context   = globals.renderingContext
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
				context = this.context

			// setting up the view space matrix
			this.worldToView = mat4.create()
			mat4.identity( this.worldToView )
			createWorldToViewMatrix( this.worldToView, 4 / 3 )
			context.setViewMatrix( this.worldToView )

			// setting up the viewport
			var viewportPositionX = 0,
				viewportPositionY = 0,
				maxWidth = 1024,
				maxHeight = 768

			context.viewport( viewportPositionX, viewportPositionY, maxWidth, maxHeight )

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
