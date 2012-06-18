define(
	'spell/system/render',
	[
		'spell/shared/util/Events',

		'glmatrix/vec2',
		'glmatrix/vec3',
		'glmatrix/mat4',

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

		var createSortedByPass = function( renderDatas ) {
			return _.reduce(
				renderDatas,
				function( memo, renderData, id ) {
					return memo.concat( {
						id : id,
						value : renderData
					} )
				},
				[]
			).sort(
				function( a, b ) {
					var passA = a.value.pass
					var passB = b.value.pass

					return ( passA < passB ? -1 : ( passA > passB ? 1 : 0 ) )
				}
			)
		}

		var draw = function( context, textures, positions, rotations, appearancesSortedByPass ) {
			_.each(
				appearancesSortedByPass,
				function( appearanceSortedByPass ) {
					var id         = appearanceSortedByPass.id,
						appearance = appearanceSortedByPass.value

					context.save()
					{
						var texture = textures[ appearance.textureId ]

						if( !texture ) throw 'The texture id \'' + appearance.textureId + '\' could not be resolved.'


						if( appearance.opacity !== 1.0 ) {
							context.setGlobalAlpha( appearance.opacity )
						}
						// object to world space transformation go here
//						context.rotate( renderData.rotation )

						vec2.set( positions[ id ], tmp )
						context.translate( tmp )

//						vec2.set( renderData.scale, tmp ) // vec2 -> vec3
//						context.scale( tmp )


						// appearance transformations go here
						context.rotate( appearance.rotation + rotations[ id ] )

						vec2.set( appearance.translation, tmp ) // vec2 -> vec3
						context.translate( tmp )

						vec2.multiply( appearance.scale, [ texture.width, texture.height ], tmp )
						context.scale( tmp )


						context.drawTexture( texture, -0.5, -0.5, 1, 1 )
					}
					context.restore()
				}
			)

//			// draw origins
//			context.setFillStyleColor( [ 1.0, 0.0, 1.0 ] )
//
//			_.each(
//				entities,
//				function( entity ) {
//					var renderData = entity.renderData
//
//					context.save()
//					{
//						// object to world space transformation go here
//						context.translate( renderData.position )
//						context.rotate( renderData.orientation )
//
//						context.fillRect( -2, -2, 4, 4 )
//					}
//					context.restore()
//				}
//			)
		}

		var setCamera = function( context, cameras, worldToView ) {
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
			vec2.set( activeCamera.position, tmp )
			mat4.translate( worldToView, vec2.negate( tmp ) )

			context.setViewMatrix( worldToView )
		}

		var process = function( globals, timeInMs, deltaTimeInMs ) {
			var context = this.context

			// clear color buffer
			context.clear()

			setCamera( context, this.cameras, this.worldToView )

			// TODO: renderData should be presorted on the component list level by a user defined index, not here on every rendering tick
			draw( context, this.textures, this.positions, this.rotations, createSortedByPass( this.appearances ) )
		}

		var init = function( globals ) {}

		var cleanUp = function( globals ) {}


		/**
		 * public
		 */

		var Renderer = function( globals, positions, rotations, appearances, cameras ) {
			this.textures    = globals.resources
			this.context     = globals.renderingContext
			this.positions   = positions
			this.rotations   = rotations
			this.appearances = appearances
			this.cameras     = cameras

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
