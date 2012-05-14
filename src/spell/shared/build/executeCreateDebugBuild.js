define(
	'spell/shared/build/executeCreateDebugBuild',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/createReducedEntityConfig',
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',
		'spell/shared/util/blueprints/BlueprintManager',

		'fs',
		'glob',
		'util',
		'mkdirp',

		'jsonPath',
		'underscore.string',
		'underscore'
	],
	function(
		copyFile,
		createReducedEntityConfig,
		isDirectory,
		isFile,
		BlueprintManager,

		fs,
		glob,
		util,
		mkdirp,

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

		var loadBlueprintsFromPaths = function( blueprintManager, pathPatterns ) {
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

		var loadBlueprintsFromLibrary = function( blueprintManager, libraryPaths ) {
			var errors = []

			errors = errors.concat(
				loadBlueprintsFromPaths(
					blueprintManager,
					createBlueprintLibraryPathPatterns( libraryPaths, 'component' )
				)
			)

			try {
				errors = errors.concat(
					loadBlueprintsFromPaths(
						blueprintManager,
						createBlueprintLibraryPathPatterns( libraryPaths, 'entity' )
					)
				)

			} catch( e ) {
				errors.push( e.toString() )
			}

			return errors
		}

		var hasAllBlueprints = function( blueprintManager, blueprintIds ) {
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

		/**
		 * Create a list of unique component blueprint ids that are referenced by the provided entity blueprint.
		 *
		 * @param entityBlueprintIds
		 * @param blueprintManager
		 * @return {*}
		 */
		var createDependencyComponentBlueprintIds = function( blueprintManager, entityBlueprintIds ) {
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

		var createBlueprintList = function( blueprintManager, blueprintIds ) {
			return _.map(
				blueprintIds,
				function( blueprintId ) {
					return blueprintManager.getBlueprint( blueprintId )
				}
			)
		}

		/**
		 * Creates a list of resources that are referenced by the provided entity config list
		 *
		 * @param blueprintManager
		 * @param entities
		 * @return {*}
		 */
		var createReferencedResources = function( blueprintManager, entities ) {
			return _.reduce(
				entities,
				function( memo, entityConfig ) {
					// WORKAROUND: a specialized solution; until requirements are more clear this has to do
					var entity = blueprintManager.createEntity( entityConfig.blueprintId, entityConfig.config )

					if( _.has( entity, 'appearance' ) &&
						_.has( entity.appearance, 'textureId' ) ) {

						var textureId = entity.appearance.textureId

						if( !_.include( memo, textureId ) ) {
							memo.push( textureId )
						}
					}

					return memo
				},
				[]
			)
		}

		var createZoneList = function( blueprintManager, zones ) {
			return _.map(
				zones,
				function( zone ) {
					var reducedEntityConfig = _.map(
						zone.entities,
						function( entityConfig ) {
							return createReducedEntityConfig( blueprintManager, entityConfig )
						}
					)

					return {
						name : zone.name,
						entities : reducedEntityConfig,
						resources : createReferencedResources( blueprintManager, reducedEntityConfig )
					}
				}
			)
		}

		var createRuntimeModule = function( startZoneId, zones, componentBlueprints, entityBlueprints ) {
			return {
				startZone : startZoneId,
				zones : zones,
				componentBlueprints : componentBlueprints,
				entityBlueprints : entityBlueprints
			}
		}

		var writeRuntimeModule = function( outputFilePath, runtimeModule ) {
			var errors = []

			var data = _s.sprintf(
				'spell.setRuntimeModule( %1$s )',
				JSON.stringify(
					runtimeModule,
					null,
					'\t'
				)
			)

			// delete file if it already exists
			if( isFile( outputFilePath ) ) {
				fs.unlinkSync( outputFilePath )
			}

			fs.writeFileSync( outputFilePath, data, 'utf-8' )

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
			errors = loadBlueprintsFromLibrary( blueprintManager, [ spellBlueprintPath, projectBlueprintPath ] )

			if( _.size( errors ) > 0 ) return errors


			// determine all blueprints that are referenced in the project
			var entityBlueprintIds    = _.unique( jsonPath( projectConfig, '$.zones[*].entities[*].blueprintId' ) ),
				componentBlueprintIds = createDependencyComponentBlueprintIds( blueprintManager, entityBlueprintIds )


			// check if the required blueprints are available
			errors = hasAllBlueprints( blueprintManager, entityBlueprintIds )
			errors = errors.concat( hasAllBlueprints( blueprintManager, componentBlueprintIds ) )

			if( _.size( errors ) > 0 ) return errors


			// copy referenced resources to output path
			var zoneList = createZoneList( blueprintManager, projectConfig.zones )
			var resourceIds = _.unique(
				_.reduce(
					zoneList,
					function( memo, zone ) {
						return memo.concat( zone.resources )
					},
					[]
				)
			)

			var relativeAssetsPath = '/library/assets',
				spellTexturesPath    = spellPath + relativeAssetsPath,
				projectTexturesPath  = projectPath + relativeAssetsPath,
				outputResourcesPath   = projectPath + '/public/output/resources'

			_.each(
				resourceIds,
				function( resourceId ) {
					var inputFilePath = spellTexturesPath + '/' + resourceId,
						outputFilePath = outputResourcesPath + '/' + resourceId,
						outputFilePathNamespaced = _.initial( outputFilePath.split( '/' ) ).join( '/' )

					if( !isDirectory( outputFilePathNamespaced ) ) {
						mkdirp.sync( outputFilePathNamespaced )
					}

					if( isFile( inputFilePath ) ) {
						copyFile( inputFilePath, outputFilePath )

						return
					}

					inputFilePath = projectTexturesPath + '/' + resourceId

					if( isFile( inputFilePath ) ) {
						copyFile( inputFilePath, outputFilePath )

						return
					}

					errors.push( 'Error: Could not locate resource \'' + resourceId + '\'.' )
				}
			)

			if( _.size( errors ) > 0 ) return errors



			// write generated runtime module to output path
			var outputPath = projectPath + '/public/output',
				outputFilePath = outputPath + '/data.js'

			var runtimeModule = createRuntimeModule(
				projectConfig.startZone,
				zoneList,
				createBlueprintList( blueprintManager, componentBlueprintIds ),
				createBlueprintList( blueprintManager, entityBlueprintIds )
			)

			errors = writeRuntimeModule( outputFilePath, runtimeModule )

			if( _.size( errors ) > 0 ) return errors


			// copy engine include to output path
			var inputFilePath = spellPath + '/build/spell.js'
			outputFilePath = outputPath + '/spell.js'

			copyFile( inputFilePath, outputFilePath )


			return errors
		}
	}
)
