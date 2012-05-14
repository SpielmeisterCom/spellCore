define(
	'spell/server/build/createServer',
	[
		'spell/shared/build/executeCreateDebugBuild',
		'spell/shared/build/initializeProjectDirectory',

		'underscore'
	],
	function(
		executeCreateDebugBuild,
		initializeProjectDirectory,

		_
	) {
		'use strict'


		/**
		 * private
		 */

		var createDevelopmentBuild = function( spellPath, projectsPath, req, res, payload, next ) {
			var projectPath     = projectsPath + '/' + payload[ 0 ],
				projectFilePath = projectsPath + '/' + payload[ 1 ]

			return executeCreateDebugBuild( spellPath, projectPath, projectFilePath )
		}

		var initDirectory = function( spellPath, projectsPath, req, res, payload, next  ) {
			var projectName     = payload[ 0 ],
				projectPath     = projectsPath + '/' + projectName,
				projectFilePath = projectsPath + '/' + payload[ 1 ]

			return initializeProjectDirectory( spellPath, projectName, projectPath, projectFilePath )
		}


		/**
		 * public
		 */

		return function( spellPath, projectsPath ) {
			return {
				ProjectActions: [
					{
						name: 'createDevelopmentBuild',
						len: 2,
						func: _.bind( createDevelopmentBuild, null, spellPath, projectsPath )
					},
					{
						name: 'initDirectory',
						len: 2,
						func: _.bind( initDirectory, null, spellPath, projectsPath )
					}
				]
			}
		}
	}
)
