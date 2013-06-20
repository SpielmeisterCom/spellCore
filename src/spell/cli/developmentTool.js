define(
	'spell/cli/developmentTool',
	[
		'spell/shared/build/cleanDirectory',
		'spell/shared/build/executeCreateBuild',
		'spell/shared/build/exportArchive',
		'spell/shared/build/isDevEnvironment',
		'spell/shared/build/initializeProjectDirectory',
		'spell/shared/build/isFile',
		'spell/shared/build/isDirectory',
		'spell/shared/Configuration',

		'commander',
		'fs',
		'path',
		'spell/functions'
	],
	function(
		cleanDirectory,
		executeCreateBuild,
		exportArchive,
		isDevEnvironment,
		initializeProjectDirectory,
		isFile,
		isDirectory,
		Configuration,

		commander,
		fs,
		path,
		_
	) {
		'use strict'


		var printErrors = function( errors ) {
			var tmp = []
			tmp = tmp.concat( errors )

			console.error( tmp.join( '\n' ) )
		}

		var onComplete = function( action, err, result ) {
			if( err &&
				err.length > 0 ) {

				printErrors( err )
				console.log( action + ' failed' )

				process.exit( 1 )

			} else {
				console.log( action + ' successful' )

				process.exit( 0 )
			}
		}

		var createProjectName = function( projectPath ) {
			return path.basename( projectPath )
		}

		var createProjectFilePath = function( projectPath ) {
			return path.join( projectPath, 'project.json' )
		}

		var checkProjectPath = function( projectPath ) {
			var projectFilePath = createProjectFilePath( projectPath )

			if( !isFile( projectFilePath ) ) {
				return [ 'Error: The directory "' + projectPath + '" does not contain a spell project.' ]
			}

			return []
		}

		var getSpellCorePath = function( basePath, isDevEnv ) {
			var spellCorePath = path.join( basePath, 'build', 'spellCore' )

			if( isDevEnv &&
				isDirectory( spellCorePath ) ) {

				return spellCorePath
			}

			spellCorePath = path.join( basePath, 'spellCore' )

			if( !isDirectory( spellCorePath ) ) {
				printErrors( 'Could not locate directory "spellCore".' )
			}

			return spellCorePath
		}


		return function( argv, cwd, basePath, isDevEnv ) {
			var spellCorePath  = getSpellCorePath( basePath, isDevEnv )

			var cleanCommand = function( cwd ) {
				var projectPath = path.resolve( cwd ),
					errors      = checkProjectPath( projectPath )

				if( errors.length > 0 ) printErrors( errors )

				console.log( 'cleaning...' )

				cleanDirectory( path.join( projectPath, 'build' ) )
			}

			var buildCommand = function( cwd, target, command ) {
				console.log( 'building...' )

				var projectPath        = path.resolve( cwd ),
					errors             = checkProjectPath( projectPath ),
					debug              = command.debug || false,
					minify             = !debug,
					anonymizeModuleIds = true

				if( errors.length > 0 ) printErrors( errors )

				var projectFilePath = createProjectFilePath( projectPath )

				if( !isFile( projectFilePath ) ) {
					printErrors( 'Error: Missing project file "' + projectFilePath + '".' )
				}

				executeCreateBuild(
					target,
					spellCorePath,
					projectPath,
					projectFilePath,
					minify,
					anonymizeModuleIds,
					debug,
					_.bind( onComplete, null, 'build' )
				)
			}

			var initCommand = function( spellCorePath, cwd, isDevEnvironment, command ) {
				var projectPath = path.resolve( command.directory || cwd )

				var errors = initializeProjectDirectory(
					spellCorePath,
					createProjectName( projectPath ),
					projectPath,
					createProjectFilePath( projectPath ),
					isDevEnvironment
				)

				if( errors.length > 0 ) {
					printErrors( errors )

				} else {
					console.log( 'Initialized project in ' + projectPath )
				}
			}

			var exportCommand = function( spellCorePath, cwd, command ) {
				var projectPath = path.resolve( command.directory || cwd ),
					errors      = checkProjectPath( projectPath )

				if( errors.length > 0 ) {
					printErrors( errors )
				}

				var outputFilePath = _.isString( command.file ) ?
					path.resolve( command.file ) :
					path.resolve( projectPath, 'export.zip' )

				exportArchive(
					spellCorePath,
					projectPath,
					outputFilePath,
					_.bind( onComplete, null, 'export' )
				)
			}

			var infoCommand = function( spellCorePath, cwd ) {
				var projectPath = path.resolve( cwd ),
					errors      = checkProjectPath( projectPath )

				if( errors.length > 0 ) printErrors( errors )

				console.log( 'spellCore directory: ' + spellCorePath )
				console.log( 'project directory: ' + projectPath )
			}

			// prepare argv array
			if( argv.length < 3 ) {
				argv.push( '-h' )
			}

			commander
				.version( Configuration.version )

			commander
				.command( 'clean' )
				.description( 'cleans the build directory' )
				.action( _.bind( cleanCommand, this, cwd ) )

			commander
				.command( 'build [target]' )
				.option( '--debug', 'creates a debug build' )
				.option( '--release', 'creates a release build' )
				.description( 'creates a build for a specific target; available targets: web, web-html5, web-flash, android, ios' )
				.action( _.bind( buildCommand, this, cwd ) )

			commander
				.command( 'export' )
				.option( '-d, --directory [directory]', 'The path to the project directory which should be initialized. The default is the current working directory.' )
				.option( '-f, --file [file]', 'the name of the output file' )
				.description( 'export a deployment ready version into a zip archive' )
				.action( _.bind( exportCommand, this, spellCorePath, cwd ) )

			commander
				.command( 'info' )
				.description( 'print information about current environment' )
				.action( _.bind( infoCommand, this, spellCorePath, cwd ) )

			commander
				.command( 'init' )
				.option( '-d, --directory [directory]', 'The path to the project directory which should be initialized. The default is the current working directory.' )
				.description( 'initialize a project directory with project scaffolding' )
				.action( _.bind( initCommand, this, spellCorePath, cwd, isDevEnv ) )

			commander.parse( argv )
		}
	}
)
