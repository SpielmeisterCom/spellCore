var need = {
	modules: {}
}

var resolveDependencies = function( moduleName, config ) {
	if( !moduleName ) throw 'No module name was provided.'


	var module = need.modules[ moduleName ]

	if( !module ) throw 'Unable to find module definition for module \'' + moduleName + '\'.'


	var dependencies = module.dependencies,
		args = []

	for( var i = 0; i < dependencies.length; i++ ) {
		var name = dependencies[ i ],
			dependencyModule = need.modules[ name ]

		if( !dependencyModule ) {
			throw 'Could not find module definition for dependency \'' + name + '\' of module \'' + moduleName + '\' . Is it included and registered via define?'
		}

		if( !dependencyModule.instance ) {
			dependencyModule.instance = resolveDependencies( dependencies[ i ] )
		}

		args.push(
			dependencyModule.instance
		)
	}

	if( config ) args.push( config )

	return module.body.apply( null, args )
}


var define = function( moduleName, dependencies, moduleBody ) {
	if( arguments.length < 2 ||
		arguments.length > 3 ) {

		throw 'Module definition is invalid.'
	}


	if( arguments.length === 2 ) {
		// No dependencies were provided. Thus the arguments look like this [ name, constructor ].

		moduleBody = dependencies
		dependencies = []
	}

	need.modules[ moduleName ] = {
		dependencies : dependencies,
		body : moduleBody
	}
}


var require = function( moduleName ) {
	if( !moduleName ) throw 'No module name provided.'


	var module = need.modules[ moduleName ]

	if( !module ) throw 'Could not resolve module name \'' + moduleName + '\' to module instance.'


	if( !module.instance ) {
		module.instance = resolveDependencies( moduleName )
	}

	return module.instance
}

enterMain = function( moduleName, args ) {
	resolveDependencies( moduleName, args )
}
