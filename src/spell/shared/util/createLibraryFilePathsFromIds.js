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


		return function( ids ) {
			return _.map( ids, createLibraryFilePathFromId )
		}
	}
)
