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


		return function( resourceLoader, isModeDevelopment ) {
			return {
				require : function( moduleId ) {
					var config = {
						resourceLoader : isModeDevelopment ? resourceLoader : undefined,
						hashModuleId   : hashModuleId,
						loadingAllowed : isModeDevelopment
					}

					return PlatformKit.ModuleLoader.require( moduleId, null, config )
				}
			}
		}
	}
)
