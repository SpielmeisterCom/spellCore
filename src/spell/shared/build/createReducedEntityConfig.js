define(
	'spell/shared/build/createReducedEntityConfig',
	[
		'spell/shared/util/platform/underscore'
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

		/**
		 * Creates reduced entity config (the spell runtime module format).
		 */
		return function( templateManager, entityInSpellEdFormat ) {
			return {
				name       : entityInSpellEdFormat.name,
				templateId : entityInSpellEdFormat.templateId,
				config     : compileComponents( templateManager, entityInSpellEdFormat.components )
			}
		}
	}
)
