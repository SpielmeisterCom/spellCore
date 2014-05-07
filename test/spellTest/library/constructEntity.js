define(
	[
		'spell/library/constructEntity'
	],
	function(
		constructEntity
	) {
		'use strict'

		var testLibrary = {
			'test.component1': {
				"type": "component",
				"readonly": true,
				"engineInternal": true,
				"title": "Test",
				"doc": "test",
				"attributes": [
					{
						"name": "test",
						"doc": "ids of the children entities",
						"default": [],
						"type": "list"
					}
				],
				"version": 1
			},

			'test.entityTemplate': {
				"type": "entityTemplate",
				"config": {
						"test.component3": {},
						"test.component4": {
							"testAttribute": "entityTemplateBased"
						}
				},
				"children": [
					{
						"name": "test",
						"config": {
							"test.component3": {}
						}
					}
				],
				"version": 1
			}
		}

		describe( 'spell/library/constructEntity', function( ) {
			it( 'should construct a correct flat entity', function( done ) {

					var entity = constructEntity(
						testLibrary,
						{
						"name": "anonymousEntity3",
						"children": [],
						"config": {
							"test.component4": {
								"active": true
							}
						}
					})

					expect( entity ).to.have.property( 'config' )

					done()
			} )

			it( 'should fail if two siblings have the same name', function( done ) {
				var testEntity = {
					"name": "anonymousEntity3",
					"children": [
						{
							"name": "child"
						},
						{
							"name": "child"
						}
					],
					"config": {
						"test.component4": {
							"active": true
						}
					}
				}

				expect(
					function() {
						var entity = constructEntity( testLibrary, testEntity )
					}
				).to.throw( 'Error' )

				done()
			} )

			//Entity Templates tests begin
			it( 'should fail if the entity template is unknown', function( done ) {
				var testEntity = {
					"name": "anonymousEntity3",
					"entityTemplateId": "is.not.known",
					"config": {
						"test.component4": {
							"active": true
						}
					}
				}

				expect(
					function() {
						var entity = constructEntity( testLibrary, testEntity )
					}
				).to.throw( 'Error' )

				done()
			} )

			it( 'should construct a correct entityTemplate based entity', function( done ) {

				var testEntity = {
					"name": "anonymousEntity3",
					"entityTemplateId": "test.entityTemplate",
					"config": {
						"test.component4": {
							"active": true,
							"testAttribute": "instanceOverride"
						}
					},
					"children": [
						{
							"name": "test",
							"config": {}
						}
					]
				}

				var entity = constructEntity( testLibrary, testEntity )

				expect( entity ).to.have.property( 'config' )
				expect( entity.config ).to.have.property( 'test.component4' )
				expect( entity.config['test.component4'] ).to.have.property( 'testAttribute' )

				//test if entity template component attributes are overwritten by entityInstance
				expect(
					entity.config['test.component4']['testAttribute']
				).to.be.equal( 'instanceOverride' )

				expect( entity.config ).to.have.property( 'test.component3' ) //merged in by entity template

				done()
			} )
		})
})
