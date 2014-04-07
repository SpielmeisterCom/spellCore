define(
	'spellTest/EntityManager',
	[
		'chai',
		'spell/EntityManager'
	],
	function(
		chai,
		EntityManager
		) {
		'use strict'

		return function( describe, it ) {
			var expect = chai.expect

			var spellMock                   = {},
				configurationManagerMock    = {},
				assetManagerMock            = {},
				eventManagerMock            = {},
				libraryManagerMock          = {
					get : function( libraryId ) {
						if( libraryId == "spell.component.composite" ) {
							return {
								"type": "component",
								"readonly": true,
								"engineInternal": true,
								"title": "Entity Composite",
								"doc": "This component holds the ids of the parent and children entities of this entity.",
								"attributes": [{
									"name": "childrenIds",
									"doc": "ids of the children entities",
									"default": [],
									"type": "list"
								},
								{
									"name": "parentId",
									"doc": "entity id of the parent entity",
									"default": "0",
									"type": "string"
								}],
								"version": 1
							}
						}
					}
				},
				moduleLoaderMock            = {}

				var entityManager = new EntityManager(
					spellMock,
					configurationManagerMock,
					assetManagerMock,
					eventManagerMock,
					libraryManagerMock,
					moduleLoaderMock
				)

				entityManager.init()

			describe( 'spell/EntityManager', function( ) {
				it( 'should correctly return an added object', function( done ) {

				})
			})

		}
	})
