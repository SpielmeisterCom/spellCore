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

		var SceneManager = function( spell, EntityManager, mainLoop ) {
			this.EntityManager = EntityManager
			this.mainLoop      = mainLoop
			this.spell         = spell
		}

		SceneManager.prototype = {
			startScene: function( sceneConfig, anonymizeModuleIdentifiers ) {
				var scene = new Scene( this.spell, this.EntityManager )
				scene.init( this.spell, sceneConfig, anonymizeModuleIdentifiers )

				this.mainLoop.setRenderCallback( _.bind( scene.render, scene ) )
				this.mainLoop.setUpdateCallback( _.bind( scene.update, scene ) )
			}
		}

		return SceneManager
	}
)
