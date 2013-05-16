define(
	'spell/shared/build/ast/createComponentTypeDefinition',
	[
		'spell/shared/build/ast/createAST',
		'spell/shared/build/ast/isAmdHeader',

		'uglify-js'
	],
	function(
		createAST,
		isAmdHeader,

		uglify
	) {
		'use strict'


		var getAmdHeaderNode = function( ast ) {
			var uglifyProcessor = uglify.uglify,
				w = uglifyProcessor.ast_walker()

			var amdHeaderNode

			w.with_walkers(
				{
					stat : function() {
						var node = this

						if( isAmdHeader( node ) ) {
							amdHeaderNode = node
						}

						return node
					}
				},
				function() {
					return w.walk( ast )
				}
			)

			return amdHeaderNode
		}

		var getModuleBodyNode = function( amdHeaderNode ) {
			if( amdHeaderNode[ 0 ] !== 'stat' ) return

			var callDefineNode = amdHeaderNode[ 1 ]

			var defineCallArgumentsNode = callDefineNode[ 2 ]

			return defineCallArgumentsNode[ defineCallArgumentsNode.length - 1 ]
		}

		var getNodeByType = function( nodes, type ) {
			for( var i = 0, n = nodes.length; i < n; i++ ) {
				if( nodes[ i ][ 0 ] === type ) {
					return nodes[ i ]
				}
			}
		}

		var getModuleReturnVariableName = function( moduleBodyNode ) {
			var node = getNodeByType( moduleBodyNode[ 3 ], 'return' )

			if( node ) {
				return node[ 1 ][ 1 ]
			}
		}

		var getConstructorFunctionNode = function( moduleBodyNode, typeName ) {
			var node = getNodeByType( moduleBodyNode[ 3 ], 'var' )

			if( node &&
				node[ 1 ][ 0 ][ 0 ] === typeName ) {

				return node[ 1 ][ 0 ][ 1 ]
			}
		}

		var createSourceFromFunctionNode = function( node ) {
			var nodes = node[ 3 ]

			return _.map(
				nodes,
				function( node ) {
					return uglify.uglify.gen_code(
						node,
						{
							beautify: true
						}
					)
				}
			).join( '\n' )
		}

		var getPrototypeNode = function( moduleBodyNode, typeName ) {
			return moduleBodyNode[ 3 ][ 2 ][ 1 ][ 3 ]
		}

		var createPropertyDefinition = function( propertyNode ) {
			return {
				name : propertyNode[ 0 ],
				valueName : propertyNode[ 1 ][ 2 ][ 0 ],
				source : createSourceFromFunctionNode( propertyNode[ 1 ] ),
				type : propertyNode[ 2 ]
			}
		}

		var createPrototypeDefinition = function( prototypeNode ) {
			var propertyNodes = prototypeNode[ 1 ]

			return _.map( propertyNodes, createPropertyDefinition )
		}

		return function( source, className, libraryPath ) {
			var ast = createAST( source )

			var amdHeaderNode  = getAmdHeaderNode( ast ),
				moduleBodyNode = getModuleBodyNode( amdHeaderNode ),
				typeName       = getModuleReturnVariableName( moduleBodyNode ),
				ctorNode       = getConstructorFunctionNode( moduleBodyNode, typeName ),
				prototypeNode  = getPrototypeNode( moduleBodyNode, typeName )

			return {
				className : className,
				constructorSource : createSourceFromFunctionNode( ctorNode ),
				typeName : typeName,
				libraryPath : libraryPath,
				properties : createPrototypeDefinition( prototypeNode )
			}
		}
	}
)
