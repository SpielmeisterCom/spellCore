# Entity component system vs. OOP based system

This guide elaborates on the difference between *entity component systems* and *object-oriented systems* used in game engines. It is intended for developers
which are new to the idea of *entity component systems*. A background in object-oriented programming is recommended.


## The problem - deep inheritance hierarchies, THE BLOB

Usually developing non-trivial games with the default OOP approach means that all in-game objects inherit from a common base class. While new game object types
are added during development more and more data and logic is introduced into the game object inheritance hierarchy. Ultimately this process leads to the
occurrence of the [blob anti pattern][2]. Managing a code base that suffers from this sickness requires skilled surgeons/developers in order to keep the patient
alive. Even if experienced developers are available to deal with the problem their time could be spent more efficiently. Rather then implementing new features
most of the development time is spent on fixing hard to track bugs and making sure that new features do not break existing ones. The result will be higher
development cost and/or reduction of planned features.


## The solution - component decomposition, pure data, pure logic

In order to prevent this miserable situation the dreaded blob has to be prevented at all costs. One way to achieve this is to do a *component decomposition*
instead of an *object-oriented decomposition* when coming up with the game object types. The component decomposition is almost identical to the object-oriented
version. The main difference lies in the fact that common behaviour that was formerly coded in some sub-class of the inheritance hierarchy is now split into its
data - the component - and its accompanying logic - the system. What was formerly realised as one object of intertwined state and side effects is now
represented in a form that is a lot easier to manage.

The result of this alternative approach will be:

* a code base that is easier to reason about
* a base of components that have a higher chance of being useful in another context
* a representation that expresses dependencies between data and logic explicitly by composition, not implicitly by deep inheritance



## Further reading

* [Evolve your hierarchy - Mick West][1]
* [Entity Systems are the future of MMOG development - t-machine.org][2]
* [Why use an entity framework for game development? - Richard Lord][3]



[1]: http://cowboyprogramming.com/2007/01/05/evolve-your-heirachy/ "Evolve your hierarchy - Mick West"
[2]: http://t-machine.org/index.php/2007/09/03/entity-systems-are-the-future-of-mmog-development-part-1/ "Entity Systems are the future of MMOG development - t-machine.org"
[3]: http://www.richardlord.net/blog/why-use-an-entity-framework "Why use an entity framework for game development? - Richard Lord"
[3]: http://en.wikipedia.org/wiki/God_object "God Object/The Blob"
