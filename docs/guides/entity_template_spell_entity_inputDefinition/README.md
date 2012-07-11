# Input Definition (entity template)

The entity created from this template consists of the following components:

* [Input Definition](#!/guide/component_template_spell_component_inputDefinition)

## Mapping key input to actions of an actor
**Defining the targeted actor** is done by setting the *actorId* attribute of the *Input Definition* component to the id of the actor that should be controlled.

**Mapping keys to actor actions** is done by setting the *keyToAction* attribute of the *Input Definition* component to a json object whose property names are
the key names and the respective values the assigned actions.

For example: in order to map the *space key* to an action called *jump* the keyToAction attribute must have the following value:

<pre><code>
{
	"space": "jump"
}
</code></pre>
