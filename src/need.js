var need = {
	modules: {}
}


var resolveDependencies = function( moduleName ) {
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


var enterMain = function( mainModuleName ) {
	var wrapper = function() {
		resolveDependencies( mainModuleName )
	}

	// the web client must wait until the dom construction is finished
	var isBrowser = !!( typeof window !== "undefined" && navigator && document )

	if( !isBrowser ) {
		wrapper()
		return
	}

	if( document.addEventListener ) {
		document.addEventListener(
			"DOMContentLoaded",
			wrapper,
			false
		)

	} else if( document.attachEvent ) {
		// this is for IE
		document.attachEvent(
			"onreadystatechange",
			wrapper
		)
	}
}
