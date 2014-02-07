define(
	'spell/data/libraryRecord/EntityTemplate',
	function() {
		'use strict'


		var EntityTemplate = function( metaData ) {
		}

		EntityTemplate.getDependencies = function( spell, metaData ) {
			return metaData.dependencies
		}

		EntityTemplate.hasExternalResource = function( spell, metaData ) {
			return false
		}

		EntityTemplate.getExternalResourceFilePaths = function( spell, metaData ) {
			return []
		}

		return EntityTemplate
	}
)
