import type { CatalogPlugin, PublishDatasetContext, DeletePublicationContext } from '@data-fair/types-catalogs'
import type { MockConfig } from '#types'

export const publishDataset = async ({ catalogConfig, dataset, publication }: PublishDatasetContext<MockConfig>): ReturnType<CatalogPlugin['publishDataset']> => {
  await new Promise(resolve => setTimeout(resolve, catalogConfig.delay * 10))

  switch (publication.action) {
    case 'createFolderInRoot':
      // By default, publication.remoteFolder and publication.remoteResource are undefined.
      // We set publication.remoteFolder here to simulate the creation of a folder in the root.
      publication.remoteFolder = {
        id: `folder-${dataset.id}`,
        title: dataset.title,
        url: `https://example.com/folders/folder-${dataset.slug}`
      }
      break

    case 'createFolder':
      // By default, publication.remoteFolder is the parent folder where the user wants to create the new folder,
      // and publication.remoteResource are undefined.
      // We update publication.remoteFolder to the newly created folder.
      publication.remoteFolder = {
        id: `folder-${dataset.id}`,
        title: dataset.title,
        url: `https://example.com/folders/folder-${dataset.slug}`
      }
      break

    case 'createResource':
      // By default, publication.remoteFolder is the parent folder where the user wants to create the new resource,
      // and publication.remoteResource is undefined.
      // We set publication.remoteResource here to simulate the creation of a resource in the specified folder.
      // The publication.remoteFolder will be removed by catalogs after the publication is done.
      publication.remoteResource = {
        id: `resource-${dataset.id}`,
        title: dataset.title,
        url: `https://example.com/resources/resource-${dataset.slug}`
      }
      break

    case 'replaceFolder':
      // By default, publication.remoteFolder is the folder to replace,
      // and publication.remoteResource is undefined.
      // We update publication.remoteFolder to simulate the folder after being replaced.
      publication.remoteFolder = {
        id: publication.remoteFolder?.id!,
        title: dataset.title,
        url: `https://example.com/folders/${dataset.slug}`
      }
      break

    case 'replaceResource':
      // By default, publication.remoteResource is the resource to replace,
      // and publication.remoteFolder is undefined.
      // We update publication.remoteResource to simulate the resource after being replaced.
      publication.remoteResource = {
        id: publication.remoteResource?.id!,
        title: dataset.title,
        url: `https://example.com/resources/${dataset.slug}`
      }
      break

    default:
      throw new Error(`Unknown action: ${publication.action}`)
  }

  return publication
}

export const deletePublication = async ({ catalogConfig, folderId, resourceId }: DeletePublicationContext<MockConfig>): ReturnType<CatalogPlugin['deletePublication']> => {
  await new Promise(resolve => setTimeout(resolve, catalogConfig.delay * 10))
}
