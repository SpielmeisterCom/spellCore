define(
	'spell/shared/build/executable/buildFlash',
	[
		'spell/shared/build/ast/createAST',
		'spell/shared/build/ast/createComponentTypeDefinition',
		'spell/shared/build/ast/createSource',
		'spell/shared/build/ast/isAmdHeader',
		'spell/shared/build/copyFile',
		'spell/shared/build/isFile',
		'spell/shared/build/loadAssociatedScriptModules',
		'spell/shared/build/processSource',

		'child_process',
		'fs',
		'mkdirp',
		'path',
		'xmlbuilder',
		'os',
		'rimraf',
		'uglify-js',

		'underscore.string',
		'spell/functions'
	],
	function(
		createAST,
		createComponentTypeDefinition,
		createSource,
		isAmdHeader,
		copyFile,
		isFile,
		loadAssociatedScriptModules,
		processSource,

		child_process,
		fs,
		mkdirp,
		path,
		xmlbuilder,
		os,
		rmdir,
		uglify,

		_s,
		_
	) {
		'use strict'


		var moduleDefinitionFileTemplate = [
			'package Spielmeister {',
			'%3$s',
			'	public class %1$s implements ModuleDefinition {',
			'		public function %1$s() {}',
			'',
			'		public function load( define : Function, require : Function ) : void {',
			'			%2$s',
			'		}',
			'	}',
			'}',
			''
		].join( '\n' )

		var applicationDataFileTemplate = [
			'package Spielmeister {',
			'	public class ApplicationData {',
			'		private var cacheContent : Object = %1$s',
			'		private var runtimeModule : Object = %2$s',
			'',
			'		function getCacheContent() : Object {',
			'			return this.cacheContent',
			'		}',
			'',
			'		function getRuntimeModule() : Object {',
			'			return this.runtimeModule',
			'		}',
			'	}',
			'}',
			''
		].join( '\n' )

		var componentTypeClassFileTemplate = [
			'package %1$s {',
			'',
			'	public class %2$s {',
			'		%3$s',
			'',
			'		public function %2$s( spell : Object ) {',
			'			%4$s',
			'		}',
			'',
			'		%5$s',
			'	}',
			'}',
			''
		].join( '\n' )

		var classPropertyTemplate = [
			'public function %1$s %2$s(%3$s)%4$s {',
			'	%5$s',
			'}'
		].join( '\n' )

		var attributeTypeToAS3ClassName = {
			number : 'Number',
			integer : 'Number',
			'enum' : 'String',
			boolean : 'Boolean',
			vec2 : 'Array',
			vec3 : 'Array'
		}

		var getAS3ClassNameFromAttributeType = function( x ) {
			return attributeTypeToAS3ClassName[ _.isObject( x ) ? x.name : x ]
		}

		var createModuleDefinitionFileTemplate = function( className, indentedSource, debug ) {
			return _s.sprintf(
				moduleDefinitionFileTemplate,
				className,
				indentedSource,
				debug ? '	import flash.debugger.enterDebugger' : ''
			)
		}

		var createModuleDefinitionWrapperClass = function( className, moduleDefinitionSource, debug ) {
			debug = !!debug

			var indentation = '			' // amount of tabs each line gets indented with

			var indentedSource = _.reduce(
				moduleDefinitionSource.split( '\n' ),
				function( memo, line ) {
					return memo + ( memo === '' ? '' : indentation ) + line + '\n'
				},
				''
			)

			return createModuleDefinitionFileTemplate( className, indentedSource, debug )
		}

		var writeFile = function( filePath, data ) {
			// delete file if it already exists
			if( isFile( filePath ) ) {
				fs.unlinkSync( filePath )
			}

			fs.writeFileSync( filePath, data )
		}

		var writeCompilerConfigFile = function( projectPath, spellFlashPath, flexSdkPath, componentTypeClasses, compilerConfigFilePath, outputFilePath, anonymizeModuleIds, debug ) {
			var root = xmlbuilder.create().begin( 'flex-config' )

			root.ele( 'compiler' )
				.ele( 'source-path' )
					.ele( 'path-element' )
						.txt( spellFlashPath + '/src' )
					.up()
					.ele( 'path-element' )
						.txt( spellFlashPath + '/lib/AS3WebSocket/src' )
					.up()
					.ele( 'path-element' )
						.txt( spellFlashPath + '/lib/Coral/src' )
					.up()
					.ele( 'path-element' )
						.txt( spellFlashPath + '/lib/Box2D/Source' )
					.up()
					.ele( 'path-element' )
						.txt( projectPath + '/build/src' )
					.up()
				.up()
				.ele( 'library-path' )
					.ele( 'path-element' )
						.txt( spellFlashPath + '/lib/AS3WebSocket/lib/as3corelib.swc' )
					.up()
				.up()
				.ele( 'external-library-path' )
					.ele( 'path-element' )
						.txt( flexSdkPath + '/frameworks/libs/player/11.1/playerglobal.swc' )
					.up()
				.up()
				.ele( 'debug' )
					.txt( debug.toString() )
				.up()
				.ele( 'define' )
					.ele( 'name' )
						.txt( 'CONFIG::anonymizeModuleIds' )
					.up()
					.ele( 'value' )
						.txt( anonymizeModuleIds.toString() )
					.up()
				.up()
			.up()
			.ele( 'file-specs' )
				.ele( 'path-element' )
					.txt( spellFlashPath + '/src/Spielmeister/SpellMain.as' )
				.up()
			.up()

			var includes = root.ele( 'includes' )

			_.each(
				componentTypeClasses,
				function( componentTypeClass ) {
					includes.ele( 'symbol' )
						.txt( componentTypeClass )
				}
			)

			root.ele( 'warnings' )
				.txt( 'false' )
			.up()
			.ele( 'output' )
				.txt( outputFilePath )

			fs.writeFileSync( compilerConfigFilePath, root.toString( { pretty : true } ), 'utf-8' )
		}

		var compile = function( flexSdkPath, configFilePath, next ) {
			var executablePath = path.join( flexSdkPath, os.platform() == 'win32' ? 'bin/mxmlc.bat' : 'bin/mxmlc' )

			child_process.execFile(
				executablePath,
				[ '-load-config', configFilePath ],
				{},
				next
			)
		}

		var createComponentTypeClassName = function( libraryPath ) {
			return 'Spielmeister.ComponentType.' + libraryPath.replace( /\//g, '.' )
		}

		var createComponentTypeClassNames = function( componentScripts ) {
			return _.map(
				_.keys( componentScripts ),
				createComponentTypeClassName
			)
		}

		var createAS3ClassProperty = function( attributeDefinition, property ) {
			var propertyClassName = getAS3ClassNameFromAttributeType( attributeDefinition.type ),
				isGetter          = property.type === 'get'

			return _s.sprintf(
				classPropertyTemplate,
				property.type,
				property.name,
				isGetter ? '' : ' ' + property.valueName + ' : ' + propertyClassName + ' ',
				isGetter ? ' : ' + propertyClassName : '',
				property.source.replace( /\n/g, '\n\t' )
			).replace( /\n/g, '\n\t\t' )
		}

		var createAS3ClassGetterSetters = function( componentDefinition, properties ) {
			return _.map(
				properties,
				function( property ) {
					var attributeDefinition = _.find(
						componentDefinition.attributes,
						function( attribute ) {
							return attribute.name === property.name
						}
					)

					if( !attributeDefinition ) {
						throw 'Could not find attribute definition.'
					}

					return createAS3ClassProperty( attributeDefinition, property )
				}
			).join( '\n\n\t\t' )
		}

		var createAS3ClassProperties = function( componentDefinition, properties ) {
			return _.reduce(
				properties,
				function( memo, property ) {
					if( property.type === 'set' ) {
						return memo
					}

					var attributeDefinition = _.find(
						componentDefinition.attributes,
						function( attribute ) {
							return attribute.name === property.name
						}
					)

					if( !attributeDefinition ) {
						throw 'Could not find attribute definition.'
					}

					return memo.concat(
						'private var _' + attributeDefinition.name + ' : ' + getAS3ClassNameFromAttributeType( attributeDefinition.type )
					)
				},
				[]
			).join( '\n\t\t' )
		}

		var createComponentTypeAS3Class = function( componentDefinition, componentTypeDefinition ) {
			return _s.sprintf(
				componentTypeClassFileTemplate,
				componentTypeDefinition.className.substring( 0, componentTypeDefinition.className.lastIndexOf( '.' ) ),
				componentTypeDefinition.typeName,
				createAS3ClassProperties( componentDefinition, componentTypeDefinition.properties ),
				componentTypeDefinition.constructorSource.replace( /\n/g, '\n\t\t\t' ),
				createAS3ClassGetterSetters( componentDefinition, componentTypeDefinition.properties )
			)
		}

		var createComponentTypeClassFiles = function( tmpSourcePath, components, componentScripts ) {
			_.each(
				componentScripts,
				function( componentScript, key ) {
					var componentTypeClassName = createComponentTypeClassName( key )

					var componentTypeDefinition = createComponentTypeDefinition( componentScript.source, componentTypeClassName )

					var component = _.find(
						components,
						function( component ) {
							return component.filePath === key + '.json'
						}
					)

					if( !component ) {
						throw 'Could not find component definition for component script "' + key + '".'
					}

					var source = createComponentTypeAS3Class( component.content, componentTypeDefinition )

					var filePath   = path.join( tmpSourcePath, componentTypeClassName.replace( /\./g, '/' ) + '.as' ),
						outputPath = path.dirname( filePath )

					if( !fs.existsSync( outputPath ) ) {
						mkdirp.sync( outputPath )
					}

					writeFile( filePath, source )
				}
			)
		}


		return function( spellCorePath, projectPath, projectLibraryPath, deployPath, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			var errors                  = [],
				spellEnginePath         = path.resolve( spellCorePath, '../..' ),
				spellFlashPath          = path.join( spellEnginePath, 'modules/spellFlash' ),
				tmpPath                 = path.join( projectPath, 'build' ),
				tmpSourcePath           = path.join( tmpPath, 'src' ),
				spielmeisterPackagePath = path.join( tmpSourcePath, 'Spielmeister' ),
				deployFlashPath         = path.join( deployPath, 'flash' ),
				compilerConfigFilePath  = path.join( tmpPath, 'compile-config.xml' )


			// remove build files from previous run
			rmdir.sync( spielmeisterPackagePath )

			if( !fs.existsSync( spielmeisterPackagePath ) ) {
				mkdirp.sync( spielmeisterPackagePath )
			}

			if( fs.existsSync( compilerConfigFilePath ) ) {
				fs.unlinkSync( compilerConfigFilePath )
			}

			// remove complete old deploy directory
			rmdir.sync( deployFlashPath )

			if( !fs.existsSync( deployFlashPath ) ) {
				fs.mkdirSync( deployFlashPath )
			}


			// reading engine source file
			var spellEngineSourceFilePath = path.join( spellCorePath, 'build/spell.common.js' )

			if( !fs.existsSync( spellEngineSourceFilePath ) ) {
				errors.push( 'Error: Could not locate engine include file \'' + spellEngineSourceFilePath + '\'.' )
				next( errors )
			}

			// write engine source wrapper class file
			var engineSourceFilePath = path.join( spielmeisterPackagePath, 'SpellEngine.as' ),
				engineSource         = fs.readFileSync( spellEngineSourceFilePath ).toString( 'utf-8' )

			writeFile(
				engineSourceFilePath,
				createModuleDefinitionWrapperClass(
					'SpellEngine',
					processSource( engineSource, minify, anonymizeModuleIds ),
					debug
				)
			)

			// write script modules source wrapper class file
			writeFile(
				path.join( spielmeisterPackagePath, 'ScriptModules.as' ),
				createModuleDefinitionWrapperClass(
					'ScriptModules',
					scriptSource,
					debug
				)
			)

			// write application data class file
			writeFile(
				path.join( spielmeisterPackagePath, 'ApplicationData.as' ),
				_s.sprintf(
					applicationDataFileTemplate,
					JSON.stringify( cacheContent ),
					JSON.stringify( projectConfig )
				)
			)

			// TODO: write component type class files
			var componentScripts = loadAssociatedScriptModules( projectLibraryPath, library.component )

			console.log( 'generating AS3 classes...' )

			createComponentTypeClassFiles( tmpSourcePath, library.component, componentScripts )


			// create config and compile
			var flexSdkPath    = path.join( spellFlashPath, 'vendor/flex_sdk_4.8.0' ),
				outputFilePath = path.join( deployFlashPath, 'spell.swf' )

			console.log( 'compiling...' )

			writeCompilerConfigFile(
				projectPath,
				spellFlashPath,
				flexSdkPath,
				createComponentTypeClassNames( componentScripts ),
				compilerConfigFilePath,
				outputFilePath,
				anonymizeModuleIds,
				debug
			)

			var onCompilingCompleted = function( errors, stderr, stdout ) {
				// TODO: parse stderr to get to the real compiler errors
				next( stdout )
			}

			compile( flexSdkPath, compilerConfigFilePath, onCompilingCompleted )
		}
	}
)
