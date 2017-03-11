const fs = require('fs');
const path = require('path');
const SVGSpriter = require('svg-sprite');
const spritesDir = path.resolve(process.cwd(), 'assets', 'icons');
const outputDir = path.resolve(process.cwd(), 'assets');
const transform = {
	cleanupAttrs: true,
	removeDoctype: true,
	removeXMLProcInst: true,
	removeComments: true,
	removeMetadata: true,
	removeTitle: true,
	removeDesc: true,
	removeUselessDefs: true,
	removeXMLNS: true,
	removeEditorsNSData: true,
	removeEmptyAttrs: true,
	removeHiddenElems: true,
	removeEmptyText: true,
	removeEmptyContainers: true,
	cleanUpEnableBackground: true,
	minifyStyles: true,
	convertStyleToAttrs: true,
	convertPathData: true,
	convertTransform: true,
	removeUnknownsAndDefaults: true,
	removeNonInheritableGroupAttrs: true,
	removeUselessStrokeAndFill: true,
	removeUnusedNS: true,
	cleanupIDs: true,
	cleanupNumericValues: { floatPrecision: 1 },
	cleanupListOfValues: { floatPrecision: 1 },
	mergePath: true,
	convertShapeToPath: true,
	transformsWithOnePath: { floatPrecision: 1 },
	removeDimensions: true,
	removeAttrs: { attrs: 'fill|stroke' },
	removeStyleElement: true,
	collapseGroups: true
};

const spriter = new SVGSpriter({
	dest: outputDir,
	log: 'debug',
	shape: {
		id: {
			generator: 'i-%s'
		},
		transform: [
			{ svgo: { plugins: Object.keys(transform).map(k => ({ [k]: transform[k] })) } },
			{ svgo: { plugins: [
				// collapseGroups is not recursive (
				{ collapseGroups: true }
			] }}
		]
	},
	svg: {
		xmlDeclaration: false,
		doctypeDeclaration: false,
		dimensionAttributes: false
	},
	mode: {
		symbol: {
			dest: '.',
			sprite: 'sprite.svg'
		}
	}
});

for (let f of fs.readdirSync(spritesDir)) {
	let p = spritesDir + '/' + f;
	spriter.add(p, f, fs.readFileSync(p), { encoding: 'utf-8' });
}

spriter.compile((err, result, data) => {
	if (err) return console.error(err);
	for (let mode in result) {
		for (let resource in result[mode]) {
			fs.writeFileSync(result[mode][resource].path, result[mode][resource].contents);
		}
	}
});