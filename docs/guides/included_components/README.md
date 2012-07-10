# Components included in SpellJS

<a id="spell.component.actor"></a>
## Actor

#### id
the id of the actor

* type : string
* default : \*none, must be provided by user\*

#### actions
the actions which can be performed by the actor

* type : object
* default : \*none, must be provided by user\*



<a id="spell.component.inputDefinition"></a>
## Mapping of keys to actions

#### actorId
the id of the actor that is controlled by this mapping

* type : string
* default : \*none, must be provided by user\*

#### keyToAction
the keys to actions mapping

* type : object
* default : \*none, must be provided by user\*



<a id="spell.component.visualObject"></a>
## Visual Object
the visual representation of an entity

#### layer
the layer that the entity is drawn on

* type : integer
* default : 1

#### opacity
the opacity that the entity is drawn with

* type : number
* default : 1



<a id="spell.component.2d.transform"></a>
## 2D Transformation

#### translation
translation of the local origin

* type : vec2
* default : [ 0, 0 ]

#### rotation
rotation of the local origin

* type : number
* default : 0

#### scale
scale of the local origin

* type : vec2
* default : [ 1, 1 ]



<a id="spell.component.2d.graphics.animatedAppearance"></a>
## 2D Animation

#### assetId
the appearance asset used for rendering

* type : assetId:animatedAppearance
* default : animatedAppearance:spell.not_defined

#### animationSpeedFactor
the speed factor used for playing the animation; i.e. a speed factor of 2 means doubled playing speed

* type : number
* default : 1

#### animationOffset
current offset into the played animation in milliseconds

* type : number
* default : 0



<a id="spell.component.2d.graphics.appearance"></a>
## 2D Appearance

#### assetId
the appearance asset used for rendering

* type : assetId:appearance
* default : appearance:spell.defaultAppearance



<a id="spell.component.2d.graphics.camera"></a>
## 2D Camera

#### width
the width of the section of the scene in logical units captured by the camera

* type : integer
* default : 320

#### height
the height of the section of the scene in logical units captured by the camera

* type : integer
* default : 240

#### active
controls if the camera is active

* type : boolean
* default : false



<a id="spell.component.2d.graphics.inertialObject"></a>
## Inertial Object

#### mass
the mass of the object

* type : number
* default : 1

#### velocity
the velocity of the object

* type : vec2
* default : [ 0, 0 ]



<a id="spell.component.physics.collisionSphere"></a>
## Collision Sphere

#### radius
the radius of the sphere

* type : number
* default : 1
