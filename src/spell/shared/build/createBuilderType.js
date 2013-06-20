define(
	'spell/shared/build/createBuilderType',
	function() {
		'use strict'


		return function() {
			return function(
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
		}
	}
)
