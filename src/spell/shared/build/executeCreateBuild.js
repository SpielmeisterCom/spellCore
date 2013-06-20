define(
	'spell/shared/build/executeCreateBuild',
	[
		'spell/shared/build/cleanDirectory',
		'spell/shared/build/createDebugPath',
		'spell/shared/build/createProjectLibraryFilePaths',
		'spell/shared/build/copyFiles',
		'spell/shared/util/createModuleId',
		'spell/shared/build/processSource',
		'spell/shared/build/isFile',
		'spell/shared/build/loadAssociatedScriptModules',
		'spell/shared/build/target/android/AndroidBuilder',
		'spell/shared/build/target/web/WebBuilder',
		'spell/shared/util/createCacheContent',
		'spell/shared/util/createIdFromLibraryFilePath',
		'spell/shared/util/hashModuleId',
		'spell/functions',

		'amd-helper',
		'fs',
		'flob',
		'path'
	],
	function(
		cleanDirectory,
		createDebugPath,
		createProjectLibraryFilePaths,
		copyFiles,
		createModuleId,
		processSource,
		isFile,
		loadAssociatedScriptModules,
		AndroidBuilder,
		WebBuilder,
		createCacheContent,
		createIdFromLibraryFilePath,
		hashModuleId,
		_,

		amdHelper,
		fs,
		flob,
		path
	) {
		'use strict'


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

		return function( target, spellCorePath, projectPath, projectFilePath, minify, anonymizeModuleIds, debug, next ) {
			var errors             = [],
				buildMode          = debug ? 'debug' : 'release',
				projectLibraryPath = path.join( projectPath, 'library' ),
				projectBuildPath   = path.join( projectPath, 'build' ),
				outputPath         = path.join( projectBuildPath, buildMode ),
				projectConfigData  = readProjectConfigFile( projectFilePath ),
				projectConfigRaw   = parseProjectConfig( projectConfigData, next ),
				projectConfig      = createProjectConfig( projectConfigRaw ),
				target             = target || 'html5'

			// loading the library
			var library = {}

			errors = errors.concat(
				loadLibrary( projectLibraryPath, library )
			)

			if( _.size( errors ) > 0 ) next( errors )

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

			var builderTypes = [ AndroidBuilder, WebBuilder ]

			var builders = _.map(
				builderTypes,
				function( builderType ) {
					var builder = new builderType(
						spellCorePath,
						projectPath,
						projectLibraryPath,
						outputPath,
						target,
						projectConfig,
						library,
						cacheContent,
						scriptSource,
						minify,
						anonymizeModuleIds,
						debug
					)

					builder.init()

					return builder
				}
			)

			var builtSomething = false

			_.each(
				builders,
				function( builder ) {
					if( !builder.handlesTarget( target ) ) {
						return
					}

					builder.build()

					builtSomething = true
				}
			)

			if( !builtSomething ) {
				next( 'Error: Build target "' + target + '" is not supported.' )
			}

			next()
		}
	}
)
