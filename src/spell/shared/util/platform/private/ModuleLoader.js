define(
	'spell/shared/util/platform/private/ModuleLoader',
	function() {
		'use strict'


		/**
		 * The global needjs public functions are wrapped into this amd module in order to prevent a dependency on global namespace.
		 */

		var createDependentModules = typeof window === 'undefined' ?
			function() {} :
			window.createDependentModules

		return {
			createDependentModules : createDependentModules,
			require                : require,
			define                 : define
		}
	}
)
