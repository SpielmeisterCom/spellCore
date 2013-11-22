define(
	'spell/shared/util/platform/private/Environment',
	[
		'spell/shared/util/platform/private/environment/visibilityChangeHandler'
	],
	function(
		visibilityChangeHandler
	) {
		'use strict'


		var Environment = function( configurationManager, eventManager ) {
			this.configurationManager = configurationManager
			this.eventManager         = eventManager
		}

		Environment.prototype = {
			init : function() {
				visibilityChangeHandler.registerListener( this.eventManager )
			}
		}

		return Environment
	}
)
