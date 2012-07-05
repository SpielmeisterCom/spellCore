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
		'spell/shared/util/template/TemplateManager',
		'spell/shared/util/template/TemplateTypes',
		'spell/shared/util/createAssetId',

		'amd-helper',
		'fs',
		'glob',
		'util',
		'mkdirp',
		'path',

		'jsonPath',
		'underscore.string',
		'spell/functions'
	],
	function(
		filterNodes,
		copyFile,
		createReducedEntityConfig,
		buildFlashExecutable,
		buildHtml5Executable,
		isDirectory,
		isFile,
		TemplateManager,
		TemplateTypes,
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


		/*
		 * private
		 */

		var LIBRARY_TEMPLATES_PATH = '/library/templates'
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

		var checkTemplateValidity = function( template ) {
			var entityId = template.namespace + '.' + template.name,
				childEntityIds = jsonPath( template, '$..children[*].templateId' )

			if( _.contains( childEntityIds, entityId ) ) {
				return 'Error: Entity template \'' + entityId + '\' contains a reference to itself via its children.'
			}

			return false
		}

		var loadTemplates = function( templateManager, templates, type ) {
			var errors = []

			_.each(
				_.filter( templates, function( template ) { return template.template.type === type } ),
				function( template ) {
					var error = checkTemplateValidity( template.template )

					if( error ) errors.push( checkTemplateValidity( template.template ) )

					try {
						templateManager.add( template.template )

					} catch( e ) {
						var regex = /Error: Template definition '(.*)' already exists./,
							match = e.match( regex )

						if( match ) {
							errors.push( 'Error: Overwriting of template \'' + match[ 1 ] + '\' by template definition in file \'' + template.filePath + '\' was prevented.' )

						} else {
							errors.push( e.toString() )
						}
					}
				}
			)

			return errors
		}

		var loadTemplatesFromPaths = function( templateManager, filePaths ) {
			var errors = []

			var templates = _.reduce(
				filePaths,
				function( memo, filePath ) {
					var data = fs.readFileSync( filePath, 'utf-8')

					try {
						var template = JSON.parse( data )

					} catch( e ) {
						if( _s.startsWith( e, 'SyntaxError' ) ) {
							errors.push( 'Error: Unexpected token \'' + _.last( e.toString().split( ' ' ) ) + '\' while parsing file \'' + filePath + '\'.' )

							return memo
						}
					}

					return memo.concat( {
						template : template,
						filePath : filePath
					} )
				},
				[]
			)

			errors = errors.concat(
				loadTemplates( templateManager, templates, TemplateTypes.COMPONENT )
			)

			if( errors.length > 0 ) return errors


			errors = errors.concat(
				loadTemplates( templateManager, templates, TemplateTypes.ENTITY )
			)

			if( errors.length > 0 ) return errors


			errors = errors.concat(
				loadTemplates( templateManager, templates, TemplateTypes.SYSTEM )
			)

			return errors
		}

		var loadTemplatesFromLibrary = function( templateManager, libraryPaths ) {
			var errors = [],
				filePaths = createFilePaths( libraryPaths, [ 'json' ] )

			errors = errors.concat(
				loadTemplatesFromPaths( templateManager, filePaths )
			)

			return errors
		}

		var hasAllTemplates = function( templateManager, templateIds ) {
			var errors = []

			_.each(
				templateIds,
				function( templateId ) {
					if( !templateManager.hasTemplate( templateId ) ) {
						errors.push( 'Error: Required template \'' + templateId + '\' could not be found.' )
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

		var createDependencyScriptIds = function( templateManager, systemTemplateIds ) {
			return _.reduce(
				systemTemplateIds,
				function( memo, templateId ) {
					return memo.concat( templateManager.getTemplate( templateId).scriptId )
				},
				[]
			)
		}

		var createTemplateList = function( templateManager, templateIds ) {
			return _.map(
				templateIds,
				function( templateId ) {
					return templateManager.getTemplate( templateId )
				}
			)
		}

		var createSceneList = function( templateManager, scenes ) {
			return _.map(
				scenes,
				function( scene ) {
					var reducedEntityConfig = _.map(
						scene.entities,
						function( entityConfig ) {
							return createReducedEntityConfig( templateManager, entityConfig )
						}
					)

					return {
						entities : reducedEntityConfig,
						name : scene.name,
						scriptId : scene.scriptId,
						systems : scene.systems
					}
				}
			)
		}

		var createRuntimeModule = function( projectName, startSceneId, scenes, componentTemplates, entityTemplates, systemTemplates, assets, resources, modules ) {
			var runtimeModule = {
				name: projectName,
				startScene : startSceneId,
				scenes : scenes,
				componentTemplates : componentTemplates,
				entityTemplates : entityTemplates,
				systemTemplates : systemTemplates,
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

		/*
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
						type : asset.type
					}

					if( asset.type === 'animation' ) {
						record.assetId = asset.assetId

					} else {
						record.resourceId = asset.file
					}

					if( asset.config ) record.config = asset.config

					memo[ assetId ] = record

					return memo
				},
				{}
			)
		}

		var createResourceList = function( assets ) {
			return _.reduce(
				assets,
				function( memo, asset ) {
					if( !_.has( asset, 'resourceId' ) ) return memo

					return _.union( memo, asset.resourceId )
				},
				[]
			)
		}


		/*
		 * public
		 */

		return function( target, spellPath, projectPath, projectFilePath, callback ) {
			var errors               = [],
				projectTemplatePath = projectPath + LIBRARY_TEMPLATES_PATH

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


			// read all template files from template library
			var templateManager = new TemplateManager()
			errors = loadTemplatesFromLibrary( templateManager, [ projectTemplatePath ] )

			if( _.size( errors ) > 0 ) callback( errors )


			// determine all templates
			var entityTemplateIds    = templateManager.getTemplateIds( TemplateTypes.ENTITY ),
				systemTemplateIds    = templateManager.getTemplateIds( TemplateTypes.SYSTEM ),
				componentTemplateIds = templateManager.getTemplateIds( TemplateTypes.COMPONENT )


			// check if the required templates are available
			errors = hasAllTemplates( templateManager, entityTemplateIds )
			errors = errors.concat( hasAllTemplates( templateManager, componentTemplateIds ) )
			errors = errors.concat( hasAllTemplates( templateManager, systemTemplateIds ) )

			if( _.size( errors ) > 0 ) callback( errors )


			// determine scripts that need to be included
			var modules       = amdHelper.loadModules( spellPath + '/src' ),
				scriptModules = amdHelper.loadModules( projectPath + LIBRARY_SCRIPTS_PATH )

			// system script ids
			var usedScriptIds = createDependencyScriptIds( templateManager, systemTemplateIds )

			// scene script ids
			usedScriptIds = usedScriptIds.concat(
				_.unique(
					jsonPath( projectConfig, '$.scenes[*].scriptId' )
				)
			)

			errors.concat( hasAllScripts( scriptModules, usedScriptIds ) )

			if( _.size( errors ) > 0 ) callback( errors )


			// reading engine source file
			var spellEngineSourceFilePath = spellPath + '/build/spell.js'

			if( !fs.existsSync( spellEngineSourceFilePath ) ) {
				errors.push( 'Error: Could not locate engine include file \'' + spellEngineSourceFilePath + '\'.' )
				callback( errors )
			}

			var engineSource = fs.readFileSync( spellEngineSourceFilePath ).toString( 'utf-8' )


			// Determine dependencies of scripts. Include those modules which are not already included in the engine file in the runtime module.
			var scriptModuleDependencies = traceScriptModuleDependencies( engineSource, modules, scriptModules, usedScriptIds )


			// copy referenced resources to output path
			var sceneList = createSceneList( templateManager, projectConfig.scenes )

			var relativeAssetsPath  = '/library/assets',
				spellTexturesPath   = spellPath + relativeAssetsPath,
				projectAssetsPath   = projectPath + relativeAssetsPath,
				outputResourcesPath = projectPath + '/public/output/resources',
				assets              = createAssetList( projectAssetsPath ),
				resourceIds         = _.union(
					createResourceList( assets ),
					'spell/OpenSans14px.png'
				)

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



			if( !fs.existsSync( tempPath) ) {
				fs.mkdirSync( tempPath )
			}

			var runtimeModuleSource = createRuntimeModule(
				projectConfig.name,
				projectConfig.startScene,
				sceneList,
				createTemplateList( templateManager, componentTemplateIds ),
				createTemplateList( templateManager, entityTemplateIds ),
				createTemplateList( templateManager, systemTemplateIds ),
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
