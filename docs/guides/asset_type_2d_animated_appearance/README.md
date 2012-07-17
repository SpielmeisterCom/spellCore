# 2D Animated Appearance

## Usage

The *2D Animated Appearance* represents an animation. Depending on the assets type different types of animation resources can be used. **Currently only sprite
based animations are supported.**


## Attributes

### Name

The name of the asset.

For example:

<code>redHering</code>


### Namespace

The namespace of the asset.

For example if the namespace is *seaCreatures* and the name *redHerring* the resulting identifier would be:

<code>seaCreatures.redHerring</code>


### Animation Type

Currently only the type *sprite* is supported.


### From existing sprite sheet

The concrete sprite sheet asset to use to resolve the frame indices.


### Looped

A boolean that states if the animation should play from the beginning once it has reached its end.


### Duration

The duration of the total animation sequence in milliseconds.

For example a value of 2500 means that the complete animation sequence lasts 2 1/2 seconds.


### Frames

A comma seperated list of frame indices that the animation sequence consists of.

For example *[ 0, 1, 2, 2, 2, 3, 4, 1 ]*.

