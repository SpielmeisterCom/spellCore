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


		var PluginManager = function( inputManager ) {
			this.plugins = PlatformKit.getPlugins()

			if( this.plugins[ 'ouya' ] ) {
				this.plugins[ 'ouya'].init( inputManager )
			}

            if( this.plugins[ 'iap' ] ) {
                this.plugins[ 'iap'].init()
            }
		}

		PluginManager.prototype = {
			getById : function( pluginId ) {
				return this.plugins[ pluginId ]
			}
		}

		return PluginManager
	}
)
