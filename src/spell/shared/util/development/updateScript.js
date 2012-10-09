define(
	'spell/shared/util/development/updateScript',
	[
		'spell/shared/util/createId',
		'spell/shared/util/createModuleId',
		'spell/shared/util/template/TemplateTypes',

		'spell/functions'
	],
	function(
		createId,
		createModuleId,
		TemplateTypes,

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
			var scriptId = payload.id

			// reload amd module
			define( scriptId, payload.moduleSource )

			// restart the affected systems
			var sceneManager = spell.sceneManager,
				systemIds    = createAffectedSystems(
					spell.templateManager,
					createDependentModules( scriptId ).concat( scriptId )
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
