define(
	'spell/shared/build/createReducedEntityConfig',
	[
		'spell/functions'
	],
	function(
		_
	) {
		var compileComponents = function( templateManager, componentsInSpellEdFormat ) {
			return _.reduce(
				componentsInSpellEdFormat,
				function( memo, iter ) {
					var templateId = iter.templateId,
						attributeConfig = iter.config

					if( templateManager.isSingleAttributeComponent( iter.templateId ) ) {
						for( var propertyName in attributeConfig ) {
							memo[ templateId ] = _.clone( attributeConfig[ propertyName ] )
						}

					} else {
						memo[ templateId ] = {}

						_.each(
							attributeConfig,
							function( value, key ) {
								memo[ templateId ][ key ] = _.clone( value )
							}
						)
					}

					return memo
				},
				{}
			)
		}

		var createEntityConfigSpellFormat = function( templateManager, entityConfigSpellEdFormat ) {
			var entityConfig = {}

			if( _.has( entityConfigSpellEdFormat, 'name' ) ) {
				entityConfig.name = entityConfigSpellEdFormat.name
			}

			if( _.has( entityConfigSpellEdFormat, 'templateId' ) ) {
				entityConfig.templateId = entityConfigSpellEdFormat.templateId
			}

			if( _.has( entityConfigSpellEdFormat, 'components' ) ) {
				entityConfig.config = compileComponents( templateManager, entityConfigSpellEdFormat.components )
			}

			if( _.has( entityConfigSpellEdFormat, 'children' ) ) {
				entityConfig.children = _.map(
					entityConfigSpellEdFormat.children,
					function( entityConfigSpellEdFormat ) {
						return createEntityConfigSpellFormat( templateManager, entityConfigSpellEdFormat )
					}
				)
			}

			return entityConfig
		}

		/*
		 * Creates reduced entity config (the spell runtime module format).
		 */
		return function( templateManager, entityConfigSpellEdFormat ) {
			return createEntityConfigSpellFormat( templateManager, entityConfigSpellEdFormat )
		}
	}
)
