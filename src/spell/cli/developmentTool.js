require( { baseUrl: "src" } )

require(
	[
		'spell/shared/build/executeBuildDevelopment',
		'spell/shared/build/isFile',

		'commander',
		'fs',
		'path',
		'underscore'
	],
	function(
		executeBuildDevelopment,
		isFile,

		commander,
		fs,
		path,
		_
	) {
		var createProjectPath = function( spellPath ) {
			var parts = spellPath.split( '/' )

			return parts.slice( 0, parts.length - 2 ).join( '/' )
		}

		var executableName  = 'sappre',
			spellPath       = process.cwd(),
			projectPath     = createProjectPath( spellPath ),
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

		var processBuild = function( projectFilePath, target ) {
			var errors = []

			if( !target ) target = buildTargets.DEVELOPMENT

			if( target === buildTargets.DEVELOPMENT ) {
				if( isFile( projectFilePath ) ) {
					errors = executeBuildDevelopment( spellPath, projectPath, projectFilePath )

				} else {
					errors.push( 'Error: Missing project file \'' + projectFilePath + '\'.' )
				}

				if( _.size( errors ) > 0 ) errors.push( 'Error: Parsing \'' + projectFilename + '\' failed.' )

			} else if( target === buildTargets.DEPLOYMENT ) {


			} else if( target === buildTargets.ALL ) {

			} else {
				console.log( 'Error: \'' + target + '\' is not a valid build target. See \'' + executableName + ' --help\'.' )
			}


			if(_.size( errors ) > 0 ) printErrors( errors )
		}


		commander
			.version( '0.0.1' )
//			.option( '-C, --chdir <path>', 'change the working directory' )

		commander
			.command( 'build [target]' )
			.description( 'build a version for a target [all, deploy, dev (default)]' )
			.action( _.bind( processBuild, this, projectFilePath ) )

		commander.parse( _.rest( process.argv ) )
	}
)
