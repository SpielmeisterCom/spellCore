# 2D Animated Appearance (component template)

## Usage

The * 2D Animated Appearance* component describes the graphical representation of the entity it is assigned to.


## Attributes

### assetId ( assetId:animatedAppearance )

The **assetId** attribute value specifies which animatedAppearance asset should be used for rendering the entity.


### replaySpeed ( number )

The **replaySpeed** attribute value specifies the speed at which the animation is played. The default value is 1. A replay speed of 2 means doubled speed.


### offset ( integer )

The **offset** attribute value specifies the current offset in milliseconds into the played animation. This value is incremented automatically during playback.
It can be used for seeking in the animation when manipulated directly.
