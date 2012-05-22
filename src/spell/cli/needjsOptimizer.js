define(
	'spell/cli/needjsOptimizer',
	[
		'commander',
		'fs',
		'glob',
		'path',

		'underscore.string',
		'spell/shared/util/platform/underscore'
	],
	function(
		commander,
		fs,
		glob,
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

			if( !match ) return false


			var match1 = match[ 1 ].replace( /["'\s]/g, '' ),
				match2 = match[ 2 ] ? match[ 2 ].replace( /["'\s]/g, '' ) : ''

			return {
				name : ( _s.contains( match1, '[' ) ? '' : match1 ),
				dependencies : ( _s.contains( match1, '[' ) ?
					match1.replace( /[\[\]]/g, '' ).split( ',' ) :
					( _s.contains( match2, '[' ) ?
						match2.replace( /[\[\]]/g, '' ).split( ',' ) :
						[]
					)
				)
			}
		}

		var isModuleIncluded = function( ListedModules, moduleName ) {
			return _.any(
				ListedModules,
				function( listedModuleName ) {
					return _s.startsWith( moduleName, listedModuleName )
				}
			)
		}

		var traceDependencies = function( modules, blackListModules, moduleName ) {
			if( isModuleIncluded( blackListModules, moduleName ) ) {
				return []
			}

			var result = [ moduleName ],
				module = modules[ moduleName ]

			if( !module ) throw 'Error: Could not find module \'' + moduleName + '\'.'

			// iterate
			return _.reduce(
				module.dependencies,
				function( memo, dependencyModuleName ) {
					memo = _.union(
						memo,
						traceDependencies( modules, blackListModules, dependencyModuleName )
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

		var createModuleList = function( sourcePath ) {
			var filePattern = sourcePath + '/**/*.js',
				filePaths = glob.sync( filePattern, {} )

			return _.reduce(
				filePaths,
				function( memo, filePath ) {
					var fileContent = fs.readFileSync( filePath ).toString( 'utf-8'),
						moduleHeader = extractModuleHeader( fileContent )

					if( !moduleHeader ) return memo

					if( !moduleHeader.name ) {
						console.error( 'Error: Anonymous module in file \'' + filePath + '\' is not supported.' )
						return memo
					}

					memo[ moduleHeader.name ] = {
						dependencies : moduleHeader.dependencies,
						source : fileContent
					}

					return memo
				},
				{}
			)
		}

		var traceExtractNamespaceDependencies = function( modules, extractNamespace ) {
			var modulesInNamespace = _.reduce(
				modules,
				function( memo, value, key ) {
					if( _s.startsWith( key, extractNamespace ) ) {
						memo.push( key )
					}

					return memo
				},
				[]
			)

			return _.reduce(
				modulesInNamespace,
				function( memo, moduleName ) {
					return _.union(
						memo,
						traceDependencies( modules, [], moduleName )
					)
				},
				[]
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
				.option( '-s, --source-base <path>', 'the path to the source directory' )
				.option( '-m, --module <name>', 'the name of the entry module of the application' )
				.option( '-i, --ignore <items>', 'the name(s) of the module(s) or namespaces that should be ignored', list )
				.option( '-e, --extract <name>', 'the namespace whose dependencies should be extracted' )
				.option( '-l, --list', 'prints the names of the traced modules to stdout instead of a concatenation of the modules contents' )
				.parse( argv )

			var sourcePath       = ( commander.sourceBase ? path.normalize( commander.sourceBase ) : cwd ),
				entryModuleName  = commander.module,
				blackListModules = commander.ignore || [],
				extractNamespace = commander.extract || []

			if( !entryModuleName ) {
				console.log( 'No entry module was supplied. See \'' + executableName + ' --help\'.' )
				return
			}

			if( !path.existsSync( sourcePath ) ) {
				console.error( 'Error: Could not read base directory \'' + sourcePath + '\'.' )
			}

			var modules                 = createModuleList( sourcePath ),
				entryModuleDependencies = traceDependencies( modules, blackListModules, entryModuleName ),
				resultModules           = null

			if( !commander.extract ) {
				resultModules = entryModuleDependencies

			} else {
				resultModules = _.without(
					traceExtractNamespaceDependencies( modules, extractNamespace ),
					entryModuleDependencies
				)
			}

			if( commander.list ) {
				console.log( resultModules.join( '\n' ) )

			} else {
				printModuleContents( sourcePath, resultModules )
			}
		}
	}
)
