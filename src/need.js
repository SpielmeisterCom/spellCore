/**
 * need.js - A requiresque require.js replacement for usage in browsers.
 */

( function( document ) {
	var modules  = {}

	var arrayContains = function( array, value ) {
		return array.indexOf( value ) !== -1
	}

	var createUrlWithCacheBreaker = function( url ) {
		return url + '?t=' + Date.now()
	}

	var createModuleSource = function( scriptName, source ) {
		return source + '\n//# sourceURL=' + scriptName
	}

	var createRequest = function( url ) {
		var request = new XMLHttpRequest()

		request.open(
			'GET',
			createUrlWithCacheBreaker( url ),
			false
		)

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

	var createDependentModulesR = function( dependencyName, result ) {
		for( var dependentName in modules ) {
			var dependentModule = modules[ dependentName ]

			if( !dependentModule ) {
				throw 'Error: Module id "' + dependentName + '" could not be resolved.'
			}

			if( arrayContains( dependentModule.dependencies, dependencyName ) &&
				!arrayContains( result, dependentName ) ) {

				result.push( dependentName )

				createDependentModulesR( dependentName, result )
			}
		}

		return result
	}

	var createDependentModules = function( name ) {
		return createDependentModulesR( name, [] )
	}

	var define = function( name ) {
		var numArguments = arguments.length,
			arg1         = arguments[ 1 ]

		if( numArguments < 2 ||
			numArguments > 3 ) {

			throw 'Error: Module definition is invalid.'
		}

		// call this function again through eval
		if( typeof( arg1 ) === 'string' ) {
			eval( createModuleSource( name + '.js', arg1 ) )

			return
		}

		// "redefine" the module
		if( modules[ name ] ) {
			modules[ name ].instance = undefined

			// reset instances of all dependent modules so that consecutive calls to require need to rebuild their dependencies with updated module instances
			var dependentModules = createDependentModules( name )

			for( var i = 0, n = dependentModules.length; i < n; i++ ) {
				modules[ dependentModules[ i ] ].instance = undefined
			}
		}

		// create the module
		modules[ name ] = {
			body         : numArguments === 2 ? arg1 : arguments[ 2 ],
			dependencies : numArguments === 2 ? [] : arg1,
			instance     : undefined
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

	window.define = define
	window.require = require
	window.createDependentModules = createDependentModules
} )( document )
