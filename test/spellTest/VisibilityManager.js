define(
	[
		'spell/EventManager',
		'spell/VisibilityManager',
		'spell/Defines',
		'spell/functions'
	],
	function(
		EventManager,
		VisibilityManager,
	    Defines,
	    _
		) {
		'use strict'

			var eventManager = new EventManager()

			var configurationManagerMock = {
				getValue : function( key ) {
					if ( key == 'currentScreenSize' ) {
						return [ 800, 600 ]
					}
				}
			}

			var entityManagerMock = {
				componentMaps : {},
				getEntityDimensions : function() {
					return [100, 100]
				}
			}

			describe( 'spell/VisibilityManager', function( ) {

				it( 'should correctly register and unregister for screen resize events', function( done ) {
					var visibilityManager = new VisibilityManager(
						eventManager, configurationManagerMock, entityManagerMock
					)
					visibilityManager.init()

					expect(visibilityManager.screenSize[0]).to.equal(800)
					expect(visibilityManager.screenSize[1]).to.equal(600)

					//check if screenResizing are correctly handled
					eventManager.publish( eventManager.EVENT.SCREEN_RESIZE, [ [100, 200] ] )

					expect(visibilityManager.screenSize[0]).to.equal(100)
					expect(visibilityManager.screenSize[1]).to.equal(200)

					visibilityManager.destroy()

					eventManager.publish( eventManager.EVENT.SCREEN_RESIZE, [ [200, 300] ] )
					expect(visibilityManager.screenSize).to.be.undefined


					done()
				})

			it( 'should correctly register and unregister for camera changed events', function( done ) {
				var visibilityManager = new VisibilityManager(
					eventManager, configurationManagerMock, entityManagerMock
				)
				visibilityManager.init()

				eventManager.publish( [ eventManager.EVENT.COMPONENT_CREATED, Defines.CAMERA_COMPONENT_ID ], [ {
					'active': true
				}, 1 ] )

				expect(visibilityManager.currentCameraId).to.equal(1)

				visibilityManager.destroy()

				eventManager.publish( [ eventManager.EVENT.COMPONENT_CREATED, Defines.CAMERA_COMPONENT_ID ], [ {
					'active': true
				}, 2 ] )

				expect(visibilityManager.currentCameraId).to.be.undefined

				done()
			})
/*
			it( 'should update the boxtree when a visualobject component is created, updated and removed', function( done ) {
				var visibilityManager = new VisibilityManager(
					eventManager, configurationManagerMock, entityManagerMock
				)
				visibilityManager.init()

				var visualComponent = {

				},
				entityId = 1

				eventManager.publish(
					[ eventManager.EVENT.COMPONENT_CREATED, Defines.VISUAL_OBJECT_COMPONENT_ID ],
					[ visualComponent, entityId ]
				)


				eventManager.publish(
					[ eventManager.EVENT.COMPONENT_UPDATED, Defines.VISUAL_OBJECT_COMPONENT_ID ],
					[ visualComponent, entityId ] )


				eventManager.publish(
					[ eventManager.EVENT.COMPONENT_REMOVED, Defines.VISUAL_OBJECT_COMPONENT_ID ],
					entityId
				)

				visibilityManager.destroy()


				done()
			})

			it( 'should update the boxtree when a transform component is created, updated and removed', function( done ) {
				var visibilityManager = new VisibilityManager(
					eventManager, configurationManagerMock, entityManagerMock
				)
				visibilityManager.init()

				var transformComponent = {
					translation: [ 0, 0 ],
					scale: 1,
					rotation: 0
					},
					entityId = 1

				eventManager.publish(
					[ eventManager.EVENT.COMPONENT_CREATED, Defines.TRANSFORM_COMPONENT_ID ],
					[ transformComponent, entityId ]
				)


				eventManager.publish(
					[ eventManager.EVENT.COMPONENT_UPDATED, Defines.TRANSFORM_COMPONENT_ID ],
					[ transformComponent, entityId ] )


				eventManager.publish(
					[ eventManager.EVENT.COMPONENT_REMOVED, Defines.TRANSFORM_COMPONENT_ID ],
					entityId
				)

				visibilityManager.destroy()

				done()
			})

			it( 'should update the boxtree when a composite component is created, updated and removed', function( done ) {
				//COMPOSITE_COMPONENT_ID
			})



			it( 'should update the boxtree when an entity is created and removed', function( done ) {
				//COMPOSITE_COMPONENT_ID
				//if parentId Changes
			})

*/


		})
	})
