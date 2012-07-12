define(
	'spell/server/build/createServer',
	[
		'spell/shared/build/executeCreateDebugBuild',
		'spell/shared/build/exportDeploymentArchive',
		'spell/shared/build/initializeProjectDirectory',
		'path',

		'spell/functions'
	],
	function(
		executeCreateDebugBuild,
		exportDeploymentArchive,
		initializeProjectDirectory,
		path,

		_
	) {
		'use strict'

        var printErrors = function( errors ) {
            var tmp = []
            tmp = tmp.concat( errors )

            console.error( tmp.join( '\n' ) )
        }

        var onComplete = function( errors ) {
            if( errors &&
                errors.length > 0 ) {

                printErrors( errors )
            }
        }


		/*
		 * private
		 */

		/*
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
				projectFilePath = projectPath + '/' + payload[ 2 ]

			return executeCreateDebugBuild( target, spellPath, projectPath, projectFilePath, onComplete )
		}

		/*
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

		/*
		 * RPC call handler
		 *
		 * @param projectsPath
		 * @param req
		 * @param res
		 * @param payload
		 * 	payload[ 0 ] : relative project path in projects directory
		 * 	payload[ 1 ] : relative output file path in projects directory
		 *
		 * @param next
		 * @return {*}
		 */
		var exportDeployment = function( projectsPath, req, res, payload, next  ) {
			var projectName    = payload[ 0 ],
				outputFileName = payload[ 1 ],
				projectPath    = path.join( projectsPath, path.normalize( projectName ) ),
				outputFilePath = path.join( projectsPath, path.normalize( outputFileName ) )

			return exportDeploymentArchive( projectPath, outputFilePath, onComplete )
		}


		/*
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
					},
					{
						name: 'exportDeployment',
						len: 2,
						func: _.bind( exportDeployment, null, projectsPath )
					}
				]
			}
		}
	}
)
