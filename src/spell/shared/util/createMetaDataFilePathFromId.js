define(
	'spell/shared/util/createMetaDataFilePathFromId',
	function() {
		'use strict'


		return function( id ) {
			return id.replace( /\./g, '/' ) + '.json'
		}
	}
)
