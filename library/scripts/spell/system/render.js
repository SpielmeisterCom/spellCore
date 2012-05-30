define(
	'spell/system/render',
	[
		'funkysnakes/shared/config/constants',
		'spell/shared/util/Events',

		'glmatrix/vec3',
		'glmatrix/mat4',
		'spell/shared/util/platform/underscore'
	],
	function(
		constants,
		Events,

		vec3,
		mat4,
		_
	) {
		'use strict'


		/**
		 * private
		 */

		var position = vec3.create( [ 0, 0, 0 ]),
			renderDataComponentId = 'spell/component/core/graphics2d/renderData',
			appearanceComponentId = 'spell/component/core/graphics2d/appearance'


		var createEntitiesSortedByPath = function( entitiesByPass ) {
			var passA,
				passB

			return _.toArray( entitiesByPass ).sort(
				function( a, b ) {
					passA = a[ renderDataComponentId ].pass
					passB = b[ renderDataComponentId ].pass

					return ( passA < passB ? -1 : ( passA > passB ? 1 : 0 ) )
				}
			)
		}

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

		var draw = function( context, textures, entities ) {
			_.each(
				entities,
				function( entity ) {
					context.save()
					{
						var entityRenderData  = entity[ renderDataComponentId ],
							entityAppearance  = entity[ appearanceComponentId ],
							renderDataOpacity = entityRenderData.opacity,
							appearanceOpacity = entityAppearance.opacity

						// appearances without a texture id are drawn as colored rectangles
						if( !entityAppearance.textureId &&
							entityAppearance.color ) {

							context.translate( entityRenderData.position )
							context.setFillStyleColor( entityAppearance.color )
							context.fillRect(
								0,
								0,
								entityAppearance.scale[ 0 ],
								entityAppearance.scale[ 1 ]
							)

						} else {
							var texture = textures[ entityAppearance.textureId ]

							if( !texture ) throw 'The texture id \'' + entityAppearance.textureId + '\' could not be resolved.'


							if( appearanceOpacity !== 1.0 ||
									renderDataOpacity !== 1.0 ) {

								context.setGlobalAlpha( appearanceOpacity * renderDataOpacity )
							}

							// object to world space transformation go here
							context.translate( entityRenderData.position )
							context.rotate( entityRenderData.orientation )

							// 'appearance' transformations go here
							context.translate( entityAppearance.translation )
							context.scale( [ texture.width, texture.height, 1 ] )

							context.drawTexture( texture, 0, 0, 1, 1 )
						}
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
//					var entityRenderData = entity.renderData
//
//					context.save()
//					{
//						// object to world space transformation go here
//						context.translate( entityRenderData.position )
//						context.rotate( entityRenderData.orientation )
//
//						context.fillRect( -2, -2, 4, 4 )
//					}
//					context.restore()
//				}
//			)
		}

		var process = function( globals, timeInMs, deltaTimeInMs, entities ) {
			var context = this.context

			// clear color buffer
			context.clear()

			draw( context, this.textures, createEntitiesSortedByPath( entities ) )
		}

		/**
		 * public
		 */

		var Renderer = function( globals ) {
			this.textures = globals.resources
			this.context  = globals.renderingContext

			var eventManager = globals.eventManager,
				context = this.context

			// setting up the view space matrix
			this.worldToView = mat4.create()
			mat4.identity( this.worldToView )
			createWorldToViewMatrix( this.worldToView, 4 / 3 )
			context.setViewMatrix( this.worldToView )

			// setting up the viewport
			var viewportPositionX = 0,
				viewportPositionY = 0

			context.viewport( viewportPositionX, viewportPositionY, constants.maxWidth, constants.maxHeight )

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
			process : process
		}

		return Renderer
	}
)
