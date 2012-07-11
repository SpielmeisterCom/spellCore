# 2D Transformation (component template)

## Usage

The *2D Transformation* component of an entity enables the modification of its local origin. This can be used to set the position of an entity relative to its
parent. If the entity is a root entity the transformation is to world coordinate space. If the entity is not a root entity but part of an entity composite
structure the resulting transformation is to entity parent coordinate space.


## Attributes

### rotation ( number )

The **rotation** attribute specifies the rotation of the local origin of the entity. Values must be provided in radians.


### scale ( vec2 )

The **scale** attribute specifies the scale of the local origin of the entity.


### translation ( vec2 )

The **translation** attribute specifies the translation of the local origin of the entity.
