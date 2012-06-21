define(
	'spell/shared/build/executeCreateDebugBuild',
	[
		'spell/shared/ast/filterNodes',
		'spell/shared/build/copyFile',
		'spell/shared/build/createReducedEntityConfig',
		'spell/shared/build/executable/buildFlashExecutable',
		'spell/shared/build/executable/buildHtml5Executable',
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',
		'spell/shared/util/blueprints/BlueprintManager',
		'spell/shared/util/createAssetId',

		'amd-helper',
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
		filterNodes,
		copyFile,
		createReducedEntityConfig,
		buildFlashExecutable,
		buildHtml5Executable,
		isDirectory,
		isFile,
		BlueprintManager,
		createAssetId,

		amdHelper,
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

		var LIBRARY_BLUEPRINTS_PATH = '/library/blueprints'
		var LIBRARY_SCRIPTS_PATH = '/library/scripts'

		var runtimeModuleRequirejsTemplate = [
			'define(',
			'	\'spell/client/runtimeModule\',',
			'	function() {',
			'		return %1$s',
			'	}',
			')'
		].join( '\n' )

		var createFilePaths = function( paths, extensions ) {
			if( !extensions ||
				extensions.length === 0 ) {

				return
			}

			var pathSuffix = ( extensions.length === 1 ?
				'/**/*.' + extensions[ 0 ] :
				'/**/*.{' + extensions.join( ',' ) + '}'
			)

			var filePathPatterns = _.map(
				paths,
				function( libraryPath ) {
					return libraryPath + pathSuffix
				}
			)

			var filePathPattern = ( filePathPatterns.length > 1 ?
				'{' + filePathPatterns.join( ',' ) + '}' :
				filePathPatterns[ 0 ]
			)

			return glob.sync( filePathPattern, {} )
		}

		var loadBlueprints = function( blueprintManager, blueprints, type ) {
			var errors = []

			_.each(
				_.filter( blueprints, function( blueprint ) { return blueprint.blueprint.type === type } ),
				function( blueprint ) {
					try {
						blueprintManager.add( blueprint.blueprint )

					} catch( e ) {
						var regex = /Error: Blueprint definition '(.*)' already exists./,
							match = e.match( regex )

						if( match ) {
							errors.push( 'Error: Overwriting of blueprint \'' + match[ 1 ] + '\' by blueprint definition in file \'' + blueprint.filePath + '\' was prevented.' )
						}
					}
				}
			)

			return errors
		}

		var loadBlueprintsFromPaths = function( blueprintManager, filePaths ) {
			var errors = []

			var blueprints = _.reduce(
				filePaths,
				function( memo, filePath ) {
					var data = fs.readFileSync( filePath, 'utf-8')

					try {
						var blueprint = JSON.parse( data )

					} catch( e ) {
						if( _s.startsWith( e, 'SyntaxError' ) ) {
							errors.push( 'Error: Unexpected token \'' + _.last( e.toString().split( ' ' ) ) + '\' while parsing file \'' + filePath + '\'.' )

							return errors
						}
					}

					return memo.concat( {
						blueprint : blueprint,
						filePath : filePath
					} )
				},
				[]
			)

			errors = errors.concat(
				loadBlueprints( blueprintManager, blueprints, 'componentBlueprint' )
			)

			if( errors.length > 0 ) return errors


			errors = errors.concat(
				loadBlueprints( blueprintManager, blueprints, 'entityBlueprint' )
			)

			if( errors.length > 0 ) return errors


			errors = errors.concat(
				loadBlueprints( blueprintManager, blueprints, 'systemBlueprint' )
			)

			return errors
		}

		var loadBlueprintsFromLibrary = function( blueprintManager, libraryPaths ) {
			var errors = [],
				filePaths = createFilePaths( libraryPaths, [ 'json' ] )

			errors = errors.concat(
				loadBlueprintsFromPaths( blueprintManager, filePaths )
			)

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

		var hasAllScripts = function( scripts, usedScriptIds ) {
			var errors = []

			_.each(
				usedScriptIds,
				function( scriptId ) {
					if( !scripts[ scriptId ] ) {
						errors.push( 'Error: Could not find script for script id \'' + scriptId + '\'.' )
					}
				}
			)

			return errors
		}

		var createModuleList = function( modules, moduleNames ) {
			return _.pluck(
				_.pick( modules, moduleNames ),
				'source'
			)
		}

		var createDependencyScriptIds = function( blueprintManager, systemBlueprintIds ) {
			return _.reduce(
				systemBlueprintIds,
				function( memo, blueprintId ) {
					return memo.concat( blueprintManager.getBlueprint( blueprintId).scriptId )
				},
				[]
			)
		}

		/**
		 * Returns all dependent component blueprint ids
		 */
		var getDependencyBlueprintIds = function( blueprintManager, blueprintIds, path ) {
			return _.reduce(
				blueprintIds,
				function( memo, blueprintId ) {
					return _.union(
						memo,
						jsonPath(
							blueprintManager.getBlueprint( blueprintId ),
							path
						)
					)
				},
				[]
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
						entities : reducedEntityConfig,
						name : zone.name,
						scriptId : zone.scriptId,
						systems : zone.systems
					}
				}
			)
		}

		var createRuntimeModule = function( projectName, startZoneId, zones, componentBlueprints, entityBlueprints, systemBlueprints, assets, resources, modules ) {
			var runtimeModule = {
				name: projectName,
				startZone : startZoneId,
				zones : zones,
				componentBlueprints : componentBlueprints,
				entityBlueprints : entityBlueprints,
				systemBlueprints : systemBlueprints,
				resources : resources,
				assets : assets
			}

			return _s.sprintf( runtimeModuleRequirejsTemplate, JSON.stringify( runtimeModule, null, '\t' ) ) +
				'\n\n' +
				modules.join( '\n' )
		}

		var createContainedModulesList = function( source ) {
			var nodes = filterNodes(
				source,
				function( node ) {
					if( node.type === 'CallExpression' &&
						node.callee.type === 'Identifier' &&
						node.callee.name === 'define' ) {

						if( node.arguments.length === 0 ) return false

						return node.arguments[ 0 ].type === 'Literal'
					}
				}
			)

			return _.map(
				nodes,
				function( node ) {
					return node.arguments[ 0 ].value
				}
			)
		}

		/**
		 * Determines the dependencies of the script modules which are not already resolved by the spell engine include.
		 *
		 * @param engineSource
		 * @param modules
		 * @param scriptModules
		 * @param usedScriptIds
		 * @return {*}
		 */
		var traceScriptModuleDependencies = function( engineSource, modules, scriptModules, usedScriptIds ) {
			var includedModuleNames = createContainedModulesList( engineSource )

			// the available modules include the script modules
			_.extend( modules, scriptModules )

			var scriptModuleDependencies = _.reduce(
				usedScriptIds,
				function( memo, scriptModuleName ) {
					return _.union(
						memo,
						amdHelper.traceDependencies( modules, includedModuleNames, scriptModuleName )
					)
				},
				[]
			)

			return scriptModuleDependencies
		}

		var createAssetList = function( projectAssetsPath ) {
			var filePaths = createFilePaths( [ projectAssetsPath ], [ 'json' ] )

			return _.reduce(
				filePaths,
				function( memo, filePath ) {
					var asset   = JSON.parse( fs.readFileSync( filePath, 'utf-8') ),
						assetId = createAssetId( asset.type, asset.namespace, asset.name )

					if( _.has( memo, assetId ) ) throw 'Error: Duplicate definition of asset \'' + assetId + '\'.'

					var record = {
						type : asset.type,
						resourceId : asset.file
					}

					if( asset.config ) record.config = asset.config

					memo[ assetId ] = record

					return memo
				},
				{}
			)
		}

		var createResourceList = function( assets ) {
			return _.unique( _.pluck( assets, 'resourceId' ) )
		}


		/**
		 * public
		 */

		return function( target, spellPath, projectPath, projectFilePath, callback ) {
			var errors               = [],
				projectBlueprintPath = projectPath + LIBRARY_BLUEPRINTS_PATH

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
			errors = loadBlueprintsFromLibrary( blueprintManager, [ projectBlueprintPath ] )

			if( _.size( errors ) > 0 ) callback( errors )


			// determine all blueprints that are referenced in the project
			var entityBlueprintIds    = _.unique( jsonPath( projectConfig, '$.zones[*].entities[*].blueprintId' ) ),
				systemBlueprintIds    = _.unique( _.flatten( jsonPath( projectConfig, '$.zones[*].systems[*]' ) )),
				componentBlueprintIds = _.union(
					getDependencyBlueprintIds( blueprintManager, entityBlueprintIds, '$.components[*].blueprintId' ),
					getDependencyBlueprintIds( blueprintManager, systemBlueprintIds, '$.input[*].blueprintId' )
				)


			// check if the required blueprints are available
			errors = hasAllBlueprints( blueprintManager, entityBlueprintIds )
			errors = errors.concat( hasAllBlueprints( blueprintManager, componentBlueprintIds ) )
			errors = errors.concat( hasAllBlueprints( blueprintManager, systemBlueprintIds ) )

			if( _.size( errors ) > 0 ) callback( errors )


			// determine scripts that need to be included
			var modules       = amdHelper.loadModules( spellPath + '/src' ),
				scriptModules = amdHelper.loadModules( projectPath + LIBRARY_SCRIPTS_PATH )

			// system script ids
			var usedScriptIds = createDependencyScriptIds( blueprintManager, systemBlueprintIds )

			// zone script ids
			usedScriptIds = usedScriptIds.concat(
				_.unique(
					jsonPath( projectConfig, '$.zones[*].scriptId' )
				)
			)

			errors.concat( hasAllScripts( scriptModules, usedScriptIds ) )

			if( _.size( errors ) > 0 ) callback( errors )


			// reading engine source file
			var spellEngineSourceFilePath = spellPath + '/build/spell.js'

			if( !path.existsSync( spellEngineSourceFilePath ) ) {
				errors.push( 'Error: Could not locate engine include file \'' + spellEngineSourceFilePath + '\'.' )
				callback( errors )
			}

			var engineSource = fs.readFileSync( spellEngineSourceFilePath ).toString( 'utf-8' )


			// Determine dependencies of scripts. Include those modules which are not already included in the engine file in the runtime module.
			var scriptModuleDependencies = traceScriptModuleDependencies( engineSource, modules, scriptModules, usedScriptIds )


			// copy referenced resources to output path
			var zoneList = createZoneList( blueprintManager, projectConfig.zones )

			var relativeAssetsPath  = '/library/assets',
				spellTexturesPath   = spellPath + relativeAssetsPath,
				projectAssetsPath   = projectPath + relativeAssetsPath,
				outputResourcesPath = projectPath + '/public/output/resources',
				assets              = createAssetList( projectAssetsPath ),
				resourceIds         = createResourceList( assets )

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

					inputFilePath = projectAssetsPath + '/' + resourceId

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
				executablesOutputPath = projectPath + '/public/output'



			if( !path.existsSync( tempPath) ) {
				fs.mkdirSync( tempPath )
			}

			var runtimeModuleSource = createRuntimeModule(
				projectConfig.name,
				projectConfig.startZone,
				zoneList,
				createBlueprintList( blueprintManager, componentBlueprintIds ),
				createBlueprintList( blueprintManager, entityBlueprintIds ),
				createBlueprintList( blueprintManager, systemBlueprintIds ),
				assets,
				resourceIds,
				createModuleList(
					_.extend( modules, scriptModules ),
					scriptModuleDependencies
				)
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
