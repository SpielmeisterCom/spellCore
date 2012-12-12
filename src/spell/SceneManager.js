define(
	'spell/SceneManager',
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


		var postLoadedResources = function( spell, entityManager, templateManager, isModeDevelopment, sceneId, sceneData ) {
			var sceneConfig = spell.scenes[ sceneId ]

			if( !sceneConfig ) {
				throw 'Error: Could not find scene configuration for scene \'' + sceneId + '\'.'
			}

			var scene = new Scene( spell, entityManager, templateManager, isModeDevelopment, sceneConfig, sceneData )


			scene.init( sceneConfig, sceneData )

			this.mainLoop.setRenderCallback( _.bind( scene.render, scene ) )
			this.mainLoop.setUpdateCallback( _.bind( scene.update, scene ) )

			this.activeScene = scene

			this.loadingPending = false
			this.processCmdQueue()
		}

		var SceneManager = function( spell, entityManager, templateManager, mainLoop, sendMessageToEditor, isModeDevelopment ) {
			this.activeScene
			this.entityManager       = entityManager
			this.mainLoop            = mainLoop
			this.sendMessageToEditor = sendMessageToEditor
			this.spell               = spell
			this.templateManager     = templateManager
			this.isModeDevelopment   = isModeDevelopment
			this.cmdQueue            = []
			this.loadingPending      = false
		}

		SceneManager.prototype = {
			startScene : function( sceneId, sceneData ) {
				var preNextFrame = function() {
					if( this.activeScene ) {
						this.mainLoop.setRenderCallback()
						this.mainLoop.setUpdateCallback()
						this.activeScene.destroy()
						this.entityManager.reset()
						this.activeScene = null
					}

					var onProgress = this.sendMessageToEditor ?
						_.bind( this.sendMessageToEditor, null, 'spelled.loadingProgress' ) :
						undefined

					this.cmdQueue = []
					this.loadingPending = true

					loadSceneResources(
						this.spell,
						sceneId,
						_.bind(
							postLoadedResources,
							this,
							this.spell,
							this.entityManager,
							this.templateManager,
							this.isModeDevelopment,
							sceneId,
							sceneData
						),
						onProgress
					)
				}

				this.mainLoop.setPreNextFrame( _.bind( preNextFrame, this ) )
			},

			processCmdQueue : function() {
				if( this.loadingPending ) {
					return
				}

				for( var i=0; i < this.cmdQueue.length; i++) {
					var cmd = this.cmdQueue[ i ]

					this.activeScene[ cmd.fn ].apply( this.activeScene, cmd.args )
				}

				this.cmdQueue.length = 0
			},

			addSystem : function( systemId, executionGroupId, index, systemConfig ) {
				this.cmdQueue.push( {
					fn   : 'addSystem',
					args : [ systemId, executionGroupId, index, systemConfig ]
				} )

				this.processCmdQueue()
			},

			moveSystem : function( systemId, srcExecutionGroupId, dstExecutionGroupId, dstIndex ) {
				this.cmdQueue.push( {
					fn   : 'moveSystem',
					args : [ systemId, srcExecutionGroupId, dstExecutionGroupId, dstIndex ]
				} )

				this.processCmdQueue()
			},

			removeSystem : function( systemId, executionGroupId ) {
				this.cmdQueue.push( {
					fn   : 'removeSystem',
					args : [ systemId, executionGroupId ]
				} )

				this.processCmdQueue()
			},

			restartSystem : function( systemId, executionGroupId, systemConfig ) {
				this.cmdQueue.push( {
					fn   : 'restartSystem',
					args : [ systemId, executionGroupId, systemConfig ]
				} )

				this.processCmdQueue()
			},

			updateSystem : function( systemId, executionGroupId, systemConfig ) {
				this.cmdQueue.push( {
					fn   : 'updateSystem',
					args : [ systemId, executionGroupId, systemConfig ]
				} )

				this.processCmdQueue()
			}
		}

		return SceneManager
	}
)
