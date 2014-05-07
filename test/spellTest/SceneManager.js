define(
	[
		'spell/SceneManager'
	],
	function(
		SceneManager
	) {
		'use strict'

		var eventManager = {
			EVENT : {},
			subscribe: function() {},
			unsubscribe: function () {},
			waitFor: function() { return eventManager },
			resume: function() { return eventManager  },
			and: function() { return eventManager }
		}

		var libraryManager = {
			loadLibraryRecords: function() {}
		}

		var spell               = {
				scenes: {},
				configurationManager: {
					getValue: function( key ) { if ( key == 'loadingScene' ) { return 'test.loadingScene ' } }
				},
				eventManager: eventManager,
				libraryManager: libraryManager
			},
			entityManager       = {
			},
			statisticsManager   = {},
			libraryManager      = libraryManager,
			mainLoop            = {
				setPreNextFrame: function( cb ) { cb.call() }
			},
			sendMessageToEditor = undefined,
			isModeDevelopment = false

		var sceneManager = new SceneManager(
			spell,
			entityManager,
			statisticsManager,
			libraryManager,
			mainLoop,
			sendMessageToEditor,
			isModeDevelopment
		)

		describe( 'spell/SceneManager', function( ) {
			var sandbox

			beforeEach(function() {
				sandbox = sinon.sandbox.create()
			})

			afterEach(function() {
				sandbox.restore()
			})


			it( 'loadSceneData should construct a sceneData object from a sceneId', function( done ) {

				 sandbox.stub( libraryManager, 'loadLibraryRecords' )
					 .withArgs( 'test.Scene' )
					 .callsArgWith( 1, null, {
						'test.Scene': {
							'entities': [
								{
									name: "testEntity",
									entityTemplateId: "test.entityTemplate"
								}
							]
						},
						'test.entityTemplate': {
							config: {
								'testComponent': {
									'testAttribute': 'xyz'
								}
							}
						}
					}
				 )

				sceneManager.loadSceneData(
					'test.Scene',
					function( err, data ) {
						expect( err ).to.not.exist
						expect( data ).to.exists

						expect( data ).to.have.property( 'entities' )
						expect( data[ 'entities' ] ).to.have.length( 1 )

						expect( data ).to.have.deep.property('entities[0].name', 'testEntity')
						expect( data ).to.have.deep.property('entities[0].config.testComponent.testAttribute', 'xyz')


						done()
					}
				)

			})

			it( 'loadSceneData fails if loadLibraryRecords fails', function( done ) {

				sandbox .stub( libraryManager, 'loadLibraryRecords' )
						.callsArgWith( 1, 'Error', null )

				sceneManager.loadSceneData(
					'test.Scene',
					function( err, data ) {
						expect( err ).to.exist
						expect( data ).to.not.exists

						done()
					}
				)
			})


			it( 'loadSceneData fails if the scene is not included in the result', function( done ) {
				sandbox.stub( libraryManager, 'loadLibraryRecords' )
					.callsArgWith( 1, null, {
						'test.AnotherScene': {
							'entites': []
						}
					}
				)

				sceneManager.loadSceneData(
					'test.Scene',
					function( err, data ) {
						expect( err ).to.exist
						expect( data ).to.not.exists

						done()
					}
				)

			})
		})
})
