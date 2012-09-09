define(
	'spell/shared/util/scene/Scene',
	[
		'spell/shared/util/create',
		'spell/shared/util/entityConfig/flatten',
		'spell/shared/util/hashModuleIdentifier',
		'spell/shared/util/Events',

		'spell/functions'
	],
	function(
		create,
		flattenEntityConfig,
		hashModuleIdentifier,
		Events,

		_
	) {
		'use strict'


		/*
		 * private
		 */

		var cameraEntityTemplateId    = 'spell.entity.2d.graphics.camera',
			cameraComponentTemplateId = 'spell.component.2d.graphics.camera'

		var loadModule = function( moduleId, config ) {
			if( !moduleId ) throw 'Error: No module id provided.'

			var module = require( moduleId, undefined, config )

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

		var createModuleIdFromTemplateId = function( id ) {
			return id.replace( /\./g, '/' )
		}

		var createSystem = function( spell, templateManager, EntityManager, anonymizeModuleIdentifiers, systemTemplateId ) {
			var template = templateManager.getTemplate( systemTemplateId ),
				moduleId = createModuleIdFromTemplateId( createTemplateId( template.namespace, template.name ) )

			var constructor = loadModule(
				anonymizeModuleIdentifiers ? hashModuleIdentifier( moduleId ) : moduleId,
				{
					baseUrl : 'library/templates'
				}
			)

			var componentsInput = _.reduce(
				template.input,
				function( memo, inputDefinition ) {
					var componentDictionary = EntityManager.getComponentDictionaryById( inputDefinition.templateId )

					if( !componentDictionary ) {
						throw 'Error: No component list for component template id \'' + inputDefinition.templateId +  '\' available.'
					}

					memo[ inputDefinition.name ] = componentDictionary

					return memo
				},
				{}
			)

			// TODO: Fix create. Returned instances do not support prototype chain method look-up. O_o
			return create( constructor, [ spell ], componentsInput )
		}

		var createSystems = function( spell, systemTemplateIds, anonymizeModuleIdentifiers ) {
			var templateManager = spell.templateManager,
				EntityManager   = spell.EntityManager

			return _.map(
				systemTemplateIds,
				function( systemTemplateId ) {
					return createSystem( spell, templateManager, EntityManager, anonymizeModuleIdentifiers, systemTemplateId )
				}
			)
		}

		var hasActiveCamera = function( sceneConfig ) {
			return _.any(
				flattenEntityConfig( sceneConfig.entities ),
				function( entityConfig ) {
					if( entityConfig.templateId !== cameraEntityTemplateId ||
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
			init: function( spell, sceneConfig, anonymizeModuleIdentifiers ) {
				if( !hasActiveCamera( sceneConfig ) ) {
					spell.logger.error( 'Could not start scene "' + sceneConfig.name + '" because no camera entity was found. A scene must have at least one active camera entity.' )

					return
				}

				if( sceneConfig.scriptId ) {
					this.script = loadModule( sceneConfig.scriptId )
					this.script.init( this.spell, this.EntityManager, sceneConfig )
				}

				if( sceneConfig.systems ) {
					this.renderSystems = createSystems( spell, sceneConfig.systems.render, anonymizeModuleIdentifiers )
					this.updateSystems = createSystems( spell, sceneConfig.systems.update, anonymizeModuleIdentifiers )

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
