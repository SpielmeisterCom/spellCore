define(
	'spell/client/development/library/updateScript',
	[
		'spell/shared/util/createId',
		'spell/shared/util/createModuleId',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		createId,
		createModuleId,
		PlatformKit,

		_
	) {
		'use strict'


		var createAffectedSystems = function( libraryManager, dependentModules ) {
			return _.reduce(
				libraryManager.getMetaDataRecordsByType( 'system' ),
				function( memo, system ) {
					var systemId       = createId( system.namespace, system.name ),
						systemModuleId = createModuleId( systemId )

					if( _.contains( dependentModules, systemModuleId ) ) {
						memo.push( systemId )
					}

					return memo
				},
				[]
			)
		}

		return function( spell, payload ) {
			var moduleId = createModuleId( payload.id )

			// reload amd module
			PlatformKit.ModuleLoader.define( moduleId, payload.moduleSource )

			// restart the affected systems
			var sceneManager = spell.sceneManager,
				systemIds    = createAffectedSystems(
					spell.libraryManager,
					PlatformKit.ModuleLoader.createDependentModules( moduleId ).concat( moduleId )
				)

			_.each(
				systemIds,
				function( systemId ) {
					sceneManager.restartSystem( systemId )
				}
			)
		}
	}
)
