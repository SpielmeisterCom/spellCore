var _  = require( 'underscore'),
	falafel = require( 'falafel' )


var filterNodes =  function( source, iterator ) {
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

module.exports = function( moduleSource ) {
	var nodes = filterNodes(
		moduleSource,
		function( node ) {
			if( node.type === 'CallExpression' &&
				node.callee.type === 'Identifier' &&
				node.callee.name === 'define' ) {

				if( node.arguments.length === 0 ) return false

				return node.arguments[ 0 ].type === 'Literal'
			}
		}
	)

	if( nodes.length === 0 ) return false

	return {
		name : nodes[ 0 ].arguments[ 0 ].value,
		dependencies : ( nodes[ 0 ].arguments[ 1 ].type === 'ArrayExpression' ?
			_.map( nodes[ 0 ].arguments[ 1 ].elements, function( iter ) { return iter.value } ) :
			[]
		)
	}
}
