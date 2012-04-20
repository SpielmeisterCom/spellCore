define(
	"spell/shared/util/network/snapshots",
	function() {
		"use strict"


		var snapshots = {
			SNAPSHOT_NOT_NEWEST_ERROR: "The added snapshot has an earlier timestamp than the latest snapshot.",


			create: function() {
				var theSnapshots = []
				initializeSnapshots( theSnapshots )
				return theSnapshots
			},

			add: function( theSnapshots, time, data ) {
				var latest = this.latest( theSnapshots )
				if ( latest !== undefined && latest.time > time ) {
					throw this.SNAPSHOT_NOT_NEWEST_ERROR
				}

				theSnapshots.push( {
					time: time,
					data: data
				} )
			},

			current: function( theSnapshots ) {
				return snapshotOrUndefined( theSnapshots[ 0 ] )
			},

			next: function( theSnapshots ) {
				return theSnapshots[ 1 ]
			},

			latest: function( theSnapshots ) {
				return snapshotOrUndefined( theSnapshots[ theSnapshots.length - 1 ] )
			},

			empty: function( theSnapshots ) {
				return theSnapshots.length === 1
			},

			forwardTo: function( theSnapshots, time ) {
				while( theSnapshots[ 1 ] !== undefined &&
						theSnapshots[ 2 ] !== undefined &&
						time >= theSnapshots[ 1 ].time ) {

					theSnapshots.shift()
				}
			},

			clear: function( theSnapshots ) {
				theSnapshots.length = 0
				initializeSnapshots( theSnapshots )
			}
		}


		function snapshotOrUndefined( s ) {
			if ( s.data === undefined ) {
				return undefined
			}
			else {
				return s
			}
		}

		function initializeSnapshots( theSnapshots ) {
			theSnapshots.push( {
				time: 0,
				data: undefined
			} )
		}


		return snapshots
	}
)
