define(
	'spell/shared/build/executeCreateDeployBuild',
	[
		'spell/shared/build/copyFile',
		'spell/shared/build/hashModuleIdentifier',
		'spell/shared/build/processSource',
		'spell/shared/build/isFile',
		'spell/shared/util/template/TemplateTypes',

		'amd-helper',
		'fs',
		'glob',
		'mkdirp',
		'path'
	],
	function(
		copyFile,
		hashModuleIdentifier,
		processSource,
		isFile,
		TemplateTypes,

		amdHelper,
		fs,
		glob,
		mkdirp,
		path
	) {
		'use strict'


		var LIBRARY_PATH   = 'library'
		var ASSETS_PATH    = LIBRARY_PATH + '/assets'
		var SCRIPTS_PATH   = LIBRARY_PATH + '/scripts'
		var TEMPLATES_PATH = LIBRARY_PATH + '/templates'
		var DEPLOY_PATH    = 'build/deploy'

		var dataFileTemplate = [
			'%1$s;',
			'spell.setCache(%2$s);',
			'spell.setRuntimeModule(%3$s);'
		].join( '\n' )


		var loadJsonFromPaths = function( result, libraryPath, filePaths ) {
			var errors = []

			_.each(
				filePaths,
				function( filePath ) {
					var fullyQualifiedFilePath = path.join( libraryPath, filePath )

					var data = fs.readFileSync( fullyQualifiedFilePath, 'utf-8')

					try {
						var content = JSON.parse( data )

					} catch( e ) {
						if( _s.startsWith( e, 'SyntaxError' ) ) {
							errors.push( 'Error: Unexpected token \'' + _.last( e.toString().split( ' ' ) ) + '\' while parsing file \'' + fullyQualifiedFilePath + '\'.' )
						}
					}

					result.push( {
						content  : content,
						filePath : filePath
					} )
				}
			)

			return errors
		}

		var loadJsonFromLibrary = function( result, libraryPath ) {
			var filePaths = glob.sync(
				'**/*.json',
				{
					nomount : true,
					cwd : libraryPath
				}
			)

			return loadJsonFromPaths( result, libraryPath, filePaths )
		}


		/**
		 * Creates a list of raw asset files, that is not the json files containing the asset definition but rather the actual low level resources like images,
		 * sounds, etc.
		 *
		 * @param {String} prefix
		 * @param {Array} assets
		 * @return {Array}
		 */
		var createResourceFilePaths = function( prefix, assets ) {
			return _.map(
				_.compact(
					_.unique(
						_.map(
							assets,
							function( it ) {
								return it.content.file
							}
						)
					)
				),
				function( it ) {
					return prefix + '/' + it
				}
			)
		}

		var readProjectConfigFile = function( filePath ) {
			return fs.readFileSync( filePath, 'utf-8' )
		}

		var parseProjectConfig = function( projectConfigData, callback ) {
			var errors = [],
				projectConfig

			try {
				projectConfig = JSON.parse( projectConfigData )

			} catch( e ) {
				if( _s.startsWith( e, 'SyntaxError' ) ) {
					errors.push( e.toString() )

					callback( errors )
				}
			}

			return projectConfig
		}

		var createProjectConfig = function( projectConfigRaw, anonymizeModuleIdentifiers ) {
			var result = _.pick( projectConfigRaw, 'name', 'startScene', 'templateIds', 'assetIds' )

			result.scenes = createSceneList( projectConfigRaw.scenes, anonymizeModuleIdentifiers )

			return result
		}

		var writeFile = function( filePath, content ) {
			// delete file if it already exists
			if( isFile( filePath ) ) {
				fs.unlinkSync( filePath )
			}

			fs.writeFileSync( filePath, content, 'utf-8' )
		}

		var createCacheContent = function( resources ) {
			return _.reduce(
				resources,
				function( memo, resource ) {
					var content  = resource.content,
						filePath = resource.filePath

					if( _.has( memo, filePath ) ) {
						throw 'Error: Resource path duplication detected. Could not build.'
					}

					memo[ filePath ] = JSON.stringify( content )

					return memo
				},
				{}
			)
		}

		var createSceneList = function( scenes, anonymizeModuleIdentifiers ) {
			return _.map(
				scenes,
				function( scene ) {
					return {
						entities : scene.entities,
						name     : scene.name,
						scriptId : anonymizeModuleIdentifiers ? hashModuleIdentifier( scene.scriptId ) : scene.scriptId,
						systems  : scene.systems
					}
				}
			)
		}

		var anonymizeScriptIds = function( template ) {
			template.scriptId = hashModuleIdentifier( template.scriptId )

			return template
		}

		var createTemplateList = function( templates, anonymizeModuleIdentifiers ) {
			if( !anonymizeModuleIdentifiers ) return templates

			return _.map(
				templates,
				function( template ) {
					if( template.content.type !== TemplateTypes.SYSTEM ) return template

					template.content = anonymizeScriptIds( template.content )

					return template
				}
			)
		}


		return function( target, spellCorePath, projectPath, projectFilePath, minify, anonymizeModuleIdentifiers, callback ) {
			var errors                     = [],
				minify                     = true,
				anonymizeModuleIdentifiers = true,
				spellEnginePath            = path.resolve( spellCorePath + '/../..' ),
				projectAssetsPath          = path.join( projectPath, ASSETS_PATH ),
				deployPath                 = path.join( projectPath, DEPLOY_PATH ),
				deployHtml5Path            = path.join( deployPath, 'html5' )

			var projectConfigData = readProjectConfigFile( projectFilePath )
			var projectConfigRaw  = parseProjectConfig( projectConfigData, callback )
			var projectConfig     = createProjectConfig( projectConfigRaw, anonymizeModuleIdentifiers )


			// load all templates
			var templates = []

			errors = errors.concat(
				loadJsonFromLibrary( templates, path.join( projectPath, TEMPLATES_PATH ) )
			)

			templates = createTemplateList( templates, anonymizeModuleIdentifiers )

			if( _.size( errors ) > 0 ) callback( errors )


			// load all assets
			var assets = []

			errors = errors.concat(
				loadJsonFromLibrary( assets, path.join( projectPath, ASSETS_PATH ) )
			)

			if( _.size( errors ) > 0 ) callback( errors )


			// load all scripts
			var scripts = amdHelper.loadModules( path.join( projectPath, SCRIPTS_PATH ) )

			var scriptSource = processSource(
				_.pluck( scripts, 'source' ).join( '\n' ),
				minify,
				anonymizeModuleIdentifiers
			)


			// copy all files in asset directory which are not json files to the directory "build/deploy/library/assets"
			var resourceFilePaths = createResourceFilePaths( 'library/assets', assets )

			// WORKAROUND: This workaround has to stay until fonts get their own asset type.
			resourceFilePaths.push( 'library/assets/spell/OpenSans14px.png' )

			_.each(
				resourceFilePaths,
				function( resourceFilePath ) {
					var sourceFilePath = path.resolve( projectPath, resourceFilePath ),
						targetFilePath = path.resolve( deployPath, resourceFilePath ),
						targetPath     = path.dirname( targetFilePath )

					if( !fs.existsSync( targetPath ) ) {
						mkdirp.sync( targetPath )
					}

					copyFile( sourceFilePath, targetFilePath )
				}
			)


			// write data file to output directory -> "build/deploy/html5/data.js"
			var resources = templates.concat( assets )

			var dataFileContent = _s.sprintf(
				dataFileTemplate,
				scriptSource,
				JSON.stringify( createCacheContent( resources ) ),
				JSON.stringify( projectConfig )
			)

			if( !fs.existsSync( deployHtml5Path ) ) {
				mkdirp.sync( deployHtml5Path )
			}

			var dataFilePath = path.resolve( deployHtml5Path, 'data.js' )

			writeFile( dataFilePath, dataFileContent )


			// copy public template files to output directory -> "build/deploy/*"
			var publicTemplateFiles = [ 'index.html', 'main.css' ]

			_.each(
				publicTemplateFiles,
				function( file ) {
					var sourceFilePath = path.join( spellCorePath, 'publicTemplate', file ),
						targetFilePath = path.join( deployPath, file )

					copyFile( sourceFilePath, targetFilePath )
				}
			)


			// copy stage zero loader to output directory -> "build/deploy/spell.js"
			var sourceFilePath = path.join( spellCorePath, 'src/spell/client/stageZeroLoader.js' ),
			targetFilePath = path.join( deployPath, 'spell.js' )

			copyFile( sourceFilePath, targetFilePath )


			// copy minified, anonymized engine include to output directory -> "build/deploy/html5/spell.js"
			sourceFilePath = path.join( spellCorePath, 'build/spell.deploy.js' ),
			targetFilePath = path.join( deployHtml5Path, 'spell.js' )

			copyFile( sourceFilePath, targetFilePath )
		}
	}
)
