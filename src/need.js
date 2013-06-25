/**
 * need.js - A requiresque require.js replacement for usage in browsers.
 */

( function( document ) {
	var modules  = {}

	var createModuleSource = function( scriptName, source ) {
		return source + '\n//@ sourceURL=' + scriptName
	}

	var createRequest = function( url ) {
		var request = new XMLHttpRequest()

		request.open( 'GET', url, false )
		request.send()

		return request
	}

	var loadModule = function( name, libraryUrl, libraryManager ) {
		var scriptName = name + '.js',
			cachedEntry,
			source

		if( libraryManager ) {
			cachedEntry = libraryManager.get( scriptName )
		}

		if( cachedEntry ) {
			source = cachedEntry

		} else {
			var moduleUrl = libraryUrl ? libraryUrl + '/' + scriptName : scriptName,
				request   = createRequest( moduleUrl )

			if( request.status !== 200 &&
				request.status !== 0 ) {

				throw 'Error: Loading \'' + moduleUrl + '\' failed.'
			}

			source = request.responseText
		}

		eval( createModuleSource( scriptName, source ) )

		return modules[ name ]
	}

	var createModule = function( name, config ) {
		var module = loadModule( name, config.libraryUrl, config.libraryManager )

		if( !module ) throw 'Error: Could not load module \'' + name + '\'.'

		modules[ name ] = module

		return module
	}

	var createModuleInstance = function( dependencies, body, args, config ) {
		var moduleInstanceArgs = []

		if( dependencies ) {
			for( var i = 0; i < dependencies.length; i++ ) {
				var dependencyName   = dependencies[ i ],
					dependencyModule = modules[ dependencyName ]

				if( !dependencyModule && config.hashModuleId ) {
					dependencyModule = modules[ config.hashModuleId( dependencyName ) ]
				}

				if( !dependencyModule ) {
					dependencyModule = createModule( dependencyName, config )
				}

				if( !dependencyModule.instance ) {
					dependencyModule.instance = createModuleInstance( dependencyModule.dependencies, dependencyModule.body, undefined, config )
				}

				moduleInstanceArgs.push( dependencyModule.instance )
			}
		}

		if( args ) moduleInstanceArgs.push( args )

		return body.apply( null, moduleInstanceArgs )
	}

	var traceDependentModules = function( names, dependentModules ) {
		dependentModules = dependentModules || []

		for( var i = 0, numNames = names.length; i < numNames; i++ ) {
			var name = names[ i ]

			for( var moduleName in modules ) {
				var module       = modules[ moduleName ],
					dependencies = module.dependencies

				if( !dependencies ) continue

				for( var i = 0, numDependencies = dependencies.length; i < numDependencies; i++ ) {
					var dependencyName = dependencies[ i ]

					if( name === dependencyName ) {
						dependentModules.push( moduleName )
					}
				}
			}
		}

		return dependentModules
	}

	var createDependentModules = function( name ) {
		return traceDependentModules( [ name ] )
	}

	var define = function( name ) {
		var numArguments = arguments.length,
			arg1         = arguments[ 1 ]

		if( numArguments < 2 ||
			numArguments > 3 ) {

			throw 'Error: Module definition is invalid.'
		}

		if( typeof( arg1 ) === 'string' ) {
			eval( createModuleSource( name + '.js', arg1 ) )

		} else {
			modules[ name ] = {
				body         : ( numArguments === 2 ? arg1 : arguments[ 2 ] ),
				dependencies : ( numArguments === 2 ? undefined : arg1 )
			}
		}
	}

	var require = function( name, args, config ) {
		if( !name ) throw 'Error: No module name provided.'

		var module = modules[ name ]

		if( !module && config.hashModuleId ) {
			module = modules[ config.hashModuleId( name ) ]
		}

		if( !module ) {
			if( config.loadingAllowed === false ) {
				throw 'Error: Missing module \'' + name + '\'. External loading is disabled. Please make sure that all required modules are shipped.'
			}

			module = createModule( name, config )
		}

		if( !module.instance ) {
			module.instance = createModuleInstance( module.dependencies, module.body, args, config )
		}

		return module.instance
	}

	window.define  = define
	window.require = require
	window.createDependentModules = createDependentModules
} )( document )
