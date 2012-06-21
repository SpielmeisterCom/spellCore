define(
	'spell/shared/util/entities/EntityManager',
	[
		'spell/shared/util/create',

		'spell/shared/util/platform/underscore'
	],
	function(
		create,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var nextEntityId = 0

		var getNextEntityId = function() {
			return nextEntityId++
		}

		var createComponentList = function( componentBlueprintIds ) {
			return _.reduce(
				componentBlueprintIds,
				function( memo, componentBlueprintId ) {
					memo[ componentBlueprintId ] = {}

					return memo
				},
				{}
			)
		}

		var addComponents = function( components, entityId, entityComponents ) {
			_.each(
				entityComponents,
				function( entityComponent, entityComponentId ) {
					components[ entityComponentId ][ entityId ] = entityComponent
				}
			)
		}

		/**
		 * Parses the createEntity method argument object
		 * @param argumentObject
		 * @return {*}
		 */
		var extractCreateEntityArguments = function( argumentObject ) {
			var arg0 = argumentObject[ 0 ],
				arg1 = argumentObject[ 1 ],
				blueprintId,
				config

			if( !arg0 ) return

			if( !arg1 ) {
				if( _.isObject( arg0 ) ) {
					/**
					 * arg0 =  { ... } // config
					 */

					config = arg0

				} else if( _.isString( arg0 ) ) {
					/**
					 * arg0 = 'blueprintId'
					 */

					blueprintId = arg0
				}

			} else {
				/**
				 * arg0 = 'blueprintId'
				 * arg1 = { ... } // config
				 */

				blueprintId = arg0
				config      = arg1
			}

			return {
				blueprintId : blueprintId,
				config : config
			}
		}


		/**
		 * public
		 */

		var EntityManager = function( blueprintManager ) {
			this.blueprintManager = blueprintManager
			this.components = createComponentList( blueprintManager.getBlueprintIds( 'componentBlueprint' ) )
		}

		EntityManager.prototype = {
			createEntity: function() {
				var args = extractCreateEntityArguments( arguments )

				if( !args ) throw 'Error: Supplied invalid arguments.'

				var blueprintId = args.blueprintId,
					config      = args.config

				if( !blueprintId && !config ) {
					throw 'Error: Supplied invalid arguments.'
				}

				if( blueprintId && !this.blueprintManager.hasBlueprint( blueprintId ) ) {
					throw 'Error: Unknown blueprint \'' + blueprintId + '\'. Could not create entity.'
				}

				var id = getNextEntityId()

				addComponents(
					this.components,
					id,
					this.blueprintManager.createEntityComponents( blueprintId, config || {} )
				)

				return id
			},

			createEntities : function( entityConfigs ) {
				var self = this

				_.each(
					entityConfigs,
					function( entityConfig ) {
						if( _.has( entityConfig, 'blueprintId' ) ) {
							self.createEntity( entityConfig.blueprintId, entityConfig.config )

						} else {
							self.createEntity( entityConfig.config )
						}
					}
				)
			},

			getComponentsById : function( componentBlueprintId ) {
				var components = this.components[ componentBlueprintId ]

				if( !components ) throw 'Error: No component list for component blueprint id \'' + componentBlueprintId +  '\' available.'

				return components
			}
		}


		return EntityManager
	}
)
