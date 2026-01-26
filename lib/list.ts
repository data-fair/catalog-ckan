import type { CatalogPlugin, ListContext, Folder } from '@data-fair/types-catalogs'
import type { CkanConfig } from '#types'
import type { CkanCapabilities } from './capabilities.ts'
import axios from '@data-fair/lib-node/axios.js'

export const list = async ({ catalogConfig, secrets, params }: ListContext<CkanConfig, CkanCapabilities>): ReturnType<CatalogPlugin['list']> => {
  if (params.action && !secrets.apiKey) throw new Error('API key is required to list datasets for publication')

  const axiosOptions: Record<string, any> = { headers: {}, params: {} }
  if (secrets.apiKey) axiosOptions.headers['X-API-KEY'] = secrets.apiKey
  if (params.q) axiosOptions.params.q = params.q

  if (params.currentFolderId) {
    const dataset = (await axios.get(new URL(`api/action/package_show?id=${params.currentFolderId}`, catalogConfig.url).href, axiosOptions)).data.result

    type ResourceResponse = Awaited<ReturnType<CatalogPlugin['list']>>['results'][number]

    // Convert the dataset resources to ResourceList format
    const resources = (dataset.resources || []).map(
      (ckanResource: any) =>
        ({
          id: `${dataset.id}:${ckanResource.id}`,
          title: ckanResource.name,
          type: 'resource',
          description: ckanResource.description,
          format: ckanResource.format || 'unknown',
          origin: 0,
          mimeType: ckanResource.mimetype,
          size: ckanResource.size,
          updatedAt: ckanResource.metadata_modified,
        }) as unknown as ResourceResponse
    )

    // Build the path with the dataset folder
    const path: Folder[] = [
      {
        id: dataset.id,
        title: dataset.name,
        type: 'folder',
        updatedAt: dataset.metadata_modified,
      },
    ]

    return {
      count: resources.length,
      results: resources,
      path,
    }
  }

  let datasets
  let count

  datasets = (await axios.get(new URL('api/action/current_package_list_with_resources', catalogConfig.url).href, axiosOptions)).data.result
  // eslint-disable-next-line prefer-const
  count = datasets.length // Count before pagination
  if (params.size && params.page) {
    const startIndex = (params.page - 1) * params.size
    const endIndex = startIndex + Number(params.size)
    datasets = datasets.slice(startIndex, endIndex)
  }

  // Convert datasets to folders
  const folders = datasets.map(
    (dataset: any) =>
      ({
        id: dataset.id,
        title: dataset.title,
        type: 'folder',
        updatedAt: dataset.metadata_modified,
      }) as unknown as Folder[]
  )

  return {
    count,
    results: folders,
    path: [], // Empty path for root level
  }
}
