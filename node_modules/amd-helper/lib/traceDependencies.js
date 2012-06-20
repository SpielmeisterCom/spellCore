_  = require( 'underscore' )
_s = require( 'underscore.string' )


var isModuleIncluded = function( ListedModules, moduleName ) {
	return _.any(
		ListedModules,
		function( listedModuleName ) {
			return _s.startsWith( moduleName, listedModuleName + '/' ) ||
				moduleName === listedModuleName
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
			return _.union(
				memo,
				traceDependencies( modules, blackListModules, dependencyModuleName )
			)
		},
		result
	)
}

module.exports = traceDependencies
