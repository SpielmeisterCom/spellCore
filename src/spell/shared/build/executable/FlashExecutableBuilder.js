define(
	'spell/shared/build/executable/FlashExecutableBuilder',
	[
		'spell/shared/build/executable/AbstractExecutableBuilder',
		'spell/shared/build/isFile',

		'fs',
		'mkdirp',
		'path',

		'underscore.string',
		'underscore'
	],
	function(
		AbstractExecutableBuilder,
		isFile,

		fs,
		mkdirp,
		path,

		_s,
		_
	) {
		'use strict'


		/**
		 * private
		 */

		var wrapperClassTemplate = [
			'package Spielmeister {',
			'',
			'	public class %1$s {',
			'		private var define  : Function',
			'		private var require : Function',
			'',
			'		public function %1$s( define : Function, require : Function ) {',
			'			this.define  = define',
			'			this.require = require',
			'		}',
			'',
			'		public function load() : void {',
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


		/**
		 * public
		 */

		var FlashExecutableBuilder = function() {}
		FlashExecutableBuilder.prototype = new AbstractExecutableBuilder()

		FlashExecutableBuilder.prototype.build = function() {
			var errors = []

			var tmpSourcePath = this.tempPath + '/src/Spielmeister'

			if( !path.existsSync( tmpSourcePath ) ) {
				mkdirp.sync( tmpSourcePath )
			}

			// write engine source wrapper class file
			var engineSourceFilePath = tmpSourcePath + '/SpellEngine.as'

			writeFile(
				engineSourceFilePath,
				createActionScriptWrapperClass( 'SpellEngine', this.engineSource )
			)

			// TODO: write runtime module source wrapper class file
			var runtimeModuleSourceFilePath = tmpSourcePath + '/RuntimeModule.as'

			writeFile(
				runtimeModuleSourceFilePath,
				createActionScriptWrapperClass( 'RuntimeModule', this.runtimeModule )
			)


			// TODO: compile

			return errors
		}

		return FlashExecutableBuilder
	}
)
