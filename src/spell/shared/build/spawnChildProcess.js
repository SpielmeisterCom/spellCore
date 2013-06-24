define(
	'spell/shared/build/spawnChildProcess',
	[
		'child_process'
	],
	function(
		child_process
	) {
		'use strict'


		return function( command, args, options, redirectStd, next ) {
			var child = child_process.spawn( command, args, options )

			if( redirectStd ) {
				child.stdout.on(
					'data',
					function( data ) {
						process.stdout.write( data )
					}
				)

				child.stderr.on(
					'data',
					function( data ) {
						process.stderr.write( data )
					}
				)
			}

			var error,
				status

			child.on(
				'close',
				function( status ) {
					next( error, status )
				}
			)

			child.on(
				'error',
				function( x ) {
					error = x
				}
			)

			return child
		}
	}
)
