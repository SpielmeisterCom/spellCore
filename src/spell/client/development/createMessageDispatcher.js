define(
	'spell/client/development/createMessageDispatcher',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var createMatchingId = function( idToHandler, searchedId ) {
			if( searchedId.charAt( 0 ) === '.' ) {
				searchedId = searchedId.substring( 1 )
			}

			for( var id in idToHandler ) {
				if( searchedId.lastIndexOf( id, 0 ) === 0 ) {
					return id
				}
			}
		}

		var createRemainingId = function( id, matchingId ) {
			return id.substring( matchingId.length + 1 )
		}

		return function( idToHandler ) {
			return function( message, id, processedId ) {
				if( !processedId ) processedId = ''

				var matchingId = createMatchingId( idToHandler, id ),
					handler    = idToHandler[ matchingId ]

				if( !handler ) {
					throw 'Error: No handler for message with id \'' + processedId + ( processedId !== '' ? '.' : '' ) + id + '\' found.'
				}

				var remainingId = createRemainingId( id, matchingId )

				handler( message, remainingId, processedId + matchingId )
			}
		}
	}
)
