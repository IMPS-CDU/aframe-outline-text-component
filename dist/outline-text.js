'use strict';

/* global AFRAME, THREE, Promise */

/**
 * Outline text. Draw text surrounded by an outline to improve readability.
 * Build from https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_text_shapes.html
 **/
AFRAME.registerComponent('outline-text', {
	schema: {
		value: { type: 'string', default: '' },
		color: { type: 'string', default: '#000' },
		outlineColor: { type: 'string', default: '#FFF' },
		font: { type: 'string', default: 'helvetiker_regular' },
		align: { type: 'string', default: 'left' },
		opacity: { type: 'number', default: 1 },
		side: { default: 'front', oneOf: ['front', 'back', 'double'] }
	},
	multiple: false,
	init: function init() {
		var data = this.parseData(this.data);
		this.drawText(data);
	},
	update: function update() {
		// It should be possible to cache the font to avoid reloading it each time
		this.el.removeObject3D('text_mesh');
		this.el.removeObject3D('text_outline');
		var data = this.parseData(this.data);
		this.drawText(data);
	},
	remove: function remove() {
		this.el.removeObject3D('text_mesh');
		this.el.removeObject3D('text_outline');
	},

	/**
  * Prepare component data for use
  * @param {string} dataString Component data string
  * @return {object} parsed component data
  **/
	parseData: function parseData(dataString) {
		var data = AFRAME.utils.styleParser.parse(dataString);

		switch (data.side) {
			case 'front':
				data.side = THREE.FrontSide;
				break;
			case 'back':
				data.side = THREE.BackSide;
				break;
			case 'double':
			default:
				data.side = THREE.DoubleSide;
		}
		return data;
	},

	/**
  * Draw text to component
  * @param {object} data parsed component data
  * @return {undefined} no return value
  **/
	drawText: function drawText(data) {
		var _this = this;

		this.getTextShape(data).then(function (shapes) {
			var geometry = _this.getTextGeometry(shapes, data);
			var text = _this.getTextMesh(geometry, data);
			var lineText = _this.getLineMesh(shapes, geometry, data);

			_this.el.setObject3D('text_mesh', text);
			_this.el.setObject3D('text_outline', lineText);
		});
	},

	getFontURL: function getFontURL(fontString) {
		if (/.json$/.test(fontString)) {
			return fontString;
		}
		switch (fontString) {
			case 'gentilis_regular':
				return 'https://threejs.org/examples/fonts/gentilis_regular.typeface.json';
			case 'gentilis_bold':
				return 'https://threejs.org/examples/fonts/gentilis_bold.typeface.json';
			case 'optimer_regular':
				return 'https://threejs.org/examples/fonts/optimer_regular.typeface.json';
			case 'optimer_bold':
				return 'https://threejs.org/examples/fonts/optimer_bold.typeface.json';
			case 'helvetiker_bold':
				return 'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json';
			case 'helvetiker_regular':
			default:
				return 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';
		}
	},

	/** Get text shape data
  * Load font data and resolve a promise with the font shape data
  * @param {object} data The component configuration data
  * @return {Promise<THREE.Shape[]>} Shape data returned from Font.generateShapes()
  **/
	getTextShape: function getTextShape(data) {
		var fontUrl = this.getFontURL(data.font);
		var loader = new THREE.FontLoader();
		var divisions = 2;
		return new Promise(function (resolve, reject) {
			loader.load(fontUrl, function (font) {
				var message = data.value;
				var shapes = font.generateShapes(message, 1, divisions);
				resolve(shapes);
			}, null, function (err) {
				return reject(err);
			});
		});
	},

	/**
  * Get the midpoint for alignment transform
  * @param {object} data The component configuration data
  * @param {THREE.ShapeGeometry} geometry Shape geometry for text
  * @return {number} The x offset to transform text for the alignment
  **/
	getMid: function getMid(data, geometry) {
		var half = 0.5;
		var xMid = 0;
		switch (data.align) {
			case 'right':
				xMid = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
				break;
			case 'center':
			case 'centre':
				xMid = -half * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
				break;
			case 'left':
			default:
				xMid = -(geometry.boundingBox.max.x - geometry.boundingBox.min.x);
				break;
		}
		return xMid;
	},

	/** Get geometry for the text shapes
  * @param {Shape[]} shapes Font shape data
  * @param {object} data The component configuration data
  * @return {THREE.ShapeGeometry} Shape geometry for the text
  **/
	getTextGeometry: function getTextGeometry(shapes, data) {
		var geometry = new THREE.ShapeGeometry(shapes);
		geometry.computeBoundingBox();
		var xMid = this.getMid(data, geometry);
		geometry.translate(xMid, 0, 0);
		return geometry;
	},

	/** Get text mesh from geometry
  * @param {THREE.ShapeGeometry} geometry Shape geometry for text
  * @param {object} data The component configuration data
  * @return {THREE.Mesh} A mesh of the text body
  **/
	getTextMesh: function getTextMesh(geometry, data) {
		// make shape ( N.B. edge view not visible )
		var textShape = new THREE.BufferGeometry();
		textShape.fromGeometry(geometry);

		var textMaterial = new THREE.MeshBasicMaterial({
			color: data.color,
			transparent: true,
			opacity: data.opacity,
			side: data.side
		});
		var text = new THREE.Mesh(textShape, textMaterial);
		return text;
	},

	/** Get mesh for text outline
  * @param {Shape[]} shapes Font shape data
  * @param {THREE.ShapeGeometry} geometry Shape geometry for text
  * @param {object} data The component configuration data
  * @return {THREE.Object3D} A mesh of the text outline
  **/
	getLineMesh: function getLineMesh(shapes, geometry, data) {
		var lineMaterial = new THREE.LineBasicMaterial({
			color: data.outlineColor,
			side: data.side
		});

		var xMid = this.getMid(data, geometry);

		// make line shape ( N.B. edge view remains visible )
		var holeShapes = [];
		for (var holeI = 0; holeI < shapes.length; holeI++) {
			var holeShape = shapes[holeI];
			if (holeShape.holes && holeShape.holes.length > 0) {
				for (var j = 0; j < holeShape.holes.length; j++) {
					var hole = holeShape.holes[j];
					holeShapes.push(hole);
				}
			}
		}
		shapes.push.apply(shapes, holeShapes);
		var lineText = new THREE.Object3D();
		for (var i = 0; i < shapes.length; i++) {
			var shape = shapes[i];
			var points = shape.getPoints();
			var pointGeometry = new THREE.BufferGeometry().setFromPoints(points);

			pointGeometry.translate(xMid, 0, 0);
			var lineMesh = new THREE.Line(pointGeometry, lineMaterial);
			lineText.add(lineMesh);
		}

		return lineText;
	}
});