define(
	'spell/cli/developmentTool',
	[
		'spell/server/main',

		'spell/shared/build/executeCreateDeployBuild',
		'spell/shared/build/exportDeploymentArchive',
		'spell/shared/build/isDevEnvironment',
		'spell/shared/build/isDirectory',
		'spell/shared/build/initializeProjectDirectory',
		'spell/shared/build/isFile',

		'commander',
		'fs',
		'path',
		'spell/functions'
	],
	function(
		serverMain,

		executeCreateDeployBuild,
		exportDeploymentArchive,
		isDevEnvironment,
		isDirectory,
		initializeProjectDirectory,
		isFile,

		commander,
		fs,
		path,
		_
	) {
		/*
		 * private
		 */

		var printErrors = function( errors ) {
			var tmp = []
			tmp = tmp.concat( errors )

			console.error( tmp.join( '\n' ) )
			process.exit( 1 )
		}

		var onComplete = function( action, errors ) {
			if( errors &&
				errors.length > 0 ) {

				printErrors( errors )
				console.log( action + ' failed' )
				process.exit( 0 )

			} else {
				console.log( action + ' completed' )
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


		/*
		 * public
		 */

		return function( argv, cwd, spellCorePath ) {
			var executableName  = 'sappre'

			var buildTargets = {
				HTML5 : 'html5',
				FLASH : 'flash',
				ALL   : 'all'
			}

			var buildCommand = function( cwd, target, command ) {
				var projectPath = path.resolve( cwd ),
					errors      = checkProjectPath( projectPath )

				if( errors.length > 0 ) printErrors( errors )

				if( !target ) target = buildTargets.HTML5

				if( !_.contains( _.values( buildTargets ), target ) ) {
					errors.push( 'Error: \'' + target + '\' is not a valid target. See \"' + executableName + ' --help\" for usage information.' )
				}

				if( errors.length > 0 ) printErrors( errors )

				console.log( 'creating deployment build for target \'' + target + '\'...' )

				var projectFilePath = createProjectFilePath( projectPath )

				if( isFile( projectFilePath ) ) {
					executeCreateDeployBuild( target, spellCorePath, projectPath, projectFilePath, _.bind( onComplete, null, 'build' ) )

				} else {
					printErrors( 'Error: Missing project file \'' + projectFilePath + '\'.' )
				}
			}

			var startServerCommand = function( cwd, command ) {
				var errors = [],
					projectsPath = path.resolve( cwd + ( command.projectsRoot ? '/' + command.projectsRoot : '' ) )

				if( !fs.existsSync( projectsPath ) ) {
					errors.push( 'Error: No valid projects directory supplied. Unable to start build server. ' +
						'See \'' + executableName + ' start-server --help\'.' )
				}

				if( errors.length > 0 ) {
					printErrors( errors )

				} else {
					serverMain( spellCorePath, projectsPath, command.port )
				}
			}

			var initCommand = function( spellCorePath, cwd, isDevEnvironment, command ) {
				var projectPath = path.resolve( command.directory || cwd )

				errors = initializeProjectDirectory(
					spellCorePath,
					createProjectName( projectPath ),
					projectPath,
					createProjectFilePath( projectPath ),
					isDevEnvironment
				)

				if( errors.length > 0 ) {
					printErrors( errors )

				} else {
					console.log( 'Initialized spell project in \'' + projectPath + '\'' )
				}
			}

			var exportCommand = function( spellCorePath, cwd, command ) {
				var projectPath = path.resolve( cwd ),
					errors      = checkProjectPath( projectPath )

				if( errors.length > 0 ) printErrors( errors )

				var outputFilePath = _.isString( command.file ) ?
					path.resolve( command.file ) :
					path.resolve( projectPath, 'export.tar' )

				exportDeploymentArchive( spellCorePath, projectPath, outputFilePath, _.bind( onComplete, null, 'export' ) )
			}

			var infoCommand = function( spellCorePath, cwd ) {
				var projectPath = path.resolve( cwd ),
					errors      = checkProjectPath( projectPath )

				if( errors.length > 0 ) printErrors( errors )

				console.log( 'spell sdk path:\t\t' + spellCorePath )
				console.log( 'project path:\t\t' + projectPath )
			}


			commander
				.version( '0.0.1' )

			commander
				.command( 'build-deploy [target]' )
				.description( 'build for a specific target [html5 (default)]' )
				.action( _.bind( buildCommand, this, cwd ) )

			commander
				.command( 'start-server' )
				.option( '-u, --user [username]', 'the user the server drops it\'s privileges to' )
				.option( '-p, --port [port number]', 'the port the server runs on' )
				.option( '-r, --projects-root [directory]', 'The path to the projects directory that contains the project directories. The default is the current working directory.' )
				.description( 'start the dev server - run with superuser privileges to enable flash target support' )
				.action( _.bind( startServerCommand, this, cwd ) )

			commander
				.command( 'init' )
				.option( '-d, --directory [directory]', 'The path to the project directory which should be initialized. The default is the current working directory.' )
				.description( 'initialize a project directory with project scaffolding' )
				.action( _.bind( initCommand, this, spellCorePath, cwd, isDevEnvironment( spellCorePath ) ) )

			commander
				.command( 'export' )
				.option( '-f, --file [file]', 'the name of the output file' )
				.description( 'export a deployment ready version into a zip archive' )
				.action( _.bind( exportCommand, this, spellCorePath, cwd ) )

			commander
				.command( 'info' )
				.description( 'print information about current environment' )
				.action( _.bind( infoCommand, this, spellCorePath, cwd ) )

			commander.parse( argv )
		}
	}
)
