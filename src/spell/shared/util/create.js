define(
	'spell/shared/util/create',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var NO_CONSTRUCTOR_ERROR = 'The first argument for create must be a constructor. You passed in '


		/*
		 * public
		 */

		// TODO: Fix the issue that instances which where created with "create" do not support method look-up along the prototype chain.
		return function( constructor, constructorArguments, propertiesToInject ) {
			if ( constructor.prototype === undefined ) {
				throw NO_CONSTRUCTOR_ERROR + constructor
			}

			var object = {}

			if( !!propertiesToInject && _.isObject( propertiesToInject ) ) {
				_.extend( object, propertiesToInject )
			}

			object.prototype = constructor.prototype
			var returnedObject = constructor.apply( object, constructorArguments )
			return returnedObject || object
		}
	}
)
