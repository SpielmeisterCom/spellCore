define(
	'spell/shared/build/target/android/AndroidBuilder',
	[
		'spell/shared/build/createBuilderType',
		'spell/shared/build/createDataFileContent',
		'spell/shared/build/createDebugPath',
		'spell/shared/build/createProjectLibraryFilePaths',
		'spell/shared/build/copyFile',
		'spell/shared/build/copyFiles',
		'spell/shared/build/processSource',
		'spell/shared/build/isDevEnvironment',
		'spell/shared/build/isFile',
		'spell/shared/build/loadAssociatedScriptModules',
		'spell/shared/build/writeFile',
		'spell/shared/build/spawnChildProcess',
		'spell/shared/util/createModuleId',
		'spell/shared/util/hashModuleId',

		'amd-helper',
		'child_process',
		'ff',
		'fs',
		'flob',
		'mkdirp',
		'path',
		'rimraf',
        'os',
        'wrench'
	],
	function(
		createBuilderType,
		createDataFileContent,
		createDebugPath,
		createProjectLibraryFilePaths,
		copyFile,
		copyFiles,
		processSource,
		isDevEnvironment,
		isFile,
		loadAssociatedScriptModules,
		writeFile,
		spawnChildProcess,
		createModuleId,
		hashModuleId,

		amdHelper,
		child_process,
		ff,
		fs,
		flob,
		mkdirp,
		path,
		rmdir,
        os,
        wrench
	) {
		'use strict'

        var ANDROID_TARGET = 'android-15'

        var updateActivity = function(namespace, activity, destDir, next) {
            var activityFile = path.join( destDir, 'src/' + namespace.replace(/\./g, '/') + '/' + activity + '.java')

            if( fs.existsSync( activityFile ) ) {

                fs.readFile( activityFile, 'utf-8', function( err, contents ) {
                    contents = contents
                        .replace(/extends Activity/g, "extends com.tealeaf.TeaLeaf")
                        .replace(/setContentView\(R\.layout\.main\);/g, "startGame();")

                    fs.writeFile( activityFile, contents, next )
                })
            }
        }


        var createXsltProcCliParams = function( XslFile, sourceXmlFile, destinationXmlFile, buildOptions ) {
            var cliParams = [
            ]

            for( var key in buildOptions ) {
                cliParams.push( '--stringparam' )
                cliParams.push( key )
                cliParams.push( buildOptions[ key ] )
            }

            cliParams.push( '--output' )
            cliParams.push( destinationXmlFile )

            cliParams.push( XslFile )
            cliParams.push( sourceXmlFile )

            return cliParams
        }

		var build = function( spellCorePath, projectPath, projectLibraryPath, outputPath, target, projectConfig, library, cacheContent, scriptSource, minify, anonymizeModuleIds, debug, next ) {
			var projectId           = projectConfig.config.projectId,
                spellEnginePath     = path.resolve( spellCorePath, '../../../..' ),
                androidSdkPath      = path.resolve( spellEnginePath, 'modules', 'spellAndroid', 'modules', 'android-sdk', os.platform() == 'darwin' ? 'osx-ia32' : 'linux-ia32'),
                JDKPath             = path.resolve( spellEnginePath, 'modules', 'spellAndroid', 'modules', 'jdk', os.platform() == 'darwin' ? 'osx-x64' : 'linux-ia32'),
                xslFile             = path.resolve( spellEnginePath, 'modules', 'spellAndroid', 'modules', 'native-android', 'AndroidManifest.xsl'),
                tealeafDebugPath    = path.resolve( spellEnginePath, 'modules', 'spellAndroid', 'build', 'debug', 'TeaLeaf'),
                tealeafReleasePath  = path.resolve( spellEnginePath, 'modules', 'spellAndroid', 'build', 'release', 'TeaLeaf'),
                androidTool         = path.resolve( androidSdkPath, 'tools', 'android'),
                zipalignTool        = path.resolve( androidSdkPath, 'tools', 'zipalign'),
                buildOptions = {
                /*
                 A package name must be constitued of two Java identifiers.
                 Each identifier allowed characters are: a-z A-Z 0-9 _
                 */
                'package'         : 'com.kaisergames.' + projectId, //namespace,
                'activity'        : '.' + projectId + 'Activity',

                'title'           : 'Jungle Chaos', //title underneath the icon
                'version'         : '1.0', // is shown in app manager
                'versionCode'     : '1',

                'shortname'       : projectId,
                'disableLogs'     : debug ? 'false' : 'true',
                'debuggable'      : debug ? 'true' : 'false',
                'develop'         : debug ? 'true' : 'false',

                'orientation'     : 'landscape', //landscape, unspecified

                //unused parameters
                'appid'           : 'Jungle Chaos',
                'gameHash'        : '1.0',
                'sdkHash'         : '1.0',
                'androidHash'     : '1.0',
                'studioName'      : '',
                'codeHost'        : '127.0.0.1',
                'tcpHost'         : '127.0.0.1',
                'codePort'        : '80',
                'tcpPort'         : '4747',
                'entryPoint'      : '',
                'pushUrl'         : 'http://127.0.0.1/push/%s/?device=%s&amp;version=%s',
                'servicesUrl'     : 'http://127.0.0.1',
                'installShortcut' : 'false',
                'contactsUrl'     : ''
                },
                name                = buildOptions[ 'shortname' ],
                activity            = ( buildOptions[ 'activity' ].substring(0, 1) == '.' ) ? buildOptions[ 'activity' ].substring( 1 ) : buildOptions[ 'activity' ]

            var androidSigningKey           = 'kibakumbajunglechaos',
                androidSigningKeyPass       = 'DidverjUk7',
                androidSigningKeyStore      = '/home/julian/workspace/spellEngine/projects/superkumba/resources/android/kibakumbajunglechaos.keystore',
                androidSigningKeyStorePass  = 'DidverjUk7'

            // add component scripts to scriptSource
			var componentScripts = loadAssociatedScriptModules( projectLibraryPath, library.component )

			scriptSource += ',' + processSource(
				_.pluck( componentScripts, 'source' ).join( '\n' ),
				!debug, // minify
				!debug  // anonymizeModuleIds
			)

			// set up temporary android project
			var tmpProjectPath          = path.join( projectPath, 'build', 'tmp', 'android', projectId ),
				resourcesPath           = path.join( tmpProjectPath, 'assets', 'resources'),
                tealeafPath             = path.join( tmpProjectPath, '..', 'TeaLeaf'),
                outputPath              = path.join( outputPath, 'android'),
                unsignedDebugApkFile    = path.join( tmpProjectPath, 'bin', name + '-debug-unsigned.apk'),
                unsignedReleaseApkFile  = path.join( tmpProjectPath, 'bin', name + '-release-unsigned.apk'),
                unalignedReleaseApkFile = path.join( tmpProjectPath, 'bin', name + '-release-signed-unaligned.apk'),
                signedReleaseApkFile    = path.join( tmpProjectPath, 'bin', name + '-release-signed.apk')

            console.log( '[spellcli] Cleaning ' + tmpProjectPath )
            rmdir.sync( tmpProjectPath )
            mkdirp.sync( tmpProjectPath )

            console.log( '[spellcli] Cleaning ' + outputPath )
            rmdir.sync( outputPath )
            mkdirp.sync( outputPath )

            // copy the prebuild Tealeaf library into our temp directory
            wrench.copyDirSyncRecursive(
                debug ? tealeafDebugPath : tealeafReleasePath,
                tealeafPath,
                {
                    forceDelete: true,
                    preserveFiles: false,
                    inflateSymlinks: false
                }
            )

			var f = ff(
				function() {
                    console.log( '[spellcli] Creating temporary android project in ' + tmpProjectPath )

                    spawnChildProcess(
                        androidTool,
                        [
                            'create',       'project',
                            '--target',     ANDROID_TARGET,
                            '--name',       name,
                            '--path',       tmpProjectPath,
                            '--activity',   activity,
                            '--package',    buildOptions[ 'package' ],
                        ],
                        {
                            cwd : tmpProjectPath,
                            env : { JAVA_HOME: JDKPath }
                        },
                        true,
                        f.wait()
                    )
                },
                function() {
                    console.log( '[spellcli] Adding libtealeaf as dependency for the android project' )

                    spawnChildProcess(
                        androidTool,
                        [
                            'update',       'project',
                            '--target',     ANDROID_TARGET,
                            '--path',       tmpProjectPath,
                            '--library',    '../TeaLeaf'
                        ],
                        {
                            cwd : tmpProjectPath,
                            env : { JAVA_HOME: JDKPath }
                        },
                        true,
                        f.wait()
                    )
                },
                function() {
                    console.log( '[spellcli] Patching AndroidManifest.xml file' )

                    var xsltprocParameters = createXsltProcCliParams(
                        xslFile,
                        path.resolve( tealeafPath, 'AndroidManifest.xml'),
                        path.resolve( tmpProjectPath, 'AndroidManifest.xml' ),
                        buildOptions
                    )

                    spawnChildProcess(
                        'xsltproc',
                        xsltprocParameters,
                        {
                            cwd : tmpProjectPath
                        },
                        true,
                        f.wait()
                    )
                },
                function() {
                    console.log( '[spellcli] Patching ' + activity + '.java' )

                    updateActivity(
                        buildOptions['package'],
                        activity,
                        tmpProjectPath,
                        f.wait()
                    )
                },
                function() {
                    console.log( '[spellcli] Copying icon resources into android project' )

                    var dpi     = [ 'ldpi', 'mdpi', 'hdpi', 'xhdpi' ]

                    for( var i = 0; i< dpi.length; i++ ) {

                        var key = dpi[ i ],
                            srcPath = path.join( projectPath, 'resources', 'android', 'drawable-' + key ),
                            dstPath = path.join( tmpProjectPath, 'res', 'drawable-' + key )

                        if( fs.existsSync( srcPath ) ) {

                            wrench.copyDirSyncRecursive(
                                srcPath,
                                dstPath,
                                {
                                    forceDelete: true,
                                    preserveFiles: false,
                                    inflateSymlinks: false
                                }
                            )

                        } else {

                            console.log('[spellcli] WARN did not find icons in ' + srcPath )
                        }

                    }
                },
                function() {
                  console.log( '[spellcli] creating assets/resources directory' )

                  mkdirp.sync( resourcesPath )
                },
                function() {
                    console.log( '[spellcli] Copying splash screen resources into android project' )

                    var splashSizes = [ '512', '1024', '2048' ]

                    for( var i = 0; i< splashSizes.length; i++ ) {

                        var key = splashSizes[ i ],
                            srcPath = path.join( projectPath, 'resources', 'android', 'splash-' + key + '.png' ),
                            dstPath = path.join( resourcesPath, 'splash-' + key + '.png' )

                        if( fs.existsSync( srcPath ) ) {

                            copyFile(
                                srcPath,
                                dstPath
                            )

                        } else {

                            console.log('[spellcli] WARN did not find splash screen ' + srcPath )
                        }

                    }
                },
                function() {
                    console.log( '[spellcli] Populating the android project with SpellJS project resources' )

                    // copy project library directory
                    var libraryResourcesPath    = path.join( resourcesPath, 'library'),
                        spelljsResourcesPath    = path.join( resourcesPath, 'spelljs' )

                    copyFile(
                        path.join( spellEnginePath, 'modules', 'spellAndroid', 'launchClient.js' ),
                        path.join( resourcesPath, 'native.js.mp3' )
                    )

                    // create application module and engine library file
                    mkdirp.sync( spelljsResourcesPath )

                    writeFile(
						path.join( spelljsResourcesPath, 'data.js.mp3' ),
						createDataFileContent( scriptSource, cacheContent, projectConfig )
					)

					copyFile(
						createDebugPath( debug, 'spell.debug.js', 'spell.release.js', path.join( spellCorePath, 'lib' ) ),
						path.join( spelljsResourcesPath, 'spell.js.mp3' )
					)

					copyFiles(
						projectLibraryPath,
						libraryResourcesPath,
						createProjectLibraryFilePaths( projectLibraryPath, true )
					)
                },
				function() {
                    console.log( '[spellcli] Running ant in ' + tmpProjectPath + ' to build the android project' )

                    //build the android project
					spawnChildProcess(
                        'ant',
                        [ debug ? 'debug' : 'release' ],
                        {
                            cwd : tmpProjectPath,
                            env : { JAVA_HOME: JDKPath }
                        },
                        true,
                        f.wait()
                    )
				},
                function() {
                    //sign apk file, if we have keys a and doing a release build
                    console.log( '[spellcli] Signing ' + unsignedReleaseApkFile )

                    spawnChildProcess(
                        'jarsigner',
                        [
                            '-sigalg',      'MD5withRSA',
                            '-digestalg',   'SHA1',
                            '-keystore',    androidSigningKeyStore,
                            '-storepass',   androidSigningKeyStorePass,
                            '-keypass',     androidSigningKeyPass,
                            '-signedjar',   unalignedReleaseApkFile,
                            unsignedReleaseApkFile,
                            androidSigningKey
                        ],
                        {
                            cwd : tmpProjectPath,
                            env : { JAVA_HOME: JDKPath }
                        },
                        true,
                        f.wait()
                    )
                },
                function() {
                    if( !debug ) {
                        console.log( '[spellcli] Aligning signed unaligned apk file ' + unalignedReleaseApkFile + ' and save it as ' + signedReleaseApkFile)

                        spawnChildProcess(
                            zipalignTool,
                            [
                                '-f', '-v', '4', unalignedReleaseApkFile, signedReleaseApkFile
                            ],
                            {
                                cwd : tmpProjectPath,
                                env : { JAVA_HOME: JDKPath }
                            },
                            true,
                            f.wait()
                        )
                    }
                },
				function() {
                    var apkFileName         = debug ? unsignedDebugApkFile : signedReleaseApkFile,
                        outputFile          = path.join( outputPath, path.basename( apkFileName ) )

                    console.log( '[spellcli] Copying ' + apkFileName + ' into ' + outputFile )

					copyFile(
                        apkFileName,
                        outputFile
					)
				},
				next
			)
		}

		var TARGET_NAME  = 'android',
			AndroidBuilder = createBuilderType()

		AndroidBuilder.prototype = {
			init : function() {},
			getName : function() {
				return TARGET_NAME
			},
			handlesTarget : function( x ) {
				return x === 'all' ||
					x === TARGET_NAME
			},
			build : function( next ) {
				console.log( 'building for target "' + TARGET_NAME + '"...' )

				build(
					this.spellCorePath,
					this.projectPath,
					this.projectLibraryPath,
					this.outputPath,
					this.target,
					this.projectConfig,
					this.library,
					this.cacheContent,
					this.scriptSource,
					this.minify,
					this.anonymizeModuleIds,
					this.debug,
					next
				)
			}
		}

		return AndroidBuilder
	}
)
