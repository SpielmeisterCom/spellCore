define(
	'spell/cli/developmentTool',
	[
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


		/*
		 * public
		 */

		return function( argv, cwd, basePath, isDevEnv ) {
			var executableName = 'spellcli',
				spellCorePath  = getSpellCorePath( basePath, isDevEnv )

			var buildTargets = {
				HTML5 : 'html5',
				FLASH : 'flash',
				ALL : 'all'
			}

			var buildCommand = function( cwd, target, command ) {
				var projectPath        = path.resolve( cwd ),
					errors             = checkProjectPath( projectPath ),
					debug              = command.debug || false,
					minify             = !debug,
					anonymizeModuleIds = true

				if( errors.length > 0 ) printErrors( errors )

				if( !target ) {
					target = buildTargets.HTML5
				}

				if( !_.contains( _.values( buildTargets ), target ) ) {
					errors.push( 'Error: \'' + target + '\' is not a valid target. See \"' + executableName + ' --help\" for usage information.' )
				}

				if( errors.length > 0 ) printErrors( errors )

				var projectFilePath = createProjectFilePath( projectPath )

				if( !isFile( projectFilePath ) ) {
					printErrors( 'Error: Missing project file \'' + projectFilePath + '\'.' )
				}

				// figuring out the requested targets
				if( target === 'all' ) {
					targets = [ buildTargets.HTML5, buildTargets.FLASH ]

				} else {
					targets = [ target ]
				}

				// begin building
				console.log( 'building...' )
				if( debug ) console.log( ' -> debug mode is enabled' )

				var afterAllBuildsCompleted = _.after(
					targets.length,
					_.bind( onComplete, null, 'build' )
				)

				_.each(
					targets,
					function( target ) {
						console.log( ' -> creating package for target "' + target + '"'  )

						executeCreateBuild(
							target,
							spellCorePath,
							projectPath,
							projectFilePath,
							minify,
							anonymizeModuleIds,
							debug,
							afterAllBuildsCompleted
						)
					}
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

				if( errors.length > 0 ) printErrors( errors )

				var outputFilePath = _.isString( command.file ) ?
					path.resolve( command.file ) :
					path.resolve( projectPath, 'export.zip' )

				exportArchive( spellCorePath, projectPath, outputFilePath, _.bind( onComplete, null, 'export' ) )
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
				.command( 'build [target]' )
				.option( '--debug' )
				.description( 'Create a build for a specific target. Available targets: ' + _.values( buildTargets ).join( ', ' ) )
				.action( _.bind( buildCommand, this, cwd ) )

			commander
				.command( 'init' )
				.option( '-d, --directory [directory]', 'The path to the project directory which should be initialized. The default is the current working directory.' )
				.description( 'initialize a project directory with project scaffolding' )
				.action( _.bind( initCommand, this, spellCorePath, cwd, isDevEnv ) )

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

			commander.parse( argv )
		}
	}
)
