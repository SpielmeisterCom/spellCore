# 2D Camera (component template)

## Usage

The *2D Camera* component is used to tag an entity as a camera. An entity can only function as a camera if it also has the *2D Transformation* component.


## Attributes

### width ( number )

The **width** attribute value specifies the width of the section of the world in logical units that the camera displays. The concrete width value used for
determining the size of the section of the world that is rendered is computed by dividing the entity's transform component's scale attribute's x value by the
width attribute's value.


### height ( number )

The **height** attribute value specifies the height of the section of the world in logical units that the camera displays. The concrete height value used for
determining the size of the section of the world that is rendered is computed by dividing the entity's transform component's scale attribute's y value by the
height attribute's value.


### active ( boolean )

The **active** attribute value specifies if the camera should be used by the engine as the current camera entity. Currently only one active camera entity at
any one time is supported. If more than one camera entity is active the SpellJS engine chooses one of them at random. If you want to use multiple camera
entities you have to make sure that only one of them is activated at a time.
