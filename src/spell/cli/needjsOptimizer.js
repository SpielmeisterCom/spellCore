define(
	'spell/cli/needjsOptimizer',
	[
		'commander',
		'fs',
		'path',

		'underscore.string',
		'spell/shared/util/platform/underscore'
	],
	function(
		commander,
		fs,
		path,

		_s,
		_
	) {
		/**
		 * private
		 */

		var list = function( val ) {
			return val.split( ',' )
		}

		var extractModuleHeader= function( moduleSource ) {
			moduleSource = moduleSource.replace( /\r?\n|\r/g, '' )

			// TODO: Parsing the define statement like this wins first price for in category ugly. Make it stop.
			var regex  = /.*define\((\s\[.*\]|[^\[,]*)\s*,\s*(\[.*?\])?.*\).*/,
				match  = moduleSource.match( regex )

			if( !match ) throw 'Error: Parsing error.'


			var match1 = match[ 1 ].replace( /["'\s]/g, '' ),
				match2 = match[ 2 ] ? match[ 2 ].replace( /["'\s]/g, '' ) : ''

			return {
				moduleName   : ( _s.contains( match1, '[' ) ? '' : match1 ),
				dependencies : ( _s.contains( match1, '[' ) ?
					match1.replace( /[\[\]]/g, '' ).split( ',' ) :
					( _s.contains( match2, '[' ) ?
						match2.replace( /[\[\]]/g, '' ).split( ',' ) :
						[]
					)
				)
			}
		}

		var isModuleIncluded = function( blackListModules, whiteListModules, moduleName ) {
			var blackListed = _.any(
				blackListModules,
				function( blackListedModuleName ) {
					return _s.startsWith( moduleName, blackListedModuleName )
				}
			)

			if( blackListed ) return false

			if( whiteListModules.length > 0 ) {
				return _.any(
					whiteListModules,
					function( whiteListedModuleName ) {
						return _s.startsWith( moduleName, whiteListedModuleName )
					}
				)
			}

			return true
		}

		/**
		 * Removes modules from the dependency list according to black and white list.
		 *
		 * @param blackListModules
		 * @param whiteListModules
		 * @param dependencies
		 * @return {*}
		 */
		var removeCertainModules = function( blackListModules, whiteListModules, dependencies ) {
			if( blackListModules.length === 0 &&
				whiteListModules.length === 0 ) {

				return dependencies
			}

			return _.filter(
				dependencies,
				function( dependencyModuleName ) {
					return isModuleIncluded( blackListModules, whiteListModules, dependencyModuleName )
				}
			)
		}

		var traceDependencies = function( sourcePath, blackListModules, whiteListModules, moduleName ) {
			var result = []

			if( isModuleIncluded( blackListModules, whiteListModules, moduleName ) ) {
				result = [ moduleName ]
			}

			// read file
			var moduleFilePath = path.join( sourcePath, moduleName ) + '.js'

			if( !path.existsSync( moduleFilePath ) ) {
				console.error( 'Error: Could not read module \'' + moduleFilePath + '\'.' )
				process.exit()
			}

			var fileContent = fs.readFileSync( moduleFilePath ).toString( 'utf-8' )

			// extract module dependencies which are not excluded
			var moduleHeader = extractModuleHeader( fileContent ),
				dependencies = removeCertainModules( blackListModules, whiteListModules, moduleHeader.dependencies )

			// iterate
			return _.reduce(
				dependencies,
				function( memo, dependencyModuleName ) {
					memo = _.union(
						memo,
						traceDependencies( sourcePath, blackListModules, whiteListModules, dependencyModuleName )
					)

					return memo
				},
				result
			)
		}

		var printModuleContents = function( sourcePath, moduleNames ) {
			_.each(
				moduleNames.reverse(),
				function( moduleName ) {
					console.log(
						fs.readFileSync( sourcePath + '/' + moduleName + '.js').toString( 'utf-8' )
					)
				}
			)
		}


		/**
		 * public
		 */

		return function( argv, cwd, spellPath ) {
			var executableName  = 'n.js'

			commander
				.version( '0.0.1' )

			commander
				.option( '-b, --base <path>', 'the path to the source directory' )
				.option( '-m, --module <name>', 'the name of the entry module of the application' )
				.option( '-e, --exclude <items>', 'the name(s) of the module(s) or namespaces that should be excluded (mutual exclusive with option -i)', list )
				.option( '-i, --include <items>', 'the name(s) of the module(s) or namespaces that should be included (mutual exclusive with option -e)', list )
				.option( '-l, --list', 'prints the names of the traced modules to stdout instead of a concatenation of the modules contents' )
				.parse( argv )

			var sourcePath       = ( commander.base ? path.normalize( commander.base ) : cwd ),
				entryModuleName  = commander.module,
				blackListModules = commander.exclude || [],
				whiteListModules = commander.include || []

			if( !entryModuleName ) {
				console.log( 'No entry module was supplied. See \'' + executableName + ' --help\'.' )
				return
			}

			// check sourcePath
			if( !path.existsSync( sourcePath ) ) {
				console.error( 'Error: Could not read base directory \'' + sourcePath + '\'.' )
			}

			var moduleNames = traceDependencies(
				sourcePath,
				blackListModules,
				whiteListModules,
				entryModuleName
			)

			if( commander.list ) {
				console.log( moduleNames.join( '\n' ) )

			} else {
				printModuleContents( sourcePath, moduleNames )
			}
		}
	}
)
