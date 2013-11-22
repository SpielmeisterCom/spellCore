define(
	'spell/shared/util/platform/private/Environment',
	[
	],
	function(
	) {
		'use strict'

		var init = function() {
		}

		var Environment = function( configurationManager, eventManager ) {
			this.configurationManager   = configurationManager
			this.eventManager           = eventManager
		}

		Environment.prototype = {
			init : init
		}

		return Environment
	}
)
