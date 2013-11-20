define(
	'spell/shared/util/createLibraryFilePathsFromIds',
	[
		'spell/shared/util/createLibraryFilePathFromId',

		'spell/functions'
	],
	function(
		createLibraryFilePathFromId,

		_
	) {
		'use strict'


		return function( libraryIds ) {
			return _.reduce(
				libraryIds,
				function( memo, libraryId ) {
					memo[ libraryId ] = createLibraryFilePathFromId( libraryId )

					return memo
				},
				{}
			)
		}
	}
)
