define(
	'spell/client/loading/createFilesToLoad',
	[
		'spell/shared/util/createLibraryFilePath',

		'spell/functions'
	],
	function(
		createLibraryFilePath,

		_
	) {
		'use strict'


		return function( assets ) {
			return _.unique(
				_.reduce(
					assets,
					function( memo, asset ) {
						return asset.file ?
							memo.concat( createLibraryFilePath( asset.namespace, asset.file ) ) :
							memo
					},
					[]
				)
			)
		}
	}
)
