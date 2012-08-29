define(
	'spell/shared/build/processSource',
	[
		'spell/shared/build/ast/anonymizeModuleIdentifiers',
		'spell/shared/build/ast/createAST',
		'spell/shared/build/ast/createSource',
		'spell/shared/build/ast/minifyAST'
	],
	function(
		anonymizeModuleIdentifiers,
		createAST,
		createSource,
		minifyAST
	) {
		return function( sourceChunk, minify, anonymizeModules ) {
			if( !minify && !anonymizeModules ) return sourceChunk

			var ast = createAST( sourceChunk )

			if( anonymizeModules ) {
				ast = anonymizeModuleIdentifiers( ast, [ 'spell/client/main', 'spell/client/runtimeModule' ] )
			}

			if( minify ) ast = minifyAST( ast )

			return createSource( ast, !minify )
		}
	}
)
