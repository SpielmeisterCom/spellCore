define(
	'spell/shared/util/scene/SceneManager',
	[
		'spell/shared/util/Events',
		'spell/shared/util/scene/Scene',

		'spell/functions'
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

		var SceneManager = function( spell, EntityManager, templateManager, mainLoop ) {
			this.EntityManager   = EntityManager
			this.templateManager = templateManager
			this.mainLoop        = mainLoop
			this.spell           = spell
			this.activeScene     = null
		}

		SceneManager.prototype = {
			startScene: function( sceneConfig, anonymizeModuleIds ) {
				var scene = new Scene( this.spell, this.EntityManager, this.templateManager, anonymizeModuleIds )
				scene.init( sceneConfig )

				this.mainLoop.setRenderCallback( _.bind( scene.render, scene ) )
				this.mainLoop.setUpdateCallback( _.bind( scene.update, scene ) )

				this.activeScene = scene
			},
			restartSystem: function( systemId ) {
				this.activeScene.restartSystem( systemId )
			}
		}

		return SceneManager
	}
)
