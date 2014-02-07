define(
	'spell/data/LibraryId',
	function() {
		'use strict'


		var LibraryId = function( value ) {
			this.value = value
		}

		LibraryId.prototype = {
			getName: function() {
				var splitOffset = this.value.lastIndexOf( '.' )

				return this.value.substr( splitOffset + 1, this.value.length )
			},
			getNamespace : function() {
				var splitOffset = this.value.lastIndexOf( '.' )

				return this.value.substr( 0, splitOffset )
			}
		}

		return LibraryId
	}
)
