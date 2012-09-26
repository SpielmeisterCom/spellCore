define(
	'spell/shared/build/processSource',
	[
		'spell/shared/build/ast/anonymizeModuleIds',
		'spell/shared/build/ast/createAST',
		'spell/shared/build/ast/createSource',
		'spell/shared/build/ast/minifyAST'
	],
	function(
		anonymizeModuleIds,
		createAST,
		createSource,
		minifyAST
	) {
		return function( sourceChunk, minify, anonymizeModules ) {
			if( !minify && !anonymizeModules ) return sourceChunk

			var ast = createAST( sourceChunk )

			if( anonymizeModules ) {
				ast = anonymizeModuleIds( ast, [ 'spell/client/main' ] )
			}

			if( minify ) ast = minifyAST( ast )

			return createSource( ast, !minify )
		}
	}
)
