define(
	'spell/shared/build/executable/buildHtml5',
	[
		'spell/shared/build/copyFiles',
		'spell/shared/util/createModuleId',
		'spell/shared/build/processSource',
		'spell/shared/build/isDirectory',
		'spell/shared/build/isFile',
		'spell/shared/util/hashModuleId',
		'spell/shared/util/template/TemplateTypes',

		'amd-helper',
		'fs',
		'flob',
		'mkdirp',
		'path'
	],
	function(
		copyFiles,
		createModuleId,
		processSource,
		isDirectory,
		isFile,
		hashModuleId,
		TemplateTypes,

		amdHelper,
		fs,
		flob,
		mkdirp,
		path
	) {
		'use strict'


		var dataFileTemplate = [
			'%1$s;',
			'spell.setCache(%2$s);',
			'spell.setRuntimeModule(%3$s);'
		].join( '\n' )


		var writeFile = function( filePath, content ) {
			// delete file if it already exists
			if( isFile( filePath ) ) {
				fs.unlinkSync( filePath )
			}

			fs.writeFileSync( filePath, content, 'utf-8' )
		}

		var createSceneList = function( scenes, anonymizeModuleIds ) {
			return _.map(
				scenes,
				function( scene ) {
					return {
						entities : scene.entities,
						name     : scene.name,
						scriptId : anonymizeModuleIds ? hashModuleId( createModuleId( scene.scriptId ) ) : scene.scriptId,
						systems  : scene.systems
					}
				}
			)
		}

		var createDataFileContent = function( dataFileTemplate, scriptSource, cacheContent, projectConfig ) {
			return _s.sprintf(
				dataFileTemplate,
				scriptSource,
				JSON.stringify( cacheContent ),
				JSON.stringify( projectConfig )
			)
		}


		return function( spellCorePath, projectPath, projectLibraryPath, deployPath, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			var errors            = [],
				deployLibraryPath = path.join( deployPath, 'library' ),
				deployHtml5Path   = path.join( deployPath, 'html5' )


			// copying all files required by the build to the deployment directory "build/deploy"

			// write data file to "build/deploy/html5/data.js"
			if( !fs.existsSync( deployHtml5Path ) ) {
				mkdirp.sync( deployHtml5Path )
			}

			var dataFilePath = path.resolve( deployHtml5Path, 'data.js' )

			writeFile(
				dataFilePath,
				createDataFileContent(
					dataFileTemplate,
					scriptSource,
					cacheContent,
					projectConfig
				)
			)

			// minified, anonymized engine include goes to "build/deploy/html5/spell.js"
			var deployFilePaths = []

			deployFilePaths.push( [
				path.join( spellCorePath, 'build/spell.deploy.js' ),
				path.join( deployHtml5Path, 'spell.js' )
			] )

			copyFiles( projectLibraryPath, deployLibraryPath, deployFilePaths )

			next()
		}
	}
)
