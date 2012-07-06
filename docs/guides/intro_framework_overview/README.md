# Overview of SpellJS

SpellJS is a cross-platform framework for the development of games based on the HTML5 technology stack. It offers a convenient abstraction layer that hides all
the platform specific implementation details that exist on the various target browser environments and mobile handsets.


## Developing with SpellJS

The SpellJS engine is designed to work as a runtime for your content. This means that SpellJS can not be included as a library into your project on a source
code level. Rather your SpellJS project consists of a collection of scenes, custom game objects a.k.a *entities*, associated behaviour (code) and assets (textures, sounds,
animations, etc.). Your project gets compiled into a runtime friendly representation during the build process. The resulting compiled project or *runtime
module* can be executed by the SpellJS engine.

Developing a project with the SpellJS framework is done primarily in the SpellJS editor called *SpellEd*. SpellEd is an integrated development environment that
makes it easy to design complex scenes and user defined entities and entity behaviour. Creating and managing assets is also done in SpellEd. Custom behaviour of
entities is defined in JavaScript code. The SpellJS framework offers a comprehensible api that alleviates tasks often encountered during the development of
games.


## Development system requirements

The development system must meet the following requirements:

1. A stable internet connection must be available.
2. A HTML5 capable browser must be installed ony our operating system of choice.

*Currently Chrome 16 or greater, Internet Explorer 10 or greater and Firefox 13 or greater are supported as development environments.*


## Supported target platforms

The following target platforms are supported out of the box, that is no additional work for porting to these platforms is necessary.

* HTML5 capable browsers
* Flash 10.1 or greater *(browsers which do not support HTML5 adequately use the flash fall-back)*

*Currently Chrome 16 or greater, Internet Explorer 10 or greater and Firefox 13 or greater are supported as target platforms.*
