define(
	'spell/library/constructEntity',
	[
		'spell/Defines',
		'spell/data/entity/recursiveFind',
		'spell/data/entity/createAmbiguousSiblingName',
		'spell/data/entity/applyEntityConfig',
		'spell/shared/util/deepClone',
		'spell/functions'
	],
	function(
		Defines,
		recursiveFind,
		createAmbiguousSiblingName,
		applyEntityConfig,
		deepClone,
		_
		) {
		'use strict'


		var mergeOverloadedChildren = function( entityTemplateChildren, overloadedChildren ) {
			if( !overloadedChildren || overloadedChildren.length === 0 ) {
				return entityTemplateChildren
			}

			if( !entityTemplateChildren || entityTemplateChildren.length === 0 ) {
				return overloadedChildren
			}

			var result = deepClone( entityTemplateChildren )

			for( var i = 0; i < overloadedChildren.length; i++ ) {
				var overloadedChild = overloadedChildren[ i ]

				var entityTemplateChild = _.find(
					result,
					function( tmp ) {
						return tmp.name === overloadedChild.name
					}
				)

				if( !entityTemplateChild ) {
					result.push( deepClone( overloadedChild ) )
					continue
				}

				if( !entityTemplateChild.config ) {
					entityTemplateChild.config = {}
				}

				applyEntityConfig( entityTemplateChild.config, overloadedChild.config )

				if( overloadedChild.id ) {
					entityTemplateChild.id = overloadedChild.id
				}

				entityTemplateChild.children = applyOverloadedChildrenConfig( entityTemplateChild.children, overloadedChild.children )
			}

			return result
		}

		/**
		 * Applies the overloaded children config to the children config defined in a template.
		 *
		 * @private
		 * @param entityTemplateChildrenConfig
		 * @param overloadedChildrenConfig
		 * @return {*}
		 */
		var applyOverloadedChildrenConfig = function( entityTemplateChildrenConfig, overloadedChildrenConfig ) {
			return _.reduce(
				overloadedChildrenConfig,
				function( memo, overloadedChildConfig ) {
					var entityTemplateChildConfig = _.find(
						memo,
						function( entityTemplateChildConfig ) {
							return overloadedChildConfig.name === entityTemplateChildConfig.name
						}
					)

					if( entityTemplateChildConfig ) {
						entityTemplateChildConfig.children = mergeOverloadedChildren( entityTemplateChildConfig.children, overloadedChildConfig.children )
						entityTemplateChildConfig.id       = overloadedChildConfig.id

						if( !entityTemplateChildConfig.config ) {
							entityTemplateChildConfig.config = {}
						}

						applyEntityConfig( entityTemplateChildConfig.config, overloadedChildConfig.config )

					} else {
						memo.push( overloadedChildConfig )
					}

					return memo
				},
				deepClone( entityTemplateChildrenConfig )
			)
		}

		/**
		 * Normalizes the provided entity config and merges any entity templates into the entity
		 *
		 * @private
		 * @param libraryManager
		 * @param arg1 can be either an entity template id or a entity config
		 * @private
		 * @return {*}
		 */
		var normalizeEntityConfig = function( library, arg1 ) {
			if( !arg1 ) return

			var entityTemplateId = _.isString( arg1 ) ? arg1 : arg1.entityTemplateId

			var entityConfig = {
				children         : arg1.children || [],
				config           : arg1.config || {},
				id               : arg1.id,
				parentId         : arg1.parentId !== undefined ? arg1.parentId : Defines.ROOT_ENTITY_ID,
				name             : arg1.name,
				entityTemplateId : entityTemplateId
			}

			// check for ambiguous sibling names
			var ambiguousName = recursiveFind( entityConfig, createAmbiguousSiblingName )

			if( ambiguousName ) {
				throw 'Error: The entity configuration contains the ambiguous sibling name "' + ambiguousName + '". Entity siblings must have unique names.'
			}

			if( entityTemplateId ) {
				if( !library[ entityTemplateId ] ) {
					throw 'Error: Unknown entity template "' + entityTemplateId + '". Could not create entity.'
				}

				var entityTemplate = library[ entityTemplateId ]

                //clone entityTemplate config and apply instance specific config
				entityConfig.config = applyEntityConfig(
                    deepClone( entityTemplate.config ),
                    entityConfig.config
				)

				entityConfig.children = applyOverloadedChildrenConfig( entityTemplate.children, entityConfig.children )
			}

			return entityConfig
		}

		return function( library, entityOrEntityTemplateId ) {
			var entity = normalizeEntityConfig( library, entityOrEntityTemplateId )


			return entity
		}
	}
)