define(
	'spell/shared/util/development/updateScript',
	[
		'spell/shared/util/createId',
		'spell/shared/util/createModuleId',
		'spell/shared/util/template/TemplateTypes',
		'spell/shared/util/platform/PlatformKit',

		'spell/functions'
	],
	function(
		createId,
		createModuleId,
		TemplateTypes,
		PlatformKit,

		_
	) {
		'use strict'


		var createAffectedSystems = function( templateManager, dependentModules ) {
			var systems = templateManager.getTemplatesByType( TemplateTypes.SYSTEM )

			return _.reduce(
				systems,
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
			define( moduleId, payload.moduleSource )

			// restart the affected systems
			var sceneManager = spell.sceneManager,
				systemIds    = createAffectedSystems(
					spell.templateManager,
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
