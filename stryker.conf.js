module.exports = function(config) {
  config.set({
    mutator: "typescript",
    packageManager: "yarn",
    reporters: ["html", "clear-text", "progress"],
    testRunner: "jest",
    transpilers: [],
    coverageAnalysis: "off",
    tsconfigFile: "tsconfig.json",
    mutate: ["src/todo/**/*.ts", "src/utils/**/*.ts", "!src/**/*.spec.ts"],
    jest: {
      projectType: "custom",
      config: require(__dirname + "/jest.stryker.config.js")
    }
  });
};
