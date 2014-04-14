/**
 * see https://developer.mozilla.org/en/DOM/XMLHttpRequest
 */
define(
	'spell/shared/util/platform/private/loader/TextLoader',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'

		var onReadyStateChange = function( request, url, callback ) {
			if(
				request.readyState !== 4 /* DONE */
			) {
				//return if loading is not completed yet
				return
			}

			/*
			 * file protocol always yields status code 0 as status
			 */
			if( request.status !== 200 && request.status !== 0 ) {
				callback(
					'TextLoader> Status ' + request.status + ' received while trying to receive ' + url,
					null
				)

			} else {
				// request loading completed

				// free internal handler
				request.onreadystatechange = null

				var response = request.response || request.responseText

				callback(
					null,
					response
				)
			}
		}

		var TextLoader = function() {
		}

		TextLoader.prototype = {
			load : function( url, callback ) {
				var request                = new XMLHttpRequest()
				request.onreadystatechange = _.bind( onReadyStateChange, this, request, url, callback )

				request.open( 'GET', url, true )
				request.send()
			}
		}

		return TextLoader
	}
)
