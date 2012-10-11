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

		return config
	}

	var createRequest = function( url ) {
		var request = new XMLHttpRequest()
		request.open( 'GET', url, false )
		request.send( null )

		return request
	}

	var loadModule = function( name, baseUrl ) {
		var moduleUrl = baseUrl + '/' + name + '.js',
			request   = createRequest( moduleUrl )

		if( request.status !== 200 ) throw 'Error: Loading \'' + moduleUrl + '\' failed.'

		var moduleSource = request.responseText

		eval( moduleSource )

		return modules[ name ]
	}

	var createModule = function( name, config ) {
		config = normalizeConfig( config )

		var module = loadModule( name, config.baseUrl )

		if( !module ) throw 'Error: Could not load module \'' + name + '\'.'

		modules[ name ] = module

		return module
	}

	var createModuleInstance = function( dependencies, body, config ) {
		var args = []

		if( dependencies ) {
			for( var i = 0; i < dependencies.length; i++ ) {
				var dependencyName = dependencies[ i ],
					dependencyModule = modules[ dependencyName ]

				if( !dependencyModule ) {
					dependencyModule = createModule( dependencyName, config )
				}

				if( !dependencyModule.instance ) {
					dependencyModule.instance = createModuleInstance( dependencyModule.dependencies, dependencyModule.body )
				}

				args.push( dependencyModule.instance )
			}
		}

		if( config ) args.push( config )

		return body.apply( null, args )
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
		config = config || {}

		if( !name ) throw 'Error: No module name provided.'

		var module = modules[ name ]

		if( !module ) {
			if( config.loadingAllowed === false ) {
				throw 'Error: Missing module \'' + name + '\'. External loading is disabled. Please make sure that all required modules are shipped.'
			}

			module = createModule( name, config )
		}

		if( !module.instance ) {
			module.instance = createModuleInstance( module.dependencies, module.body, args )
		}

		return module.instance
	}

	window.define  = define
	window.require = require
	window.createDependentModules = createDependentModules
} )( document )
