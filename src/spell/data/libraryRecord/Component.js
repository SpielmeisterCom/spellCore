define(
	'spell/data/libraryRecord/Component',
	function() {
		'use strict'


		var Component = function( metaData ) {
		}

		Component.getDependencies = function( spell, metaData ) {}

		Component.hasExternalResource = function( spell, metaData ) {
			return false
		}

		Component.getExternalResourceFilePaths = function( spell, metaData ) {
			return []
		}

		return Component
	}
)
