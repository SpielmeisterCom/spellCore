/**
 * @class spell.pluginManager
 * @singleton
 */
define(
	'spell/PluginManager',
	[
		'spell/shared/util/platform/PlatformKit'
	],
	function(
		PlatformKit
	) {
		'use strict'


		var PluginManager = function() {
			this.plugins = PlatformKit.getPlugins()
		}

		PluginManager.prototype = {
			getById : function( pluginId ) {
				this.plugins[ pluginId ]
			}
		}

		return PluginManager
	}
)
