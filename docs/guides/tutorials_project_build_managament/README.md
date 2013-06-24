# Project build management

This guide explains how to manage project builds.


## Introduction

In order to execute a project independent of SpellEd it must first be built into a target specific packaging format. The following build targets are supported:

 * web
     * html5
     * flash
 * android (not included in early beta)
 * ios (not included in early beta)


The *web* target is subdivided into the two sub-targets *html5* and *flash*. The *web* target package can be built and executed with only one of them being
enabled. It is recommended to include the *flash* sub-target only when backwards compatibility with HTML5 incapable web browsers is desired. Building
exclusively with the *flash* sub-target produces a package which only runs when the flash plugin is available.


## Building

In order to create a build with SpellEd use the build menu to choose the desired build mode and target.

{@img build.png Build -> Debug/Release -> target}

Once the build process is completed the generated output is placed in the *build* directory of the current project.


## Exporting

The export function creates packages for the chosen build targets and merges them into a single zip archive. Use this function when you want to deploy the
project.

{@img export.png Build -> Export -> target}


## Deploying

Deployment of the *web* target package is pretty straight forward.

1. Extract the *web directory* from the exported zip archive into the content directory of a
web server.

{@img export_archive_small.png content listing of a exported project zip archive}

2. Launch the app by pointing a web browser to the contained index.html file.

{@img launching_small.png web browser url bar with index.html}
