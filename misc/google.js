// simple-search-console-script.js
import { google } from 'googleapis'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple function to list Search Console properties
async function listSearchConsoleProperties() {
  try {
    // Set up authentication with service account key file
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../google-credentials.json'),
      scopes: ['https://www.googleapis.com/auth/webmasters'],
    })

    // Create Search Console API client
    const searchconsole = google.searchconsole({
      version: 'v1',
      auth: await auth.getClient(),
    })

    // Get site list
    const response = await searchconsole.sites.list()

    console.log('Search Console Properties:')
    if (response.data.siteEntry && response.data.siteEntry.length) {
      response.data.siteEntry.forEach((site) => {
        console.log(`${site.siteUrl} (${site.permissionLevel})`)
      })
    } else {
      console.log('No properties found.')
    }

    return response.data.siteEntry
  } catch (error) {
    console.error('Error listing Search Console properties:', error)
  }
}

// Execute the function
listSearchConsoleProperties()
