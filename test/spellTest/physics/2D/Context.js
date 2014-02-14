define(
	'spellTest/physics/2D/Context',
	[
		'chai',
		'spell/physics/2D/Context'
	],
	function(
		chai,
		Physics2DContext
		) {
		'use strict'

		return function( describe, it ) {
			var expect = chai.expect

			var context = new Physics2DContext()

			describe( 'spell/physics/2D/Context', function( ) {
				it( 'should provide all public functions', function( done ) {

					[ 'getDefaultMaterial' ].forEach( function( method ) {
						expect( context ).to.respondTo( method )
					})

					done()
				})

				it( 'getDefaultMaterial() should return a valid default material', function( done ) {
					var expectedMethods = [
						'getElasticity', 'getStaticFriction', 'getDynamicFriction',
						'getRollingFriction', 'getDensity'

					]

					var defaultMaterial = context.getDefaultMaterial()

					expectedMethods.forEach( function( method ) {
						expect( defaultMaterial ).to.respondTo( method )
					})

					done()
				})

				it( 'should create a valid circleShape using createCircleShape()', function( done ) {
					var expectedMethods = [
						'computeArea', 'computeMasslessInertia', 'computeCenterOfMass'
					]

					var circleShape = context.createCircleShape({
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

					var polygonShape = context.createPolygonShape({
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

					var rigidBody = context.createRigidBody({
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

					var world = context.createWorld({
						gravity : [0, 10],
						velocityIterations : 8,
						positionIterations : 8
					})

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

				it( 'should simulate physics', function( done ) {


					var world = context.createWorld({
						gravity : [0, 10],
						velocityIterations : 8,
						positionIterations : 8
					})

					for(var i=1; i<=10; i++) {

						var circleShape = context.createCircleShape({
							radius : Math.random() * 10,
							origin : [0, 0]
						})

						var rigidBody = context.createRigidBody({
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
