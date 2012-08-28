define(
	'spell/shared/util/scene/Scene',
	[
		'spell/shared/util/create',
		'spell/shared/util/entityConfig/flatten',
		'spell/shared/util/Events',

		'spell/functions'
	],
	function(
		create,
		flattenEntityConfig,
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

		var createSystem = function( globals, templateManager, entityManager, systemTemplateId ) {
			var template    = templateManager.getTemplate( systemTemplateId ),
				moduleId    = createModuleIdFromTemplateId( createTemplateId( template.namespace, template.name ) )

			var constructor = loadModule(
				moduleId,
				{
					baseUrl : 'library/templates'
				}
			)

			var componentsInput = _.reduce(
				template.input,
				function( memo, inputDefinition ) {
					memo[ inputDefinition.name ] = entityManager.getComponentsById( inputDefinition.templateId )

					return memo
				},
				{}
			)

			// TODO: Fix create. Returned instances do not support prototype chain method look-up. O_o
			return create( constructor, [ globals ], componentsInput )
		}

		var createSystems = function( globals, systemTemplateIds ) {
			var templateManager = globals.templateManager,
				entityManager   = globals.entityManager

			return _.map(
				systemTemplateIds,
				function( systemTemplateId ) {
					return createSystem( globals, templateManager, entityManager, systemTemplateId )
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

		var createDefaultCamera = function( entityManager ) {
			var entityConfig = {}
			entityConfig[ cameraComponentTemplateId ] = {
				active : true
			}

			entityManager.createEntity( {
				templateId : cameraEntityTemplateId,
				config : entityConfig
			} )
 		}


		/*
		 * public
		 */

		var Scene = function( globals, templateManager ) {
			this.globals         = globals
			this.templateManager = templateManager
			this.renderSystems   = null
			this.updateSystems   = null
			this.script          = null
		}

		Scene.prototype = {
			render: function( timeInMs, deltaTimeInMs ) {
				invoke( this.renderSystems, 'process', [ this.globals, timeInMs, deltaTimeInMs ] )
			},
			update: function( timeInMs, deltaTimeInMs ) {
				invoke( this.updateSystems, 'process', [ this.globals, timeInMs, deltaTimeInMs ] )
			},
			init: function( globals, sceneConfig ) {
				var entityManager = globals.entityManager

				if( !hasActiveCamera( sceneConfig ) ) {
					createDefaultCamera( entityManager )
				}

				if( sceneConfig.scriptId ) {
					this.script = loadModule( sceneConfig.scriptId )
					this.script.init( this.globals, entityManager, sceneConfig )
				}

				if( sceneConfig.systems ) {
					this.renderSystems = createSystems( globals, sceneConfig.systems.render )
					this.updateSystems = createSystems( globals, sceneConfig.systems.update )

					invoke( this.renderSystems, 'init', [ this.globals, sceneConfig ] )
					invoke( this.updateSystems, 'init', [ this.globals, sceneConfig ] )
				}
			},
			destroy: function( globals, sceneConfig ) {
				invoke( this.renderSystems, 'cleanUp', [ this.globals, sceneConfig ] )
				invoke( this.updateSystems, 'cleanUp', [ this.globals, sceneConfig ] )

				this.script.cleanUp( this.globals )
			}
		}

		return Scene
	}
)
