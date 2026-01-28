import type { CatalogPlugin, ListContext, Folder } from '@data-fair/types-catalogs'
import type { CkanConfig } from '#types'
import type { CkanCapabilities } from './capabilities.ts'
import axios from '@data-fair/lib-node/axios.js'

export const list = async ({ catalogConfig, secrets, params }: ListContext<CkanConfig, CkanCapabilities>): ReturnType<CatalogPlugin['list']> => {
  if (params.action && !secrets.apiKey) throw new Error('API key is required to list datasets for publication')

  const axiosOptions: Record<string, any> = { headers: {}, params: {} }
  if (secrets.apiKey) axiosOptions.headers.Authorization = secrets.apiKey
  if (params.q) axiosOptions.params.q = params.q
  if (params.currentFolderId) {
    const dataset = (await axios.get(new URL(`api/3/action/package_show?id=${params.currentFolderId}`, catalogConfig.url).href, axiosOptions)).data.result

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
          origin: `${catalogConfig.url}/dataset/${dataset.name}`,
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
  const urlParams = new URLSearchParams()

  if (!params.action && params.showAll === 'true') {
    if (params.size && params.page) {
      urlParams.append('start', String((params.page - 1) * params.size))
      urlParams.append('rows', String(params.size))
    }
    if (params.organization) urlParams.append('fq', `owner_org:${params.organization}`)
    const result = (await axios.get(new URL(`api/3/action/package_search?${urlParams.toString()}`, catalogConfig.url).href, axiosOptions)).data.result
    datasets = result.results
    count = result.count
  } else {
    datasets = (await axios.get(new URL('api/3/action/current_package_list_with_resources?limit=10', catalogConfig.url).href, axiosOptions)).data.result

    if (params.action !== 'replaceFolder') datasets = datasets.filter((d: any) => d.state !== 'deleted')

    // Filter out datasets with "Consultez les données" resources for create/replace resource actions
    if (params.action === 'createResource' || params.action === 'replaceResource') {
      const filteredDatasets = []
      for (const dataset of datasets) {
        try {
          const datasetDetails = (await axios.get(new URL(`api/3/action/package_show?id=${dataset.id}`, catalogConfig.url).href, axiosOptions)).data.result
          const hasConsultezResource = (datasetDetails.resources || []).some((resource: any) =>
            resource.name?.includes('Consultez les données')
          )
          if (!hasConsultezResource) {
            filteredDatasets.push(dataset)
          }
        } catch (error) {
          // In case of error fetching dataset details, include it in the list
          filteredDatasets.push(dataset)
        }
      }
      datasets = filteredDatasets
    }
    count = datasets.length // Count before pagination
    if (params.size && params.page) {
      const startIndex = (params.page - 1) * params.size
      const endIndex = startIndex + Number(params.size)
      datasets = datasets.slice(startIndex, endIndex)
    }
  }

  // Convert datasets to folders
  const folders = datasets.map((dataset: any) => ({
    id: dataset.id,
    title: dataset.title,
    type: 'folder',
    updatedAt: dataset.metadata_modified,
  } as Folder))

  return {
    count,
    results: folders,
    path: [], // Empty path for root level
  }
}
