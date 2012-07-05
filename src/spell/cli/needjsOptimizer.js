define(
	'spell/cli/needjsOptimizer',
	[
		'amd-helper',
		'commander',
		'fs',
		'glob',
		'path',

		'underscore.string',
		'spell/functions'
	],
	function(
		amdHelper,
		commander,
		fs,
		glob,
		path,

		_s,
		_
	) {
		/*
		 * private
		 */

		var list = function( val ) {
			return val.split( ',' )
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
						amdHelper.traceDependencies( modules, [], moduleName )
					)
				},
				[]
			)
		}


		/*
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

			if( !fs.existsSync( sourcePath ) ) {
				console.error( 'Error: Could not read base directory \'' + sourcePath + '\'.' )
			}

			var modules                 = amdHelper.loadModules( sourcePath ),
				entryModuleDependencies = amdHelper.traceDependencies( modules, blackListModules, entryModuleName ),
				resultModules           = null

			if( !commander.extract ) {
				resultModules = entryModuleDependencies

			} else {
				resultModules = _.difference(
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
