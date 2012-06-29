define(
	'spell/shared/util/scene/SceneManager',
	[
		'spell/shared/util/Events',
		'spell/shared/util/scene/Scene',

		'spell/shared/util/platform/underscore'
	],
	function(
		Events,
		Scene,

		_
	) {
		'use strict'


		/*
		 * public
		 */

		var SceneManager = function( globals, mainLoop ) {
			this.globals          = globals
			this.mainLoop         = mainLoop
		}

		SceneManager.prototype = {
			startScene: function( sceneConfig ) {
				var scene = new Scene( this.globals )
				scene.init( this.globals, sceneConfig )

				this.mainLoop.setRenderCallback( _.bind( scene.render, scene ) )
				this.mainLoop.setUpdateCallback( _.bind( scene.update, scene ) )
			}
		}

		return SceneManager
	}
)
