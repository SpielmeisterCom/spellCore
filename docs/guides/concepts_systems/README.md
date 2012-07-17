# Systems

This guide illustrates the basic concept of systems in SpellJS. It is intended for developers who are new to the SpellJS framework.

You might also be interested in [this guide](#!/guide/intro_creating_a_system_from_scratch) about creating a system from scratch.


## What is a system?

In SpellJS entities do not have instance methods. This is intentionally and by design. However in a game engine it is desirable to associate a certain piece of
logic with a certain type of entity. Without being able to "pin" a certain piece of logic to an entity in order to describe its behaviour a developer would be
limited to creating purely static games which are considered not much fun to play by many players.

The SpellJS way of tackling this issue is to create a system that takes care of managing the behaviour of a certain type of entity. Usually systems limit the
scope of entities that they process by declaring a group of entities as the expected input. This entity group consists of a set of components that an entity
instance must have in order to qualify as input for the system.


## System definition

A system is declared in form of a system template. The purpose of the system template is to provide a unique identifier (namespace and name), to declare the
systems' input and to assign a script which contains the implementation.


## System implementation

Since a systems' implementation is done in a script all [standard rules related to script definition](#!/guide/concepts_scripts) apply.

### A basic system skeleton

<pre><code>
define(
	'script/system/foo',
	[
		'spell/functions'
	],
	function(
		_
	) {
		'use strict'


		var Foo = function( globals ) {}

		Foo.prototype = {
			cleanUp : function() {
				// do some cleaning up
			},
			init    : function() {
				// do some initializing
			},
			process : function( globals, timeInMs, deltaTimeInMs ) {
				// do some processing on entities
			}
		}

		return Foo
	}
)
</code></pre>


### Accessing input

All components which are declared as input for a system in its system template can be accessed by their aliasing name as instance members of the system. These
data structures are called **component lists**. The injection of the component list into the system instance is done by the engine automatically when a system
gets created. If for example a system declares the component *spell.component.2d.transform* with the aliasing name "myTransformComponents" as its required input
the *component list* of all transform components can be accessed through the this pointer as shown below.

<pre><code>
...

var Foo = function( globals ) {
	var aComponent = this.myTransformComponents[ _.size( this.myTransformComponents ) - 1 ]
	examine( aComponent )
	...
}

Foo.prototype = {
	cleanUp : function() {
		// do some cleaning up
	},
	init    : function() {
		// do some initializing
	},
	process : function( globals, timeInMs, deltaTimeInMs ) {
		_.each( this.myTransformComponents, function( component, entityId ) { // do stuff } )
	}
}

...
</code></pre>


### Working with component lists

As stated before input is presented to a system in form of component lists. There are a couple of things you should keep in mind when working with them.

* Component lists are just regular JavaScript objects with the keys being entity ids and the value being the component instances. As a consequence you must
not make any assumptions about iteration order when iterating over the component list.

* It is usually a very bad idea to keep references to individual component instances in the system instance scope around between two processing calls. This is
considered an anti pattern because other systems might also manipulate entities and their components. This manipulation includes the deletion of entities too.
So if another system decides that it is time to delete an entity whilst your system is still keeping a reference to one of its components you have successfully
entered side effect hell. Try to avoid this for your own sake.

* Manipulating component lists must not be done manually but rather through means provided by the framework. Otherwise things might break.

**TODO: add link to relevant entity/component creation/deletion api documentation**


## System execution

### Execution order
Systems are executed in a fixed order. This order can be changed during editing time but not during runtime. It is always guaranteed that changes performed by
*system A* to the game state are visible to *system B* when *system B* is set to execute after *system A* by the predefined order.

### Execution type
Systems can be assigned to two different execution types.

The first type is called *render*. Systems assigned to this type are executed everytime a render tick is performed. The amount of render ticks might vary
depending on your concrete workload but will max out at about the refresh rate of the devices display. Usually only systems related to rendering or related
should be assigned to this type.

The other type is called *update*. Systems assigned to this type are executed every update tick. Update ticks are done periodically at a fixed rate of 50Hz.




