define(
	'spell/shared/build/executeCreateBuild',
	[
		'spell/shared/build/createDebugPath',
		'spell/shared/build/copyFiles',
		'spell/shared/util/createModuleId',
		'spell/shared/build/processSource',
		'spell/shared/build/isDevEnvironment',
		'spell/shared/build/isFile',
		'spell/shared/build/loadAssociatedScriptModules',
		'spell/shared/build/executable/buildHtml5',
		'spell/shared/build/executable/buildFlash',
		'spell/shared/util/createCacheContent',
		'spell/shared/util/createIdFromLibraryFilePath',
		'spell/shared/util/hashModuleId',

		'amd-helper',
		'fs',
		'flob',
		'mkdirp',
		'path'
	],
	function(
		createDebugPath,
		copyFiles,
		createModuleId,
		processSource,
		isDevEnvironment,
		isFile,
		loadAssociatedScriptModules,
		buildHtml5,
		buildFlash,
		createCacheContent,
		createIdFromLibraryFilePath,
		hashModuleId,

		amdHelper,
		fs,
		flob,
		mkdirp,
		path
	) {
		'use strict'


		var LIBRARY_PATH = 'library'
		var OUTPUT_PATH  = 'build/release'

		var targetToBuilder = {
			html5 : buildHtml5,
			flash : buildFlash
		}


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

		var createProjectConfig = function( projectConfigRaw ) {
			var result = _.pick( projectConfigRaw, 'name', 'startScene', 'libraryIds', 'config' )

			result.scenes = createSceneList( projectConfigRaw.scenes )

			return result
		}

		var createSceneList = function( scenes ) {
			return _.map(
				scenes,
				function( scene ) {
					return {
						entities : scene.entities,
						name     : scene.name,
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

		var createProjectLibraryFilePaths = function( projectLibraryPath ) {
			var filePaths = _.filter(
				flob.sync( '**/*', { cwd : projectLibraryPath } ),
				function( filePath ) {
					var extension = path.extname( filePath )

					return extension !== '.js' && extension !== '.json'
				}
			)

			return filePaths
		}


		return function( target, spellCorePath, projectPath, projectFilePath, minify, anonymizeModuleIds, debug, callback ) {
			var errors             = [],
				projectLibraryPath = path.join( projectPath, LIBRARY_PATH ),
				outputPath         = path.join( projectPath, OUTPUT_PATH ),
				outputLibraryPath  = path.join( outputPath, LIBRARY_PATH ),
				projectConfigData  = readProjectConfigFile( projectFilePath ),
				projectConfigRaw   = parseProjectConfig( projectConfigData, callback ),
				projectConfig      = createProjectConfig( projectConfigRaw )


			// loading the library
			var library = {}

			errors = errors.concat(
				loadLibrary( projectLibraryPath, library )
			)

			if( _.size( errors ) > 0 ) callback( errors )

			// load all scripts
			var scriptModules = _.extend(
				loadScriptModules( projectLibraryPath, library.script ),
				loadAssociatedScriptModules( projectLibraryPath, library.scene ),
				loadAssociatedScriptModules( projectLibraryPath, library.system )
			)

			// generate script source
			var scriptSource = processSource(
				_.pluck( scriptModules, 'source' ).join( '\n' ),
				!debug, // minify
				!debug  // anonymizeModuleIds
			)

			// generate cache content
			var cacheContent = createCacheContent(
				_.flatten(
					_.pick(
						library,
						'asset',
						'component',
						'entityTemplate',
						'scene',
						'script',
						'system'
					),
					true
				)
			)


			// copy common files

			// the library files
			var outputFilePaths = createProjectLibraryFilePaths( projectLibraryPath )

			// public template files go to "build/release/*"
			outputFilePaths.push( [
				path.join( spellCorePath, 'htmlTemplate', 'index.html' ),
				path.join( outputPath, 'index.html' )
			] )

			outputFilePaths.push( [
				path.join( spellCorePath, 'htmlTemplate', 'main.css' ),
				path.join( outputPath, 'main.css' )
			] )

			// stage zero loader goes to "build/release/spell.loader.js"
			outputFilePaths.push( [
				createDebugPath( debug, 'spell.loader.js', 'spell.loader.min.js', path.join( spellCorePath, 'lib' ) ),
				path.join( outputPath, 'spell.loader.js' )
			] )

			// copy new library content to destination
			copyFiles( projectLibraryPath, outputLibraryPath, outputFilePaths )


			// create build
			var build = targetToBuilder[ target ]

			if( !build ) {
				throw 'The target \'' + target + '\' is not supported.'
			}

			build(
				spellCorePath,
				projectPath,
				projectLibraryPath,
				outputPath,
				outputLibraryPath,
				projectConfig,
				library,
				cacheContent,
				scriptSource,
				minify,
				anonymizeModuleIds,
				debug,
				callback
			)
		}
	}
)
