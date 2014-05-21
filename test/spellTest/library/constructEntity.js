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
                        },
	                    children: []
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
            },
			'test.entityTemplate3': {
				"type": "entityTemplate",
				"config": {
					"test.component1": {
						test: [ 'one', 'two', 'three' ]
					}
				},
				children: [
					{
						name: 'child1',
						entityTemplateId: 'test.entityTemplate',
						config: {},
						children: [
							{
								name: 'newChild',
								entityTemplateId: 'test.entityTemplate2',
								config: {
									"test.component3": {
										text: 'newChild'
									}
								},
								children: []
							},
							{
								name: 'test',
								config: {
									"test.component2": {
										value: 0.1
									}
								}
							}
						]
					},
					{
						name: 'child2',
						entityTemplateId: 'test.entityTemplate',
						config: {},
						children: [
							{
								name: 'test',
								config: {
									"test.component2": {
										value: 0.2
									},
									"test.component3": {
										text: 'child2'
									}
								}
							}
						]
					},
					{
						name: 'child3',
						entityTemplateId: 'test.entityTemplate',
						config: {},
						children: []
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

/*                it( 'should throw an error, because test is defined as children in the root entityTemplate but is overridden with another entityTemplate with the same entityname', function() {
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
                        }
                    ).to.throw( 'Error' )

                })
 */

	            it( 'should not be possible to have the ownerTemplateId as child (recursion)', function() {
		            expect(
			            function() {
				            constructEntity( {
					            'test.wrongEntityTemplate': {
						            "type": "entityTemplate",
						            "config": {},
						            "children": [
							            {
								            "name": "test",
								            "entityTemplateId": 'test.wrongEntityTemplate',
								            "config": {},
								            children: []
							            }
						            ]
					            }
				            }, {
					            "name": "errol",
					            "config": {},
					            "children": [
						            {
							            "name": "test",
							            "entityTemplateId": 'test.wrongEntityTemplate',
							            "config": {},
							            children: []
						            }
					            ]
				            } )
			            }
		            ).to.throw( Error )
	            })

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
                        },
	                    children: [{
		                    name: 'test',
		                    config: {
			                    "test.component1": {}
		                    }
	                    }]
                    }

	                var entity = constructEntity( testLibrary, entityConfig )

                    it( 'test.component1 should be added to the parent entity', function() {
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

	                it( 'test.component1 should be added to the test child entity', function() {
		                entity.children.should.be.an( 'array').with.length( 1 )

		                var child = entity.children.pop()

		                child.config.should.deep.equal(
			                {
				                'test.component1' : {
					                test: []
				                },
				                'test.component3': {
					                text: 'Default Text'
				                }
			                }
		                )
	                } )
                } )
            } )

			describe( 'Merge a complex entity correctly', function() {
				var entityConfig = {
					name: 'complexEntity',
					entityTemplateId: 'test.entityTemplate3',
					config: {
						"test.component2": {
							value: 6.9
						}
					},
					children: [
						{
							name: 'child4',
							entityTemplateId: 'test.entityTemplate3'
						}
					]
				}

				var entity = constructEntity( testLibrary, entityConfig )

				it( 'the config should have test.component1 from template and test.component2 with value 6.9 as new component', function(){
					entity.config.should.deep.equal(
						{
							"test.component1": {
								test: [ 'one', 'two', 'three' ]
							},
							"test.component2": {
								value: 6.9
							}
						}
					)
				} )

				it( 'should have 4 children', function(){
					entity.children.should.be.an( 'array' ).with.length( 4 )
				} )

				var defaultConfigOfTestEntityTemplate = function( configEntity ) {
					return function() {
						it( 'should base on test.entityTemplate', function() {
							configEntity.should.have.property( 'entityTemplateId').and.equal( 'test.entityTemplate' )
						} )

						it( 'should have component 3+4', function(){
							configEntity.config.should.deep.equal({
								"test.component3": {
									text: "Default Text"
								},
								"test.component4": {
									active: true,
									testAttribute: "entityTemplateBased"
								}
							})
						} )
					}
				}

				var defaultChecksOnTestChild = function( child ) {
					return function() {
						it( 'should have name newChild', function() {
							child.should.have.property( 'name' ).and.equal( 'test' )
						} )

						it( 'should not base on an template', function() {
							child.should.not.have.property( 'entityTemplateId' )
						} )

						it( 'should have no children', function() {
							child.children.should.an( 'array').and.empty
						} )
					}
				}

				describe( 'child1', function() {
					var child1 = entity.children[ 0 ]

					it( 'should have name child1', function() {
						child1.should.have.property( 'name' ).and.equal( 'child1' )
					} )

					describe( 'defaults', defaultConfigOfTestEntityTemplate( child1 ) )

					it( 'should have 2 children', function() {
						child1.children.should.be.an( 'array' ).with.length( 2 )
					} )

					describe( 'test child', function() {
						var child = child1.children[ 0 ]

						describe( 'check defaults', defaultChecksOnTestChild( child ) )

						it( 'should have component 2+3 and 2 should have value 0.1', function() {
							child.config.should.deep.equal(
								{
									'test.component3': {
										text: 'Default Text'
									},
									'test.component2': {
										value: 0.1
									}
								}
							)
						} )
					} )

					describe( 'newChild', function() {
						var child = child1.children[ 1 ]

						it( 'should have name newChild', function() {
							child.should.have.property( 'name' ).and.equal( 'newChild' )
						} )

						it( 'should base on test.entityTemplate', function() {
							child.should.have.property( 'entityTemplateId').and.equal( 'test.entityTemplate2' )
						} )

						it( 'should have all components and component 3 with text newChild', function() {
							child.config.should.deep.equal({
								"test.component1": {
									test: []
								},
								"test.component4": {
									active: true
								},
								'test.component2': {
									value: 0.4
								},
								'test.component3': {
									text: 'newChild'
								}
							})
						})

						it( 'should have one child', function() {
							child.children.should.be.an( 'array' ).with.length( 1 )
						} )

						describe( 'testChild', function() {
							var testChild = child.children[ 0 ]

							it( 'should have name testChild', function() {
								testChild.should.have.property( 'name' ).and.equal( 'testChild' )
							} )

							it( 'should have no template', function() {
								testChild.should.not.have.property( 'entityTemplateId')
							} )

							it( 'should have all components with default values', function() {
								testChild.config.should.deep.equal({
									"test.component1": {
										test: []
									},
									"test.component4": {
										active: true
									},
									'test.component2': {
										value: 0.4
									},
									'test.component3': {
										text: 'Default Text'
									}
								})
							} )
						} )

					} )
				} )

				describe( 'child2', function() {
					var child2 = entity.children[ 1 ]

					it( 'should have name child2', function() {
						child2.should.have.property( 'name' ).and.equal( 'child2' )
					} )

					describe( 'defaults', defaultConfigOfTestEntityTemplate( child2 ) )

					it( 'should have only one child', function() {
						child2.children.should.be.an( 'array' ).with.length( 1 )
					} )

					describe( 'test child', function() {
						var testChild = child2.children[ 0 ]

						describe( 'check defaults', defaultChecksOnTestChild( testChild ) )

						it( 'should have component 2+3 with 0.2 and child2', function() {
							testChild.config.should.deep.equal({
								"test.component2": {
									value: 0.2
								},
								"test.component3": {
									text: 'child2'
								}
							})
						} )
					} )
				} )

				describe( 'child3', function() {
					var child3 = entity.children[ 2 ]

					it( 'should have name child3', function() {
						child3.should.have.property( 'name' ).and.equal( 'child3' )
					} )

					describe( 'defaults', defaultConfigOfTestEntityTemplate( child3 ) )

					it( 'should have only one child', function() {
						child3.children.should.be.an( 'array' ).with.length( 1 )
					} )

					describe( 'test child', function() {
						var testChild = child3.children[ 0 ]

						describe( 'check defaults', defaultChecksOnTestChild( testChild ) )

						it( 'should have default component with default values', function() {
							testChild.config.should.deep.equal({
								"test.component3": {
									text: 'Default Text'
								}
							})
						} )
					} )
				} )

				describe( 'child4', function() {
					var child4 = entity.children[ 3 ]

					it( 'should have name child4', function() {
						child4.should.have.property( 'name' ).and.equal( 'child4' )
					} )

					it( 'should base on test.entityTemplate3', function() {
						child4.should.have.property( 'entityTemplateId').and.equal( 'test.entityTemplate3' )
					} )

					it( 'should have component 1+2 with component 2 with value 6.9', function() {
						child4.config.should.deep.equal( {
							"test.component1": {
								test: [ 'one', 'two', 'three' ]
							}
						})
					} )

					it( 'should have 3 children', function() {
						child4.children.should.be.an( 'array' ).with.length( 3 )
					} )

					describe( 'Only check child1', function() {
						var child1 = child4.children[ 0 ]

						it( 'should have name child1', function() {
							child1.should.have.property( 'name' ).and.equal( 'child1' )
						} )

						describe( 'defaults', defaultConfigOfTestEntityTemplate( child1 ) )

						it( 'should have 2 children', function() {
							child1.children.should.be.an( 'array' ).with.length( 2 )
						} )

						describe( 'test child', function() {
							var child = child1.children[ 0 ]

							describe( 'check defaults', defaultChecksOnTestChild( child ) )

							it( 'should have component 2+3 and 2 should have value 0.1', function() {
								child.config.should.deep.equal(
									{
										'test.component3': {
											text: 'Default Text'
										},
										'test.component2': {
											value: 0.1
										}
									}
								)
							} )
						} )

						describe( 'newChild', function() {
							var child = child1.children[ 1 ]

							it( 'should have name newChild', function() {
								child.should.have.property( 'name' ).and.equal( 'newChild' )
							} )

							it( 'should base on test.entityTemplate', function() {
								child.should.have.property( 'entityTemplateId').and.equal( 'test.entityTemplate2' )
							} )

							it( 'should have all components and component 3 with text newChild', function() {
								child.config.should.deep.equal({
									"test.component1": {
										test: []
									},
									"test.component4": {
										active: true
									},
									'test.component2': {
										value: 0.4
									},
									'test.component3': {
										text: 'newChild'
									}
								})
							})

							it( 'should have one child', function() {
								child.children.should.be.an( 'array' ).with.length( 1 )
							} )

							describe( 'testChild', function() {
								var testChild = child.children[ 0 ]

								it( 'should have name testChild', function() {
									testChild.should.have.property( 'name' ).and.equal( 'testChild' )
								} )

								it( 'should have no template', function() {
									testChild.should.not.have.property( 'entityTemplateId')
								} )

								it( 'should have all components with default values', function() {
									testChild.config.should.deep.equal({
										"test.component1": {
											test: []
										},
										"test.component4": {
											active: true
										},
										'test.component2': {
											value: 0.4
										},
										'test.component3': {
											text: 'Default Text'
										}
									})
								} )
							} )

						} )
					} )
				} )
			} )
		})
})
