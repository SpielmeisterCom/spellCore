# 2D Camera (entity template)

The entity created from this template consists of the following components:

* [2D Transformation](#!/guide/component_template_spell_component_2d_transform)
* [2D Camera](#!/guide/component_template_spell_component_2d_graphics_camera)

## Controlling the camera
**Positioning of the camera origin** is done by setting the **transform** attribute of the *2D Transformation* component,
for example setting the transform attribute to [ 100, 100 ] sets the camera origin to respective position in world coordinates.

**Zooming in and out** is done by setting the **scale** attribute of the *2D Transformation* component. The default scale is [ 1, 1 ]. For example zooming out by
100% is done by setting scale to [ 0.5, 0.5 ] whereas setting scale to [ 2, 2 ] leads to zooming in by 100%.

**Altering the camera geometry** is done by setting the **width** and **height** attribute of the *2D Camera* component. The default values are 320 (width) by 240
(height). The width and height of the 2D camera define the section of the world in logical units which is displayed on screen. Keep in mind that the concrete
value of the scale attribute of the *2D Transformation* component is also incorporated into the computation of the section that is displayed. For example:
setting scale to [ 2, 2 ] while halving the width and height of the default camera settings to 160 by 120 is equivalent to a scale of [ 1, 1 ] and a
width and height of 320 by 240.

**Activating the camera** is done by setting the **active** attribute of the *2D Camera* component. The default value is *false*. So in order to activate the
camera it must be set to *true*. Currently only one active camera entity at any one time is supported. If more than one camera entity is active the SpellJS
engine chooses one of them at random. If you want to use multiple camera entities you have to make sure that only one of them is activated at a time.
