# Creating a system from scratch

This guide explains how a system is created from scratch and added to a scene.


## Defining the system

In order to create a system you first have to create a *system template*. The system template does three things.

1. It declares the namespace the system is going to reside in and a name for the system to use.
2. It declares the input for the system to process.
3. It points to the implementation of the system in form of a script id.


Here is an example of a small system that adds a "gravity pull" behaviour to your game.

{@img gravitySystemTemplate.png template view of the gravity system template}

**The view of the gravity system template in SpellEd.**

As you can see in the input panel the gravity system processes all entities that have a *spell.component.visualObject* and *spell.component.2d.transform*
component. The associated system implementation is in the script *script/system/gravity*.


## Implementing the system

Select the **script tab** right next to the **configuration tab** in the system template view in order to provide an implementation for the system. The following
code snippet provides a bare minimum implementation for the gravity system.

<pre><code>
define(
	'script/system/gravity',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'

		var Gravity = function( globals ) {}

		Gravity.prototype = {
			cleanUp : function() {},
			init    : function() {},
			process : function( globals, timeInMs, deltaTimeInMs ) {
				var transforms = this.transforms

				// iterating over all entities which are visual objects
				_.each(
					this.visualObjects,
					function( visualObject, entityId ) {
						var transform = transforms[ entityId ]

						// making sure that the entity is a proper visual object
						if( !transform ) return

						// decrement the y component of the translation
						transform.translation[ 1 ] -= 0.5
					}
				)
			}
		}

		return Gravity
	}
)
</code></pre>


## Adding the system to a scene

Now you have to perform one final step to use the newly created system in your scene. First open the Scene Editor, select the systems node in the scene tree on
the left and click on the add button in the inspector view to the right. In the dialog that opens chose "render" as system type and check the box in front of
the gravity system in the "Available Systems" list.

{@img addGravitySystemToScene.png adding the gravity system to the scene}

**Scene Edtior view in SpellEd**


If you press the "Reload" button now the system should be active and all visible objects should be affected by the gravity pull.






