define(
	"spell/shared/util/create",
	function() {
		"use strict"


		var create = function( constructor, args ) {
			if ( constructor.prototype === undefined ) {
				throw create.NO_CONSTRUCTOR_ERROR + constructor
			}

			var object = {}
			object.prototype = constructor.prototype
			var returnedObject = constructor.apply( object, args )
			return returnedObject || object
		}


		create.NO_CONSTRUCTOR_ERROR = "The first argument for create must be a constructor. You passed in "


		return create
	}
)
