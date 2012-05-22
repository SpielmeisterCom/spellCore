define(
	'spell/server/build/createServer',
	[
		'spell/shared/build/executeCreateDebugBuild',
		'spell/shared/build/initializeProjectDirectory',

		'spell/shared/util/platform/underscore'
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

		/**
		 * RPC call handler
		 *
		 * @param spellPath
		 * @param projectsPath
		 * @param req
		 * @param res
		 * @param payload
		 * 	payload[ 0 ] : target ( html5, flash )
		 * 	payload[ 1 ] : relative project path in projects directory
		 * 	payload[ 2 ] : relative project file path inside project directory
		 *
		 * @param next
		 * @return {*}
		 */
		var executeCreateDebugBuildWrapper = function( spellPath, projectsPath, req, res, payload, next ) {
			var target          = payload[ 0 ],
				projectPath     = projectsPath + '/' + payload[ 1 ],
				projectFilePath = projectsPath + '/' + payload[ 2 ]

			return executeCreateDebugBuild( target, spellPath, projectPath, projectFilePath )
		}

		/**
		 * RPC call handler
		 *
		 * @param spellPath
		 * @param projectsPath
		 * @param req
		 * @param res
		 * @param payload
		 * @param next
		 * @return {*}
		 */
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
						name: 'executeCreateDebugBuild',
						len: 3,
						func: _.bind( executeCreateDebugBuildWrapper, null, spellPath, projectsPath )
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
