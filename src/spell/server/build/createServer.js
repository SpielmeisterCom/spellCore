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

		var createDevelopmentBuild = function( spellPath, req, res, payload, next ) {
			var projectPath = payload[ 0 ],
				projectFilePath = payload[ 1 ]

			return executeCreateDebugBuild( spellPath, projectPath, projectFilePath )
		}

		var initDirectory = function( spellPath, req, res, payload, next  ) {
			var projectPath = payload[ 0 ],
				projectFilePath = payload[ 1 ]

			return initializeProjectDirectory( spellPath, projectPath, projectFilePath )
		}


		/**
		 * public
		 */

		return function( spellPath ) {
			return {
				ProjectActions: [
					{
						name: "createDevelopmentBuild",
						len: 2,
						func: _.bind( createDevelopmentBuild, null, spellPath )
					},
					{
						name: "initDirectory",
						len: 2,
						func: _.bind( initDirectory, null, spellPath )
					}
				]
			}
		}
	}
)
