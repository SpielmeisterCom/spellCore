define(
	'spell/shared/build/executeCreateDeployBuild',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/createModuleId',
		'spell/shared/build/processSource',
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',
		'spell/shared/util/createId',
		'spell/shared/util/hashModuleIdentifier',
		'spell/shared/util/template/TemplateTypes',

		'amd-helper',
		'fs',
		'flob',
		'mkdirp',
		'path'
	],
	function(
		copyFile,
		createModuleId,
		processSource,
		isDirectory,
		isFile,
		createId,
		hashModuleIdentifier,
		TemplateTypes,

		amdHelper,
		fs,
		flob,
		mkdirp,
		path
	) {
		'use strict'


		var LIBRARY_PATH   = 'library'
		var ASSETS_PATH    = LIBRARY_PATH + '/assets'
		var SCRIPTS_PATH   = LIBRARY_PATH + '/scripts'
		var TEMPLATES_PATH = LIBRARY_PATH + '/templates'
		var DEPLOY_PATH    = 'build/deploy'

		var dataFileTemplate = [
			'%1$s;',
			'spell.setCache(%2$s);',
			'spell.setRuntimeModule(%3$s);'
		].join( '\n' )


		var loadJsonFromPaths = function( result, libraryPath, filePaths ) {
			var errors = []

			_.each(
				filePaths,
				function( filePath ) {
					var fullyQualifiedFilePath = path.join( libraryPath, filePath )

					var data = fs.readFileSync( fullyQualifiedFilePath, 'utf-8')

					try {
						var content = JSON.parse( data )

					} catch( e ) {
						if( _s.startsWith( e, 'SyntaxError' ) ) {
							errors.push( 'Error: Unexpected token \'' + _.last( e.toString().split( ' ' ) ) + '\' while parsing file \'' + fullyQualifiedFilePath + '\'.' )
						}
					}

					result.push( {
						content  : content,
						filePath : filePath
					} )
				}
			)

			return errors
		}

		var loadJsonFromLibrary = function( result, libraryPath ) {
			var filePaths = flob.sync(
				'**/*.json',
				{
					root : libraryPath
				}
			)

			return loadJsonFromPaths( result, libraryPath, filePaths )
		}

		var readProjectConfigFile = function( filePath ) {
			return fs.readFileSync( filePath, 'utf-8' )
		}

		var parseProjectConfig = function( projectConfigData, callback ) {
			var errors = [],
				projectConfig

			try {
				projectConfig = JSON.parse( projectConfigData )

			} catch( e ) {
				if( _s.startsWith( e, 'SyntaxError' ) ) {
					errors.push( e.toString() )

					callback( errors )
				}
			}

			return projectConfig
		}

		var createProjectConfig = function( projectConfigRaw, anonymizeModuleIdentifiers ) {
			var result = _.pick( projectConfigRaw, 'name', 'startScene', 'templateIds', 'assetIds' )

			result.scenes = createSceneList( projectConfigRaw.scenes, anonymizeModuleIdentifiers )

			return result
		}

		var writeFile = function( filePath, content ) {
			// delete file if it already exists
			if( isFile( filePath ) ) {
				fs.unlinkSync( filePath )
			}

			fs.writeFileSync( filePath, content, 'utf-8' )
		}

		var createCacheContent = function( resources ) {
			return _.reduce(
				resources,
				function( memo, resource ) {
					var content  = resource.content,
						filePath = resource.filePath

					if( _.has( memo, filePath ) ) {
						throw 'Error: Resource path duplication detected. Could not build.'
					}

					memo[ filePath ] = JSON.stringify( content )

					return memo
				},
				{}
			)
		}

		var createSceneList = function( scenes, anonymizeModuleIdentifiers ) {
			return _.map(
				scenes,
				function( scene ) {
					return {
						entities : scene.entities,
						name     : scene.name,
						scriptId : anonymizeModuleIdentifiers ? hashModuleIdentifier( createModuleId( scene.scriptId ) ) : scene.scriptId,
						systems  : scene.systems
					}
				}
			)
		}

		var loadLibrary = function( projectLibraryPath, result ) {
			var library = [],
				errors  = loadJsonFromLibrary( library, projectLibraryPath )

			_.each(
				library,
				function( record ) {
					var type = record.content.type

					if( !result[ type ] ) {
						result[ type ] = [ record ]

					} else {
						result[ type ].push( record )
					}
				}
			)

			return errors
		}

		var loadScriptModules = function( projectLibraryPath, scripts ) {
			return _.reduce(
				scripts,
				function( memo, script ) {
					var moduleFilePath = path.join(
						projectLibraryPath,
						script.filePath.replace( /json$/, 'js' )
					)

					var module = amdHelper.loadModule( moduleFilePath )

					if( module ) {
						memo[ module.name ] = module
					}

					return memo
				},
				{}
			)
		}

		var createDataFileContent = function( dataFileTemplate, scriptSource, cachedResources, projectConfig ) {
			return _s.sprintf(
				dataFileTemplate,
				scriptSource,
				JSON.stringify( cachedResources ),
				JSON.stringify( projectConfig )
			)
		}

		var copyFiles = function( sourceDirectoryPath, targetDirectoryPath, filePaths ) {
			_.each(
				filePaths,
				function( filePathInfo ) {
					// indicates if the path and or name of the file changes from source to target location
					var isMoved = _.isArray( filePathInfo ) && filePathInfo.length === 2

					var sourceFilePath = isMoved ?
						filePathInfo[ 0 ] :
						path.resolve( sourceDirectoryPath,  filePathInfo )

					if( isDirectory( sourceFilePath ) ) return


					var targetFilePath = isMoved ?
						filePathInfo[ 1 ] :
						path.resolve( targetDirectoryPath,  filePathInfo )

					var targetPath = path.dirname( targetFilePath )

					if( !fs.existsSync( targetPath ) ) {
						mkdirp.sync( targetPath )
					}

					copyFile( sourceFilePath, targetFilePath )
				}
			)
		}

		var loadSystemScriptModules = function( projectLibraryPath, templates ) {
			return _.reduce(
				templates,
				function( memo, template ) {
					if( template.content.subtype !== TemplateTypes.SYSTEM ) return memo

					var id             = createId( template.content.namespace, template.content.name ),
						moduleId       = createModuleId( id ),
						moduleFilePath = path.join( projectLibraryPath, moduleId + '.js' ),
						module         = amdHelper.loadModule( moduleFilePath )

					if( module ) {
						memo[ module.name ] = module
					}

					return memo
				},
				{}
			)
		}


		return function( target, spellCorePath, projectPath, projectFilePath, callback ) {
			var errors                     = [],
				minify                     = true,
				anonymizeModuleIdentifiers = true,
				projectLibraryPath         = path.join( projectPath, LIBRARY_PATH ),
				deployPath                 = path.join( projectPath, DEPLOY_PATH ),
				deployLibraryPath          = path.join( deployPath, LIBRARY_PATH ),
				deployHtml5Path            = path.join( deployPath, 'html5' ),
				projectConfigData          = readProjectConfigFile( projectFilePath ),
				projectConfigRaw           = parseProjectConfig( projectConfigData, callback ),
				projectConfig              = createProjectConfig( projectConfigRaw, anonymizeModuleIdentifiers )


			// loading the library
			var library = {}

			errors = errors.concat(
				loadLibrary( projectLibraryPath, library )
			)

			if( _.size( errors ) > 0 ) callback( errors )


			// load all scripts
			var scriptModules = loadScriptModules( projectLibraryPath, library.script )

			scriptModules = _.extend(
				scriptModules,
				loadSystemScriptModules( projectLibraryPath, library.template )
			)


			console.log( library.script )


			// write data file to "build/deploy/html5/data.js"
			if( !fs.existsSync( deployHtml5Path ) ) {
				mkdirp.sync( deployHtml5Path )
			}

			var dataFilePath = path.resolve( deployHtml5Path, 'data.js' )

			var scriptSource = processSource(
				_.pluck( scriptModules, 'source' ).join( '\n' ),
				minify,
				anonymizeModuleIdentifiers
			)

			var cachedResources = createCacheContent(
				library.template.concat( library.asset )
			)

			writeFile(
				dataFilePath,
				createDataFileContent(
					dataFileTemplate,
					scriptSource,
					cachedResources,
					projectConfig
				)
			)


			// copying all files required by the build to the deployment directory "build/deploy"

			// the library files
			var deployFilePaths = flob.sync( '**/*', { cwd : projectLibraryPath } )

			// public template files go to "build/deploy/*"
			deployFilePaths.push( [
				path.join( spellCorePath, 'publicTemplate', 'index.html' ),
				path.join( deployPath, 'index.html' )
			] )

			deployFilePaths.push( [
				path.join( spellCorePath, 'publicTemplate', 'main.css' ),
				path.join( deployPath, 'main.css' )
			] )

			// stage zero loader goes to "build/deploy/spell.js"
			deployFilePaths.push( [
				path.join( spellCorePath, 'src/spell/client/stageZeroLoader.js' ),
				path.join( deployPath, 'spell.js' )
			] )

			// minified, anonymized engine include goes to "build/deploy/html5/spell.js"
			deployFilePaths.push( [
				path.join( spellCorePath, 'build/spell.deploy.js' ),
				path.join( deployHtml5Path, 'spell.js' )
			] )

			copyFiles( projectLibraryPath, deployLibraryPath, deployFilePaths )
		}
	}
)
