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
		}

		var onComplete = function( action, errors ) {
			if( errors &&
				errors.length > 0 ) {

				printErrors( errors )
				console.log( action + ' failed' )
				process.exit()

			} else {
				console.log( action + ' completed' )
			}
		}

		/**
		 * Returns the execution environment, 'devel' when the system is run in a development environment, 'deploy' when in deployment environment.
		 *
		 * @param {String} spellCorePath
		 * @return {String}
		 */
		var getEnvironment = function( spellCorePath ) {
			var developmentEngineIncludeFilePath = path.join( spellCorePath, 'build/spell.dev.js' )

			return isFile( developmentEngineIncludeFilePath ) ? 'devel' : 'deploy'
		}


		/*
		 * public
		 */

		return function( argv, cwd, spellCorePath ) {
			var executableName   = 'sappre',
				projectPath      = cwd,
				projectFilename  = 'project.json',
				projectFilePath  = projectPath + '/' + projectFilename

			var buildTargets = {
				HTML5 : 'html5',
				FLASH : 'flash',
				ALL   : 'all'
			}

			var buildCommand = function( projectFilePath, target, command ) {
				var errors = []

				if( !target ) target = buildTargets.HTML5

				if( !_.contains( _.values( buildTargets ), target ) ) {
					errors.push( 'Error: \'' + target + '\' is not a valid target. See \"' + executableName + ' --help\" for usage information.' )
				}

				if( errors.length > 0 ) {
					printErrors( errors )

					return
				}

				console.log( 'creating deployment build for target \'' + target + '\'...' )

				if( isFile( projectFilePath ) ) {
					executeCreateDeployBuild( target, spellCorePath, projectPath, projectFilePath, _.bind( onComplete, null, 'build' ) )

				} else {
					printErrors( 'Error: Missing project file \'' + projectFilePath + '\'.' )
				}
			}

			var startServerCommand = function( command ) {
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

			var initCommand = function( spellCorePath, projectPath, projectFilePath, isDevEnvironment ) {
				var errors = initializeProjectDirectory( spellCorePath, path.basename( projectPath ), projectPath, projectFilePath, isDevEnvironment )

				if( errors.length > 0 ) {
					printErrors( errors )

				} else {
					console.log( 'Initialized spell project in \'' + projectPath + '\'' )
				}
			}

			var exportCommand = function( projectPath, command ) {
				var outputFilePath = _.isString( command.file ) ?
					path.resolve( command.file ) :
					path.resolve( projectPath, 'export.tar' )

				exportDeploymentArchive( projectPath, outputFilePath, _.bind( onComplete, null, 'export' ) )
			}

			var infoCommand = function( spellCorePath, projectPath, projectFilePath ) {
				console.log( 'spell sdk path:\t\t' + spellCorePath )
				console.log( 'project path:\t\t' + projectPath )
				console.log( 'project file path:\t' + projectFilePath )
			}


			commander
				.version( '0.0.1' )

			commander
				.command( 'build-deploy [target]' )
				.description( 'build for a specific target [html5 (default)]' )
				.action( _.bind( buildCommand, this, projectFilePath ) )

			commander
				.command( 'start-server' )
				.option( '-u, --user [username]', 'the user the server drops it\'s privileges to' )
				.option( '-p, --port [port number]', 'the port the server runs on' )
				.option( '-r, --projects-root [directory]', 'The path to the projects directory that contains the project directories. The default is the current working directory.' )
				.description( 'start the dev server - run with superuser privileges to enable flash target support' )
				.action( startServerCommand )

			commander
				.command( 'init' )
				.description( 'initialize the current working directory with spell project scaffolding' )
				.action(
					_.bind(
						initCommand,
						this,
						spellCorePath,
						projectPath,
						projectFilePath,
						isDevEnvironment( spellCorePath )
					)
				)

			commander
				.command( 'export' )
				.option( '-f, --file [file]', 'the name of the output file' )
				.description( 'export a deployment ready version into a zip archive' )
				.action( _.bind( exportCommand, this, projectPath ) )

			commander
				.command( 'info' )
				.description( 'print information about current environment' )
				.action( _.bind( infoCommand, this, spellCorePath, projectPath, projectFilePath ) )

			commander.parse( argv )
		}
	}
)
