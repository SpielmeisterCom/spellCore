require( { baseUrl: "src" } )

require(
	[
		'funkysnakes/server/main',

		'spell/shared/build/executeBuildDevelopment',
		'spell/shared/build/initializeProjectDirectory',
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',

		'commander',
		'fs',
		'path',
		'underscore'
	],
	function(
		serverMain,

		executeBuildDevelopment,
		initializeProjectDirectory,
		isDirectory,
		isFile,

		commander,
		fs,
		path,
		_
	) {
		var executableName  = 'sappre',
			argv            = process.argv.slice( 2, process.argv.length + 1),
			spellPath       = process.cwd(),
			projectPath     = argv[ 1 ],
			projectFilename = 'project.json',
			projectFilePath = projectPath + '/' + projectFilename

		var buildTargets = {
			DEVELOPMENT: 'dev',
			DEPLOYMENT: 'deploy',
			ALL: 'all'
		}

//		var executeBuildDeployment = function( projectFilePath ) {
//		}

		var printErrors = function( errors ) {
			console.log( errors.join( '\n' ) )
		}

		var buildCommand = function( projectFilePath, target ) {
			var errors = []

			if( !target ) target = buildTargets.DEVELOPMENT

			if( target === buildTargets.DEVELOPMENT ) {
				if( isFile( projectFilePath ) ) {
					errors = executeBuildDevelopment( spellPath, projectPath, projectFilePath )

				} else {
					errors.push( 'Error: Missing project file \'' + projectFilePath + '\'.' )
				}

			} else if( target === buildTargets.DEPLOYMENT ) {


			} else if( target === buildTargets.ALL ) {

			} else {
				console.log( 'Error: \'' + target + '\' is not a valid build target. See \'' + executableName + ' --help\'.' )
			}


			if( _.size( errors ) > 0 ) {
				errors.push( 'Error: Build failed.' )
				printErrors( errors )

			} else {
				console.log( 'Completed build successfully' )
			}
		}

		var startServerCommand = function( command ) {
			var errors = [],
				cwdPath = argv[ 1 ],
				userId = command.user || process.getuid(),
				projectsPath = path.resolve( cwdPath + ( command.projectsRoot ? '/' + command.projectsRoot : '' ) )

			if( !projectsPath ) errors.push( 'Error: No projects directory supplied. Unable to start build server.' )

			if( _.size( errors ) > 0 ) {
				printErrors( errors )

			} else {
				serverMain( spellPath, projectsPath, userId, command.port )
			}
		}

		var initCommand = function( spellPath, projectPath, projectFilePath ) {
			var errors = initializeProjectDirectory( spellPath, projectPath, projectFilePath )

			if( _.size( errors ) > 0 ) {
				printErrors( errors )

			} else {
				console.log( 'Initialized spell project in \'' + projectPath + '\'' )
			}
		}

		var infoCommand = function( spellPath, projectPath, projectFilePath ) {
			console.log( 'spell sdk path:\t\t' + spellPath )
			console.log( 'project path:\t\t' + projectPath )
			console.log( 'project file path:\t' + projectFilePath )
		}


		commander
			.version( '0.0.1' )

		commander
			.command( 'build [target]' )
			.description( 'build a version for a target [all, deploy, dev (default)]' )
			.action( _.bind( buildCommand, this, projectFilePath ) )

		commander
			.command( 'start-server' )
			.option( '-u, --user [username]', 'the user the server drops it\'s privileges to' )
			.option( '-p, --port [port number]', 'the port the server runs on' )
			.option( '-r, --projects-root [directory]', 'the path to the projects directory, that contains the project directories' )
			.description( 'start the dev server - run with superuser privileges to enable flash target support' )
			.action( startServerCommand )

		commander
			.command( 'init' )
			.description( 'initialize the current working directory with spell project scaffolding' )
			.action( _.bind( initCommand, this, spellPath, projectPath, projectFilePath ) )

		commander
			.command( 'info' )
			.description( 'print information about current environment' )
			.action( _.bind( infoCommand, this, spellPath, projectPath, projectFilePath ) )

		commander.parse( argv )
	}
)
