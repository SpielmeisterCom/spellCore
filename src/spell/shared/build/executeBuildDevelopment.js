define(
	'spell/shared/build/executeBuildDevelopment',
	[
		'spell/shared/build/isFile',

		'fs',
		'underscore.string',
		'underscore'
	],
	function(
		isFile,

		fs,
		_s,
		_
	) {
		'use strict'


		/**
		 * private
		 */

		var createReferencedBlueprintIds = function( listOfConfigObjects ) {
			return _.reduce(
				listOfConfigObjects,
				function( memo, iter ) {
					if( _.has( iter, 'blueprintId' ) ) memo.push( iter.blueprintId )

					return memo
				},
				[]
			)
		}

//		var hasAllBlueprintFiles = function( basePath, blueprintIds ) {
//			return _.reduce(
//				blueprintIds,
//				function( memo, iter ) {
//					if( !isFile( basePath ) )
//				}
//			)
//		}

		/**
		 * public
		 */

		return function( blueprintsPath, projectFilePath ) {
			var errors = []

			// parsing project config file
			var data = fs.readFileSync( projectFilePath, 'utf-8'),
				projectConfig

			try {
				projectConfig = JSON.parse( data )

			} catch( e ) {
				if( _s.startsWith( e, 'SyntaxError' ) ) {
					errors.push( e.toString() )

					return errors
				}
			}


			// determine all referenced blueprints
			var entityBlueprintIds = _.unique(
				_.reduce(
					projectConfig.zones,
					function( memo, zoneConfig ) {
						return memo.concat( createReferencedBlueprintIds( zoneConfig.entities ) )
					},
					[]
				)
			)

			var componentBlueprintIds = _.unique(
				_.reduce(
					projectConfig.zones,
					function( memo, zoneConfig ) {
						return memo.concat(
							_.reduce(
								zoneConfig.entities,
								function( memo2, entityConfig ) {
									return memo2.concat( createReferencedBlueprintIds( entityConfig.components ) )
								},
								[]
							)
						)
					},
					[]
				)
			)

			console.log( entityBlueprintIds )
			console.log( componentBlueprintIds )


			// TODO: read all blueprint files from blueprint library

			// TODO: check if the required blueprints are available
//			errors = errors.concat( hasAllBlueprintFiles( blueprintsPath + '/entities', entityBlueprintIds ) )
//			errors = errors.concat( hasAllBlueprintFiles( blueprintsPath + '/components', entityBlueprintIds ) )


			// TODO: include required blueprints in output

			return errors
		}
	}
)
