define(
	'spell/physics/2D/Material',
	[
		'spell/shared/util/platform/Types'
	],
	function( Types ) {
		var Physics2DMaterial = function() {
		}
		Physics2DMaterial.prototype.getElasticity = function () {
			return this._data[(/*MAT_ELASTICITY*/ 0)];
		};

		Physics2DMaterial.prototype.getStaticFriction = function () {
			return this._data[(/*MAT_STATIC*/ 1)];
		};

		Physics2DMaterial.prototype.getDynamicFriction = function () {
			return this._data[(/*MAT_DYNAMIC*/ 2)];
		};

		Physics2DMaterial.prototype.getRollingFriction = function () {
			return this._data[(/*MAT_ROLLING*/ 3)];
		};

		Physics2DMaterial.prototype.getDensity = function () {
			return this._data[(/*MAT_DENSITY*/ 4)];
		};

		// params = {
		//    elasticity: ## = 0,
		//    staticFriction: ## = 2,
		//    dynamicFriction: ## = 1,
		//    rollingFriction: ## = 0.005,
		//    density: ## = 1,
		//    userData: null
		// }
		Physics2DMaterial.create = function (params) {
			var m = new Physics2DMaterial();
			var elasticity = (params && params.elasticity !== undefined ? params.elasticity : 0);
			var staticFriction = (params && params.staticFriction !== undefined ? params.staticFriction : 2);
			var dynamicFriction = (params && params.dynamicFriction !== undefined ? params.dynamicFriction : 1);
			var rollingFriction = (params && params.rollingFriction !== undefined ? params.rollingFriction : 0.005);
			var density = (params && params.density !== undefined ? params.density : 1);

			var data = m._data = new Types.createFloatArray((/*MATERIAL_DATA_SIZE*/ 5));

			data[(/*MAT_ELASTICITY*/ 0)] = elasticity;
			data[(/*MAT_STATIC*/ 1)] = staticFriction;
			data[(/*MAT_DYNAMIC*/ 2)] = dynamicFriction;
			data[(/*MAT_ROLLING*/ 3)] = rollingFriction;
			data[(/*MAT_DENSITY*/ 4)] = density;

			m.userData = (params && params.userData ? params.userData : null);

			return m;
		};
		Physics2DMaterial.version = 1;

		Physics2DMaterial.defaultMaterial = Physics2DMaterial.create();

		return Physics2DMaterial;
	}
)

