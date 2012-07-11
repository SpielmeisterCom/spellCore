# Actor (component template)

## Usage

The *Actor* component specifies which actions the entity is currently executing. For example if the entity is a player controlled figure in a super mario like
platformer typical actions would include "walking right", "walking left", "crouching" and "jumping".


## Attributes

### id ( string )

The **id** of the actor.


### actions ( object )

The **actions** attribute value is generated dynamically at runtime.

For example: The generated attribute value of an actor component which supports the action "jumping" and "crouching". The actor is currently performing the
action "crouching".

<pre><code>
{
	"id" : "someActorId"
	"actions" : {
		"jumping" : {
			"executing" : false
		},
		"crouching" : {
			"executing" : true
		}
	}
}
</code></pre>
