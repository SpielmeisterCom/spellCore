define(
	'spell/shared/build/createOsPath',
	[
		'os'
	],
	function(
		os
	) {
		'use strict'


		return function() {
			var type = os.type().toLowerCase()

			if( type.indexOf( 'darwin' ) === 0 ) {
				return {
					createAppDataPath : function( appName ) {
						return this.getHomePath() + '/Library/Application Support/' + appName
					},
					getHomePath : function() {
						return process.env.HOME
					},
					getTempPath : function() {
						return '/tmp'
					}
				}

			} else if( type.indexOf( 'lin' ) === 0 ) {
				return {
					createAppDataPath : function( appName ) {
						return this.getHomePath() + '/.config/' + appName
					},
					getHomePath : function() {
						return process.env.HOME
					},
					getTempPath : function() {
						return '/tmp'
					}
				}

			} else if( type.indexOf( 'win' ) === 0 ) {
				return {
					createAppDataPath : function( appName ) {
						var appDataPath = process.env.LOCALAPPDATA || process.env.APPDATA

						return appDataPath + '\\' + appName
					},
					getHomePath : function() {
						return process.env.USERPROFILE
					},
					getTempPath : function() {
						return process.env.TEMP
					}
				}
			}
		}
	}
)
