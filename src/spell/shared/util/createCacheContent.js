define(
	'spell/shared/util/createCacheContent',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		return function( resources ) {
			return _.reduce(
				resources,
				function( memo, resource ) {
					var content  = resource.content,
						filePath = resource.filePath

					if( _.has( memo, filePath ) ) {
						throw 'Error: Resource path duplication detected. Could not build.'
					}

					memo[ filePath ] = content

					return memo
				},
				{}
			)
		}
	}
)
