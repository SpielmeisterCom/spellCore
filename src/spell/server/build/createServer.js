define(
	'spell/server/build/createServer',
	[
		'spell/shared/build/exportDeploymentArchive',
		'spell/shared/build/initializeProjectDirectory',
		'path',

		'spell/functions'
	],
	function(
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
		 * @param spellCorePath
		 * @param projectsPath
		 * @param req
		 * @param res
		 * @param payload
		 * @param next
		 * @return {*}
		 */
		var initDirectory = function( spellCorePath, projectsPath, req, res, payload, next  ) {
			var projectName     = payload[ 0 ],
				projectPath     = projectsPath + '/' + projectName,
				projectFilePath = projectsPath + '/' + payload[ 1 ]

			return initializeProjectDirectory( spellCorePath, projectName, projectPath, projectFilePath )
		}

		/*
		 * RPC call handler
		 *
		 * @param spellCorePath
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
		var exportDeployment = function( spellCorePath, projectsPath, req, res, payload, next  ) {
			var projectName    = payload[ 0 ],
				outputFileName = payload[ 1 ],
				projectPath    = path.join( projectsPath, path.normalize( projectName ) ),
				outputFilePath = path.join( projectsPath, path.normalize( outputFileName ) )

			return exportDeploymentArchive( spellCorePath, projectPath, outputFilePath, onComplete )
		}


		/*
		 * public
		 */

		return function( spellCorePath, projectsPath ) {
			return {
				ProjectActions: [
					{
						name: 'initDirectory',
						len: 2,
						func: _.bind( initDirectory, null, spellCorePath, projectsPath )
					},
					{
						name: 'exportDeployment',
						len: 2,
						func: _.bind( exportDeployment, null, spellCorePath, projectsPath )
					}
				]
			}
		}
	}
)
