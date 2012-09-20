/**
 * need.js - A requiresque require.js replacement for usage in browsers.
 */

( function( document ) {
	var modules  = {},
		BASE_URL = 'library'

	var createScriptNode = function( name, source ) {
		var script = document.createElement( 'script' )
		script.type = 'text/javascript'
		script.text = source

		var head = document.getElementsByTagName( 'head' )[ 0 ]
		head.appendChild( script )
	}

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

		createScriptNode( name, request.responseText )

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
				var dependencyModuleName = dependencies[ i ],
					dependencyModule = modules[ dependencyModuleName ]

				if( !dependencyModule ) {
					dependencyModule = createModule( dependencyModuleName, config )
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


	var define = function( name ) {
		var numArguments = arguments.length

		if( numArguments < 2 ||
			numArguments > 3 ) {

			throw 'Error: Module definition is invalid.'
		}

		modules[ name ] = {
			body         : ( numArguments === 2 ? arguments[ 1 ] : arguments[ 2 ] ),
			dependencies : ( numArguments === 2 ? undefined : arguments[ 1 ] )
		}
	}


	var require = function( moduleName, args, config ) {
		config = config || {}

		if( !moduleName ) throw 'Error: No module name provided.'

		var module = modules[ moduleName ]

		if( !module ) {
			if( config.loadingAllowed === false ) {
				throw 'Error: Missing module \'' + moduleName + '\'. External loading is disabled. Please make sure that all required modules are shipped.'
			}

			module = createModule( moduleName, config )
		}

		if( !module.instance ) {
			module.instance = createModuleInstance( module.dependencies, module.body, args )
		}

		return module.instance
	}

	window.define  = define
	window.require = require
} )( document )
