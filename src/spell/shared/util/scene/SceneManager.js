define(
	'spell/shared/util/scene/SceneManager',
	[
		'spell/client/loading/loadSceneResources',
		'spell/shared/util/scene/Scene',

		'spell/functions'
	],
	function(
		loadSceneResources,
		Scene,

		_
	) {
		'use strict'


		var postLoadedResources = function( spell, entityManager, templateManager, anonymizeModuleIds, sceneId ) {
			var scene       = new Scene( spell, entityManager, templateManager, anonymizeModuleIds ),
				sceneConfig = spell.scenes[ sceneId ]

			if( !sceneConfig ) {
				throw 'Error: Could not find scene configuration for scene \'' + sceneId + '\'.'
			}

			scene.init( sceneConfig )

			this.mainLoop.setRenderCallback( _.bind( scene.render, scene ) )
			this.mainLoop.setUpdateCallback( _.bind( scene.update, scene ) )

			this.activeScene = scene
		}

		var SceneManager = function( spell, entityManager, templateManager, mainLoop, sendMessageToEditor ) {
			this.activeScene
			this.entityManager       = entityManager
			this.mainLoop            = mainLoop
			this.sendMessageToEditor = sendMessageToEditor
			this.spell               = spell
			this.templateManager     = templateManager
		}

		SceneManager.prototype = {
			startScene: function( sceneId, anonymizeModuleIds ) {
				var onProgress = this.sendMessageToEditor ?
					_.bind( this.sendMessageToEditor, null, 'spell.loadingProgress' ) :
					undefined

				loadSceneResources(
					this.spell,
					sceneId,
					_.bind( postLoadedResources, this, this.spell, this.entityManager, this.templateManager, anonymizeModuleIds, sceneId ),
					onProgress
				)
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
