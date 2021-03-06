// Copyright (c) 2012 Turbulenz Limited
define(
	'spell/physics/2D/DebugDraw',
    [
	    'spell/shared/util/platform/Types'
    ],
    function(
        Types
    ) {

        "use strict";

        var Physics2DDebugDraw = function() {
        }

        Physics2DDebugDraw.prototype.setPhysics2DViewport = function (viewport) {
            if (viewport) {
                var port = this._physics2DPort;
                port[0] = viewport[0];
                port[1] = viewport[1];
                port[2] = viewport[2];
                port[3] = viewport[3];
                this._physics2DPortEnabled = true;
            } else {
                this._physics2DPortEnabled = false;
            }
            this._invalidated = true;
        };

        Physics2DDebugDraw.prototype.setScreenViewport = function (viewport) {
            if (viewport) {
                var port = this._screenPort;
                port[0] = viewport[0];
                port[1] = viewport[1];
                port[2] = viewport[2];
                port[3] = viewport[3];
                this._screenPortEnabled = true;
            } else {
                this._screenPortEnabled = false;
            }
            this._invalidated = true;
        };

        Physics2DDebugDraw.prototype.drawLine = function (x1, y1, x2, y2, color) {
            this.renderingContext.setLineColor( color )
            this.renderingContext.drawLine( x1, y1, x2, y2 )
        };

        Physics2DDebugDraw.prototype.drawLinearSpring = function (x1, y1, x2, y2, numCoils, radius, color) {
            if (numCoils <= 0) {
                this.drawLine(x1, y1, x2, y2, color);
                return;
            }

            // Draw linear spring as a sequence of curves approximating
            // a sine wave.
            //
            var dx = (x2 - x1);
            var dy = (y2 - y1);

            var lengthSq = ((dx * dx) + (dy * dy));
            var min = (this.minSpringLength * this.screenToPhysics2D);
            if (lengthSq < (min * min)) {
                // Spring length is below defined epsilon, so we use a line instead.
                this.drawLine(x1, y1, x2, y2, color);
                return;
            }

            // set (nx, ny) to be normal-offset to line between end points of spring
            //   defining twice the amplitude of wave.
            // We use control points which are twice as far from spring line
            //   as the amplitude of wave as the nature of bezier curves means this will
            //   give us a curve that reaches the amplitude perfectly.
            var nx = -dy;
            var ny = dx;
            var nlsq = ((2 * radius) / Math.sqrt((nx * nx) + (ny * ny)));
            nx *= nlsq;
            ny *= nlsq;

            var rec = (1 / (numCoils * 4));
            dx *= rec;
            dy *= rec;

            var i;
            for (i = 0; i < numCoils; i += 1) {
                x2 = (x1 + (dx * 2));
                y2 = (y1 + (dy * 2));
                this.drawCurve(x1, y1, (x1 + dx + nx), (y1 + dy + ny), x2, y2, color);
                x1 = x2;
                y1 = y2;

                x2 = (x1 + (dx * 2));
                y2 = (y1 + (dy * 2));
                this.drawCurve(x1, y1, (x1 + dx - nx), (y1 + dy - ny), x2, y2, color);
                x1 = x2;
                y1 = y2;
            }
        };

        Physics2DDebugDraw.prototype._drawAngleIndicator = function (x, y, ang, rad, size, color) {
            var cos = Math.cos(ang);
            var sin = Math.sin(ang);
            this._drawAnchor(x + (rad * cos), y + (rad * sin), size, color);
        };

        Physics2DDebugDraw.prototype._drawAnchor = function (x, y, rad, color) {
            // 'emulates' a filled circle.
            this.drawCircle(x, y, rad, color);
            this.drawCircle(x, y, rad * 0.75, color);
            this.drawCircle(x, y, rad * 0.5, color);
            this.drawCircle(x, y, rad * 0.25, color);
        };

        Physics2DDebugDraw.prototype.drawSpiral = function (x, y, ang1, ang2, rad1, rad2, color) {
            // Order end points so ang1 < ang2.
            if (ang1 > ang2) {
                var tmp = ang1;
                ang1 = ang2;
                ang2 = tmp;

                tmp = rad1;
                rad1 = rad2;
                rad2 = tmp;
            }

            if (ang1 === ang2) {
                return;
            }

            var deltaRadius = (rad2 - rad1);
            var deltaAngle = (ang2 - ang1);

            // Render spiral in angular segments.
            var segmentCount = Math.ceil(deltaAngle / this.spiralMaxArc);
            var segmentDeltaRadius = (deltaRadius / segmentCount);
            var segmentDeltaAngle = (deltaAngle / segmentCount);

            var cosDelta = Math.cos(segmentDeltaAngle);
            var sinDelta = Math.sin(segmentDeltaAngle);

            // Generate spiral points by rotating (and scaling)
            // radial vector.
            var radialX = Math.cos(ang1);
            var radialY = Math.sin(ang1);
            var radius = rad1;

            var x1 = (x + (rad1 * radialX));
            var y1 = (y + (rad1 * radialY));

            // Gradient at (x1, y1).
            var ux = (deltaRadius * radialX) - (radius * deltaAngle * radialY);
            var uy = (deltaRadius * radialY) + (radius * deltaAngle * radialX);

            var i;
            for (i = 0; i < segmentCount; i += 1) {
                // Compute next point on spiral
                var newRadius = (radius + segmentDeltaRadius);
                var newRadialX = (cosDelta * radialX) - (sinDelta * radialY);
                var newRadialY = (sinDelta * radialX) + (cosDelta * radialY);

                var x2 = (x + (newRadius * newRadialX));
                var y2 = (y + (newRadius * newRadialY));

                // Gradient at (x2, y2)
                var vx = (deltaRadius * newRadialX) - (newRadius * deltaAngle * newRadialY);
                var vy = (deltaRadius * newRadialY) + (newRadius * deltaAngle * newRadialX);

                // Render this spiral segment using a bezier curve (if possible)
                // We find the control point by intersecting the gradients at start and end point.
                var den = ((ux * vy) - (uy * vx));
                if ((den * den) < this.spiralEpsilon) {
                    // Gradients are nearly parallel, use a line!
                    this.drawLine(x1, y1, x2, y2, color);
                } else {
                    // Compute intersection 'time' along gradient (ux, uy).
                    var t = (((x2 - x1) * vy) + ((y1 - y2) * vx)) / den;
                    if (t <= 0) {
                        // Intersection has negative 'time'? Can happen (rare).
                        // Better use a line!
                        this.drawLine(x1, y1, x2, y2, color);
                    } else {
                        this.drawCurve(x1, y1, (x1 + (ux * t)), (y1 + (uy * t)), x2, y2, color);
                    }
                }

                radius = newRadius;
                radialX = newRadialX;
                radialY = newRadialY;
                ux = vx;
                uy = vy;
                x1 = x2;
                y1 = y2;
            }
        };

        // We render a spiral 'spring' in the same way we do a spiral.
        // Only that the expressions for point on spring, and gradient at point
        // are more complex than that of a plain spiral.
        Physics2DDebugDraw.prototype.drawSpiralSpring = function (x, y, ang1, ang2, rad1, rad2, numCoils, color) {
            // Order end points so ang1 < ang2.
            if (ang1 > ang2) {
                var tmp = ang1;
                ang1 = ang2;
                ang2 = tmp;

                tmp = rad1;
                rad1 = rad2;
                rad2 = tmp;
            }

            if (ang1 === ang2) {
                return;
            }

            var deltaRadius = (rad2 - rad1);
            var deltaAngle = (ang2 - ang1);

            // Render spiral in angular segments.
            var segmentCount = Math.max(Math.ceil(deltaAngle / (this.spiralMaxArc * 3)), (40 * numCoils));
            var segmentDeltaAngle = (deltaAngle / segmentCount);
            var segmentDeltaTime = (1 / segmentCount);

            var cosDelta = Math.cos(segmentDeltaAngle);
            var sinDelta = Math.sin(segmentDeltaAngle);

            var spiralSpringSize = this.spiralSpringSize;

            // Coeffecients in expression for point on spiral spring.
            // and gradient of spiral spring at point.
            var Delta = Math.abs(2 * Math.PI * deltaRadius / deltaAngle);
            var spiralA = (spiralSpringSize * Delta);
            var spiralB = (2 * numCoils * Math.PI);
            var spiralAt = (spiralA * spiralB);

            // Generate spiral points by rotating (and scaling)
            // radial vector.
            var radialX = Math.cos(ang1);
            var radialY = Math.sin(ang1);
            var radius = rad1;

            var x1 = (x + (radius * radialX));
            var y1 = (y + (radius * radialY));

            // Gradient at (x1, y1).
            var gradient = (deltaRadius + spiralAt);
            var ux = (gradient * radialX) - (radius * deltaAngle * radialY);
            var uy = (gradient * radialY) + (radius * deltaAngle * radialX);

            var i;
            for (i = 0; i < segmentCount; i += 1) {
                // Compute next point on spiral.
                var t = ((i + 1) * segmentDeltaTime);
                var newRadialX = (cosDelta * radialX) - (sinDelta * radialY);
                var newRadialY = (sinDelta * radialX) + (cosDelta * radialY);

                radius = ((rad1 + (deltaRadius * t)) + (spiralA * Math.sin(spiralB * t)));
                var x2 = (x + (radius * newRadialX));
                var y2 = (y + (radius * newRadialY));

                // Gradient at (x2, y2)
                gradient = (deltaRadius + (spiralAt * Math.cos(spiralB * t)));
                var vx = (gradient * newRadialX) - (radius * deltaAngle * newRadialY);
                var vy = (gradient * newRadialY) + (radius * deltaAngle * newRadialX);

                // Render spiral segment using a bezier curve (if possible).
                // We find the control point by intersecting the gradients at start and end point.
                var den = ((ux * vy) - (uy * vx));

                // Additional constraint that gradient directions in same general direction
                // but not completely equal.
                var dot = ((ux * vx) + (uy * vy));
                if ((den * den) < this.spiralEpsilon || dot < 0 || dot > (1 - this.spiralEpsilon)) {
                    // better use a line!
                    this.drawLine(x1, y1, x2, y2, color);
                } else {
                    // Compute intersection 'time' along gradient (ux, uy).
                    t = (((x2 - x1) * vy) + ((y1 - y2) * vx)) / den;
                    if (t <= 0) {
                        // better use a line!
                        this.drawLine(x1, y1, x2, y2, color);
                    } else {
                        this.drawCurve(x1, y1, (x1 + (ux * t)), (y1 + (uy * t)), x2, y2, color);
                    }
                }

                radialX = newRadialX;
                radialY = newRadialY;
                ux = vx;
                uy = vy;
                x1 = x2;
                y1 = y2;
            }
        };

        Physics2DDebugDraw.prototype.drawCurve = function (x1, y1, cx, cy, x2, y2, color) {
            var r = color[0];
            var g = color[1];
            var b = color[2];
            var a = color[3];

            var stack = this._curveStack;
            var verts = this._curveVerts;
            stack.push(x1, y1, cx, cy, x2, y2);
            while (stack.length > 0) {
                y2 = stack.pop();
                x2 = stack.pop();
                cy = stack.pop();
                cx = stack.pop();
                y1 = stack.pop();
                x1 = stack.pop();

                // (qx, qy) = mid-point of quadratic bezier segment.
                var qx = 0.25 * (x1 + (2 * cx) + x2);
                var qy = 0.25 * (y1 + (2 * cy) + y2);

                // (lx, ly) = mid-point of line from (x1, y1) -> (x2, y2)
                var lx = 0.5 * (x1 + x2);
                var ly = 0.5 * (y1 + y2);

                // If distance between q, l is minimal (by configured epsilon)
                // Then we approximate segment with a straight line.
                var dx = (qx - lx);
                var dy = (qy - ly);
                var err = (this.curveMaxError * this.screenToPhysics2D);
                if (((dx * dx) + (dy * dy)) < (err * err)) {
                    verts.push(x1, y1);
                } else {
                    // Otherwise we decompose segment in two halves
                    // And 'recurse'
                    var m1x = 0.5 * (x1 + cx);
                    var m1y = 0.5 * (y1 + cy);
                    var m2x = 0.5 * (x2 + cx);
                    var m2y = 0.5 * (y2 + cy);
                    var mmx = 0.5 * (m1x + m2x);
                    var mmy = 0.5 * (m1y + m2y);
                    stack.push(mmx, mmy, m2x, m2y, x2, y2);
                    stack.push(x1, y1, m1x, m1y, mmx, mmy);
                }
            }
            verts.push(x2, y2);

            /*jshint bitwise: false*/
            var vCount = (verts.length >> 1);

            /*jshint bitwise: true*/
            var numVertices = this._numVertices;
            var vindex = (numVertices * 6);
            var iindex = (this._numLines * 2);
            this._prepare(vCount, (vCount - 1)); // N vertices, (N - 1) lines

            var vdata = this._vertexData;
            var idata = this._indexData;

            var i, j = 0;
            for (i = 0; i < vCount; i += 1) {
                vdata[vindex] = verts[j];
                vdata[vindex + 1] = verts[j + 1];
                vdata[vindex + 2] = r;
                vdata[vindex + 3] = g;
                vdata[vindex + 4] = b;
                vdata[vindex + 5] = a;
                j += 2;
                vindex += 6;

                if (i > 0) {
                    idata[iindex] = (numVertices + i - 1);
                    idata[iindex + 1] = (numVertices + i);
                    iindex += 2;
                }
            }

            verts.length = 0;
        };

        Physics2DDebugDraw.prototype.drawRectangle = function (x1, y1, x2, y2, color) {
            this.renderingContext.setLineColor( color )
            var dx = x1,
                dy = y2,
                dw = x2 - x1,
                dh = y1 - y2

            this.renderingContext.drawRect( dx, dy, dw, dh )
        };

        Physics2DDebugDraw.prototype.drawCircle = function (x, y, radius, color) {
            this.renderingContext.setLineColor( color )
            this.renderingContext.drawCircle( x, y, radius )
        };

        Physics2DDebugDraw.prototype.drawRigidBody = function (body) {
            body._update();
            var shapes = body.shapes;
            var limit = shapes.length;
            var i;
            for (i = 0; i < limit; i += 1) {
                this._drawShape(shapes[i]);
            }

            if (this.showBodyDetail) {
                var data = body._data;
                this.drawCircle(data[(/*BODY_POS*/ 2)], data[(/*BODY_POS*/ 2) + 1], this.screenToPhysics2D * this.bodyPositionRadius, this.bodyDetailColor);
                this.drawLine(data[(/*BODY_PRE_POS*/ 15)], data[(/*BODY_PRE_POS*/ 15) + 1], data[(/*BODY_POS*/ 2)], data[(/*BODY_POS*/ 2) + 1], this.bodyDetailColor);
            }
        };

        Physics2DDebugDraw.prototype.drawConstraint = function (con) {
            if (con._draw) {
                con._draw(this, con._stiff);
            }
        };

        Physics2DDebugDraw.prototype.drawWorld = function (world, rectangle) {
            var i, limit;
            if (this.showRigidBodies) {
                var bodies = [];
                limit = world.bodyRectangleQuery(rectangle, bodies);
                for (i = 0; i < limit; i += 1) {
                    var body = bodies[i];
                    this.drawRigidBody(body);
                }
            }

            if (this.showContacts) {
                this._drawArbiters(world.dynamicArbiters);
                this._drawArbiters(world.staticArbiters);
            }

            if (this.showConstraints) {
                var constraints = world.constraints;
                limit = constraints.length;
                for (i = 0; i < limit; i += 1) {
                    var con = constraints[i];
                    if (con._active) {
                        this.drawConstraint(con);
                    }
                }
            }
        };

        Physics2DDebugDraw.prototype._drawArbiters = function (arbiters) {
            var rad = (this.screenToPhysics2D * this.contactRadius);
            var imp = (this.screenToPhysics2D * this.contactImpulseScale);

            var limit = arbiters.length;
            var i;
            for (i = 0; i < limit; i += 1) {
                var arb = arbiters[i];
                if (!arb.active) {
                    continue;
                }

                var color = (arb._static ? this.staticContactColor : this.dynamicContactColor);

                var nx, ny;
                if (arb.sensor) {
                    nx = 0;
                    ny = 0;
                } else {
                    var adata = arb._data;
                    nx = adata[(/*ARB_NORMAL*/ 4)];
                    ny = adata[(/*ARB_NORMAL*/ 4) + 1];
                }

                var c1 = arb._contact1._data;
                var x1 = c1[(/*CON_POS*/ 0)];
                var y1 = c1[(/*CON_POS*/ 0) + 1];
                this.drawCircle(x1, y1, rad, color);

                var jn, jt;
                if (this.showContactImpulses && !arb._contact1.virtual) {
                    jn = (c1[(/*CON_JNACC*/ 11)]) * imp;
                    jt = (c1[(/*CON_JTACC*/ 12)]) * imp;
                    this.drawLine(x1, y1, x1 + (nx * jn), y1 + (ny * jn), this.normalImpulseColor);
                    this.drawLine(x1, y1, x1 - (ny * jt), y1 + (nx * jt), this.frictionImpulseColor);
                }

                if (arb._position2Contact) {
                    var c2 = arb._contact2._data;
                    var x2 = c2[(/*CON_POS*/ 0)];
                    var y2 = c2[(/*CON_POS*/ 0) + 1];
                    if (this.showContactImpulses && !arb._contact2.virtual) {
                        jn = (c2[(/*CON_JNACC*/ 11)]) * imp;
                        jt = (c2[(/*CON_JTACC*/ 12)]) * imp;
                        this.drawLine(x2, y2, x2 + (nx * jn), y2 + (ny * jn), this.normalImpulseColor);
                        this.drawLine(x2, y2, x2 - (ny * jt), y2 + (nx * jt), this.frictionImpulseColor);
                    }

                    nx *= rad;
                    ny *= rad;
                    this.drawCircle(x2, y2, rad, color);
                    this.drawLine(x1 + nx, y1 + ny, x2 + nx, y2 + ny, color);
                    this.drawLine(x1 - nx, y1 - ny, x2 - nx, y2 - ny, color);
                }
            }
        };

        // Assumption that shape was updated by a body before call.
        Physics2DDebugDraw.prototype._drawShape = function (shape) {
            var body = shape.body;
            if ((shape.sensor && !this.showSensorsShapes) || (!shape.sensor && !this.showColliderShapes)) {
                return;
            }

            /*jshint bitwise: false*/
            var color = this._colors[shape.body._type | (body.sleeping ? 4 : 0) | (shape.sensor ? 8 : 0) | (body._bullet ? 16 : 0)];

            /*jshint bitwise: true*/
            if (shape._type === (/*TYPE_CIRCLE*/ 0)) {
                this._drawCircleShape(shape, color);
            } else {
                this._drawPolygonShape(shape, color);
            }

            if (this.showShapeDetail) {
                var data = shape._data;
                this.drawRectangle(data[(/*SHAPE_AABB*/ 0)], data[(/*SHAPE_AABB*/ 0) + 1], data[(/*SHAPE_AABB*/ 0) + 2], data[(/*SHAPE_AABB*/ 0) + 3], this.shapeDetailColor);
            }
        };

        Physics2DDebugDraw.prototype._drawCircleShape = function (circle, color) {
            var body = circle.body._data;
            var data = circle._data;
            var cx = data[(/*CIRCLE_WORLD*/ 9)];
            var cy = data[(/*CIRCLE_WORLD*/ 9) + 1];
            var rad = data[(/*CIRCLE_RADIUS*/ 6)];
            this.drawCircle(cx, cy, rad, color);

            if (circle.body._type !== (/*TYPE_STATIC*/ 2)) {
                var cos = body[(/*BODY_AXIS*/ 5)];
                var sin = body[(/*BODY_AXIS*/ 5) + 1];
                this.drawLine(cx + (rad * 0.333 * cos), cy + (rad * 0.333 * sin), cx + (rad * cos), cy + (rad * sin), color);
            }

            if (this.showShapeDetail) {
                this.drawCircle(data[(/*CIRCLE_WORLD*/ 9)], data[(/*CIRCLE_WORLD*/ 9) + 1], this.screenToPhysics2D * this.circleOriginRadius, this.shapeDetailColor);
            }
        };

        Physics2DDebugDraw.prototype._drawPolygonShape = function (polygon, color) {
			var numVertices = this._numVertices;
			var vindex = (numVertices * 6);

			var pdata = polygon._data;
			var pindex = (/*POLY_VERTICES*/ 6);
			var limit = pdata.length;

			var i;

			var vertices = []

			for (i = 0; pindex < limit; pindex += (/*POLY_STRIDE*/ 13), i += 1) {
				vertices.push({
					x: pdata[pindex + (/*POLY_WORLD*/ 2)],
					y: pdata[pindex + (/*POLY_WORLD*/ 2) + 1]
				})

				vindex += 6;
			}


			var firstPoint = vertices[0],
				lastPoint  = undefined

			limit = vertices.length

			for ( i = 0; i < limit; i++ ) {
				var nextPoint = vertices[ i ]

				if( lastPoint ) this.drawLine( lastPoint.x, lastPoint.y, nextPoint.x, nextPoint.y, color )

				lastPoint = nextPoint
			}

			this.drawLine( firstPoint.x, firstPoint.y, lastPoint.x, lastPoint.y, color )
        };

        // =========================================================================
        Physics2DDebugDraw.prototype.begin = function () {
            var gd = this._graphicsDevice;
            var width = gd.width;
            var height = gd.height;

            var screenX, screenY, screenW, screenH;
            var port;
            if (this._screenPortEnabled) {
                port = this._screenPort;
                screenX = port[0];
                screenY = port[1];
                screenW = port[2] - screenX;
                screenH = port[3] - screenY;
            } else {
                screenX = 0;
                screenY = 0;
                screenW = width;
                screenH = height;
            }

            if (width !== this._width || height !== this._height || this._invalidated) {
                this._width = width;
                this._height = height;
                this._invalidated = false;

                var physX, physY, physW, physH;
                if (this._physics2DPortEnabled) {
                    port = this._physics2DPort;
                    physX = port[0];
                    physY = port[1];
                    physW = port[2] - physX;
                    physH = port[3] - physY;
                } else {
                    physX = 0;
                    physY = 0;
                    physW = width / 60;
                    physH = height / 60;
                }

                var clip = this._techniqueParams['clipSpace'];
                clip[0] = (2 * screenW) / (width * physW);
                clip[1] = -(2 * screenH) / (height * physH);
                clip[2] = -(2 * physX * screenW) / (width * physW) + (2 * screenX / width) - 1;
                clip[3] = (2 * physY * screenH) / (height * physH) - (2 * screenY / height) + 1;

                var rx = (clip[0] * 0.5 * width);
                var ry = -(clip[1] * 0.5 * height);
                this.physics2DToScreen = 0.5 * (rx + ry);
                this.screenToPhysics2D = 1 / this.physics2DToScreen;
            }

            gd.setScissor(screenX, height - screenY - screenH, screenW, screenH);
            gd.setTechnique(this._technique);
            gd.setTechniqueParameters(this._techniqueParams);
        };

        Physics2DDebugDraw.prototype.end = function () {
            this._dispatch();
        };

        // =========================================================================
        Physics2DDebugDraw.prototype._prepare = function (numVerts, numLines) {
            var size, newData, i;

            var index = (this._numVertices * 6);
            var total = index + (numVerts * 6);
            var data = this._vertexData;
            if (total > data.length) {
                // allocate new vertex buffer data array.
                size = this._bufferSizeAlgorithm(total);
                newData = this._vertexData = Types.createFloatArray(size);

                for (i = 0; i < index; i += 1) {
                    newData[i] = data[i];
                }
            }
            this._numVertices += numVerts;

            index = (this._numLines * 2);
            total = index + (numLines * 2);
            data = this._indexData;
            if (total > data.length) {
                // allocate new index buffer data array
                size = this._bufferSizeAlgorithm(total);
                newData = this._indexData = Types.Uint16Array.create(size);

                for (i = 0; i < index; i += 1) {
                    newData[i] = data[i];
                }
            }
            this._numLines += numLines;
        };

        Physics2DDebugDraw.prototype._bufferSizeAlgorithm = function (target) {
            // scale factor of 2 is asymtopically optimal in terms of number of resizes
            // performed and copies performed, but we want to try and conserve memory
            // and so choose a less optimal 1.25 so that buffer will never be too much
            // larger than necessary.
            var factor = 1.25;

            // We size buffer to the next power of the factor which is >= target
            var logf = Math.ceil(Math.log(target) / Math.log(factor));
            var size = Math.floor(Math.pow(factor, logf));

            // Additionally ensure that we always take a multiple of of the stride
            // to avoid wasted bytes that could never be used.
            return (6 * Math.ceil(size / 6));
        };

        Physics2DDebugDraw.prototype._dispatch = function () {
            var graphicsDevice = this._graphicsDevice;
            var vertexBuffer = this._vertexBuffer;
            var vertexBufferParameters = this._vertexBufferParameters;
            var vertexData = this._vertexData;
            var indexBuffer = this._indexBuffer;
            var indexBufferParameters = this._indexBufferParameters;
            var indexData = this._indexData;

            var count = this._numVertices;
            if (count === 0) {
                return;
            }

            var newSize;

            // Resize buffer.
            if (count > vertexBufferParameters.numVertices) {
                newSize = this._bufferSizeAlgorithm(count);
                vertexBufferParameters.numVertices = newSize;
                this._vertexBuffer.destroy();
                this._vertexBuffer = vertexBuffer = graphicsDevice.createVertexBuffer(vertexBufferParameters);
            }

            vertexBuffer.setData(vertexData, 0, count);

            count = (this._numLines * 2);

            // Resize buffer.
            if (count > indexBufferParameters.numIndices) {
                newSize = this._bufferSizeAlgorithm(count);
                indexBufferParameters.numIndices = newSize;
                this._indexBuffer.destroy();
                this._indexBuffer = indexBuffer = graphicsDevice.createIndexBuffer(indexBufferParameters);
            }

            indexBuffer.setData(indexData, 0, count);
            graphicsDevice.setStream(vertexBuffer, this._semantics);
            graphicsDevice.setIndexBuffer(indexBuffer);
            graphicsDevice.drawIndexed(graphicsDevice.PRIMITIVE_LINES, count);

            this._numVertices = 0;
            this._numLines = 0;
        };

        Physics2DDebugDraw.prototype.destroy = function () {
            this._graphicsDevice = null;
            this._curveStack.length = 0;
            this._curveVerts.length = 0;
            this._colors.length = 0;

            this._vertexBuffer.destroy();
            this._indexBuffer.destroy();
        };

        Physics2DDebugDraw.create = function (params) {
            var o = new Physics2DDebugDraw();
            var gd = o._graphicsDevice = params.graphicsDevice;

            o._screenPort = Types.createFloatArray(4);
            o._screenPortEnabled = false;
            o._physics2DPort = Types.createFloatArray(4);
            o._physics2DPortEnabled = false;
            o._invalidated = true;

            o.physics2DToScreen = 0;
            o.screenToPhysics2D = 0;

            o.circleMaxError = 0.4; //px
            o.curveMaxError = 0.6; //px
            o.spiralMaxArc = Math.PI / 4; // rad
            o.spiralEpsilon = 1e-5;
            o.spiralSpringSize = 0.75; // percentage of gap between spiral arms for spring.
            o._curveStack = [];
            o._curveVerts = [];

            o.minSpringLength = 0.5; // px

            var v4Build = function v4BuildFn(r, g, b, a) {
                var ret = Types.createFloatArray(4);
                ret[0] = r;
                ret[1] = g;
                ret[2] = b;
                ret[3] = a;
                return ret;
            };

            var bulletColor = v4Build(1.0, 1.0, 1.0, 1.0);
            var staticColor = v4Build(1.0, 0.5, 0.5, 1.0);
            var staticSensorColor = v4Build(0.9, 0.7, 0.7, 0.6);
            var kinematicColor = v4Build(0.8, 0.3, 0.8, 1.0);
            var kinematicSensorColor = v4Build(0.8, 0.4, 0.8, 0.6);
            var dynamicColor = v4Build(0.5, 1.0, 0.5, 1.0);
            var dynamicSensorColor = v4Build(0.7, 0.9, 0.7, 0.6);
            var sleepingDynamicColor = v4Build(0.5, 1.0, 0.5, 0.5);
            var sleepingDynamicSensorColor = v4Build(0.7, 0.9, 0.7, 0.4);
            var sleepingKinematicColor = v4Build(0.8, 0.4, 0.8, 0.5);
            var sleepingKinematicSensorColor = v4Build(0.8, 0.5, 0.8, 0.4);

            o.showConstraints = true;
            o.constraintAnchorRadius = 3.0;
            o.constraintSpringRadius = 3.0;
            o.constraintSpringNumCoils = 3;
            o.constraintSpiralMinRadius = 10.0;
            o.constraintSpiralDeltaRadius = (2.5 / Math.PI);
            o.constraintSpiralNumCoils = 4;
            o.constraintColorA = v4Build(1.0, 0.0, 0.0, 0.8);
            o.constraintSleepingColorA = v4Build(0.7, 0.2, 0.2, 0.6);
            o.constraintColorB = v4Build(0.0, 0.0, 1.0, 0.8);
            o.constraintSleepingColorB = v4Build(0.2, 0.2, 0.7, 0.6);
            o.constraintColorC = v4Build(0.0, 1.0, 0.0, 0.8);
            o.constraintSleepingColorC = v4Build(0.2, 0.7, 0.2, 0.6);
            o.constraintColorD = v4Build(1.0, 0.0, 1.0, 0.8);
            o.constraintSleepingColorD = v4Build(0.7, 0.2, 0.7, 0.6);
            o.constraintErrorColorA = v4Build(1.0, 1.0, 0.5, 0.8);
            o.constraintErrorSleepingColorA = v4Build(0.7, 0.7, 0.5, 0.6);
            o.constraintErrorColorB = v4Build(0.5, 1.0, 1.0, 0.8);
            o.constraintErrorSleepingColorB = v4Build(0.5, 0.7, 0.7, 0.6);
            o.constraintErrorColorC = v4Build(0.4, 1.0, 0.4, 0.8);
            o.constraintErrorSleepingColorC = v4Build(0.4, 0.7, 0.4, 0.6);
            o.constraintErrorColorD = v4Build(1.0, 0.4, 1.0, 0.8);
            o.constraintErrorSleepingColorD = v4Build(0.7, 0.4, 0.7, 0.6);

            o.showContacts = false;
            o.showContactImpulses = false;
            o.contactRadius = 3.0;
            o.contactImpulseScale = 30.0;
            o.dynamicContactColor = v4Build(1.0, 0.0, 0.5, 0.7);
            o.staticContactColor = v4Build(0.5, 0.0, 1.0, 0.7);
            o.normalImpulseColor = v4Build(1.0, 0.0, 0.0, 1.0);
            o.frictionImpulseColor = v4Build(0.0, 0.0, 1.0, 1.0);

            o.showRigidBodies = true;
            o.showColliderShapes = true;
            o.showSensorsShapes = true;
            o.showBodyDetail = false;
            o.showShapeDetail = false;
            o.bodyPositionRadius = 0.5;
            o.circleOriginRadius = 0.5;
            o.bodyDetailColor = v4Build(0.0, 1.0, 1.0, 0.5);
            o.shapeDetailColor = v4Build(1.0, 1.0, 0.0, 0.5);

            // (type | (sleeping << 2) | (sensor << 3) | (bullet << 4))
            var colors = o._colors = [];
            colors[(/*TYPE_STATIC*/ 2) + 4] = staticColor;
            colors[(/*TYPE_STATIC*/ 2) + 12] = staticSensorColor;
            colors[(/*TYPE_DYNAMIC*/ 0)] = dynamicColor;
            colors[(/*TYPE_DYNAMIC*/ 0) + 8] = dynamicSensorColor;
            colors[(/*TYPE_DYNAMIC*/ 0) + 4] = sleepingDynamicColor;
            colors[(/*TYPE_DYNAMIC*/ 0) + 12] = sleepingDynamicSensorColor;
            colors[(/*TYPE_DYNAMIC*/ 0) + 16] = bulletColor;
            colors[(/*TYPE_KINEMATIC*/ 1)] = kinematicColor;
            colors[(/*TYPE_KINEMATIC*/ 1) + 8] = kinematicSensorColor;
            colors[(/*TYPE_KINEMATIC*/ 1) + 4] = sleepingKinematicColor;
            colors[(/*TYPE_KINEMATIC*/ 1) + 12] = sleepingKinematicSensorColor;

            // Load embedded default shader and techniques
            var shader = gd.createShader({
                "version": 1,
                "name": "lines.cgfx",
                "parameters": {
                    "clipSpace": {
                        "type": "float",
                        "columns": 4
                    }
                },
                "techniques": {
                    "alpha": [
                        {
                            "parameters": ["clipSpace"],
                            "semantics": ["POSITION", "COLOR"],
                            "states": {
                                "DepthTestEnable": false,
                                "DepthMask": false,
                                "CullFaceEnable": false,
                                "BlendEnable": true,
                                "BlendFunc": [770, 771]
                            },
                            "programs": ["vp_draw2dlines", "fp_draw2dlines"]
                        }
                    ]
                },
                "programs": {
                    "fp_draw2dlines": {
                        "type": "fragment",
                        "code": "#ifdef GL_ES\n#define TZ_LOWP lowp\nprecision mediump float;\nprecision mediump int;\n#else\n#define TZ_LOWP\n#endif\nvarying TZ_LOWP vec4 tz_Color;\nvoid main()\n{gl_FragColor=tz_Color;}"
                    },
                    "vp_draw2dlines": {
                        "type": "vertex",
                        "code": "#ifdef GL_ES\n#define TZ_LOWP lowp\nprecision mediump float;\nprecision mediump int;\n#else\n#define TZ_LOWP\n#endif\nvarying TZ_LOWP vec4 tz_Color;attribute vec4 ATTR3;attribute vec4 ATTR0;\nvec4 _outpos1;vec4 _outcol1;uniform vec4 clipSpace;void main()\n{vec2 _TMP1;_TMP1=ATTR0.xy*clipSpace.xy+clipSpace.zw;_outpos1=vec4(_TMP1.x,_TMP1.y,0.0,1.0);_outcol1=ATTR3;tz_Color=ATTR3;gl_Position=_outpos1;}"
                    }
                }
            });

            o._techniqueParams = gd.createTechniqueParameters({
                clipSpace: Types.createFloatArray(4)
            });
            o._technique = shader.getTechnique("alpha");

            var initialVertices = 4;
            var initialIndices = 4;

            o._vertexBufferParameters = {
                numVertices: initialVertices,
                attributes: [gd.VERTEXFORMAT_FLOAT2, gd.VERTEXFORMAT_FLOAT4],
                'transient': true
            };
            o._vertexBuffer = gd.createVertexBuffer(o._vertexBufferParameters);

            o._semantics = gd.createSemantics([gd.SEMANTIC_POSITION, gd.SEMANTIC_COLOR]);

            o._indexBufferParameters = {
                numIndices: initialIndices,
                format: gd.INDEXFORMAT_USHORT,
                'transient': true
            };
            o._indexBuffer = gd.createIndexBuffer(o._indexBufferParameters);

            o._vertexData = Types.createFloatArray(60);
            o._indexData = Types.Uint16Array.create(60);
            o._numVertices = 0;
            o._numLines = 0;

            return o;
        };
        Physics2DDebugDraw.version = 1;
        return Physics2DDebugDraw;
    });
