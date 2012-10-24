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
			addSystem: function( systemId, executionGroupId, index, systemConfig ) {
				this.activeScene.addSystem( systemId, executionGroupId, index, systemConfig )
			},
			moveSystem: function( systemId, srcExecutionGroupId, dstExecutionGroupId, dstIndex ) {
				this.activeScene.moveSystem( systemId, srcExecutionGroupId, dstExecutionGroupId, dstIndex )
			},
			removeSystem: function( systemId, executionGroupId ) {
				this.activeScene.removeSystem( systemId, executionGroupId )
			},
			restartSystem: function( systemId, executionGroupId, systemConfig ) {
				this.activeScene.restartSystem( systemId, executionGroupId, systemConfig )
			}
		}

		return SceneManager
	}
)
