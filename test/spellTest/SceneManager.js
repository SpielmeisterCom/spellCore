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
				load: function() { }
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
            it( 'startScene should load scene resources and start the scene', function( done ) {
	            console.log( sceneManager.startScene )
				sceneManager.startScene( 'test.Scene', {}, false )
            })
		})
})
