define(
	'spell/Defines',
	function() {
		'use strict'


		return {
			ROOT_COMPONENT_ID                    : 'spell.component.entityComposite.root',
			CHILDREN_COMPONENT_ID                : 'spell.component.entityComposite.children',
			NAME_COMPONENT_ID                    : 'spell.component.name',
			TRANSFORM_COMPONENT_ID               : 'spell.component.2d.transform',
			PHYSICS_BODY_COMPONENT_ID            : 'spell.component.physics.body',
			PHYSICS_FIXTURE_COMPONENT_ID         : 'spell.component.physics.fixture',
			PHYSICS_BOX_SHAPE_COMPONENT_ID       : 'spell.component.physics.shape.box',
			PHYSICS_CIRCLE_SHAPE_COMPONENT_ID    : 'spell.component.physics.shape.circle',
			PHYSICS_JNRPLAYER_SHAPE_COMPONENT_ID : 'spell.component.physics.shape.jumpAndRunPlayer'
		}
	}
)