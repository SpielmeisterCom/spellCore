define(
	'spell/shared/util/scene/Scene',
	[
		'spell/shared/build/createModuleId',
		'spell/shared/util/create',
		'spell/shared/util/createId',
		'spell/shared/util/entityConfig/flatten',
		'spell/shared/util/hashModuleId',
		'spell/shared/util/Events',

		'spell/functions'
	],
	function(
		createModuleId,
		create,
		createId,
		flattenEntityConfig,
		hashModuleId,
		Events,

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

			var module = require(
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

		var createSystem = function( spell, templateManager, EntityManager, anonymizeModuleIds, systemTemplateId ) {
			var system   = templateManager.getTemplate( systemTemplateId ),
				moduleId = createModuleId( createId( system.namespace, system.name ) )

			var constructor = loadModule(
				anonymizeModuleIds ? hashModuleId( moduleId ) : moduleId,
				anonymizeModuleIds
			)

			var componentsInput = _.reduce(
				system.input,
				function( memo, inputDefinition ) {
					var componentDictionary = EntityManager.getComponentDictionaryById( inputDefinition.componentId )

					if( !componentDictionary ) {
						throw 'Error: No component list for component id \'' + inputDefinition.componentId +  '\' available.'
					}

					memo[ inputDefinition.name ] = componentDictionary

					return memo
				},
				{}
			)

			// TODO: Fix create. Returned instances do not support prototype chain method look-up. O_o
			return create( constructor, [ spell ], componentsInput )
		}

		var createSystems = function( spell, systemTemplateIds, anonymizeModuleIds ) {
			var templateManager = spell.templateManager,
				EntityManager   = spell.EntityManager

			return _.map(
				systemTemplateIds,
				function( systemTemplateId ) {
					return createSystem( spell, templateManager, EntityManager, anonymizeModuleIds, systemTemplateId )
				}
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

		var Scene = function( spell, EntityManager ) {
			this.spell         = spell
			this.EntityManager = EntityManager
			this.renderSystems = null
			this.updateSystems = null
			this.script        = null
		}

		Scene.prototype = {
			render: function( timeInMs, deltaTimeInMs ) {
				invoke( this.renderSystems, 'process', [ this.spell, timeInMs, deltaTimeInMs ] )
			},
			update: function( timeInMs, deltaTimeInMs ) {
				invoke( this.updateSystems, 'process', [ this.spell, timeInMs, deltaTimeInMs ] )
			},
			init: function( spell, sceneConfig, anonymizeModuleIds ) {
				if( !hasActiveCamera( sceneConfig ) ) {
					spell.logger.error( 'Could not start scene "' + sceneConfig.name + '" because no camera entity was found. A scene must have at least one active camera entity.' )

					return
				}

				if( sceneConfig.scriptId ) {
					this.script = loadModule(
						anonymizeModuleIds ? sceneConfig.scriptId : createModuleId( sceneConfig.scriptId ),
						anonymizeModuleIds
					)

					this.script.init( this.spell, this.EntityManager, sceneConfig )
				}

				if( sceneConfig.systems ) {
					this.renderSystems = createSystems( spell, sceneConfig.systems.render, anonymizeModuleIds )
					this.updateSystems = createSystems( spell, sceneConfig.systems.update, anonymizeModuleIds )

					invoke( this.renderSystems, 'init', [ this.spell, sceneConfig ] )
					invoke( this.updateSystems, 'init', [ this.spell, sceneConfig ] )
				}
			},
			destroy: function( spell, sceneConfig ) {
				invoke( this.renderSystems, 'cleanUp', [ this.spell, sceneConfig ] )
				invoke( this.updateSystems, 'cleanUp', [ this.spell, sceneConfig ] )

				this.script.cleanUp( this.spell )
			}
		}

		return Scene
	}
)
