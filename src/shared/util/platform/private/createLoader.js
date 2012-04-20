define(
	"spell/shared/util/platform/private/createLoader",
	[
		"underscore"
	],
	function(
		_
	) {
		"use strict"

		return function( constructor, eventManager, host, resourceBundleName, resourceUri, loadingCompletedCallback, timedOutCallback, soundManager ) {
			if( constructor === undefined )              throw 'Argument 1 is missing.'
			if( eventManager === undefined )             throw 'Argument 2 is missing.'
			if( host === undefined )                     throw 'Argument 3 is missing.'
			if( resourceBundleName === undefined )       throw 'Argument 4 is missing.'
			if( resourceUri === undefined )              throw 'Argument 5 is missing.'
			if( loadingCompletedCallback === undefined ) throw 'Argument 6 is missing.'
			if( timedOutCallback === undefined )         throw 'Argument 7 is missing.'

			return new constructor(
				eventManager,
				host,
				resourceBundleName,
				resourceUri,
				loadingCompletedCallback,
				timedOutCallback,
                soundManager
			)
		}
	}
)
