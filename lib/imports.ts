import axios from '@data-fair/lib-node/axios.js'
import type { CatalogPlugin, GetResourceContext, Resource } from '@data-fair/types-catalogs'
import type { UDataConfig } from '#types'

export const getResource = async ({ catalogConfig, secrets, importConfig, resourceId, tmpDir, log }: GetResourceContext<UDataConfig>): ReturnType<CatalogPlugin['getResource']> => {
  // Decode the composite ID (format: "datasetId:resourceId")

  const parts = resourceId.split(':')
  if (parts.length !== 2) {
    throw new Error(`Invalid resource ID format: ${resourceId}. Expected: "datasetId:resourceId"`)
  }
  const [datasetId, ckanResourceId] = parts
  // await log.step('Retrieving resource information');
  // await log.info(`datasetId=${datasetId}, resourceId=${ckanResourceId}`);

  // Axios configuration with API key if available
  const axiosOptions: Record<string, any> = { headers: {} }
  if (secrets.apiKey) axiosOptions.headers['Authorization'] = secrets.apiKey

  const dataset = (await axios.get(new URL(`api/3/action/package_show?id=${datasetId}`, catalogConfig.url).href, axiosOptions)).data.result

  const ckanResource = (await axios.get(new URL(`api/3/action/resource_show?id=${ckanResourceId}`, catalogConfig.url).href, axiosOptions)).data.result

  // Download the resource
  const fs = await import('node:fs')
  const path = await import('path')

  const response = await axios.get(ckanResource.url, {
    responseType: 'stream',
  })

  // Determine the file extension from the URL or Content-Type
  const urlPath = new URL(ckanResource.url).pathname
  let extension = path.extname(urlPath) || '.dat'
  if (!extension || extension === '.dat') {
    const contentType = response.headers['content-type']
    if (contentType?.includes('json')) extension = '.json'
    else if (contentType?.includes('csv')) extension = '.csv'
    else if (contentType?.includes('xml')) extension = '.xml'
    else if (contentType?.includes('excel')) extension = '.xlsx'
    else if (contentType?.includes('zip')) extension = '.zip'
  }
  // await log.info(`File extension determined: ${extension}`);

  // Create a filename
  const resourceTitle = ckanResource.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'resource'
  const fileName = `${resourceTitle}${extension}`
  const filePath = path.join(tmpDir, fileName)
  // await log.info(`Downloading resource to ${fileName}`);

  // Create write stream
  const writeStream = fs.createWriteStream(filePath)
  response.data.pipe(writeStream)

  // Return a promise that resolves with the file path
  await new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(filePath))
    writeStream.on('error', (error) => reject(error))
  })
  // await log.info(`Resource ${udataResource.title} downloaded successfully!`);

  // await log.step('Preparing the dataset');

  // const title = importConfig.useDatasetTitle ? dataset.title : ckanResource.title;
  // const description = importConfig.useDatasetDescription ? dataset.description : ckanResource.description;
  // await log.info(`Dataset title from ${importConfig.useDatasetTitle ? 'remote dataset' : 'remote resource'}: ${title}`);
  // await log.info(`Dataset description from ${importConfig.useDatasetDescription ? 'remote dataset' : 'remote resource'}: ${description?.substring(0, 100)}${description?.length > 100 ? '...' : ''}`);

  const ckanLicenses: { id: string; title: string; url: string }[] = (await axios.get(new URL('api/3/action/license_list', catalogConfig.url).href, axiosOptions)).data.result
  const ckanLicense = ckanLicenses.find((l: any) => l.id === dataset.license_id)
  const license = ckanLicense ? { title: ckanLicense.title, href: ckanLicense.url } : undefined
  // if (license) await log.info(`License found: ${license.title}`);
  // else await log.warning('No license specified for this resource');

  return {
    id: resourceId,
    title: importConfig.useDatasetTitle ? dataset.name : ckanResource.name,
    description: importConfig.useDatasetDescription ? dataset.description : ckanResource.description,
    filePath,
    format: ckanResource.format,
    frequency: ckanResource.frequency,
    license,
    keywords: ckanResource.tags,
    mimeType: ckanResource.mimetype,
    origin: dataset.page,
    size: ckanResource.size,
  } as Resource
}
