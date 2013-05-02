define(
	'spell/shared/build/loadAssociatedScriptModules',
	[
		'spell/shared/build/isFile',
		'spell/shared/util/createIdFromLibraryFilePath',
		'spell/shared/util/createModuleId',

		'amd-helper',
		'path'
	],
	function(
		isFile,
		createIdFromLibraryFilePath,
		createModuleId,

		amdHelper,
		path
	) {
		'use strict'


		return function( projectLibraryPath, libraryRecords ) {
			return _.reduce(
				libraryRecords,
				function( memo, libraryRecord ) {
					var id             = createIdFromLibraryFilePath( libraryRecord.filePath ),
						moduleId       = createModuleId( id ),
						moduleFilePath = path.join( projectLibraryPath, moduleId + '.js' )

					// TODO: remove once all components have a script
					if( !isFile( moduleFilePath ) ) {
						return memo
					}

					var module = amdHelper.loadModule( moduleFilePath )

					if( module ) {
						memo[ module.name ] = module
					}

					return memo
				},
				{}
			)
		}
	}
)
