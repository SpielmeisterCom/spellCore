define(
	'spell/shared/build/executable/buildFlash',
	[
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

		'underscore.string',
		'spell/functions'
	],
	function(
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
			'}'
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
			'}'
		].join( '\n' )

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

			if( fs.existsSync( compilerConfigFilePath ) ) {
				fs.unlinkSync( compilerConfigFilePath )
			}

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

		var createComponentTypeClasses = function( componentScripts ) {
			return _.map(
				_.keys( componentScripts ),
				function( libraryPath ) {
					return 'Spielmeister.ComponentType.' + libraryPath.replace( /\//g, '.' )
				}
			)
		}


		return function( spellCorePath, projectPath, projectLibraryPath, deployPath, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			var errors          = [],
				spellEnginePath = path.resolve( spellCorePath, '../..' ),
				spellFlashPath  = path.join( spellEnginePath, 'modules/spellFlash' ),
				tmpPath         = path.join( projectPath, 'build' ),
				tmpSourcePath   = path.join( tmpPath, 'src/Spielmeister' ),
				deployFlashPath = path.join( deployPath, 'flash' )


			// remove complete old deploy directory
			rmdir.sync( deployFlashPath )


			if( !fs.existsSync( tmpSourcePath ) ) {
				mkdirp.sync( tmpSourcePath )
			}

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
			var engineSourceFilePath = path.join( tmpSourcePath, 'SpellEngine.as' ),
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
				path.join( tmpSourcePath, 'ScriptModules.as' ),
				createModuleDefinitionWrapperClass(
					'ScriptModules',
					scriptSource,
					debug
				)
			)

			// write application data class file
			writeFile(
				path.join( tmpSourcePath, 'ApplicationData.as' ),
				_s.sprintf(
					applicationDataFileTemplate,
					JSON.stringify( cacheContent ),
					JSON.stringify( projectConfig )
				)
			)

			// TODO: remove generated source files from previous run

			// TODO: write component type class files
			var componentScripts = loadAssociatedScriptModules( projectLibraryPath, library.component )

			// create config and compile
			var flexSdkPath            = path.join( spellFlashPath, 'vendor/flex_sdk_4.8.0' ),
				compilerConfigFilePath = path.join( tmpPath, 'compile-config.xml' ),
				outputFilePath         = path.join( deployFlashPath, 'spell.swf' )

			writeCompilerConfigFile(
				projectPath,
				spellFlashPath,
				flexSdkPath,
				createComponentTypeClasses( componentScripts ),
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
