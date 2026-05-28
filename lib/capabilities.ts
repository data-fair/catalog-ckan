import type { Capability } from '@data-fair/types-catalogs'

export const capabilities = [
  'search',
  'pagination',

  'import',
  'importConfig',

  'importFilters',

  'createFolderInRoot',
  'createResource',
  'replaceFolder',
  'replaceResource',
  'requiresPublicationSite'
] satisfies Capability[]

export type CkanCapabilities = typeof capabilities
export default capabilities
