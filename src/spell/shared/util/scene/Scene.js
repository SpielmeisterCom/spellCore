define(
	'spell/shared/util/scene/Scene',
	[
		'spell/Defines',
		'spell/data/entity/flatten',
		'spell/data/SortedMap',
		'spell/shared/util/create',
		'spell/shared/util/createId',
		'spell/shared/util/createLibraryFilePathFromId',
		'spell/shared/util/createLibraryFilePathsFromIds',
		'spell/shared/util/createModuleId',
		'spell/shared/util/deepClone',
		'spell/shared/util/StopWatch',
		'spell/shared/util/platform/PlatformKit',
		'spell/shared/util/platform/Types',

		'spell/functions'
	],
	function(
		Defines,
		flattenEntityConfig,
		SortedMap,
		create,
		createId,
		createLibraryFilePathFromId,
		createLibraryFilePathsFromIds,
		createModuleId,
		deepClone,
		StopWatch,
		PlatformKit,
		Types,

		_
	) {
		'use strict'


		var CAMERA_COMPONENT_ID = Defines.CAMERA_COMPONENT_ID

		var stopWatch = new StopWatch()

		/*
		 * TODO: Remove this custom invoke that knows how to handle the borked instances produced by the "create" constructor wrapper function.
		 * Instances created by "create" for some unknown reason do not support prototype chain method look-up. See "Fix create"
		 */
		var invoke = function( sortedMap, functionName, statisticsManager, activeSystemsOnly, args ) {
			var systems = sortedMap.values

			for( var i = 0, numSystems = systems.length; i < numSystems; i++ ) {
				stopWatch.start()

				var system = systems[ i ]

				if( !activeSystemsOnly || system.config.active ) {
					system.prototype[ functionName ].apply( system, args )
				}

				statisticsManager.updateNode( sortedMap.keys[ i ], stopWatch.stop() )
			}
		}

		var createSystem = function( spell, entityManager, systemId, system, isModeDevelopment, systemConfig ) {
			var attributes = _.reduce(
				system.input,
				function( memo, inputDefinition ) {
					var componentMap = entityManager.getComponentMapById( inputDefinition.componentId )

					if( !componentMap ) {
						throw 'Error: No component list for component template id \'' + inputDefinition.componentId +  '\' available.'
					}

					if( inputDefinition.name === 'config' ) {
						throw 'Error: The system \'' + systemId + '\' uses the reserved keyword \'config\' as a local alias for its input.'
					}

					memo[ inputDefinition.name ] = componentMap

					return memo
				},
				{
					config : systemConfig
				}
			)

			var constructor = spell.moduleLoader.require( createModuleId( systemId ) )

			// TODO: Fix create. Returned instances do not support prototype chain method look-up. O_o
			return create( constructor, [ spell ], attributes )
		}

		var createConfigFromSystemTemplateConfig = function( config ) {
			return _.reduce(
				config,
				function( memo, record ) {
					memo[ record[ 'name' ] ] = deepClone( record[ 'default' ] )

					return memo
				},
				{}
			)
		}

		var createSystems = function( spell, entityManager, libraryManager, systems, isModeDevelopment ) {
			return _.reduce(
				systems,
				function( memo, system ) {
					var systemId       = system.id,
						systemTemplate = libraryManager.get( systemId )

					if( !systemTemplate ) {
						throw 'Error: Could not get template for id \'' + systemId + '\'.'
					}

					return memo.add(
						systemId,
						createSystem(
							spell,
							entityManager,
							systemId,
							systemTemplate,
							isModeDevelopment,
							_.defaults(
								deepClone( system.config ),
								createConfigFromSystemTemplateConfig( systemTemplate.config )
							)
						)
					)
				},
				new SortedMap()
			)
		}

		var hasActiveCamera = function( sceneConfig ) {
			return true

			return _.any(
				flattenEntityConfig( sceneConfig.entities ),
				function( entityConfig ) {
					if( !entityConfig.config ) {

						return false
					}

					var cameraComponent = entityConfig.config[ CAMERA_COMPONENT_ID ]

					if( !cameraComponent ) return false

					return cameraComponent.active
				}
			)
		}

		var getExecutionGroupIdBySystemId = function( executionGroups, systemId ) {
			for( var executionGroupId in executionGroups ) {
				var executionGroup = executionGroups[ executionGroupId ]

				if( executionGroup.hasKey( systemId ) ) {
					return executionGroupId
				}
			}
		}

		var addStatisticsSeries = function( statisticsManager, systems, parentNodeId ) {
			for( var i = 0, numSystems = systems.length; i < numSystems; i++ ) {
				var system = systems[ i ]

				statisticsManager.addNode( system.id, parentNodeId )
			}
		}


		var Scene = function( spell, entityManager, libraryManager, statisticsManager, isModeDevelopment, sceneConfig, initialConfig ) {
			this.spell             = spell
			this.entityManager     = entityManager
			this.libraryManager    = libraryManager
			this.statisticsManager = statisticsManager
			this.isModeDevelopment = isModeDevelopment
			this.executionGroups   = { render : null, update : null }
			this.sceneConfig       = sceneConfig
			this.initialConfig     = initialConfig
			this.script            = null
		}

		Scene.prototype = {
			render: function( timeInMs, deltaTimeInMs ) {
				invoke( this.executionGroups.render, 'process', this.statisticsManager, true, [ this.spell, timeInMs, deltaTimeInMs ] )
			},
			update: function( timeInMs, deltaTimeInMs ) {
				invoke( this.executionGroups.update, 'process', this.statisticsManager, true, [ this.spell, timeInMs, deltaTimeInMs ] )
			},
			init: function() {
				var spell         = this.spell,
					sceneConfig   = this.sceneConfig,
					initialConfig = this.initialConfig

				this.statisticsManager.init()

				if( !hasActiveCamera( sceneConfig ) ) {
					spell.console.error( 'Could not start scene "' + sceneConfig.name + '" because no camera entity was found. A scene must have at least one active camera entity.' )

					return
				}

				var entityManager   = this.entityManager,
					libraryManager  = this.libraryManager,
					executionGroups = this.executionGroups

				executionGroups.render = createSystems(
					spell,
					entityManager,
					libraryManager,
					sceneConfig.systems.render,
					this.isModeDevelopment
				)

				executionGroups.update = createSystems(
					spell,
					entityManager,
					libraryManager,
					sceneConfig.systems.update,
					this.isModeDevelopment
				)


				addStatisticsSeries( this.statisticsManager, sceneConfig.systems.render, 'render' )
				addStatisticsSeries( this.statisticsManager, sceneConfig.systems.update, 'update' )


				// initializing systems
				invoke( executionGroups.render, 'init', this.statisticsManager, false, [ spell, sceneConfig, initialConfig ] )
				invoke( executionGroups.update, 'init', this.statisticsManager, false, [ spell, sceneConfig, initialConfig ] )

				// creating entities from scene config
				entityManager.createEntities( sceneConfig.entities )

				// initializing scene
				var moduleId = createModuleId( createId( sceneConfig.namespace, sceneConfig.name ) )

				this.script = spell.moduleLoader.require( moduleId )
				this.script.init( spell, sceneConfig, initialConfig )

				// activating systems
				invoke( executionGroups.render, 'activate', this.statisticsManager, true, [ spell, sceneConfig, initialConfig ] )
				invoke( executionGroups.update, 'activate', this.statisticsManager, true, [ spell, sceneConfig, initialConfig ] )
			},
			destroy: function() {
				var executionGroups = this.executionGroups,
					spell           = this.spell,
					sceneConfig     = this.sceneConfig

				// deactivating systems
				invoke( executionGroups.render, 'deactivate', this.statisticsManager, true, [ spell, sceneConfig ] )
				invoke( executionGroups.update, 'deactivate', this.statisticsManager, true, [ spell, sceneConfig ] )

				// destroying scene
				this.script.destroy( this.spell, sceneConfig )

				// removing all entities
				this.entityManager.init()

				// destroying systems
				invoke( executionGroups.render, 'destroy', this.statisticsManager, false, [ spell, sceneConfig ] )
				invoke( executionGroups.update, 'destroy', this.statisticsManager, false, [ spell, sceneConfig ] )
			},
			restartSystem: function( systemId, executionGroupId, systemConfig ) {
				var executionGroups = this.executionGroups

				if( !executionGroupId ) {
					// figure out in which execution group the system is contained
					executionGroupId = getExecutionGroupIdBySystemId( executionGroups, systemId )
				}

				var executionGroup = executionGroups[ executionGroupId ]
				if( !executionGroup ) return

				var system = executionGroup.getByKey( systemId )
				if( !system ) return

				if( !systemConfig ) {
					// reusing the existing system config if none was provided
					systemConfig = system.config
				}

				// deactivating, destroying ye olde system
				var spell = this.spell

				if( system.config.active ) {
					system.prototype.deactivate.call( system, spell )
				}

				system.prototype.destroy.call( system, spell )

				// initializing and activating the new system instance
				var newSystem = createSystem(
					spell,
					this.entityManager,
					systemId,
					this.libraryManager.get( systemId ),
					this.isModeDevelopment,
					systemConfig
				)

				newSystem.prototype.init.call( newSystem, spell, this.sceneConfig, this.initialConfig )

				if( newSystem.config.active ) {
					newSystem.prototype.activate.call( newSystem, spell, this.sceneConfig, this.initialConfig )
				}

				executionGroup.add( systemId, newSystem )
			},
			addSystem: function( systemId, executionGroupId, index, systemConfig ) {
				var executionGroup = this.executionGroups[ executionGroupId ]
				if( !executionGroup ) return

				var spell             = this.spell,
					isModeDevelopment = this.isModeDevelopment,
					libraryManager    = this.libraryManager

				libraryManager.load(
					createLibraryFilePathsFromIds( [ systemId ] ),
					undefined,
					function() {
						var system = createSystem(
							spell,
							spell.entityManager,
							systemId,
							libraryManager.get( systemId ),
							isModeDevelopment,
							systemConfig
						)

						system.prototype.init.call( system, spell )

						if( system.config.active ) {
							system.prototype.activate.call( system, spell )
						}

						executionGroup.insert( systemId, system, index )
					}
				)
			},
			removeSystem: function( systemId, executionGroupId ) {
				var executionGroup = this.executionGroups[ executionGroupId ]
				if( !executionGroup ) return

				var spell  = this.spell,
					system = executionGroup.getByKey( systemId )

				if( system.config.active ) {
					system.prototype.deactivate.call( system, spell )
				}
				system.prototype.destroy.call( system, spell )

				executionGroup.removeByKey( systemId )
			},
			moveSystem: function( systemId, srcExecutionGroupId, dstExecutionGroupId, dstIndex ) {
				var srcExecutionGroup = this.executionGroups[ srcExecutionGroupId ],
					dstExecutionGroup = this.executionGroups[ dstExecutionGroupId ]

				if( !srcExecutionGroup || !dstExecutionGroup ) return

				var system = srcExecutionGroup.getByKey( systemId )
				if( !system ) return

				srcExecutionGroup.removeByKey( systemId )
				dstExecutionGroup.insert( systemId, system, dstIndex )
			},
			updateSystem: function( systemId, executionGroupId, systemConfig ) {
				if( !systemConfig ) return

				var executionGroups = this.executionGroups

				if( !executionGroupId ) {
					// figure out in which execution group the system is contained
					executionGroupId = getExecutionGroupIdBySystemId( executionGroups, systemId )
				}

				var executionGroup = executionGroups[ executionGroupId ]
				if( !executionGroup ) return

				var system = executionGroup.getByKey( systemId )
				if( !system ) return

				var changedActive = systemConfig.active !== undefined &&
					system.config !== systemConfig.active

				_.extend(
					system.config,
					deepClone( systemConfig )
				)

				if( changedActive ) {
					if( systemConfig.active ) {
						system.prototype.activate.call( system, this.spell, this.sceneConfig, this.initialConfig )

					} else {
						system.prototype.deactivate.call( system, this.spell, this.sceneConfig )
					}
				}
			}
		}

		return Scene
	}
)
