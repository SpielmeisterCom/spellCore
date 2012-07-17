# Assets

This guide illustrates the basic concept of assets in SpellJS. It is intended for developers who are new to the SpellJS framework.


## What is an asset?

In SpellJS external resources like sounds, textures or sprite animations etc. are called assets. These assets are managed in the *asset editor* in SpellEd.

The purpose of assets is to provide an abstraction of the concrete used resource by referencing an asset by its unique identifier - the asset id. In addition
assets hold additional metadata describing certain properties related to their type. Through the use of the asset mechanism system code can be coupled loosely
with the required resources. This enables the editing or even exchanging of resources through the use of the editor without the need to update code.

Usually assets are referenced by components. For example the built in *spell.component.2d.graphics.appearance* components' only attribute is an asset id of type
*appearance*. The image resource contained in the referenced appearance asset is used to draw the entity.
