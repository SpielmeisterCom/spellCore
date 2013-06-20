define(
	'spell/shared/build/spawnChildProcess',
	[
		'child_process'
	],
	function(
		child_process
	) {
		'use strict'


		return function( command, args, options, next ) {
			var child = child_process.spawn( command, args, options )

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

			child.stdout.on(
				'close',
				function( code ) {
					next()
				}
			)

			return child
		}
	}
)
