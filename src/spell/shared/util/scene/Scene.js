define(
	'spell/shared/util/scene/Scene',
	[
		'spell/Defines',

		'spell/shared/util/create',
		'spell/shared/util/createId',
		'spell/shared/util/createModuleId',
		'spell/shared/util/entityConfig/flatten',
		'spell/shared/util/Events',
		'spell/shared/util/SortedMap',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		Defines,
		create,
		createId,
		createModuleId,
		flattenEntityConfig,
		Events,
		SortedMap,
		PlatformKit,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var CAMERA_COMPONENT_ID = Defines.CAMERA_COMPONENT_ID

		/*
		 * TODO: Remove this custom invoke that knows how to handle the borked instances produced by the "create" constructor wrapper function.
		 * Instances created by "create" for some unknown reason do not support prototype chain method look-up. See "Fix create"
		 */
		var invoke = function( sortedMap, functionName, activeSystemsOnly, args ) {
			var systems = sortedMap.values

			for( var i = 0, numSystems = systems.length; i < numSystems; i++ ) {
				var system = systems[ i ]

				if( !activeSystemsOnly || system.config.active ) {
					system.prototype[ functionName ].apply( system, args )
				}
			}
		}

		var createSystem = function( spell, entityManager, system, isModeDevelopment, systemConfig ) {
			var systemId = createId( system.namespace, system.name ),
				moduleId = createModuleId( systemId )

			var attributes = _.reduce(
				system.input,
				function( memo, inputDefinition ) {
					var componentDictionary = entityManager.getComponentDictionaryById( inputDefinition.componentId )

					if( !componentDictionary ) {
						throw 'Error: No component list for component template id \'' + inputDefinition.componentId +  '\' available.'
					}

					if( inputDefinition.name === 'config' ) {
						throw 'Error: The system \'' + systemId + '\' uses the reserved keyword \'config\' as a local alias for its input.'
					}

					memo[ inputDefinition.name ] = componentDictionary

					return memo
				},
				{
					config : systemConfig
				}
			)

			var constructor = spell.moduleLoader.require( moduleId )

			// TODO: Fix create. Returned instances do not support prototype chain method look-up. O_o
			return create( constructor, [ spell ], attributes )
		}

		var createSystems = function( spell, entityManager, templateManager, systems, isModeDevelopment ) {
			return _.reduce(
				systems,
				function( memo, system ) {
					var systemId       = system.id,
						systemTemplate = templateManager.getTemplate( systemId )

					if( !systemTemplate ) {
						throw 'Error: Could not get template for id \'' + systemId + '\'.'
					}

					return memo.add(
						systemId,
						createSystem( spell, entityManager, systemTemplate, isModeDevelopment, system.config )
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

					var cameraComponent     = entityConfig.config[ CAMERA_COMPONENT_ID ]

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


		/*
		 * public
		 */

		var Scene = function( spell, entityManager, templateManager, isModeDevelopment ) {
			this.spell             = spell
			this.entityManager     = entityManager
			this.templateManager   = templateManager
			this.isModeDevelopment = isModeDevelopment
			this.executionGroups   = { render : null, update : null }
			this.script            = null
		}

		Scene.prototype = {
			render: function( timeInMs, deltaTimeInMs ) {
				invoke( this.executionGroups.render, 'process', true, [ this.spell, timeInMs, deltaTimeInMs ] )
			},
			update: function( timeInMs, deltaTimeInMs ) {
				invoke( this.executionGroups.update, 'process', true, [ this.spell, timeInMs, deltaTimeInMs ] )
			},
			init: function( sceneConfig ) {
				var spell = this.spell

				if( !hasActiveCamera( sceneConfig ) ) {
					spell.logger.error( 'Could not start scene "' + sceneConfig.name + '" because no camera entity was found. A scene must have at least one active camera entity.' )

					return
				}

				if( sceneConfig.systems ) {
					var entityManager   = this.entityManager,
						templateManager = this.templateManager,
						executionGroups = this.executionGroups

					executionGroups.render = createSystems(
						spell,
						entityManager,
						templateManager,
						sceneConfig.systems.render,
						this.isModeDevelopment
					)

					executionGroups.update = createSystems(
						spell,
						entityManager,
						templateManager,
						sceneConfig.systems.update,
						this.isModeDevelopment
					)

					invoke( executionGroups.render, 'init', false, [ spell, sceneConfig ] )
					invoke( executionGroups.update, 'init', false, [ spell, sceneConfig ] )

					invoke( executionGroups.render, 'activate', true, [ spell, sceneConfig ] )
					invoke( executionGroups.update, 'activate', true, [ spell, sceneConfig ] )
				}

				var moduleId = createModuleId( createId( sceneConfig.namespace, sceneConfig.name ) )

				this.script = spell.moduleLoader.require( moduleId )

				this.script.init( spell, sceneConfig )
			},
			destroy: function( sceneConfig ) {
				var executionGroups = this.executionGroups

				invoke( executionGroups.render, 'deactivate', true, [ this.spell, sceneConfig ] )
				invoke( executionGroups.update, 'deactivate', true, [ this.spell, sceneConfig ] )

				invoke( executionGroups.render, 'destroy', false, [ this.spell, sceneConfig ] )
				invoke( executionGroups.update, 'destroy', false, [ this.spell, sceneConfig ] )

				this.script.destroy( this.spell, sceneConfig )
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
					this.templateManager.getTemplate( systemId ),
					this.isModeDevelopment,
					systemConfig
				)

				newSystem.prototype.init.call( newSystem, spell )

				if( newSystem.config.active ) {
					newSystem.prototype.activate.call( newSystem, spell )
				}

				executionGroup.add( systemId, newSystem )
			},
			addSystem: function( systemId, executionGroupId, index, systemConfig ) {
				var executionGroup = this.executionGroups[ executionGroupId ]
				if( !executionGroup ) return

				var spell = this.spell

				var system = createSystem(
					spell,
					this.entityManager,
					this.templateManager.getTemplate( systemId ),
					this.isModeDevelopment,
					systemConfig
				)

				system.prototype.init.call( system, spell )

				if( system.config.active ) {
					system.prototype.activate.call( system, spell )
				}

				executionGroup.insert( systemId, system, index )
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
			}
		}

		return Scene
	}
)
