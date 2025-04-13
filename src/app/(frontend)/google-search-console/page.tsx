'use client'

import { useState, useEffect } from 'react'
import '../../_styles/google-search-console.css'
import {
  fetchMultiplePropertiesData,
  getDefaultQuery,
  PropertyData,
  SearchAnalyticsQueryRequest,
} from '../../services/googleSearchConsole'

interface SearchProperty {
  id: string
  url: string
}

export default function GoogleSearchConsolePage() {
  const [properties, setProperties] = useState<SearchProperty[]>([])
  const [newPropertyUrl, setNewPropertyUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<PropertyData[] | null>(null)
  const [query, setQuery] = useState<SearchAnalyticsQueryRequest>(getDefaultQuery())
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw'>('formatted')
  const [error, setError] = useState<string | null>(null)

  // Load saved properties from localStorage on component mount
  useEffect(() => {
    const savedProperties = localStorage.getItem('gscProperties')
    if (savedProperties) {
      try {
        setProperties(JSON.parse(savedProperties))
      } catch (e) {
        console.error('Failed to parse saved properties:', e)
      }
    }
  }, [])

  // Save properties to localStorage when they change
  useEffect(() => {
    localStorage.setItem('gscProperties', JSON.stringify(properties))
  }, [properties])

  const addProperty = () => {
    if (!newPropertyUrl.trim()) return

    // Simple URL validation
    let url = newPropertyUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }

    const newProperty: SearchProperty = {
      id: Date.now().toString(),
      url,
    }

    setProperties([...properties, newProperty])
    setNewPropertyUrl('')
  }

  const removeProperty = (id: string) => {
    setProperties(properties.filter((property) => property.id !== id))
  }

  const fetchData = async () => {
    if (properties.length === 0) {
      setError('Please add at least one property')
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      // Extract URLs from properties
      const urls = properties.map((property) => property.url)

      // Fetch data for all properties
      const data = await fetchMultiplePropertiesData(urls, query)

      setResults(data)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch data from Google Search Console API')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="gsc-container">
      <div className="gsc-header">
        <h1>Google Search Console Data</h1>
        <p>Compare search performance across multiple properties</p>
      </div>

      {error && <div className="gsc-error">{error}</div>}

      <div className="gsc-properties">
        <h2>Search Properties</h2>

        <ul className="gsc-properties-list">
          {properties.map((property) => (
            <li key={property.id} className="gsc-property-item">
              <span className="gsc-property-url">{property.url}</span>
              <button className="gsc-property-remove" onClick={() => removeProperty(property.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="gsc-add-property">
          <input
            type="text"
            value={newPropertyUrl}
            onChange={(e) => setNewPropertyUrl(e.target.value)}
            placeholder="Enter website URL (e.g., example.com)"
            onKeyDown={(e) => e.key === 'Enter' && addProperty()}
          />
          <button onClick={addProperty}>Add Property</button>
        </div>
      </div>

      <div className="gsc-date-range">
        <h3>Date Range</h3>
        <div className="gsc-date-inputs">
          <div className="gsc-date-field">
            <label htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={query.startDate}
              onChange={(e) =>
                setQuery({
                  ...query,
                  startDate: e.target.value,
                })
              }
            />
          </div>
          <div className="gsc-date-field">
            <label htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              value={query.endDate}
              onChange={(e) =>
                setQuery({
                  ...query,
                  endDate: e.target.value,
                })
              }
            />
          </div>
          <div className="gsc-date-field">
            <label htmlFor="dimension">Group By</label>
            <select
              id="dimension"
              value={query.dimensions ? query.dimensions[0] : 'query'}
              onChange={(e) =>
                setQuery({
                  ...query,
                  dimensions: [e.target.value],
                })
              }
            >
              <option value="query">Search Query</option>
              <option value="page">Page</option>
              <option value="country">Country</option>
              <option value="device">Device</option>
              <option value="searchAppearance">Search Appearance</option>
            </select>
          </div>
          <div className="gsc-date-field">
            <label htmlFor="row-limit">Row Limit</label>
            <select
              id="row-limit"
              value={query.rowLimit || 10}
              onChange={(e) =>
                setQuery({
                  ...query,
                  rowLimit: parseInt(e.target.value),
                })
              }
            >
              <option value="10">10 rows</option>
              <option value="25">25 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
              <option value="250">250 rows</option>
              <option value="500">500 rows</option>
            </select>
          </div>
        </div>
      </div>

      <button
        className="gsc-fetch-button"
        onClick={fetchData}
        disabled={isLoading || properties.length === 0}
      >
        {isLoading ? 'Fetching Data...' : 'Fetch Search Console Data'}
      </button>

      {isLoading && <div className="gsc-loading">Loading data from Google Search Console...</div>}

      {results && (
        <div className="gsc-results">
          <div className="gsc-results-header">
            <h2>Search Console Results</h2>
          </div>

          <div className="gsc-results-tabs">
            <div
              className={`gsc-results-tab ${activeTab === 'formatted' ? 'active' : ''}`}
              onClick={() => setActiveTab('formatted')}
            >
              Formatted View
            </div>
            <div
              className={`gsc-results-tab ${activeTab === 'raw' ? 'active' : ''}`}
              onClick={() => setActiveTab('raw')}
            >
              Raw JSON
            </div>
          </div>

          <div className="gsc-results-content">
            {activeTab === 'formatted' ? (
              <div>
                {results.map((property, index) => (
                  <div key={index} className="gsc-property-result">
                    <div className="gsc-property-url">{property.siteUrl}</div>

                    {property.data.rows && property.data.rows.length > 0 ? (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th
                              style={{
                                textAlign: 'left',
                                padding: '8px',
                                borderBottom: '1px solid #ddd',
                              }}
                            >
                              {query.dimensions &&
                                query.dimensions[0].charAt(0).toUpperCase() +
                                  query.dimensions[0].slice(1)}
                            </th>
                            <th
                              style={{
                                textAlign: 'right',
                                padding: '8px',
                                borderBottom: '1px solid #ddd',
                              }}
                            >
                              Clicks
                            </th>
                            <th
                              style={{
                                textAlign: 'right',
                                padding: '8px',
                                borderBottom: '1px solid #ddd',
                              }}
                            >
                              Impressions
                            </th>
                            <th
                              style={{
                                textAlign: 'right',
                                padding: '8px',
                                borderBottom: '1px solid #ddd',
                              }}
                            >
                              CTR
                            </th>
                            <th
                              style={{
                                textAlign: 'right',
                                padding: '8px',
                                borderBottom: '1px solid #ddd',
                              }}
                            >
                              Position
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {property.data.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                {row.keys[0]}
                              </td>
                              <td
                                style={{
                                  textAlign: 'right',
                                  padding: '8px',
                                  borderBottom: '1px solid #eee',
                                }}
                              >
                                {row.clicks}
                              </td>
                              <td
                                style={{
                                  textAlign: 'right',
                                  padding: '8px',
                                  borderBottom: '1px solid #eee',
                                }}
                              >
                                {row.impressions}
                              </td>
                              <td
                                style={{
                                  textAlign: 'right',
                                  padding: '8px',
                                  borderBottom: '1px solid #eee',
                                }}
                              >
                                {(row.ctr * 100).toFixed(2)}%
                              </td>
                              <td
                                style={{
                                  textAlign: 'right',
                                  padding: '8px',
                                  borderBottom: '1px solid #eee',
                                }}
                              >
                                {row.position.toFixed(1)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No data available for this property.</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <pre>{JSON.stringify(results, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
