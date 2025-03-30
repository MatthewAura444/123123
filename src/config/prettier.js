module.exports = {
  semi: true,
  trailingComma: 'none',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'auto',
  htmlWhitespaceSensitivity: 'css',
  jsxSingleQuote: false,
  quoteProps: 'as-needed',
  jsxBracketSameLine: false,
  proseWrap: 'preserve',
  requirePragma: false,
  insertPragma: false,
  embeddedLanguageFormatting: 'auto',
  overrides: [
    {
      files: '*.{js,jsx,ts,tsx}',
      options: {
        parser: 'babel'
      }
    },
    {
      files: '*.{json,css,scss,md}',
      options: {
        parser: 'json'
      }
    }
  ]
}; 