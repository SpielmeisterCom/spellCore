define(
	'spell/shared/build/executeBuildDevelopment',
	[
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',
		'spell/shared/util/blueprints/BlueprintManager',

		'fs',
		'glob',

		'jsonPath',
		'underscore.string',
		'underscore'
	],
	function(
		isDirectory,
		isFile,
		BlueprintManager,

		fs,
		glob,

		jsonPath,
		_s,
		_
	) {
		'use strict'


		/**
		 * private
		 */

		var RELATIVE_BLUEPRINT_LIBRARY_PATH = '/library/blueprints'

		var createBlueprintLibraryPathPatterns = function( libraryPaths, subDirectoryName ) {
			return _.map(
				libraryPaths,
				function( path ) {
					return path + '/*/' + subDirectoryName + '/**/*.json'
				}
			)
		}

		var loadBlueprintsFromPaths = function( pathPatterns, blueprintManager ) {
			var errors = []

			var filePaths = glob.sync( '{' + pathPatterns.join( ',' ) + '}', {} )

			_.each(
				filePaths,
				function( filePath ) {
					var data = fs.readFileSync( filePath, 'utf-8')

					try {
						var blueprint = JSON.parse( data )

					} catch( e ) {
						if( _s.startsWith( e, 'SyntaxError' ) ) {
							errors.push( 'Error: Unexpected token \'' + _.last( e.toString().split( ' ' ) ) + '\' while parsing file \'' + filePath + '\'.' )

							return errors
						}
					}

					blueprintManager.add( blueprint )
				}
			)

			return errors
		}

		var loadBlueprintsFromLibrary = function( libraryPaths, blueprintManager ) {
			var errors = []

			errors = errors.concat(
				loadBlueprintsFromPaths(
					createBlueprintLibraryPathPatterns( libraryPaths, 'component' ),
					blueprintManager
				)
			)

			try {
				errors = errors.concat(
					loadBlueprintsFromPaths(
						createBlueprintLibraryPathPatterns( libraryPaths, 'entity' ),
						blueprintManager
					)
				)

			} catch( e ) {
				errors.push( e.toString() )
			}

			return errors
		}

		var hasAllBlueprints = function( blueprintIds, blueprintManager ) {
			var errors = []

			_.each(
				blueprintIds,
				function( blueprintId ) {
					if( !blueprintManager.hasBlueprint( blueprintId ) ) {
						errors.push( 'Error: Required blueprint \'' + blueprintId + '\' could not be found.' )
					}
				}
			)

			return errors
		}

		var createDependencyComponentBlueprintIds = function( entityBlueprintIds, blueprintManager ) {
			return _.unique(
				_.flatten(
					_.map(
						entityBlueprintIds,
						function( entityBlueprintId ) {
							return blueprintManager.getDependencyComponentBlueprintIds( entityBlueprintId )
						}
					)
				)
			)
		}

		var createBlueprintList = function( blueprintIds, blueprintManager ) {
			return _.map(
				blueprintIds,
				function( blueprintId ) {
					return blueprintManager.getBlueprint( blueprintId )
				}
			)
		}

		var createRuntimeModule = function( entities, componentBlueprints, entityBlueprints ) {
			return {
				entities : entities,
				componentBlueprints : componentBlueprints,
				entityBlueprints : entityBlueprints
			}
		}

		var writeRuntimeModule = function( outputPath, outputFileName, runtimeModule ) {
			var errors = [],
				outputFilePath = outputPath + '/' + outputFileName

			// delete file if it already exists
			if( isFile( outputFilePath ) ) {
				fs.unlinkSync( outputFilePath )
			}

			// create parent directory if necessary
			if( !isDirectory( outputPath ) ) {
				var mode = '755'
				fs.mkdirSync( outputPath, mode )
			}

			fs.writeFileSync(
				outputFilePath,
				JSON.stringify(
					runtimeModule,
					null,
					'\t'
				),
				'utf-8'
			)

			return errors
		}


		/**
		 * public
		 */

		return function( spellPath, projectPath, projectFilePath ) {
			var errors = [],
				spellBlueprintPath = spellPath + RELATIVE_BLUEPRINT_LIBRARY_PATH,
				projectBlueprintPath = projectPath + RELATIVE_BLUEPRINT_LIBRARY_PATH

			// parsing project config file
			var data = fs.readFileSync( projectFilePath, 'utf-8'),
				projectConfig = null

			try {
				projectConfig = JSON.parse( data )

			} catch( e ) {
				if( _s.startsWith( e, 'SyntaxError' ) ) {
					errors.push( e.toString() )

					return errors
				}
			}


			// read all blueprint files from blueprint library
			var blueprintManager = new BlueprintManager()
			errors = loadBlueprintsFromLibrary( [ spellBlueprintPath, projectBlueprintPath ], blueprintManager )

			if( _.size( errors ) > 0 ) return errors


			// determine all blueprints that are referenced in the project
			var entityBlueprintIds    = _.unique( jsonPath( projectConfig, '$.zones[*].entities[*].blueprintId' ) ),
				componentBlueprintIds = createDependencyComponentBlueprintIds( entityBlueprintIds, blueprintManager )

			console.log( entityBlueprintIds )
			console.log( componentBlueprintIds )


			// check if the required blueprints are available
			errors = hasAllBlueprints( entityBlueprintIds, blueprintManager )
			errors = errors.concat( hasAllBlueprints( componentBlueprintIds, blueprintManager ) )

			if( _.size( errors ) > 0 ) return errors


			// write generated runtime module to disk
			var projectName = projectConfig.name,
				outputPath = projectPath + '/public/output/' + projectName,
				outputFileName = 'data.json'

			errors = writeRuntimeModule(
				outputPath,
				outputFileName,
				createRuntimeModule(
					{},
					createBlueprintList( entityBlueprintIds, blueprintManager ),
					createBlueprintList( componentBlueprintIds, blueprintManager )
				)
			)


			return errors
		}
	}
)
