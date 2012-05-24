var need = {
	modules: {}
}


var resolveDependencies = function( moduleName, config ) {
	if( moduleName === undefined ||
		moduleName === "" ) {

		throw "No module name was provided."
	}


	var module = need.modules[ moduleName ]

	if( module === undefined ||
		module.definition === undefined ) {

		throw "Unable to find module definition for module '" + moduleName + "'."
	}


	var dependencies = module.definition[ 0 ]
	var callback     = module.definition[ 1 ]

	var args = []

	for( var i = 0; i < dependencies.length; i++ ) {
		var name = dependencies[ i ]

		if( need.modules[ name ] === undefined ) {
			throw 'Could not find module definition for dependency "' + name + '" of module "' + moduleName + '" . Is it included and registered via define?'
		}

		if( need.modules[ name ].instance === undefined ) {
			need.modules[ name ].instance = resolveDependencies( dependencies[ i ] )
		}

		args.push(
			need.modules[ name ].instance
		)
	}

	if( config ) {
		args.push( config )
	}

	return callback.apply( null, args )
}


var define = function( name, dependencies, callback ) {
	if( arguments.length < 2 ||
		arguments.length > 3 ) {

		throw "Definition is invalid."
	}


	if( arguments.length === 2 ) {
		// No dependencies were provided. Thus arguments looks like this [ name, constructor ].

		callback = dependencies
		dependencies = []
	}

	var module = {
		definition: [ dependencies, callback ]
	}

	need.modules[ name ] = module
}


var require = function( dependencies, callback ) {
	if( dependencies === undefined ||
		callback === undefined ) {

		throw "The provided arguments do not match."
	}


	var args = []

	for( var i = 0; i < dependencies.length; i++ ) {
		args.push(
			resolveDependencies( dependencies[ i ] )
		)
	}


	callback.apply( null, args )
}

enterMain = function( mainModuleName, args ) {
	resolveDependencies( mainModuleName, args )
}
