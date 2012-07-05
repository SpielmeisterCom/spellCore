define(
	"funkysnakes/client/systems/Renderer",
	[
		"funkysnakes/client/systems/shieldRenderer",
		"funkysnakes/shared/config/constants",
		"spell/shared/util/Events",
        "spell/client/util/font/fonts/BelloPro",
        "spell/client/util/font/createFontWriter",

		"spell/math/vec3",
		"spell/math/mat4",
		'spell/functions'
	],
	function(
		shieldRenderer,
		constants,
		Events,
        BelloPro,
        createFontWriter,

		vec3,
		mat4,
		_
	) {
		"use strict"


		/*
		 * private
		 */

		var createEntitiesSortedByPath = function( entitiesByPass ) {
			var passA, passB

			return _.toArray( entitiesByPass ).sort(
				function( a, b ) {
					passA = a[ 0 ].renderData.pass
					passB = b[ 0 ].renderData.pass

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

		var shadowOffset = vec3.create( [ 3, -2, 0 ] ),
			position     = vec3.create( [ 0, 0, 0 ] )


		var process = function(
			timeInMs,
			deltaTimeInMs,
			entitiesByPass,
			shieldEntities,
            textEntities
		) {
			var context       = this.context,
				textures      = this.textures,
				texture       = undefined,
				shadowTexture = undefined,
				drewShields   = false,
                fontWriter    = this.fontWriter

			// clear color buffer
			context.clear()


			_.each(
				createEntitiesSortedByPath( entitiesByPass ),
				function( entities ) {
					// draw shadows
					_.each(
						entities, function( entity ) {
							if( !entity.hasOwnProperty( "shadowCaster" ) ) return

							var entityRenderData = entity.renderData

							shadowTexture = textures[ entity.shadowCaster.textureId ]

							context.save()
							{
								context.setGlobalAlpha( 0.85 )

								vec3.reset( position )
								vec3.add( entityRenderData.position, shadowOffset, position )

								// object to world space transformation go here
								context.translate( position )
								context.rotate( entityRenderData.orientation )

								// "appearance" transformations go here
								context.translate( entity.appearance.translation )
								context.scale( [ shadowTexture.width, shadowTexture.height, 1 ] )

								context.drawTexture( shadowTexture, 0, 0, 1, 1 )
							}
							context.restore()
						}
					)

					// HACK: until animated appearances are supported shield rendering has to happen right before the "widget pass"
					if( !drewShields &&
						entities.length > 0 &&
						entities[ 0 ].renderData.pass === 100 ) {

						shieldRenderer( timeInMs, textures, context, shieldEntities )
						drewShields = true
					}

					// draw textures
					_.each(
						entities,
						function( entity ) {
							context.save()
							{
								var entityRenderData  = entity.renderData,
									entityAppearance  = entity.appearance,
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
									texture = textures[ entityAppearance.textureId ]

									if( texture === undefined ) throw "The textureId '" + entityAppearance.textureId + "' could not be resolved."


									if( appearanceOpacity !== 1.0 ||
											renderDataOpacity !== 1.0 ) {

										context.setGlobalAlpha( appearanceOpacity * renderDataOpacity )
									}

									// object to world space transformation go here
									context.translate( entityRenderData.position )
									context.rotate( entityRenderData.orientation )

									// "appearance" transformations go here
									context.translate( entityAppearance.translation )
									context.scale( [ texture.width, texture.height, 1 ] )

									context.drawTexture( texture, 0, 0, 1, 1 )
								}
							}
							context.restore()
						}
					)

//					// draw origins
//					context.setFillStyleColor( [ 1.0, 0.0, 1.0 ] )
//
//					_.each(
//						entities,
//						function( entity ) {
//							var entityRenderData = entity.renderData
//
//							context.save()
//							{
//								// object to world space transformation go here
//								context.translate( entityRenderData.position )
//								context.rotate( entityRenderData.orientation )
//
//								context.fillRect( -2, -2, 4, 4 )
//							}
//							context.restore()
//						}
//					)
				}
			)

//            _.each(
//                textEntities,
//                function( entity ) {
//                    var rgbColor = [
//                        1,
//                        0,
//                        0
//                    ]
//
//                    fontWriter.drawString(
//                        context,
//                        entity.text.value,
//                        rgbColor,
//                        1,
//                        entity.position
//                    )
//                }
//            )
		}

		/*
		 * public
		 */

		var Renderer = function(
			eventManager,
			textures,
			context
		) {
			this.textures        = textures
			this.context         = context
            this.fontWriter      = createFontWriter( BelloPro, textures[ "ttf/BelloPro_0.png" ]  )

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
