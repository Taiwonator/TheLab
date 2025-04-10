'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@(frontend)/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@(frontend)/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@(frontend)/components/ui/select'
import { Badge } from '@(frontend)/components/ui/badge'
import { Spinner } from '@(frontend)/components/ui/spinner'
// import { ShareButton } from '@(frontend)/components/ui/share-button'
import { Quest, QuestProduct, QuestUser } from '@/payload-types'

interface QuestWithState extends Quest {
  latestState?: string
}

export default function QuestsListPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [quests, setQuests] = useState<QuestWithState[]>([])
  const [products, setProducts] = useState<QuestProduct[]>([])
  const [users, setUsers] = useState<QuestUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get filter values from URL
  const productId = searchParams.get('productId')
  const userId = searchParams.get('userId')
  const state = searchParams.get('state')

  // Fetch products and users for filter dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [productsResponse, usersResponse] = await Promise.all([
          fetch('/api/quest-products'),
          fetch('/api/quest-users'),
        ])

        if (!productsResponse.ok || !usersResponse.ok) {
          throw new Error('Failed to fetch filter options')
        }

        const productsData = await productsResponse.json()
        const usersData = await usersResponse.json()

        setProducts(productsData.docs)
        setUsers(usersData.docs)
      } catch (err) {
        console.error('Error fetching filter options:', err)
        setError('Failed to load filter options')
      }
    }

    fetchFilterOptions()
  }, [])

  // Fetch quests with filters
  useEffect(() => {
    const fetchQuests = async () => {
      try {
        setIsLoading(true)

        // Build query string with filters
        const queryParams = new URLSearchParams()
        if (productId) queryParams.append('productId', productId)
        if (userId) queryParams.append('userId', userId)
        if (state) queryParams.append('state', state)

        const response = await fetch(`/api/quests?${queryParams.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch quests')
        }

        const data = await response.json()
        setQuests(data.docs)
        setError(null)
      } catch (err) {
        console.error('Error fetching quests:', err)
        setError('Failed to load quests')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuests()
  }, [productId, userId, state])

  // Update URL when filters change
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/quests?${params.toString()}`)
  }

  // Get state badge color
  const getStateBadgeColor = (state: string) => {
    switch (state) {
      case 'created':
        return 'bg-blue-100 text-blue-800'
      case 'proposing':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewing':
        return 'bg-purple-100 text-purple-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'denied':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // if (!productId || !userId || !state) {
  //   console.log('Invalid query parameters. Please use the filters to select valid options.', {
  //     productId,
  //     userId,
  //     state,
  //   })
  //   return (
  //     <div className="container mx-auto py-10">
  //       <p>Invalid query parameters. Please use the filters to select valid options.</p>
  //     </div>
  //   )
  // }

  return (
    <Suspense fallback={<Spinner size="md" />}>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quests</h1>
          {/* <ShareButton /> */}
        </div>

        {/* Filters */}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter quests by product, user, or state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <Select
                  value={productId || ''}
                  onValueChange={(value) => updateFilter('productId', value === '' ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">User</label>
                <Select
                  value={userId || ''}
                  onValueChange={(value) => updateFilter('userId', value === '' ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <Select
                  value={state || ''}
                  onValueChange={(value) => updateFilter('state', value === '' ? null : value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="proposing">Proposing</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error message */}
        {error && (
          <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4">{error}</div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
            <span className="ml-3 text-lg text-gray-600">Loading quests...</span>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-gray-500 mb-4">
              Showing {quests.length} {quests.length === 1 ? 'quest' : 'quests'}
            </p>

            {/* Quests list */}
            {quests.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center">
                  <p className="text-gray-500">No quests found matching the selected filters.</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/quests')}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {quests.map((quest) => (
                  <div key={quest.id} className="mb-4">
                    {/* <Link href={`/quests/${quest.id}`} className="block"> */}
                    <Card className="relative overflow-hidden transition-colors hover:bg-[#F9F5FF] cursor-pointer">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xl font-medium">
                              {quest.overview.length > 100
                                ? `${quest.overview.substring(0, 100)}...`
                                : quest.overview}
                            </div>
                            {quest.latestState && (
                              <Badge className={getStateBadgeColor(quest.latestState)}>
                                {quest.latestState.charAt(0).toUpperCase() +
                                  quest.latestState.slice(1)}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                            <div>
                              Product:{' '}
                              {typeof quest.productId === 'object'
                                ? quest.productId.name
                                : 'Unknown'}
                            </div>
                            <div className="mx-2">•</div>
                            <div>
                              User:{' '}
                              {typeof quest.userId === 'object' ? quest.userId.name : 'Unknown'}
                            </div>
                            <div className="mx-2">•</div>
                            <div>
                              Created:{' '}
                              {quest.dateCreated
                                ? new Date(quest.dateCreated).toLocaleDateString()
                                : 'Unknown'}
                            </div>
                          </div>

                          {quest.latestState === 'proposing' && (
                            <div
                              className="mt-4 flex justify-end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link href={`/quests/${quest.id}/proposal`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  {quest.proposal ? 'Edit Proposal' : 'Write Proposal'}{' '}
                                  <span>✏️</span>
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <Link href={`/quests/${quest.id}`} className="absolute w-full h-full" />
                    </Card>
                    {/* </Link> */}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Suspense>
  )
}
