define(
	'spell/shared/util/createModuleLoader',
	[
		'spell/shared/util/hashModuleId',
		'spell/shared/util/platform/PlatformKit'
	],
	function(
		hashModuleId,
		PlatformKit
	) {
		'use strict'


		return function( libraryManager, isModeDevelopment ) {
			return {
				require : function( moduleId ) {
					var config = {
						libraryManager : isModeDevelopment ? libraryManager : undefined,
						hashModuleId   : hashModuleId,
						loadingAllowed : isModeDevelopment
					}

					return PlatformKit.ModuleLoader.require( moduleId, null, config )
				}
			}
		}
	}
)
