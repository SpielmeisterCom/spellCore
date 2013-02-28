define(
	'spell/server/build/dependencies',
	[
		'spell/shared/build/exportDeploymentArchive',
		'spell/shared/build/initializeProjectDirectory',
		'spell/shared/build/isDevEnvironment'
	],
	function(
		exportDeploymentArchive,
		initializeProjectDirectory,
		isDevEnvironment
	) {
		'use strict'
		//Need for creating spell.util.js

		return {
			exportDeploymentArchive: exportDeploymentArchive,
			initializeProjectDirectory: initializeProjectDirectory,
			isDevEnvironment: isDevEnvironment
		}
	}
)
