import type CatalogPlugin from '@data-fair/types-catalogs'
import { importConfigSchema, configSchema, assertConfigValid, type CkanConfig } from '#types'
import { type CkanCapabilities, capabilities } from './lib/capabilities.ts'
import importFiltersSchema from './lib/importFiltersSchema.ts'
import i18n from './lib/i18n.ts'

const plugin: CatalogPlugin<CkanConfig, CkanCapabilities> = {
  async prepare (context) {
    const prepare = (await import('./lib/prepare.ts')).default
    return prepare(context)
  },

  async list (context) {
    const { list } = await import('./lib/list.ts')
    return list(context)
  },

  async getResource (context) {
    const { getResource } = await import('./lib/imports.ts')
    return getResource(context)
  },

  async publishDataset (context) {
    const { publishDataset } = await import('./lib/publications.ts')
    return publishDataset(context)
  },

  async deletePublication (context) {
    const { deletePublication } = await import('./lib/publications.ts')
    return deletePublication(context)
  },

  metadata: {
    title: 'Ckan',
    description: 'Importez / publiez des jeux de données depuis / vers un catalogue Ckan.',
    i18n,
    capabilities
  },

  importConfigSchema,
  importFiltersSchema,
  configSchema,
  assertConfigValid
}
export default plugin
