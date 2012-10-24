define(
	'spell/shared/util/scene/Scene',
	[
		'spell/shared/util/create',
		'spell/shared/util/createId',
		'spell/shared/util/createModuleId',
		'spell/shared/util/entityConfig/flatten',
		'spell/shared/util/hashModuleId',
		'spell/shared/util/Events',
		'spell/shared/util/OrderedMap',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		create,
		createId,
		createModuleId,
		flattenEntityConfig,
		hashModuleId,
		Events,
		OrderedMap,
		PlatformKit,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var cameraEntityTemplateId    = 'spell.entity.2d.graphics.camera',
			cameraComponentTemplateId = 'spell.component.2d.graphics.camera'

		var loadModule = function( moduleId, anonymizeModuleIds ) {
			if( !moduleId ) throw 'Error: No module id provided.'

			var module = PlatformKit.ModuleLoader.require(
				moduleId,
				undefined,
				{
					loadingAllowed : !anonymizeModuleIds
				}
			)

			if( !module ) throw 'Error: Could not resolve module id \'' + moduleId + '\' to module.'

			return module
		}

		/*
		 * TODO: Remove this custom invoke that knows how to handle the borked instances produced by the "create" constructor wrapper function.
		 * Instances created by "create" for some unknown reason do not support prototype chain method look-up. See "Fix create"
		 */
		var invoke = function( orderedMap, functionName, args ) {
			var systems = orderedMap.values

			for( var i = 0, numSystems = systems.length; i < numSystems; i++ ) {
				var system = systems[ i ]

				system.prototype[ functionName ].apply( system, args )
			}
		}

		var process = function( orderedMap, args ) {
			var systems = orderedMap.values

			for( var i = 0, numSystems = systems.length; i < numSystems; i++ ) {
				var system = systems[ i ]

				if( system.config.active ) {
					system.prototype.process.apply( system, args )
				}
			}
		}

		var createTemplateId = function( namespace, name ) {
			return namespace + '.' + name
		}

		var createSystem = function( spell, entityManager, system, anonymizeModuleIds, systemConfig ) {
			var systemId = createId( system.namespace, system.name),
				moduleId = createModuleId( systemId )

			var constructor = loadModule(
				anonymizeModuleIds ? hashModuleId( moduleId ) : moduleId,
				anonymizeModuleIds
			)

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

			// TODO: Fix create. Returned instances do not support prototype chain method look-up. O_o
			return create( constructor, [ spell ], attributes )
		}

		var createSystems = function( spell, entityManager, templateManager, systems, anonymizeModuleIds ) {
			return _.reduce(
				systems,
				function( memo, system ) {
					var systemId = system.id

					return memo.add(
						systemId,
						createSystem( spell, entityManager, templateManager.getTemplate( systemId ), anonymizeModuleIds, system.config )
					)
				},
				new OrderedMap()
			)
		}

		var hasActiveCamera = function( sceneConfig ) {
			return _.any(
				flattenEntityConfig( sceneConfig.entities ),
				function( entityConfig ) {
					if( entityConfig.entityTemplateId !== cameraEntityTemplateId ||
						!entityConfig.config ) {

						return false
					}

					var cameraComponent = entityConfig.config[ cameraComponentTemplateId ]

					if( !cameraComponent ) return false

					return cameraComponent.active
				}
			)
		}


		/*
		 * public
		 */

		var Scene = function( spell, entityManager, templateManager, anonymizeModuleIds ) {
			this.spell              = spell
			this.entityManager      = entityManager
			this.templateManager    = templateManager
			this.anonymizeModuleIds = anonymizeModuleIds
			this.executionGroups    = { render : null, update : null }
			this.script             = null
		}

		Scene.prototype = {
			render: function( timeInMs, deltaTimeInMs ) {
				process( this.executionGroups.render, [ this.spell, timeInMs, deltaTimeInMs ] )
			},
			update: function( timeInMs, deltaTimeInMs ) {
				process( this.executionGroups.update, [ this.spell, timeInMs, deltaTimeInMs ] )
			},
			init: function( sceneConfig ) {
				if( !hasActiveCamera( sceneConfig ) ) {
					this.spell.logger.error( 'Could not start scene "' + sceneConfig.name + '" because no camera entity was found. A scene must have at least one active camera entity.' )

					return
				}

				var anonymizeModuleIds = this.anonymizeModuleIds

				if( sceneConfig.systems ) {
					var spell           = this.spell,
						entityManager   = this.entityManager,
						templateManager = this.templateManager,
						executionGroups = this.executionGroups

					executionGroups.render = createSystems( spell, entityManager, templateManager, sceneConfig.systems.render, anonymizeModuleIds )
					executionGroups.update = createSystems( spell, entityManager, templateManager, sceneConfig.systems.update, anonymizeModuleIds )

					invoke( executionGroups.render, 'init', [ spell, sceneConfig ] )
					invoke( executionGroups.update, 'init', [ spell, sceneConfig ] )

					invoke( executionGroups.render, 'activate', [ spell, sceneConfig ] )
					invoke( executionGroups.update, 'activate', [ spell, sceneConfig ] )
				}

				var moduleId = createModuleId( createId( sceneConfig.namespace, sceneConfig.name ) )

				this.script = loadModule(
					anonymizeModuleIds ? hashModuleId( moduleId ) : moduleId,
					anonymizeModuleIds
				)

				this.script.init( this.spell, sceneConfig )
			},
			destroy: function( sceneConfig ) {
				var executionGroups = this.executionGroups

				invoke( executionGroups.render, 'deactivate', [ this.spell, sceneConfig ] )
				invoke( executionGroups.update, 'deactivate', [ this.spell, sceneConfig ] )

				invoke( executionGroups.render, 'destroy', [ this.spell, sceneConfig ] )
				invoke( executionGroups.update, 'destroy', [ this.spell, sceneConfig ] )

				this.script.destroy( this.spell, sceneConfig )
			},
			restartSystem: function( systemId, executionGroupId, systemConfig ) {
				var executionGroup = this.executionGroups[ executionGroupId ]
				if( !executionGroup ) return

				var system = executionGroup.getByKey( systemId )
				if( !system ) return

				// deactivating, destroying ye olde system
				var spell = this.spell

				system.prototype.deactivate.call( system, spell )
				system.prototype.destroy.call( system, spell )

				// initializing and activating the new system instance
				var newSystem = createSystem(
					spell,
					this.entityManager,
					this.templateManager.getTemplate( systemId ),
					this.anonymizeModuleIds,
					systemConfig
				)

				newSystem.prototype.init.call( newSystem, spell )
				newSystem.prototype.activate.call( newSystem, spell )

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
					this.anonymizeModuleIds,
					systemConfig
				)

				system.prototype.init.call( system, spell )
				system.prototype.activate.call( system, spell )

				executionGroup.insert( systemId, system, index )
			},
			removeSystem: function( systemId, executionGroupId ) {
				var executionGroup = this.executionGroups[ executionGroupId ]
				if( !executionGroup ) return

				var spell  = this.spell,
					system = executionGroup.getByKey( systemId )

				system.prototype.deactivate.call( system, spell )
				system.prototype.destroy.call( system, spell )

				executionGroup.removeByKey( systemId )
			},
			moveSystem: function( systemId, srcExecutionGroupId, dstExecutionGroupId, dstIndex ) {
				var srcExecutionGroup = this.executionGroups[ srcExecutionGroupId ],
					dstExecutionGroup = this.executionGroups[ dstExecutionGroupId ]

				if( !srcExecutionGroup || !dstExecutionGroup ) return

				var system = srcExecutionGroup.getByKey( systemId )
				if( !system ) return

				dstExecutionGroup.insert( systemId, system, dstIndex )
				srcExecutionGroup.removeByKey( systemId )
			}
		}

		return Scene
	}
)
