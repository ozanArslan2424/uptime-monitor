module.exports = function (api) {
	api.cache(true);
	return {
		presets: ["@ozanarslan/native-jsx/babel"],
		plugins: [["@babel/plugin-transform-flow-strip-types", { allowDeclareFields: true }]],
	};
};
