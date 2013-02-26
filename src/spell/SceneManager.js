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


		var postLoadedResources = function( spell, entityManager, templateManager, statisticsManager, isModeDevelopment, sceneId, initialConfig ) {
			var sceneConfig = spell.scenes[ sceneId ]

			if( !sceneConfig ) {
				throw 'Error: Could not find scene configuration for scene "' + sceneId + '".'
			}

			var scene = new Scene( spell, entityManager, templateManager, statisticsManager, isModeDevelopment, sceneConfig, initialConfig )

			scene.init()

			this.mainLoop.setRenderCallback( _.bind( scene.render, scene ) )
			this.mainLoop.setUpdateCallback( _.bind( scene.update, scene ) )

			this.activeScene = scene

			this.loadingPending = false
			this.processCmdQueue()
		}

		var SceneManager = function( spell, entityManager, statisticsManager, templateManager, mainLoop, sendMessageToEditor, isModeDevelopment ) {
			this.activeScene
			this.entityManager       = entityManager
			this.mainLoop            = mainLoop
			this.sendMessageToEditor = sendMessageToEditor
			this.spell               = spell
			this.statisticsManager   = statisticsManager
			this.templateManager     = templateManager
			this.isModeDevelopment   = isModeDevelopment
			this.cmdQueue            = []
			this.loadingPending      = false
		}

		SceneManager.prototype = {
			startScene : function( startSceneId, initialConfig, showLoadingScene ) {
				var freeMemory = showLoadingScene

				var preNextFrameCallback = function() {
					var spell = this.spell

					if( this.activeScene ) {
						this.mainLoop.setRenderCallback()
						this.mainLoop.setUpdateCallback()
						this.activeScene.destroy()
						this.entityManager.init()
						this.activeScene = undefined

						if( freeMemory &&
							!spell.configurationManager.getValue( 'platform.hasPlentyRAM' ) ) {

							spell.assetManager.free()
							spell.libraryManager.free()
						}

						spell.statisticsManager.reset()
					}

					var onProgress = this.sendMessageToEditor ?
						_.bind( this.sendMessageToEditor, null, 'spelled.loadingProgress' ) :
						undefined

					this.cmdQueue = []
					this.loadingPending = true


					// check if library dependencies of next scene are already available
					var nextScene = spell.scenes[ startSceneId ]

					if( nextScene &&
						spell.libraryManager.isAvailable( nextScene.libraryIds ) ) {

						// perform direct transition
						postLoadedResources.call(
							this,
							spell,
							this.entityManager,
							this.templateManager,
							this.statisticsManager,
							this.isModeDevelopment,
							startSceneId,
							initialConfig
						)

					} else {
						var loadingSceneId = spell.configurationManager.getValue( 'loadingScene' )

						if( showLoadingScene &&
							loadingSceneId ) {

							loadSceneResources(
								spell,
								loadingSceneId,
								_.bind(
									postLoadedResources,
									this,
									spell,
									this.entityManager,
									this.templateManager,
									this.statisticsManager,
									this.isModeDevelopment,
									loadingSceneId,
									{
										startSceneId : startSceneId,
										initialConfig : initialConfig
									}
								),
								onProgress
							)

						} else {
							// load library dependencies first
							loadSceneResources(
								spell,
								startSceneId,
								_.bind(
									postLoadedResources,
									this,
									spell,
									this.entityManager,
									this.templateManager,
									this.statisticsManager,
									this.isModeDevelopment,
									startSceneId,
									initialConfig
								),
								onProgress
							)
						}
					}
				}

				this.mainLoop.setPreNextFrame( _.bind( preNextFrameCallback, this ) )
			},

			processCmdQueue : function() {
				if( this.loadingPending ) {
					return
				}

				var cmdQueue = this.cmdQueue

				for( var i = 0; i < cmdQueue.length; i++ ) {
					var cmd = cmdQueue[ i ]

					this.activeScene[ cmd.fn ].apply( this.activeScene, cmd.args )
				}

				cmdQueue.length = 0
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
