# Input Definition (component template)

## Usage

The *Input Definition* component maps keys to actions which can be executed by a certain actor.


## Attributes

### actorId ( string )

The **actorId** attribute value indicates which actor is the target for the mapped actions.


### keyToAction ( object )

The **keyToAction** attribute specifies which keys are mapped to which actions. The attribute value is a json object whose property names are the key names
and the respective values the assigned actions.

For example: in order to map the *space key* to an action called *jump* the keyToAction attribute must have the following value:

<pre><code>
{
	"space": "jumping"
}
</code></pre>
