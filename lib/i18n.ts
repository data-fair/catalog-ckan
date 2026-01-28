import type { Metadata } from '@data-fair/types-catalogs'

const i18n: Metadata['i18n'] = {
  en: {
    description: 'Import / publish datasets from / to a Ckan catalog.',
    actionLabels: {
      createFolderInRoot: 'Create dataset',
      // createFolder: 'Create folder',
      createResource: 'Create resource', // Default : Create resource
      replaceFolder: 'Replace dataset',
      replaceResource: 'Replace resource' // Default : Replace resource
    },
    actionButtons: {
      // createFolderInRoot: 'Create publication',
      // createFolder: 'Create publication here',
      createResource: 'Create file here', // Default : Create publication here
      // replaceFolder: 'Replace this folder',
      replaceResource: 'Replace file' // Default : Replace this resource
    },
    stepTitles: {
      // createFolder: 'Destination folder selection',
      // createResource: 'Destination folder selection',
      // replaceFolder: 'Folder to replace selection',
      replaceResource: 'File to replace selection' // Default : Resource to replace selection
    }
  },
  fr: {
    description: 'Importez / publiez des jeux de données depuis / vers un catalogue Ckan.',
    actionLabels: {
      createFolderInRoot: 'Créer un jeu de donnée',
      // createFolder: 'Créer un dossier',
      createResource: 'Créer une ressource', // Défaut : Créer une ressource
      replaceFolder: 'Écraser un jeu de donnée',
      replaceResource: 'Remplacer une ressource' // Défaut : Écraser une ressource
    },
    actionButtons: {
      // createFolderInRoot: 'Créer la publication',
      // createFolder: 'Créer la publication ici',
      createResource: 'Créer la ressource ici', // Défaut : Créer la publication ici
      // replaceFolder: 'Écraser ce dossier',
      replaceResource: 'Remplacer la ressource' // Défaut : Écraser cette ressource
    },
    stepTitles: {
      // createFolder: 'Sélection du dossier de destination',
      // createResource: 'Sélection du dossier de destination',
      // replaceFolder: 'Sélection du dossier à écraser',
      replaceResource: 'Sélection du fichier à remplacer' // Défaut : Sélection de la ressource à écraser
    }
  }
}

export default i18n
