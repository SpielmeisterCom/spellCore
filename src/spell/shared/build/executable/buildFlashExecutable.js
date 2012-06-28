define(
	'spell/shared/build/executable/buildFlashExecutable',
	[
		'spell/shared/build/isFile',

		'child_process',
		'fs',
		'mkdirp',
		'xmlbuilder',

		'underscore.string',
		'spell/shared/util/platform/underscore'
	],
	function(
		isFile,

		child_process,
		fs,
		mkdirp,
		xmlbuilder,

		_s,
		_
	) {
		'use strict'


		/**
		 * private
		 */

		var wrapperClassTemplate = [
			'package Spielmeister {',
			'	public class %1$s implements ModuleDefinition {',
			'		public function %1$s() {}',
			'',
			'		public function load( define : Function, require : Function ) : void {',
			'			%2$s',
			'		}',
			'	}',
			'}'
		].join( '\n' )

		var createActionScriptWrapperClass = function( className, moduleDefinitionSource ) {
			var indentation = '			' // amount of tabs each line gets indented with

			var indentedSource = _.reduce(
				moduleDefinitionSource.split( '\n' ),
				function( memo, line ) {
					return memo + ( memo === '' ? '' : indentation ) + line + '\n'
				},
				''
			)

			return _s.sprintf( wrapperClassTemplate, className, indentedSource )
		}

		var writeFile = function( filePath, data ) {
			// delete file if it already exists
			if( isFile( filePath ) ) {
				fs.unlinkSync( filePath )
			}

			fs.writeFileSync( filePath, data )
		}

		var writeCompilerConfigFile = function( projectPath, spellAsPath, flexSdkPath, compilerConfigFilePath, outputFilePath ) {
			var doc = xmlbuilder.create()

			doc.begin( 'flex-config' )
				.ele( 'compiler' )
					.ele( 'source-path' )
						.ele( 'path-element' )
							.txt( spellAsPath + '/src' )
						.up()
						.ele( 'path-element' )
							.txt( spellAsPath + '/lib/AS3WebSocket/src' )
						.up()
						.ele( 'path-element' )
							.txt( spellAsPath + '/lib/Coral/src' )
						.up()
						.ele( 'path-element' )
							.txt( projectPath + '/build/src' )
						.up()
					.up()
					.ele( 'library-path' )
						.ele( 'path-element' )
							.txt( spellAsPath + '/lib/AS3WebSocket/lib/as3corelib.swc' )
						.up()
					.up()
					.ele( 'external-library-path' )
						.ele( 'path-element' )
							.txt( flexSdkPath + '/frameworks/libs/player/10.1/playerglobal.swc' )
						.up()
					.up()
					.ele( 'debug' )
						.txt( 'true' )
					.up()
				.up()
				.ele( 'file-specs' )
					.ele( 'path-element' )
						.txt( spellAsPath + '/src/Spielmeister/SpellMain.as' )
					.up()
				.up()
				.ele( 'warnings' )
					.txt( 'false' )
				.up()
				.ele( 'output' )
					.txt( outputFilePath )

			if( fs.existsSync( compilerConfigFilePath ) ) {
				fs.unlinkSync( compilerConfigFilePath )
			}

			fs.writeFileSync( compilerConfigFilePath, doc.toString( { pretty : true } ), 'utf-8' )
		}

		var compile = function( flexSdkPath, configFilePath, next ) {
			var command = _s.sprintf( '%1$s/bin/mxmlc -load-config %2$s', flexSdkPath, configFilePath ),
				options = {
					env : {
						LC_ALL : 'en_US'
					}
				}

			child_process.exec( command, options, next )
		}


		/**
		 * public
		 */

		return function( tempPath, outputPath, spellAsPath, projectPath, runtimeModule, engineSource, next ) {
			var errors = []

			var tmpSourcePath = tempPath + '/src/Spielmeister'

			if( !fs.existsSync( tmpSourcePath ) ) {
				mkdirp.sync( tmpSourcePath )
			}

			// write engine source wrapper class file
			var engineSourceFilePath = tmpSourcePath + '/SpellEngine.as'

			writeFile(
				engineSourceFilePath,
				createActionScriptWrapperClass( 'SpellEngine', engineSource )
			)

			// write runtime module source wrapper class file
			var runtimeModuleSourceFilePath = tmpSourcePath + '/RuntimeModule.as'

			writeFile(
				runtimeModuleSourceFilePath,
				createActionScriptWrapperClass( 'RuntimeModule', runtimeModule )
			)

			// create config and compile
			var flexSdkPath            = spellAsPath + '/vendor/flex_sdk_4.1.0.16076A_mpl',
				compilerConfigFilePath = tempPath + '/compile-config.xml',
				flashOutputPath        = outputPath + '/flash',
				outputFilePath         = flashOutputPath + '/spell.swf'

			if( !fs.existsSync( flashOutputPath ) ) {
				fs.mkdirSync( flashOutputPath )
			}

			writeCompilerConfigFile( projectPath, spellAsPath, flexSdkPath, compilerConfigFilePath, outputFilePath )


			var onCompilingCompleted = function( errors, stderr, stdout ) {
				// TODO: parse stderr to get to the real compiler errors
				next( stdout )
			}

			compile( flexSdkPath, compilerConfigFilePath, onCompilingCompleted )
		}
	}
)
