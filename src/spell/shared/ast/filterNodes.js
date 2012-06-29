define(
	'spell/shared/ast/filterNodes',
	[
		'falafel'
	],
	function(
		falafel
	) {
		/*
		 *
		 */
		return function( source, iterator ) {
			var nodes = []

			falafel(
				source,
				function( node ) {
					if( !iterator( node ) ) return

					nodes.push( node )
				}
			)

			return nodes
		}
	}
)
