define(
	'spell/server/build/server',
	[],
	function( ) {
		'use strict'


		/**
		 * private
		 */

		var test1 = function() {
			return 'test1'
		}


		/**
		 * public
		 */

		return {
			TestActions: [
				{
					name: "test1",
					len: 1,
					func: test1
				}
			]
		}
	}
)
