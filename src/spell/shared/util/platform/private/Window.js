define(
	"spell/shared/util/platform/private/Window",
	function() {
		"use strict"

		var Window = function() {}

		Window.prototype = {
			open: function( href, name ) {
				window.open( href, name )
			}
		}

		return Window
	}
)
