define(
	'spell/client/development/library/loadAsset',
	[
		'spell/client/loading/createFilesToLoad',
		'spell/client/util/updateAssets',
		'spell/shared/util/createLibraryFilePathFromId'
	],
	function(
		createFilesToLoad,
		updateAssets,
		createLibraryFilePathFromId
	) {
		'use strict'


		return function( spell, libraryId, next ) {
			// load meta data record
			spell.libraryManager.load(
				[ createLibraryFilePathFromId( libraryId ) ],
				{
					omitCache          : true,
					onLoadingCompleted : function( loadedLibraryRecords ) {
						updateAssets( spell.assetManager, loadedLibraryRecords )

						var filesToLoad = createFilesToLoad( spell.configurationManager, loadedLibraryRecords )

						if( filesToLoad.length > 0 ) {
							spell.libraryManager.load(
								filesToLoad,
								{
									isMetaDataLoad     : false,
									omitCache          : true,
									onLoadingCompleted : next
								}
							)

						} else {
							next()
						}
					}
				}
			)
		}
	}
)
