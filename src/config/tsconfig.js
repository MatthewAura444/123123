module.exports = {
  compilerOptions: {
    // Основные настройки
    target: 'es5',
    lib: ['dom', 'dom.iterable', 'esnext'],
    allowJs: true,
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    noFallthroughCasesInSwitch: true,
    module: 'esnext',
    moduleResolution: 'node',
    resolveJsonModule: true,
    isolatedModules: true,
    noEmit: true,
    jsx: 'react-jsx',

    // Пути
    baseUrl: '.',
    paths: {
      '@/*': ['src/*'],
      '@components/*': ['src/components/*'],
      '@pages/*': ['src/pages/*'],
      '@assets/*': ['src/assets/*'],
      '@utils/*': ['src/utils/*'],
      '@hooks/*': ['src/hooks/*'],
      '@store/*': ['src/store/*'],
      '@styles/*': ['src/styles/*']
    },

    // Дополнительные настройки
    noImplicitAny: true,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictBindCallApply: true,
    strictPropertyInitialization: true,
    noImplicitThis: true,
    alwaysStrict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedIndexedAccess: true,
    noImplicitOverride: true,
    noPropertyAccessFromIndexSignature: true,
    exactOptionalPropertyTypes: true,
    allowUnreachableCode: false,
    allowUnusedLabels: false,
    downlevelIteration: true,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    importHelpers: true,
    incremental: true,
    sourceMap: true,
    declaration: true,
    declarationMap: true,
    removeComments: false,
    pretty: true,
    newLine: 'lf',
    charset: 'utf8'
  },

  // Включаемые файлы
  include: [
    'src/**/*',
    'tests/**/*'
  ],

  // Исключаемые файлы
  exclude: [
    'node_modules',
    'build',
    'dist',
    'coverage',
    '**/*.test.ts',
    '**/*.test.tsx'
  ],

  // Настройки для разных типов файлов
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-empty-interface': 'warn'
      }
    }
  ]
}; 