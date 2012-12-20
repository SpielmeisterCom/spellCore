define(
	"spell/shared/util/platform/private/Window",
	function() {
		"use strict"

		return {
			open: function( href, name ) {
				window.open( href, name )
			}
		}
	}
)
