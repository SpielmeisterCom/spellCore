define(
	'spell/physics/2D/Configuration',
	[
	],
	function(
		) {
		var Physics2DConfig = {
			// (Contact Physics)
			// Amount of slop permitted in contact penetration
			CONTACT_SLOP: 0.01,
			EFF_MASS_EPSILON: 1e-10,
			ILL_THRESHOLD: 1e5,
			CLIP_EPSILON: 1.65e-10,
			// Configuration of bias coeffecient computation
			// for percentage of error to resolve per-frame.
			BIAS_COEF: 0.15,
			STATIC_BIAS_COEF: 0.75,
			CONT_BIAS_COEF: 0.5,
			CONT_STATIC_BIAS_COEF: 0.6,
			// Bounce-target-velocity at contact below this value
			// will cause bouncing to be ignored.
			BOUNCE_VELOCITY_THRESHOLD: 0.25,
			// Threshold at which static friction takes over from
			// dynamic.
			STATIC_FRIC_SQ_EPSILON: 1e-4,
			// ================================================
			// (Constraint physics)
			// Point
			// -----------
			// Percentage of error solved per-iteration
			POINT_BIAS_COEF: 0.5,
			// Maximum error to be resolved per-iteration
			POINT_MAX_ERROR: 0.2,
			POINT_MAX_ERROR_SQ: (0.2 * 0.2),
			POINT_SLOP_SQ: 1e-6,
			// Squared error to consider error too large
			// to solve properly.
			POINT_LARGE_ERROR_SQ: 0.01,
			// Percentage of error solved per-iteration in large error case
			POINT_LARGE_ERROR_BIAS: 0.75,
			// Maximum error to be resolve per-iteration in large error case
			POINT_LARGE_ERROR_MAX: 0.4,
			// Weld
			// ----
			// Percentage of error solved per-iteration
			WELD_BIAS_COEF: 0.5,
			// Maximum error to be resolved per-iteration
			WELD_MAX_LINEAR_ERROR: 0.2,
			WELD_MAX_ANGULAR_ERROR: 0.5,
			WELD_MAX_LINEAR_ERROR_SQ: (0.2 * 0.2),
			WELD_LINEAR_SLOP_SQ: 1e-6,
			WELD_ANGULAR_SLOP_SQ: 1e-6,
			// Squared error to consider error too large
			// to solve properly.
			WELD_LARGE_ERROR_SQ: 0.01,
			// Percentage of linear error solved per-iteration in large error case
			WELD_LARGE_ERROR_BIAS: 0.75,
			// Maximum linear error to be resolve per-iteration in large error case
			WELD_LARGE_ERROR_MAX: 0.4,
			// Angle
			// -----
			// Percentage of error solved per-iteration
			ANGLE_BIAS_COEF: 0.5,
			ANGLE_SLOP_SQ: 1e-6,
			// Distance
			// --------
			// Percentage of error solved per-iteration
			DIST_BIAS_COEF: 0.5,
			DIST_SLOP_SQ: 1e-6,
			// Squared error to consider error too large
			// to solve properly.
			DIST_LARGE_ERROR_SQ: 0.01,
			// Percentage of error to solve per-iteration in large error case
			DIST_LARGE_ERROR_BIAS: 0.75,
			// Line
			// ----
			// Percentage of error solved per-iteration
			LINE_BIAS_COEF: 0.8,
			LINE_SLOP_SQ: 1e-6,
			// Squared error to consider error too large
			// to solve properly.
			LINE_LARGE_ERROR_SQ: 0.01,
			// Percentage of error to solve per-iteration in large error case
			LINE_LARGE_ERROR_BIAS: 0.9,
			// Pulley
			// --------
			// Percentage of error solved per-iteration
			PULLEY_BIAS_COEF: 0.5,
			PULLEY_SLOP_SQ: 1e-6,
			// Squared error to consider error too large
			// to solve properly.
			PULLEY_LARGE_ERROR_SQ: 0.01,
			// Percentage of error to solve per-iteration in large error case
			PULLEY_LARGE_ERROR_BIAS: 0.75,
			// ================================================
			// (Continuous collisions)
			// Percentage of body radius body must move through.
			MIN_LINEAR_STATIC_SWEEP: 0.05,
			MIN_ANGULAR_STATIC_SWEEP: 0.005,
			MIN_LINEAR_BULLET_SWEEP: 0.5,
			MIN_ANGULAR_BULLET_SWEEP: 0.05,
			// Accuracy threshold for sweeps on distance.
			SWEEP_LIMIT: 0.0005,
			// Amount of slop permitted in a continuous collision.
			SWEEP_SLOP: 0.05,
			// Minimum fractional TOI-alpha advancement
			MINIMUM_SWEEP_ADVANCE: 1e-6,
			// Maximum sub-steps in sweep
			MAX_SWEEP_ITER: 50,
			// Squared relative velocity in dynamic sweeps to ignore pair
			EQUAL_SQ_VEL: 0.2,
			// Sum of angular-velocity * radius for pair of shapes to ignore pair in dynamic sweeps.
			ZERO_ANG_BIAS: 0.02,
			// Scale factor for angular velocity when TOI has been permitted to slip.
			// This helps prevent an object getting 'stuck' for a few steps when in
			// a fast rotating continuous set of collisions at one point.
			TOI_SLIP_SCALE: 0.75,
			// ================================================
			// (Arbiter/Contact persistance)
			// Number of simulation steps before inactive arbiter is killed.
			DELAYED_DEATH: 30,
			// ================================================
			// (Body integration)
			DELTA_ROTATION_EPSILON: 1e-4,
			// ================================================
			// (Sleeping)
			SLEEP_DELAY: 60,
			// squared linear velocity for sleeping
			SLEEP_LINEAR_SQ: 0.0006,
			// squared tangent velocity for sleeping (body radius taken into account)
			SLEEP_ANGULAR_SQ: 0.001,
			// ================================================
			// (Point containment)
			CONTAINS_EPSILON: 1e-6,
			CONTAINS_SQ_EPSILON: 1e-12,
			// ================================================
			// (General)
			COLLINEAR_EPSILON: 1e-5,
			COLLINEAR_SQ_EPSILON: (1e-5 * 1e-5),
			NORMALIZE_EPSILON: 1e-6,
			NORMALIZE_SQ_EPSILON: (1e-6 * 1e-6)
		};

		return Physics2DConfig;

})