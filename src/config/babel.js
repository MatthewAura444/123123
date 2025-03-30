module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
          browsers: ['last 2 versions', 'not dead']
        },
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false
      }
    ],
    '@babel/preset-typescript',
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-async-generator-functions',
    '@babel/plugin-proposal-json-strings',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-proposal-logical-assignment-operators',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-private-property-in-object',
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-proposal-pipeline-operator',
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-partial-application',
    '@babel/plugin-proposal-decorators',
    '@babel/plugin-proposal-function-sent',
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-proposal-optional-sequencing',
    '@babel/plugin-proposal-unicode-property-regex',
    '@babel/plugin-proposal-json-modules',
    '@babel/plugin-proposal-dynamic-import',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-partial-application',
    '@babel/plugin-proposal-pipeline-operator',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-private-property-in-object',
    '@babel/plugin-proposal-throw-expressions',
    '@babel/plugin-proposal-unicode-property-regex',
    '@babel/plugin-syntax-async-generators',
    '@babel/plugin-syntax-class-properties',
    '@babel/plugin-syntax-class-static-block',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-syntax-export-namespace-from',
    '@babel/plugin-syntax-import-assertions',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-syntax-json-strings',
    '@babel/plugin-syntax-logical-assignment-operators',
    '@babel/plugin-syntax-nullish-coalescing-operator',
    '@babel/plugin-syntax-numeric-separator',
    '@babel/plugin-syntax-object-rest-spread',
    '@babel/plugin-syntax-optional-catch-binding',
    '@babel/plugin-syntax-optional-chaining',
    '@babel/plugin-syntax-partial-application',
    '@babel/plugin-syntax-pipeline-operator',
    '@babel/plugin-syntax-private-property-in-object',
    '@babel/plugin-syntax-throw-expressions',
    '@babel/plugin-syntax-top-level-await',
    '@babel/plugin-syntax-unicode-property-regex'
  ],
  env: {
    development: {
      plugins: ['react-refresh/babel']
    },
    test: {
      plugins: ['@babel/plugin-transform-modules-commonjs']
    }
  }
}; 