define(
	'spell/library/getAssetIdReferencesForEntities',
	[
		'spell/functions'
	],
	function(
		_
		) {
		'use strict'

		var getAssetIdReferencesForEntitiesRecursion = function( library, entities ) {
			var componentAttributesWithAssetIds = {},
				result = []

			//find out which components reference assets
			_.each( library, function( libraryRecord, libraryId ) {
				if( libraryRecord.type == 'component' ) {
					_.each( libraryRecord.attributes, function( attribute ) {
						if( attribute.type.indexOf( 'assetId:' ) == 0 ) {

							if( !componentAttributesWithAssetIds[ libraryId ] ) {
								componentAttributesWithAssetIds[ libraryId ] = {}
							}

							componentAttributesWithAssetIds[ libraryId ][ attribute.name ] = true
						}
					})
				}
			})

			//find all entities which reference assetId
			_.each( entities, function( entity ) {

				_.each( entity.config, function( attributes, componentName ) {
					_.each( attributes, function( attributeValue, attributeName ) {

						if( componentAttributesWithAssetIds[ componentName ] &&
							componentAttributesWithAssetIds[ componentName ][ attributeName ]) {

							result.push(
								attributeValue.indexOf(':') > 0 ?
									attributeValue.substr( attributeValue.indexOf(':') + 1 ) :
									attributeValue
							)
						}

					})
				})

				if( entity.children ) {
					result = result.concat(
						getAssetIdReferencesForEntitiesRecursion(
							library,
							entity.children
						)
					)
				}
			})

			return _.unique( result )
		}

		return function( library, entities ) {
			return getAssetIdReferencesForEntitiesRecursion( library, entities )
		}
	}
)
