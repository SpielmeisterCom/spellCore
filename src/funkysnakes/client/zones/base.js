define(
	'funkysnakes/client/zones/base',
	[
		"funkysnakes/client/systems/updateRenderData",
		'funkysnakes/client/systems/Renderer',

		'spell/shared/util/entities/Entities',
		'spell/shared/util/entities/datastructures/passIdMultiMap',
		'spell/shared/util/zones/ZoneEntityManager',
		'spell/shared/util/Events',

		'underscore'
	],
	function(
		updateRenderData,
		Renderer,

		Entities,
		passIdMultiMap,
		ZoneEntityManager,
		Events,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		function updateTextures( renderingContext, resources, textures ) {
			// TODO: the resource loader should create spell texture object instances instead of raw html images

			// HACK: creating textures out of images
			_.each(
				resources,
				function( resource, resourceId ) {
					var extension =  _.last( resourceId.split( '.' ) )
					if( extension === 'png' || extension === 'jpg' ) {
						textures[ resourceId.replace(/images\//g, '') ] = renderingContext.createTexture( resource )
					}
				}
			)

			return textures
		}

		function update(
			globals,
			timeInMs,
			dtInS
		) {
		}

		function render(
			globals,
			timeInMs,
			deltaTimeInMs
		) {
			var entities = this.entities,
				queryIds = this.queryIds

			updateRenderData(
				entities.executeQuery( queryIds[ "updateRenderData" ][ 0 ] ).elements
			)

			this.renderer.process(
				timeInMs,
				deltaTimeInMs,
				entities.executeQuery( queryIds[ "render" ][ 0 ] ).multiMap,
				[]
			)
		}

		return {
			onCreate: function( globals, zoneConfig ) {
				var eventManager         = globals.eventManager,
					configurationManager = globals.configurationManager,
					statisticsManager    = globals.statisticsManager,
					resourceLoader       = globals.resourceLoader,
					zoneManager          = globals.zoneManager

				var entities  = new Entities()
				this.entities = entities

				var entityManager  = new ZoneEntityManager( globals.entityManager, this.entities )
				this.entityManager = entityManager

				this.renderer = new Renderer( eventManager, globals.textures, globals.renderingContext )


				this.queryIds = {
					render: [
						entities.prepareQuery( [ "position", "appearance", "renderData" ], passIdMultiMap )
					],
					updateRenderData: [
						entities.prepareQuery( [ "position", "renderData" ] )
					]
				}


				this.renderCallback = _.bind( render, this, globals )
				this.updateCallback = _.bind( update, this, globals )

				eventManager.subscribe( Events.RENDER_UPDATE, this.renderCallback )
				eventManager.subscribe( [ Events.LOGIC_UPDATE, '20' ], this.updateCallback )


				if( _.size( zoneConfig.resources ) === 0 ) return


				eventManager.subscribe(
					[ Events.RESOURCE_LOADING_COMPLETED, 'zoneResources' ],
					function() {
						updateTextures( globals.renderingContext, resourceLoader.getResources(), globals.textures )

						// create default entities from zone config
						_.each(
							zoneConfig.entities,
							function( entityConfig ) {
								entityManager.createEntity( entityConfig.blueprintId, entityConfig.config )
							}
						)
					}
				)

				// trigger loading of zone resources
				resourceLoader.addResourceBundle( 'zoneResources', zoneConfig.resources )
				resourceLoader.start()
			},

			onDestroy: function( globals ) {
				var eventManager = globals.eventManager

				eventManager.unsubscribe( Events.RENDER_UPDATE, this.renderCallback )
				eventManager.unsubscribe( [ Events.LOGIC_UPDATE, '20' ], this.updateCallback )
			}
		}
	}
)
