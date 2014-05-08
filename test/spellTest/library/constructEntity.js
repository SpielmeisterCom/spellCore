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
				"attributes": [
					{
						"name": "test",
						"default": [],
						"type": "list"
					}
				]
			},
            'test.component2': {
                "type": "component",
                "attributes": [
                    {
                        "name": "value",
                        "default": 0.4,
                        "type": "number"
                    }
                ]
            },
            'test.component3': {
                "type": "component",
                "attributes": [
                    {
                        "name": "text",
                        "default": 'Default Text',
                        "type": "string"
                    }
                ]
            },
            'test.component4': {
                "type": "component",
                "attributes": [
                    {
                        "name": "active",
                        "default": true,
                        "type": "boolean"
                    }
                ]
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
                ]
			},
            'test.entityTemplate2': {
                "type": "entityTemplate",
                "config": {
                    "test.component1": {},
                    "test.component2": {},
                    "test.component3": {},
                    "test.component4": {}
                },
                "children": [
                    {
                        "name": "testChild",
                        "config": {
                            "test.component1": {},
                            "test.component2": {},
                            "test.component3": {},
                            "test.component4": {}
                        }
                    }
                ]
            }
		}

		describe( 'spell/library/constructEntity', function( ) {
			it( 'should construct a correct flat entity', function() {

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
			} )

            it( 'missing children key must be initialized as an empty array', function() {
                var entity = constructEntity(
                    testLibrary,
                    {
                        "name": "anonymousEntity3",
                        "config": {
                            "test.component4": {
                                "active": true
                            }
                        }
                    }
                )

                entity.should.have.property( 'children' ).and.be.a( 'array' )
            } )

			it( 'should fail if two siblings have the same name', function() {
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
			} )

			//Entity Templates tests begin
			it( 'should fail if the entity template is unknown', function() {
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
			} )

			it( 'should construct a correct entityTemplate based entity', function() {

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
			} )

            describe( 'Merge an entityTemplate with children based on other entityTemplates', function() {

                it( 'should throw an error, because test is defined as children in the root entityTemplate but is overridden with another entityTemplate with the same entityname', function() {
                    var wrongTestEntity = {
                        "name": "anonymousEntity4",
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
                                "entityTemplateId": "test.entityTemplate2",
                                "config": {}
                            }
                        ]
                    }

                    expect(
                        function() {
                            var entity = constructEntity( testLibrary, wrongTestEntity )
                        }, 'Child entity "test" is not unique.'
                    ).to.throw( 'Error' )

                })


                it( 'should not be possible to have the ownerTemplateId as child (recursion)', function() {
                    //TODO: implement a test
                } )


                it( 'should have the child test in anonymousEntity4 and merge test2 with the entityTemplate', function() {
                    var testEntity = {
                        "name": "anonymousEntity4",
                        "entityTemplateId": "test.entityTemplate",
                        "config": {},
                        "children": [
                            {
                                "name": "test2",
                                "entityTemplateId": "test.entityTemplate2",
                                "config": {
                                    "test.component3": {
                                        "text": "overloaded text"
                                    }
                                }
                            }
                        ]
                    }

                    var mergedEntity = constructEntity( testLibrary, testEntity )

                    mergedEntity.should.have.property( 'children' ).with.length( 2 )

                    var test = mergedEntity.children.shift()

                    test.should.have.property( 'name' ).and.equal( 'test' )
                    test.config.should.deep.equal( {
                        'test.component3' :{
                            "text": "Default Text"
                        }
                    } )

                    var test2 = mergedEntity.children.shift()

                    test2.should.have.property( 'name' ).and.equal( 'test2' )
                    test2.should.have.property( 'entityTemplateId' ).and.equal( 'test.entityTemplate2' )

                    test2.config.should.deep.equal( {
                        "test.component1": {
                            test: []
                        },
                        "test.component4": {
                            active: true
                        },
                        'test.component3': {
                            text: "overloaded text"
                        },
                        'test.component2': {
                            value: 0.4
                        }
                    } )

                    test2.should.have.property( 'children' ).with.length( 1 )

                    var testChild = test2.children.pop()

                    testChild.config.should.deep.equal(
                        {
                            "test.component1": {
                                test: []
                            },
                            "test.component4": {
                                active: true
                            },
                            'test.component3': {
                                text: "Default Text"
                            },
                            'test.component2': {
                                value: 0.4
                            }
                        }
                    )
                } )


                it( 'testAttribute in childEntity should be overridden' , function() {
                    var testEntity = {
                        "name": "anonymousEntity4",
                        "entityTemplateId": "test.entityTemplate",
                        "config": {},
                        "children": [
                            {
                                "name": "test",
                                "entityTemplateId": "test.entityTemplate",
                                "config": {
                                    "test.component4": {
                                        "testAttribute": "childOverride"
                                    }
                                }
                            }
                        ]
                    }

                    var mergedEntity = constructEntity( testLibrary, testEntity )

                    mergedEntity.should.have.property( 'children' ).with.length( 1 )

                    var child = mergedEntity.children.pop()

                    child.config.should.deep.equal( {
                            "test.component3": {
                                text: 'Default Text'
                            },
                            "test.component4": {
                                "testAttribute": "childOverride",
                                active: true
                            }
                        }
                    )
                })
            } )

            describe( 'Add a component to an entityTemplate', function() {
                describe( 'on root level', function() {
                    var entityConfig = {
                        "name": "entityBasedOnTemplate",
                        "entityTemplateId": "test.entityTemplate",
                        "config": {
                            "test.component1": {}
                        }
                    }


                    it( 'should be added to the entity', function() {
                        var entity = constructEntity( testLibrary, entityConfig )

                        entity.config.should.deep.equal(
                            {
                                'test.component1' : {
                                    test: []
                                },
                                'test.component3': {
                                    text: 'Default Text'
                                },
                                'test.component4': {
                                    testAttribute: "entityTemplateBased",
                                    active: true
                                }
                            }
                        )
                    } )
                } )
            } )
		})
})
