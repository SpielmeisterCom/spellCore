define(
	'spell/cli/Products',
	function() {
		'use strict'


		return {
			'SpellJS free' : {
				features : [
					{
						name : 'forcedSplashScreen',
						included : true
					}
				]
			},
			'SpellJS standard' : {
				features : [
					{
						name : 'forcedSplashScreen',
						included : false
					}
				]
			},
			'SpellJS professional' : {
				features : [
					{
						name : 'forcedSplashScreen',
						included : false
					}
				]
			}
		}
	}
)
