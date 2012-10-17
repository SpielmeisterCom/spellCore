define(
	'spell/shared/util/scene/Scene',
	[
		'spell/shared/util/create',
		'spell/shared/util/createId',
		'spell/shared/util/createModuleId',
		'spell/shared/util/entityConfig/flatten',
		'spell/shared/util/hashModuleId',
		'spell/shared/util/Events',
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
		var invoke = function( items, functionName, args ) {
			_.each(
				items,
				function( item ) {
					item.prototype[ functionName ].apply( item, args )
				}
			)
		}

		var createTemplateId = function( namespace, name ) {
			return namespace + '.' + name
		}

		var createSystem = function( spell, EntityManager, system, anonymizeModuleIds ) {
			var moduleId = createModuleId( createId( system.namespace, system.name ) )

			var constructor = loadModule(
				anonymizeModuleIds ? hashModuleId( moduleId ) : moduleId,
				anonymizeModuleIds
			)

			var componentsInput = _.reduce(
				system.input,
				function( memo, inputDefinition ) {
					var componentDictionary = EntityManager.getComponentDictionaryById( inputDefinition.componentId )

					if( !componentDictionary ) {
						throw 'Error: No component list for component template id \'' + inputDefinition.componentId +  '\' available.'
					}

					memo[ inputDefinition.name ] = componentDictionary

					return memo
				},
				{}
			)

			// TODO: Fix create. Returned instances do not support prototype chain method look-up. O_o
			return create( constructor, [ spell ], componentsInput )
		}

		var createSystems = function( spell, systemIds, anonymizeModuleIds ) {
			var templateManager = spell.templateManager,
				EntityManager   = spell.EntityManager

			return _.reduce(
				systemIds,
				function( memo, systemId ) {
					memo[ systemId ] = createSystem( spell, EntityManager, templateManager.getTemplate( systemId ), anonymizeModuleIds )

					return memo
				},
				{}
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

		var Scene = function( spell, EntityManager, templateManager, anonymizeModuleIds ) {
			this.spell              = spell
			this.EntityManager      = EntityManager
			this.templateManager    = templateManager
			this.anonymizeModuleIds = anonymizeModuleIds
			this.renderSystems      = null
			this.updateSystems      = null
			this.script             = null
		}

		Scene.prototype = {
			render: function( timeInMs, deltaTimeInMs ) {
				invoke( this.renderSystems, 'process', [ this.spell, timeInMs, deltaTimeInMs ] )
			},
			update: function( timeInMs, deltaTimeInMs ) {
				invoke( this.updateSystems, 'process', [ this.spell, timeInMs, deltaTimeInMs ] )
			},
			init: function( sceneConfig ) {
				if( !hasActiveCamera( sceneConfig ) ) {
					this.spell.logger.error( 'Could not start scene "' + sceneConfig.name + '" because no camera entity was found. A scene must have at least one active camera entity.' )

					return
				}

				if( sceneConfig.systems ) {
					this.renderSystems = createSystems( this.spell, sceneConfig.systems.render, anonymizeModuleIds )
					this.updateSystems = createSystems( this.spell, sceneConfig.systems.update, anonymizeModuleIds )

					invoke( this.renderSystems, 'init', [ this.spell, sceneConfig ] )
					invoke( this.updateSystems, 'init', [ this.spell, sceneConfig ] )

					invoke( this.renderSystems, 'activate', [ this.spell, sceneConfig ] )
					invoke( this.updateSystems, 'activate', [ this.spell, sceneConfig ] )
				}

				var anonymizeModuleIds = this.anonymizeModuleIds

				if( sceneConfig.scriptId ) {
					this.script = loadModule(
						anonymizeModuleIds ? sceneConfig.scriptId : createModuleId( sceneConfig.scriptId ),
						anonymizeModuleIds
					)

					this.script.init( this.spell, sceneConfig )
				}
			},
			destroy: function( sceneConfig ) {
				invoke( this.renderSystems, 'deactivate', [ this.spell, sceneConfig ] )
				invoke( this.updateSystems, 'deactivate', [ this.spell, sceneConfig ] )

				invoke( this.renderSystems, 'destroy', [ this.spell, sceneConfig ] )
				invoke( this.updateSystems, 'destroy', [ this.spell, sceneConfig ] )

				this.script.destroy( this.spell, sceneConfig )
			},
			restartSystem: function( systemId ) {
				var renderSystems = this.renderSystems,
					updateSystems = this.updateSystems

				var systemsGroup = ( renderSystems[ systemId ] ?
					renderSystems :
					( updateSystems[ systemId ] ?
						updateSystems :
						undefined
					)
				)

				if( !systemsGroup ) return

				systemsGroup[ systemId ].prototype[ 'deactivate' ]( this.spell )
				systemsGroup[ systemId ].prototype[ 'destroy' ]( this.spell )

				var system = createSystem(
					this.spell,
					this.EntityManager,
					this.templateManager.getTemplate( systemId ),
					this.anonymizeModuleIds
				)

				system.prototype[ 'init' ].call( this.spell )
				system.prototype[ 'activate' ].call( this.spell )
				systemsGroup[ systemId ] = system
			}
		}

		return Scene
	}
)
