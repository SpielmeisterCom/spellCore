define(
	'spell/Defines',
	function() {
		'use strict'


		return {
			INVALID_ENTITY_ID                         : '',
			ROOT_ENTITY_ID                            : '0',
			COMPOSITE_COMPONENT_ID                    : 'spell.component.composite',
			METADATA_COMPONENT_ID                     : 'spell.component.metaData',
			EVENT_HANDLERS_COMPONENT_ID               : 'spell.component.eventHandlers',
			TRANSFORM_COMPONENT_ID                    : 'spell.component.2d.transform',
			TEXTURE_MATRIX_COMPONENT_ID               : 'spell.component.2d.graphics.textureMatrix',
			CAMERA_COMPONENT_ID                       : 'spell.component.2d.graphics.camera',
			STATIC_APPEARANCE_COMPONENT_ID            : 'spell.component.2d.graphics.appearance',
			TEXT_APPEARANCE_COMPONENT_ID              : 'spell.component.2d.graphics.textAppearance',
			ANIMATED_APPEARANCE_COMPONENT_ID          : 'spell.component.2d.graphics.animatedAppearance',
			QUAD_GEOMETRY_COMPONENT_ID                : 'spell.component.2d.graphics.geometry.quad',
			TILEMAP_COMPONENT_ID                      : 'spell.component.2d.graphics.tilemap',
			PARALLAX_COMPONENT_ID                     : 'spell.component.2d.graphics.parallax',
			PHYSICS_BODY_COMPONENT_ID                 : 'spell.component.physics.body',
			PHYSICS_FIXTURE_COMPONENT_ID              : 'spell.component.physics.fixture',
			PHYSICS_BOX_SHAPE_COMPONENT_ID            : 'spell.component.physics.shape.box',
			PHYSICS_CIRCLE_SHAPE_COMPONENT_ID         : 'spell.component.physics.shape.circle',
			PHYSICS_CONVEX_POLYGON_SHAPE_COMPONENT_ID : 'spell.component.physics.shape.convexPolygon',
			PHYSICS_JNRPLAYER_SHAPE_COMPONENT_ID      : 'spell.component.physics.shape.jumpAndRunPlayer',
			KEY_FRAME_ANIMATION_COMPONENT_ID          : 'spell.component.animation.keyFrameAnimation',
			SOUND_EMITTER_COMPONENT_ID                : 'spell.component.audio.soundEmitter',
			VISUAL_OBJECT_COMPONENT_ID                : 'spell.component.visualObject',
			CONTROLLABLE_COMPONENT_ID                 : 'spell.component.controllable'
		}
	}
)
