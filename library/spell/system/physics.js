/**
 * @class spell.system.physics
 * @singleton
 */

define(
    'spell/system/physics',
    [
        'spell/Defines',
        'spell/math/util',
        'spell/shared/util/platform/PlatformKit',

        'spell/functions'
    ],
    function(
        Defines,
        mathUtil,
        PlatformKit,

        _
        ) {
        'use strict'


        //TODO: check if the boxtree can be removed, instead use our quadtree http://docs.turbulenz.com/jslibrary_api/broadphase_api.html#broadphase
        //TODO: add license of torbulenz to spellCore LICENCE
        var Physics   = PlatformKit.Physics.device,
            debugDraw = PlatformKit.Physics.debugDrawer,
            clamp     = mathUtil.clamp

        /**
         * Creates an instance of the system.
         *
         * @constructor
         * @param {Object} [spell] The spell object.
         */
        var physics = function( spell ) {
            this.entityCreatedHandler
            this.entityDestroyHandler
            this.world
            this.removedEntitiesQueue = []
        }

        var triggerContactEntityEvent = function( entityManager, eventId, arbiter, params ) {
            var entityIdA = arbiter.bodyA.userData,
                entityIdB = arbiter.bodyB.userData

            entityManager.triggerEvent( entityIdA, eventId, [ entityIdB, arbiter ].concat( params ) )
            entityManager.triggerEvent( entityIdB, eventId, [ entityIdA, arbiter ].concat( params ) )
        }

        var createContactListener = function( entityManager, shape, contactTrigger ) {

            shape.addEventListener(
                'begin', function( arbiter, otherShape ) {
                    triggerContactEntityEvent( entityManager, 'beginContact', arbiter, [] )

                    if( contactTrigger && contactTrigger.eventId ) {
                        var params = !contactTrigger.parameters ? [] : _.isArray( contactTrigger.parameters ) ? contactTrigger.parameters : contactTrigger.parameters.split(',')

                        triggerContactEntityEvent( entityManager, contactTrigger.eventId, arbiter, params )
                    }
                }
            )

            shape.addEventListener(
                'end', function( arbiter, otherShape ) {
                    triggerContactEntityEvent( entityManager, 'endContact', arbiter, [] )
                }
            )

            shape.addEventListener(
                'preSolve', function( arbiter, otherShape ) {
                    triggerContactEntityEvent( entityManager, 'preSolve', arbiter, [] )
                }
            )

            shape.addEventListener(
                'progress', function( arbiter, otherShape ) {
                    triggerContactEntityEvent( entityManager, 'progress', arbiter, [] )
                }
            )
        }


        var createJNRPlayerBody = function( shapeDef, JNRunPlayerShape ) {
            var radius = JNRunPlayerShape.dimensions[ 0 ] * 0.9,
                width  = JNRunPlayerShape.dimensions[ 0 ] * 0.7,
                sensorHeight = 5,
                height = JNRunPlayerShape.dimensions[ 0 ],
                shapes = [
                    Physics.createPolygonShape(
                        _.extend(
                            {},
                            shapeDef,
                            {
                                vertices: [
                                    [ -width, height ],
                                    [ -width, height + sensorHeight ],
                                    [ width, height + sensorHeight ],
                                    [ width, height ]
                                ],
                                group: 0x0500,
                                mask: 0xFFFF,
                                sensor: true
                            }
                        )
                    ),
                    Physics.createCircleShape(
                        _.extend(
                            {},
                            shapeDef,
                            {
                                radius: radius,
                                group: 0x0900,
                                mask: 0xFFFF
                            }
                        )
                    ),
                    Physics.createPolygonShape(
                        _.extend(
                            {},
                            shapeDef,
                            {
                                vertices: [
                                    [ -width, -height ],
                                    [ -width, -height - sensorHeight ],
                                    [ width, -height - sensorHeight ],
                                    [ width, -height ]
                                ],
                                group: 0x0300,
                                mask: 0xFFFF,
                                sensor: true
                            }
                        )
                    )
                ]


            return shapes
        }

        var createBody = function( entityManager, debug, world, entityId, entity ) {
            var body               = entity[ Defines.PHYSICS_BODY_COMPONENT_ID ],
                fixture            = entity[ Defines.PHYSICS_FIXTURE_COMPONENT_ID ],
                boxShape           = entity[ Defines.PHYSICS_BOX_SHAPE_COMPONENT_ID ],
                circleShape        = entity[ Defines.PHYSICS_CIRCLE_SHAPE_COMPONENT_ID ],
                convexPolygonShape = entity[ Defines.PHYSICS_CONVEX_POLYGON_SHAPE_COMPONENT_ID ],
                JNRunPlayerShape   = entity[ Defines.PHYSICS_JNRPLAYER_SHAPE_COMPONENT_ID ],
                transform          = entity[ Defines.TRANSFORM_COMPONENT_ID ],
                contactTrigger     = entity[ Defines.PHYSICS_CONTACT_TRIGGER_COMPONENT_ID ]

            if( !body || !fixture || !transform ||
                ( !boxShape && !circleShape && !convexPolygonShape && !JNRunPlayerShape ) ) {

                return
            }

            var shapeDef = {
                    material : Physics.createMaterial({
                        elasticity : fixture.elasticity,
                        staticFriction : fixture.staticFriction,
                        dynamicFriction : fixture.dynamicFriction,
                        rollingFriction : fixture.rollingFriction,
                        density: fixture.density
                    }),
                    group: fixture.categoryBits,
                    mask: fixture.maskBits,
                    sensor: fixture.isSensor
                },
                shapes = []

            if( JNRunPlayerShape ) {
                shapes = createJNRPlayerBody( shapeDef, JNRunPlayerShape )

            } else {
                if( circleShape ) {
                    shapeDef.radius = circleShape.radius
                    shapes.push( Physics.createCircleShape( shapeDef ) )

                } else {
                    shapeDef.vertices = boxShape ? Physics.createBoxVertices(
                        boxShape.dimensions[ 0 ],
                        boxShape.dimensions[ 1 ]
                    ): convexPolygonShape.vertices

                    shapes.push( Physics.createPolygonShape( shapeDef ) )
                }
            }

            _.each(
                shapes,
                function( shape ) {
                    createContactListener( entityManager, shape, contactTrigger )
                }
            )

            world.createBodyDef( entityId, body, shapes, transform )
        }


        var destroyBodies = function( world, entityIds ) {
            for( var i = 0, numEntityIds = entityIds.length; i < numEntityIds; i++ ) {
                world.destroyBody( entityIds[ i ] )
            }
        }

        var incrementState = function( entityManager, world, bodies, transforms ) {

            for( var id in bodies ) {
                var body = bodies[ id ]

                if( body.type === 'static' ) {
                    continue
                }

                // transfering state to components
                var transform = transforms[ id ]

                if( !transform ) continue

                var position = world.getPosition( id )

                transform.translation[ 0 ] = position[0]
                transform.translation[ 1 ] = position[1]

                //TODO: check for existing of internal flags for fixed rotation in physics engine
                if( !body.fixedRotation ){
                    transform.rotation = world.getRotation( id )
                } else {
                    world.setRotation( id, transform.rotation )
                }

                //Sync velocity
                world.getVelocity( body.velocity )

                entityManager.updateWorldTransform( id )
            }
        }

        var _graphicsDevice = {
            width: 800,
            height: 600,
            technique: undefined,
            setStream: function() {

            },
            setTechnique: function( technique ) {
                this.technique = technique
            },
            setTechniqueParameters: function() {

            },
            setScissor: function() {

            },
            createIndexBuffer: function() {
                return {
                    destroy: function() {

                    },
                    setData: function() {

                    }
                }
            },
            setIndexBuffer: function() {

            },
            drawIndexed: function() {

            },
            createSemantics: function() {

            },
            createVertexBuffer: function() {
                return {
                    destroy: function() {

                    },
                    setData: function() {

                    }
                }
            },
            createShader: function() {
                return {
                    getTechnique: function() {
                        return {}
                    }
                }
            },
            createTechniqueParameters: function() {

                return {
                    clipSpace: new Array(4)
                }
            }
        }

        physics.prototype = {
            /**
             * Gets called when the system is created.
             *
             * @param {Object} [spell] The spell object.
             */
            init: function( spell ) {
                this.world = spell.physicsWorlds.main
				var config = this.config

                if( !this.world ) {
                    var world = spell.physicsContext.createWorld( this.config.gravity, this.config.scale )

                    this.world = world
                    spell.physicsWorlds.main = world
                }

                if(
					config.showConstraints ||
					config.showContacts ||
					config.showContactImpulses ||
					config.showRigidBodies ||
					config.showColliderShapes ||
					config.showSensorShapes ||
					config.showBodyDetail ||
					config.showShapeDetail
				) {
                    var debug = spell.physicsWorlds.debugDraw

                    if( !debug ) {
                        debug = debugDraw.create( { graphicsDevice: _graphicsDevice } )
                        debug.renderingContext = spell.renderingContext

                        spell.physicsWorlds.debugDraw = debug
                    }

                    debug.showConstraints     = config.showConstraints
					debug.showContacts        = config.showContacts
					debug.showContactImpulses = config.showContactImpulses
					debug.showRigidBodies     = config.showRigidBodies
					debug.showColliderShapes  = config.showColliderShapes
					debug.showSensorShapes    = config.showSensorShapes
					debug.showBodyDetail      = config.showBodyDetail
					debug.showShapeDetail     = config.showShapeDetail
                }

                this.entityCreatedHandler = _.bind( createBody, null, spell.entityManager, this.config.debug, this.world )
                this.entityDestroyHandler = _.bind( this.removedEntitiesQueue.push, this.removedEntitiesQueue )

                var eventManager = spell.eventManager

                eventManager.subscribe( eventManager.EVENT.ENTITY_CREATED, this.entityCreatedHandler )
                eventManager.subscribe( eventManager.EVENT.ENTITY_REMOVED, this.entityDestroyHandler )
            },

            /**
             * Gets called when the system is destroyed.
             *
             * @param {Object} [spell] The spell object.
             */
            destroy: function( spell ) {
                var eventManager = spell.eventManager

                eventManager.unsubscribe( eventManager.EVENT.ENTITY_CREATED, this.entityCreatedHandler )
                eventManager.unsubscribe( eventManager.EVENT.ENTITY_REMOVED, this.entityDestroyHandler )
            },

            /**
             * Gets called when the system is activated.
             *
             * @param {Object} [spell] The spell object.
             */
            activate: function( spell ) {

            },

            /**
             * Gets called when the system is deactivated.
             *
             * @param {Object} [spell] The spell object.
             */
            deactivate: function( spell ) {

            },

            /**
             * Gets called to trigger the processing of game state.
             *
             * @param {Object} [spell] The spell object.
             * @param {Object} [timeInMs] The current time in ms.
             * @param {Object} [deltaTimeInMs] The elapsed time in ms.
             */
            process: function( spell, timeInMs, deltaTimeInMs ) {
                var world                = this.world,
                    transforms           = this.transforms,
                    removedEntitiesQueue = this.removedEntitiesQueue

                if( removedEntitiesQueue.length ) {
                    destroyBodies( world, removedEntitiesQueue )
                    removedEntitiesQueue.length = 0
                }

                world.step( deltaTimeInMs )
                //TODO: iterate only dynamic & kinematic bodies
                incrementState( spell.entityManager, world, this.bodies, transforms )
            }
        }

        return physics
    }
)
