define(
	'spell/shared/build/compileEntities',
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
		 * Creates entity configs in the spell packaging format.
		 */
		return function( blueprintManager, entitiesInSpellEdFormat ) {
			var entitiesSpellFormat = _.reduce(
				entitiesInSpellEdFormat,
				function( memo, iter ) {
					memo.push(
						{
							blueprintId : iter.blueprintId,
							name : iter.name,
							config : compileComponents( blueprintManager, iter.components )
						}
					)

					return memo
				},
				[]
			)

			return entitiesSpellFormat
		}
	}
)
