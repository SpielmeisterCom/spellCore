define(
	'spell/library/getDependencies',
	[
		'spell/functions'
	],
	function(
		_
		) {
		'use strict'

		var addSystemDependencies = function( dependencies, system ) {
			_.each(
				system.input,
				function( input ) {
					dependencies.push( input.componentId )
				}
			)
		}

		var addEntityDependencies = function( dependencies, entity ) {
			//add entity template, if this entity is based on a template
			if( entity.entityTemplateId ) {
				dependencies.push( entity.entityTemplateId )
			}

			//add components from config
			_.each(
				entity.config,
				function( value, key ) {
					dependencies.push( key )
				}
			)

			//process child entities
			_.each(
				entity.children,
				function( childEntity ) {
					addEntityDependencies( dependencies, childEntity )
				}
			)

		}

		var addSceneDependencies = function( dependencies, scene ) {
			//process systems
			_.each(
				scene.systems,
				function( value ) {
					_.each(
						value,
						function( system ) {
							dependencies.push( system.id )
						}
					)
				}
			)

			//process entities
			_.each(
				scene.entities,
				function( entity ) {
					addEntityDependencies( dependencies, entity )
				}
			)
		}

		var libraryItemHandler = {
			'scene':            addSceneDependencies,
			'system':           addSystemDependencies,
			'entityTemplate':   addEntityDependencies
		}

		return function( libraryItem ) {
			var dependencies = [ ]

			if( !libraryItem || !libraryItem.type ) {
				return dependencies
			}

			if( libraryItemHandler[ libraryItem.type ] ) {
				libraryItemHandler[ libraryItem.type ].call( null, dependencies, libraryItem )

			} else {

				throw 'Unknown library item type: ' + libraryItem.type
			}


			return _.unique( dependencies )
		}
	}
)
