/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  name: 'Microservicios de Accidentes laborales',
  entryPointStrategy: 'expand',
  entryPoints: ['./src'],
  out: 'docs',
  theme: 'default',
  excludeExternals: false,
  exclude: ['**/*+(.spec|.e2e|.module).ts', '**/index.ts', '**/main.ts'],
  navigation: {
    includeCategories: false,
    includeGroups: false,
    excludeReferences: true,
    includeFolders: true,
    compactFolders: true,
  },
  categorizeByGroup: false,
  cleanOutputDir: true,
  customFooterHtml:
    '<p class="tsd-generator">Departamento de Desarrollo e Implemetación | SISALRIL.</p>',
  plugin: [
    'typedoc-plugin-dt-links',
    'typedoc-plugin-coverage',
    'typedoc-github-theme',
  ],
  coverageLabel: 'Docs Status',
  coverageOutputType: 'all',
  coverageSvgWidth: 150,
  theme: 'hierarchy',
  requiredToBeDocumented: [
    'Enum',
    'EnumMember',
    'Function',
    'Class',
    'Interface',
    'Accessor',
    'TypeAlias',
    'Constructor',
    'Method',
    'Property',
  ],
  validation: {
    invalidLink: true,
    notExported: true,
    notDocumented: true,
    rewrittenLink: true,
    unusedMergeModuleWith: false,
  },
};

export default config;
