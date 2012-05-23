define(
	'spell/shared/build/executeCreateDebugBuild',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/createReducedEntityConfig',
		'spell/shared/build/executable/buildFlashExecutable',
		'spell/shared/build/executable/buildHtml5Executable',
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',
		'spell/shared/util/blueprints/BlueprintManager',

		'fs',
		'glob',
		'util',
		'mkdirp',
		'path',

		'jsonPath',
		'underscore.string',
		'spell/shared/util/platform/underscore'
	],
	function(
		copyFile,
		createReducedEntityConfig,
		buildFlashExecutable,
		buildHtml5Executable,
		isDirectory,
		isFile,
		BlueprintManager,

		fs,
		glob,
		util,
		mkdirp,
		path,

		jsonPath,
		_s,
		_
	) {
		'use strict'


		/**
		 * private
		 */

		var RELATIVE_BLUEPRINT_LIBRARY_PATH = '/library/blueprints'

		var runtimeModuleRequirejsTemplate = [
			'define(',
			'	\'spell/client/runtimeModule\',',
			'	function() {',
			'		return %1$s',
			'	}',
			')'
		].join( '\n' )

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

					try {
						blueprintManager.add( blueprint )

					} catch( e ) {
						var regex = /Error: Blueprint definition '(.*)' already exists./,
							match = e.match( regex )

						if( match ) {
							errors.push( 'Error: Overwriting of blueprint \'' + match[ 1 ] + '\' by blueprint definition in file \'' + filePath + '\' was prevented.' )
						}
					}
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
		 * Returns all dependent component blueprint ids
		 *
		 * @param blueprintId - entity blueprint id
		 */
		var getDependencyComponentBlueprintIds = function( blueprintManager, blueprintId ) {
			return jsonPath( blueprintManager.getBlueprint( blueprintId ), '$.components[*].blueprintId' )
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
							return getDependencyComponentBlueprintIds( blueprintManager, entityBlueprintId )
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

		var createRuntimeModule = function( projectName, startZoneId, zones, componentBlueprints, entityBlueprints ) {
			var runtimeModule = {
				name: projectName,
				startZone : startZoneId,
				zones : zones,
				componentBlueprints : componentBlueprints,
				entityBlueprints : entityBlueprints
			}

			return _s.sprintf(
				runtimeModuleRequirejsTemplate,
				JSON.stringify( runtimeModule )
			)
		}


		/**
		 * public
		 */

		return function( target, spellPath, projectPath, projectFilePath, callback ) {
			var errors               = [],
				spellBlueprintPath   = spellPath + RELATIVE_BLUEPRINT_LIBRARY_PATH,
				projectBlueprintPath = projectPath + RELATIVE_BLUEPRINT_LIBRARY_PATH

			// parsing project config file
			var data = fs.readFileSync( projectFilePath, 'utf-8'),
				projectConfig = null

			try {
				projectConfig = JSON.parse( data )

			} catch( e ) {
				if( _s.startsWith( e, 'SyntaxError' ) ) {
					errors.push( e.toString() )

					callback( errors )
				}
			}


			// read all blueprint files from blueprint library
			var blueprintManager = new BlueprintManager()
			errors = loadBlueprintsFromLibrary( blueprintManager, [ spellBlueprintPath, projectBlueprintPath ] )

			if( _.size( errors ) > 0 ) callback( errors )


			// determine all blueprints that are referenced in the project
			var entityBlueprintIds    = _.unique( jsonPath( projectConfig, '$.zones[*].entities[*].blueprintId' ) ),
				componentBlueprintIds = createDependencyComponentBlueprintIds( blueprintManager, entityBlueprintIds )


			// check if the required blueprints are available
			errors = hasAllBlueprints( blueprintManager, entityBlueprintIds )
			errors = errors.concat( hasAllBlueprints( blueprintManager, componentBlueprintIds ) )

			if( _.size( errors ) > 0 ) callback( errors )


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

			if( _.size( errors ) > 0 ) callback( errors )


			// generating executables
			var tempPath = projectPath + '/build', // directory for build related temporary files
				executablesOutputPath = projectPath + '/public/output',
				spellEngineSource = spellPath + '/build/spell.js'

			if( !path.existsSync( spellEngineSource ) ) {
				errors.push( 'Error: Could not locate engine include file \'' + spellEngineSource + '\'.' )
				callback( errors )
			}

			var engineSource = fs.readFileSync( spellEngineSource ).toString( 'utf-8' )

			if( !path.existsSync( tempPath) ) {
				fs.mkdirSync( tempPath )
			}

			var runtimeModuleSource = createRuntimeModule(
				projectConfig.name,
				projectConfig.startZone,
				zoneList,
				createBlueprintList( blueprintManager, componentBlueprintIds ),
				createBlueprintList( blueprintManager, entityBlueprintIds )
			)


			if( target === 'html5' ) {
				var platformAdapterSource = fs.readFileSync( spellPath + '/build/spell.html5.js' ).toString( 'utf-8')

				buildHtml5Executable(
					spellPath,
					executablesOutputPath,
					platformAdapterSource,
					engineSource,
					runtimeModuleSource,
					callback
				)

			} else if( target === 'flash' ) {
				var spellAsPath = spellPath + '/vendor/spellas'

				buildFlashExecutable(
					tempPath,
					executablesOutputPath,
					spellAsPath,
					projectPath,
					runtimeModuleSource,
					engineSource,
					callback
				)

			} else {
				console.error( 'Error: Target type \'' + target + '\' is not supported.' )
			}
		}
	}
)
