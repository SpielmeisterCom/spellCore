define(
	'spell/shared/util/createEntityEach',
	[
		'spell/shared/util/platform/underscore'
	],
	function(
		_
	) {
		'use strict'


		return function( primaryComponents, argumentComponents, iterator ) {
			if( !_.isArray( argumentComponents ) ) {
				argumentComponents = [ argumentComponents ]
			}

			return function() {
				var ids    = _.keys( primaryComponents ),
					numIds = ids.length

				for( var i = 0; i < numIds; i++ ) {
					var id = ids[ i ],
						primaryComponent = [ primaryComponents[ id ] ],
						numArgumentComponentsList = argumentComponents.length,
						args = ( arguments ? _.toArray( arguments ).concat( primaryComponent ) : [ primaryComponent ] )

					for( var j = 0; j < numArgumentComponentsList; j++ ) {
						args.push( argumentComponents[ j ][ i ] )
					}

					iterator.apply( null, args )
				}
			}
		}
	}
)
