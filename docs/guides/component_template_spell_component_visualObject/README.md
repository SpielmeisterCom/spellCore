# Visual Object (component template)

## Usage

The *Visual Object* component is used to tag an entity for rendering to the screen. In order to be rendered the entity must have additionally a
[2D Transformation](#!/guide/component_template_spell_component_2d_transform) component and a
[2D Appearance](#!/guide/component_template_spell_component_2d_graphics_appearance) or
[2D Animation](#!/guide/component_template_spell_component_2d_graphics_animatedAppearance) component.


## Attributes

### layer ( integer )

The **layer** attribute value indicates on which layer the entity must be rendered. Layers with higher values are rendered after or "over" layers with a lower
value. With the help of the layer mechanic foreground and background entities can be easily declared.


### opacity ( number )

The **opacity** attribute declares with which opacity the entity must be rendered. Valid values are in the range from 0.0 - 1.0. This opacity value is
multiplied with any opacity value defined in the used appearance component of the entity in order to produce the final opacity value used for rendering.
