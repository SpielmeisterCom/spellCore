/**
 * need.js - A requiresque require.js replacement for usage in browsers.
 */

( function( document ) {
	var modules  = {},
		BASE_URL = 'library'

	var normalizeConfig = function( config ) {
		if( !config ) {
			config = {}
		}

		if( !config.baseUrl ) {
			config.baseUrl = BASE_URL
		}

		if( !config.cache ) {
			config.cache = {}
		}

		return config
	}

	var createRequest = function( url ) {
		var request = new XMLHttpRequest()
		request.open( 'GET', url, false )
		request.send( null )

		return request
	}

	var loadModule = function( name, baseUrl, cache ) {
		var scriptName  = name + '.js',
			cachedEntry = cache[ scriptName ],
			moduleSource

		if( cachedEntry ) {
			moduleSource = cachedEntry

		} else {
			var moduleUrl = baseUrl + '/' + scriptName,
				request   = createRequest( moduleUrl )

			if( request.status !== 200 ) throw 'Error: Loading \'' + moduleUrl + '\' failed.'

			moduleSource = request.responseText
		}

		eval( moduleSource )

		return modules[ name ]
	}

	var createModule = function( name, config ) {
		config = normalizeConfig( config )

		var module = loadModule( name, config.baseUrl, config.cache )

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
					dependencyModule = createModule( dependencyName, args )
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
			eval( arg1 )

		} else {
			modules[ name ] = {
				body         : ( numArguments === 2 ? arg1 : arguments[ 2 ] ),
				dependencies : ( numArguments === 2 ? undefined : arg1 )
			}
		}
	}

	var require = function( name, args, config ) {
		if( !name ) throw 'Error: No module name provided.'

		config = config || {}

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
