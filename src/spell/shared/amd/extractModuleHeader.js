define(
	'spell/shared/amd/extractModuleHeader',
	[
		'underscore.string'
	],
	function(
		_s
	) {
		return function( moduleSource ) {
			moduleSource = moduleSource.replace( /\r?\n|\r/g, '' )

			// keeping the string of interest small is good
			var functionIndex = moduleSource.indexOf( 'function' )
			moduleSource = moduleSource.substr( 0, functionIndex )

			// TODO: Parsing the define statement like this wins first price in category ugly. Make it stop.
			var regex  = /.*define\((\s\[.*\]|[^\[,]*)\s*,\s*(\[.*?\])?.*/,
				match  = moduleSource.match( regex )

			if( !match ) return false


			var match1 = match[ 1 ].replace( /["'\s]/g, '' ),
				match2 = match[ 2 ] ? match[ 2 ].replace( /["'\s]/g, '' ) : ''

			return {
				name : ( _s.contains( match1, '[' ) ? '' : match1 ),
				dependencies : ( _s.contains( match1, '[' ) ?
					match1.replace( /[\[\]]/g, '' ).split( ',' ) :
					( _s.contains( match2, '[' ) ?
						match2.replace( /[\[\]]/g, '' ).split( ',' ) :
						[]
					)
				)
			}
		}
	}
)
