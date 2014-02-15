define(
	'spellTest/PhysicsManager',
	[
		'chai',
		'spell/PhysicsManager'
	],
	function(
		chai,
		PhysicsManager
		) {
		'use strict'

		return function( describe, it ) {
			var expect = chai.expect

			var physicsManager = new PhysicsManager()

			describe( 'spell/PhysicsManager', function( ) {
				it( 'should provide all public functions', function( done ) {

					[ 'getDefaultMaterial' ].forEach( function( method ) {
						expect( physicsManager ).to.respondTo( method )
					})

					done()
				})


				it( 'should create RectangleVertices when calling createRectangleVertices', function( done ) {
					var vertices = physicsManager.createRectangleVertices(1,2,3,4)

					expect(vertices).to.have.length( 4 )

					expect(vertices[0]).to.have.length( 2 )
					expect(vertices[1]).to.have.length( 2 )
					expect(vertices[2]).to.have.length( 2 )
					expect(vertices[3]).to.have.length( 2 )

					done()
				})

				it( 'should create BoxVertices when calling createBoxVertices', function( done ) {
					var vertices = physicsManager.createBoxVertices(100, 100)

					expect(vertices).to.have.length( 4 )

					expect(vertices[0]).to.have.length( 2 )
					expect(vertices[1]).to.have.length( 2 )
					expect(vertices[2]).to.have.length( 2 )
					expect(vertices[3]).to.have.length( 2 )

					done()
				})

				it( 'should create RegularPolygonVertices when calling createRegularPolygonVertices', function( done ) {
					var vertices = physicsManager.createRegularPolygonVertices(2, 2, 4)

					expect(vertices).to.have.length( 4 )

					expect(vertices[0]).to.have.length( 2 )
					expect(vertices[1]).to.have.length( 2 )
					expect(vertices[2]).to.have.length( 2 )
					expect(vertices[3]).to.have.length( 2 )

					done()
				})


				it( 'getDefaultMaterial() should return a valid default material', function( done ) {
					var expectedMethods = [
						'getElasticity', 'getStaticFriction', 'getDynamicFriction',
						'getRollingFriction', 'getDensity'

					]

					var defaultMaterial = physicsManager.getDefaultMaterial()

					expectedMethods.forEach( function( method ) {
						expect( defaultMaterial ).to.respondTo( method )
					})

					done()
				})

				it( 'should create a valid circleShape using createCircleShape()', function( done ) {
					var expectedMethods = [
						'computeArea', 'computeMasslessInertia', 'computeCenterOfMass'
					]

					var circleShape = physicsManager.createCircleShape({
						radius : 10,
						origin : [0, 0]
					})


					expectedMethods.forEach( function( method ) {
						expect( circleShape ).to.respondTo( method )
					})

					var area = circleShape.computeArea()
					expect( area ).to.be.within( 314.15, 314.16)

					done()
				})


				it( 'should create a valid PolygonShape using createPolygonShape()', function( done ) {
					var expectedMethods = [
						'computeArea', 'computeMasslessInertia', 'computeCenterOfMass'
					]

					var polygonShape = physicsManager.createPolygonShape({
						vertices : [[0, 0], [0, 2], [3, 4]]
					})


					expectedMethods.forEach( function( method ) {
						expect( polygonShape ).to.respondTo( method )
					})

					done()
				})

				it( 'should create a valid RigidBody using createRigidBody()', function( done ) {
					var expectedMethods = [
						'isDynamic', 'isKinematic', 'isStatic',
						'setAsDynamic', 'setAsKinematic', 'setAsStatic',
						'getPosition', 'setPosition', 'getRotation',
						'setRotation', 'getVelocity', 'setVelocity',
						'getAngularVelocity', 'setAngularVelocity', 'getForce',
						'setForce', 'getTorque', 'setTorque',
						'getSurfaceVelocity', 'setSurfaceVelocity', 'getMass',
						'setMass', 'setMassFromShapes', 'getInertia',
						'setInertia', 'setInertiaFromShapes', 'getLinearDrag',
						'setLinearDrag', 'getAngularDrag', 'setAngularDrag',
						'addShape', 'removeShape', 'applyImpulse',
						'setVelocityFromPosition', 'transformWorldPointToLocal', 'transformLocalPointToWorld',
						'transformWorldVectorToLocal', 'transformLocalVectorToWorld', 'computeMassFromShapes',
						'computeInertiaFromShapes', 'wake', 'sleep',
						'computeLocalCenterOfMass', 'computeWorldBounds', 'alignWithOrigin',
						'integrate', 'addEventListener', 'removeEventListener'
					]

					var expectedProperties = [
						'shapes', 'constraints', 'world', 'sleeping', 'bullet', 'userData'
					]

					var rigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})


					expectedMethods.forEach( function( method ) {
						expect( rigidBody ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( rigidBody ).to.have.property( property )
					})


					done()
				})


				it( 'should create a valid world using createWorld()', function( done ) {
					var expectedMethods = [
						'step', 'getGravity', 'setGravity',
						'addRigidBody', 'removeRigidBody', 'addConstraint',
						'removeConstraint', 'clear', 'shapeRectangleQuery',
						'bodyRectangleQuery', 'shapeCircleQuery', 'bodyCircleQuery',
						'shapePointQuery', 'bodyPointQuery', 'rayCast',
						'convexCast'
					]

					var world = physicsManager.createWorld(
						[0, 10], 8, 8
					)

					var expectedProperties = [
						'simulatedTime', 'timeStamp', 'rigidBodies', 'constraints', 'liveDynamics', 'liveKinematics',
						'liveConstraints', 'broadphase', 'velocityIterations', 'positionIterations', 'dynamicArbiters',
						'staticArbiters'
					]

					expectedMethods.forEach( function( method ) {
						expect( world ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( world ).to.have.property( property )
					})

					done()
				})

				it( 'should create a pulleyConstraint using createPulleyConstraint()', function( done ) {
					var expectedMethods = [
						'configure', 'wake', 'sleep',
						'isEnabled', 'isDisabled', 'enable',
						'disable', 'addEventListener', 'removeEventListener',
						'getImpulseForBody', 'getAnchorA', 'setAnchorA',
						'getAnchorB', 'setAnchorB', 'getAnchorC',
						'setAnchorC', 'getAnchorD', 'setAnchorD',
						'getLowerBound', 'setLowerBound', 'getUpperBound', 'setUpperBound',
						'getRatio', 'setRatio'
					]

					var expectedProperties = [
						'type', 'world', 'sleeping', 'userData', 'dimension', 'bodyA',
						'bodyB', 'bodyC', 'bodyD'
					]

					var firstRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var secondRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var thirdRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var fourthRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var pulleyConstraint = physicsManager.createPulleyConstraint({
						bodyA : firstRigidBody,
						bodyB : secondRigidBody,
						bodyC : thirdRigidBody,
						bodyD : fourthRigidBody,
						anchorA : [1, 0],
						anchorB : [-1, 0],
						anchorC : [1, 0],
						anchorD : [-1, 0],
						ratio : 1,
						lowerBound : 1,
						upperBound : 4
						// + common Constraint constructor parameters.
					})

					expectedMethods.forEach( function( method ) {
						expect( pulleyConstraint ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( pulleyConstraint ).to.have.property( property )
					})


					done()

				})


				it( 'should create a angleConstraint using createAngleConstraint()', function( done ) {
					var expectedMethods = [
						'configure', 'wake', 'sleep',
						'isEnabled', 'isDisabled', 'enable',
						'disable', 'addEventListener', 'removeEventListener',
						'getImpulseForBody', 'getAnchorA', 'setAnchorA',
						'getAnchorB', 'setAnchorB',
						'getLowerBound', 'setLowerBound', 'getUpperBound', 'setUpperBound',
						'getRatio', 'setRatio'
					]

					var expectedProperties = [
						'type', 'world', 'sleeping', 'userData', 'dimension', 'bodyA',
						'bodyB'
					]

					var firstRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var secondRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var angleConstraint = physicsManager.createAngleConstraint({
						bodyA : firstRigidBody,
						bodyB : secondRigidBody,
						ratio : 1,
						lowerBound : -Math.PI,
						upperBound : Math.PI
					})

					expectedMethods.forEach( function( method ) {
						expect( angleConstraint ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( angleConstraint ).to.have.property( property )
					})


					done()

				})


				it( 'should create a createMotorConstraint using createMotorConstraint()', function( done ) {
					var expectedMethods = [
						'configure', 'wake', 'sleep',
						'isEnabled', 'isDisabled', 'enable',
						'disable', 'addEventListener', 'removeEventListener',
						'getImpulseForBody', 'getAnchorA', 'setAnchorA',
						'getAnchorB', 'setAnchorB',
						'getRatio', 'setRatio', 'getRate', 'setRate'
					]

					var expectedProperties = [
						'type', 'world', 'sleeping', 'userData', 'dimension', 'bodyA',
						'bodyB'
					]

					var firstRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var secondRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var motorConstraint = physicsManager.createMotorConstraint({
						bodyA : firstRigidBody,
						bodyB : secondRigidBody,
						ratio : 1,
						rate : 0
					})

					expectedMethods.forEach( function( method ) {
						expect( motorConstraint ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( motorConstraint ).to.have.property( property )
					})


					done()

				})

				it( 'should create a WeldConstraint using createWeldConstraint()', function( done ) {
					var expectedMethods = [
						'configure', 'wake', 'sleep',
						'isEnabled', 'isDisabled', 'enable',
						'disable', 'addEventListener', 'removeEventListener',
						'getImpulseForBody', 'getAnchorA', 'setAnchorA',
						'getAnchorB', 'setAnchorB',
						'getPhase', 'setPhase'
					]

					var expectedProperties = [
						'type', 'world', 'sleeping', 'userData', 'dimension', 'bodyA',
						'bodyB'
					]

					var firstRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var secondRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var motorConstraint = physicsManager.createWeldConstraint({
						bodyA : firstRigidBody,
						bodyB : secondRigidBody,
						anchorA : [1, 0],
						anchorB : [-1, 0]
					})

					expectedMethods.forEach( function( method ) {
						expect( motorConstraint ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( motorConstraint ).to.have.property( property )
					})


					done()

				})



				it( 'should create a PointConstraint using createPointConstraint()', function( done ) {
					var expectedMethods = [
						'configure', 'wake', 'sleep',
						'isEnabled', 'isDisabled', 'enable',
						'disable', 'addEventListener', 'removeEventListener',
						'getImpulseForBody', 'getAnchorA', 'setAnchorA',
						'getAnchorB', 'setAnchorB'
					]

					var expectedProperties = [
						'type', 'world', 'sleeping', 'userData', 'dimension', 'bodyA',
						'bodyB'
					]

					var firstRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var secondRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var pointConstraint = physicsManager.createPointConstraint({
						bodyA : firstRigidBody,
						bodyB : secondRigidBody,
						anchorA : [1, 0],
						anchorB : [-1, 0]
					})

					expectedMethods.forEach( function( method ) {
						expect( pointConstraint ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( pointConstraint ).to.have.property( property )
					})


					done()

				})


				it( 'should create a LineConstraint using createLineConstraint()', function( done ) {
					var expectedMethods = [
						'configure', 'wake', 'sleep',
						'isEnabled', 'isDisabled', 'enable',
						'disable', 'addEventListener', 'removeEventListener',
						'getImpulseForBody', 'getAnchorA', 'setAnchorA',
						'getAnchorB', 'setAnchorB',
						'getLowerBound', 'setLowerBound',
						'getUpperBound', 'setUpperBound',
						'getAxis', 'setAxis'
					]

					var expectedProperties = [
						'type', 'world', 'sleeping', 'userData', 'dimension', 'bodyA',
						'bodyB'
					]

					var firstRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var secondRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var lineConstraint = physicsManager.createLineConstraint({
						bodyA : firstRigidBody,
						bodyB : secondRigidBody,
						axis : [0, 1],
						anchorA : [1, 0],
						anchorB : [-1, 0],
						lowerBound : -1,
						upperBound : 1
					})

					expectedMethods.forEach( function( method ) {
						expect( lineConstraint ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( lineConstraint ).to.have.property( property )
					})


					done()

				})



				it( 'should create a DistanceConstraint using createDistanceConstraint()', function( done ) {
					var expectedMethods = [
						'configure', 'wake', 'sleep',
						'isEnabled', 'isDisabled', 'enable',
						'disable', 'addEventListener', 'removeEventListener',
						'getImpulseForBody', 'getAnchorA', 'setAnchorA',
						'getAnchorB', 'setAnchorB',
						'getLowerBound', 'setLowerBound',
						'getUpperBound', 'setUpperBound'
					]

					var expectedProperties = [
						'type', 'world', 'sleeping', 'userData', 'dimension', 'bodyA',
						'bodyB'
					]

					var firstRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var secondRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var distanceConstraint = physicsManager.createDistanceConstraint({
						bodyA : firstRigidBody,
						bodyB : secondRigidBody,
						anchorA : [1, 0],
						anchorB : [1, 0],
						lowerBound : 1,
						upperBound : 4
					})

					expectedMethods.forEach( function( method ) {
						expect( distanceConstraint ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( distanceConstraint ).to.have.property( property )
					})


					done()

				})


				it( 'should create a CustomConstraint using createCustomConstraint()', function( done ) {
					var expectedMethods = [
						'configure', 'wake', 'sleep',
						'isEnabled', 'isDisabled', 'enable',
						'disable', 'addEventListener', 'removeEventListener',
						'getImpulseForBody'
					]

					var expectedProperties = [
						'type', 'world', 'sleeping', 'userData', 'dimension', 'bodies'
					]

					var firstRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var secondRigidBody = physicsManager.createRigidBody({
						type : 'dynamic',
						shapes : [],
						mass : 10,
						inertia : 20,
						sleeping : false,
						bullet : false,
						position : [0, 0],
						rotation : 0,
						velocity : [0, 0],
						angularVelocity : 0,
						force : [0, 0],
						torque : 0,
						linearDrag : 0.05,
						angularDrag : 0.05,
						surfaceVelocity : [0, 0],
						userData : null
					})

					var customConstraint = physicsManager.createCustomConstraint({
						dimension : 2,
						bodies : [firstRigidBody, secondRigidBody],
						position : function positionErrorFn(data, index)
						{
							data[index]     = 'errorInFirstDimension';
							data[index + 1] = 'errorInSecondDimension';
						},
						jacobian : function jacobianFn(data, index)
						{
							data[index]     = 'jacobian term for x-velocity of first body, in first dimension';
							data[index + 1] = 'jacobian term for y-velocity of first body, in first dimension';
							data[index + 2] = 'jacobian term for angular velocity of first body, in first dimension';
							data[index + 3] = 'jacobian term for x-velocity of second body, in first dimension';
							data[index + 4] = 'jacobian term for y-velocity of second body, in first dimension';
							data[index + 5] = 'jacobian term for angular velocity of second body, in first dimension';

							data[index + 6]  = 'jacobian term for x-velocity of first body, in second dimension';
							data[index + 7]  = 'jacobian term for y-velocity of first body, in second dimension';
							data[index + 8]  = 'jacobian term for angular velocity of first body, in second dimension';
							data[index + 9]  = 'jacobian term for x-velocity of second body, in second dimension';
							data[index + 10] = 'jacobian term for y-velocity of second body, in second dimension';
							data[index + 11] = 'jacobian term for angular velocity of second body, in second dimension';
						},
						positionConstants : function positionConstantsFn()
						{
							// Perform any useful computations whose results may be used in definition of
							// position and jacobian functions.
						},
						velocityClamp : function velocityClampFn(data, index)
						{
							// Clamp impulse values at
							//   data[index]     :: impulse in first dimension
							//   data[index + 1] :: impulse in second dimension
						},
						positionClamp : function positionClampFn(data, index)
						{
							// Clamp impulse values at
							//   data[index]     :: impulse in first dimension
							//   data[index + 1] :: impulse in second dimension
						},
						debugDraw : function debugDrawFn(debugDrawObject, stiff)
						{
							// Draw constraint information to debug object.
						}
						// + common Constraint constructor parameters.
					})

					expectedMethods.forEach( function( method ) {
						expect( customConstraint ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( customConstraint ).to.have.property( property )
					})


					done()

				})


				it( 'should create a SweepAndPruneBroadphase using createSweepAndPruneBroadphase()', function( done ) {
					var expectedMethods = [
						'insert', 'update', 'remove',
						'clear', 'perform', 'sample'
					]

					var expectedProperties = [
					]

					var sweepAndPruneBroadphase = physicsManager.createSweepAndPruneBroadphase()

					expectedMethods.forEach( function( method ) {
						expect( sweepAndPruneBroadphase ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( sweepAndPruneBroadphase ).to.have.property( property )
					})


					done()
				})

				it( 'should create a BoxTreeBroadphase using createBoxTreeBroadphase()', function( done ) {
					var expectedMethods = [
						'insert', 'update', 'remove',
						'clear', 'perform', 'sample'
					]

					var expectedProperties = [
					]

					var boxTreeBroadphase = physicsManager.createBoxTreeBroadphase()

					expectedMethods.forEach( function( method ) {
						expect( boxTreeBroadphase ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( boxTreeBroadphase ).to.have.property( property )
					})


					done()
				})

				it( 'should create CollisionUtils using createCollisionUtils()', function( done ) {
					var expectedMethods = [
					]

					var expectedProperties = [
					]

					var collisionUtils = physicsManager.createCollisionUtils()

					expectedMethods.forEach( function( method ) {
						expect( collisionUtils ).to.respondTo( method )
					})

					expectedProperties.forEach( function( property ) {
						expect( collisionUtils ).to.have.property( property )
					})


					done()
				})






				it( 'should simulate physics', function( done ) {
					var world = physicsManager.createWorld({
						gravity : [0, 10],
						velocityIterations : 8,
						positionIterations : 8
					})

					for(var i=1; i<=10; i++) {

						var circleShape = physicsManager.createCircleShape({
							radius : Math.random() * 10,
							origin : [0, 0]
						})

						var rigidBody = physicsManager.createRigidBody({
							type : 'dynamic',
							shapes : [circleShape],
							mass : 10,
							inertia : 20,
							sleeping : false,
							bullet : false,
							position : [Math.random()*100, Math.random()*100],
							rotation : 0,
							velocity : [Math.random() * 10, Math.random() * 10],
							angularVelocity : 0,
							force : [0, 0],
							torque : 0,
							linearDrag : 0.05,
							angularDrag : 0.05,
							surfaceVelocity : [0, 0],
							userData : null
						})

						world.addRigidBody( rigidBody )
					}

					world.step()
					world.step()
					world.step()

					done()
				})



			})

		}
})
