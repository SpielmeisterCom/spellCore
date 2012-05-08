define(
	'spell/shared/build/createReducedEntityConfig',
	[
		'spell/shared/util/blueprints/createLocalComponentName',

		'underscore'
	],
	function(
		createLocalComponentName,

		_
	) {
		var compileComponents = function( blueprintManager, componentsInSpellEdFormat ) {
			return _.reduce(
				componentsInSpellEdFormat,
				function( memo, iter ) {
					var componentName = createLocalComponentName( iter.blueprintId ),
						attributeConfig = iter.config

					if( blueprintManager.isSingleAttributeComponent( iter.blueprintId ) ) {
						for( var propertyName in attributeConfig ) {
							memo[ componentName ] = _.clone( attributeConfig[ propertyName ] )
						}

					} else {
						memo[ componentName ] = {}

						_.each(
							attributeConfig,
							function( value, key ) {
								memo[ componentName ][ key ] = _.clone( value )
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
		return function( blueprintManager, entityInSpellEdFormat ) {
			return {
				name        : entityInSpellEdFormat.name,
				blueprintId : entityInSpellEdFormat.blueprintId,
				config      : compileComponents( blueprintManager, entityInSpellEdFormat.components )
			}
		}
	}
)
