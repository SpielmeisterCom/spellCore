define(
	'spellTest/VisibilityManager',
	[
		'chai',
		'spell/VisibilityManager',
		'spell/Defines'
	],
	function(
		chai,
		VisibilityManager,
	    Defines
		) {
		'use strict'

		return function( describe, it ) {
			var expect = chai.expect

			var EVENT = {
				SCREEN_RESIZE : 1,
				COMPONENT_CREATED : 2,
				COMPONENT_UPDATED : 3,
				ENTITY_CREATED : 4
			}

			var eventCallback = {
			}

			eventCallback[ EVENT.COMPONENT_CREATED ] = {}
			eventCallback[ EVENT.COMPONENT_UPDATED ] = {}
			eventCallback[ EVENT.ENTITY_CREATED ] = {}

			var eventManagerMock = {
				EVENT: EVENT,

				subscribe: function( event, callback ) {
					expect( callback).to.be.a('function')

					if(event instanceof Array) {
						eventCallback[ event[0] ][ event[1] ] = callback
					} else {
						eventCallback[ event ] = callback
					}
				},

				unsubscribe: function( event, callback ) {
					expect( callback).to.be.a('function')

					if(event instanceof Array) {
						expect( callback).to.equal( eventCallback[ event[0] ][ event[1] ]  )
						eventCallback[ event[0] ][ event[1] ] = undefined

					} else {
						expect( callback).to.equal( eventCallback[ event ]  )
						eventCallback[ event ] = undefined
					}
				}
			}


			var configurationManagerMock = {
				getValue : function( key ) {
					if ( key == 'currentScreenSize' ) {
						return [ 800, 600 ]
					}
				}
			}

			var entityManagerMock = {

			}


			describe( 'spell/VisibilityManager', function( ) {

				it( 'should correctly register and unregister for screen resize events', function( done ) {
					var visibilityManager = new VisibilityManager(
						eventManagerMock, configurationManagerMock, entityManagerMock
					)
					expect( eventCallback[ EVENT.SCREEN_RESIZE ] ).to.be.undefined

					visibilityManager.init()

					expect(visibilityManager.screenSize[0]).to.equal(800)
					expect(visibilityManager.screenSize[1]).to.equal(600)

					//check if screenResizing are correctly handled
					expect( eventCallback[ EVENT.SCREEN_RESIZE ]).to.be.a( 'function' )
					eventCallback[ EVENT.SCREEN_RESIZE ]( [100, 200])

					expect(visibilityManager.screenSize[0]).to.equal(100)
					expect(visibilityManager.screenSize[1]).to.equal(200)

					visibilityManager.destroy()
					expect( eventCallback[ EVENT.SCREEN_RESIZE ] ).to.be.undefined
					expect(visibilityManager.screenSize).to.be.undefined

					done()
				})

			it( 'should correctly register and unregister for camera changed events', function( done ) {
				var visibilityManager = new VisibilityManager(
					eventManagerMock, configurationManagerMock, entityManagerMock
				)
				visibilityManager.init()

				expect( eventCallback[ EVENT.COMPONENT_CREATED ][ Defines.CAMERA_COMPONENT_ID ]).to.be.a('function')
				expect( eventCallback[ EVENT.COMPONENT_UPDATED ][ Defines.CAMERA_COMPONENT_ID ]).to.be.a('function')

				eventCallback[ EVENT.COMPONENT_CREATED ][ Defines.CAMERA_COMPONENT_ID ]({
					'active': true
				}, 1)

				expect(visibilityManager.currentCameraId).to.equal(1)

				visibilityManager.destroy()

				expect(visibilityManager.currentCameraId).to.be.undefined
				expect( eventCallback[ EVENT.COMPONENT_CREATED ][ Defines.CAMERA_COMPONENT_ID ] ).to.be.undefined
				expect( eventCallback[ EVENT.COMPONENT_UPDATED ][ Defines.CAMERA_COMPONENT_ID ] ).to.be.undefined

				done()
			})

			it( 'should correctly register and unregister for visual object changes', function( done ) {
				var visibilityManager = new VisibilityManager(
					eventManagerMock, configurationManagerMock, entityManagerMock
				)
				visibilityManager.init()

				expect( eventCallback[ EVENT.ENTITY_CREATED ][ Defines.VISUAL_OBJECT_COMPONENT_ID ]).to.be.a('function')

				visibilityManager.destroy()
				expect( eventCallback[ EVENT.ENTITY_CREATED ][ Defines.VISUAL_OBJECT_COMPONENT_ID ]).to.be.undefined

				done()
			})



		})
		}
	})
