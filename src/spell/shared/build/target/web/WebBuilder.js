define(
	'spell/shared/build/target/web/WebBuilder',
	[
		'spell/shared/build/target/web/FlashBuilder',
		'spell/shared/build/target/web/HTML5Builder',
		'spell/shared/build/copyFiles',
		'spell/shared/build/createDebugPath',
		'spell/shared/build/createProjectLibraryFilePaths',

		'path'
	],
	function(
		FlashBuilder,
		HTML5Builder,
		copyFiles,
		createDebugPath,
		createProjectLibraryFilePaths,

		path
	) {
		'use strict'


		var build = function( projectLibraryPath, spellCorePath, outputWebPath, debug ) {
			// copy common files

			// the library files
			var outputFilePaths = createProjectLibraryFilePaths( projectLibraryPath )

			// public template files go to "build/release/*"
			outputFilePaths.push( [
				path.join( spellCorePath, 'htmlTemplate', 'index.html' ),
				path.join( outputWebPath, 'index.html' )
			] )

			outputFilePaths.push( [
				path.join( spellCorePath, 'htmlTemplate', 'main.css' ),
				path.join( outputWebPath, 'main.css' )
			] )

			// stage zero loader goes to "build/release/spell.loader.js"
			outputFilePaths.push( [
				createDebugPath( debug, 'spell.loader.js', 'spell.loader.min.js', path.join( spellCorePath, 'lib' ) ),
				path.join( outputWebPath, 'spell.loader.js' )
			] )

			// copy new library content to destination
			var outputWebLibraryPath = path.join( outputWebPath, 'library' )

			copyFiles( projectLibraryPath, outputWebLibraryPath, outputFilePaths )
		}

		var TARGET_NAME = 'web'

		var WebBuilder = function(
			spellCorePath,
			projectPath,
			projectLibraryPath,
			outputPath,
			target,
			projectConfig,
			library,
			cacheContent,
			scriptSource,
			minify,
			anonymizeModuleIds,
			debug
		) {
			this.spellCorePath      = spellCorePath
			this.projectPath        = projectPath
			this.projectLibraryPath = projectLibraryPath
			this.outputPath         = outputPath
			this.target             = target
			this.projectConfig      = projectConfig
			this.library            = library
			this.cacheContent       = cacheContent
			this.scriptSource       = scriptSource
			this.minify             = minify
			this.anonymizeModuleIds = anonymizeModuleIds
			this.debug              = debug
		}

		WebBuilder.prototype = {
			init : function() {
				this.subTargetBuilders = [
					new FlashBuilder(
						this.spellCorePath,
						this.projectPath,
						this.projectLibraryPath,
						this.outputPath,
						this.target,
						this.projectConfig,
						this.library,
						this.cacheContent,
						this.scriptSource,
						this.minify,
						this.anonymizeModuleIds,
						this.debug
					),
					new HTML5Builder(
						this.spellCorePath,
						this.projectPath,
						this.projectLibraryPath,
						this.outputPath,
						this.target,
						this.projectConfig,
						this.library,
						this.cacheContent,
						this.scriptSource,
						this.minify,
						this.anonymizeModuleIds,
						this.debug
					)
				]

				_.invoke( this.subTargetBuilders, 'init' )
			},
			getName : function() {
				return TARGET_NAME
			},
			handlesTarget : function( x ) {
				return x === 'all' ||
					x === TARGET_NAME ||
					_.any(
						this.subTargetBuilders,
						function( builder ) {
							return builder.handlesTarget( x )
						}
					)
			},
			build : function( next ) {
				console.log( 'WebBuilder.build()' )

				var target        = this.target,
					outputWebPath = path.join( this.outputPath, 'web' )

				build(
					this.projectLibraryPath,
					this.spellCorePath,
					outputWebPath,
					this.debug
				)

				_.each(
					this.subTargetBuilders,
					function( builder ) {
						if( !builder.handlesTarget( target ) ) {
							return
						}

						builder.build()
					}
				)
			}
		}

		return WebBuilder
	}
)
