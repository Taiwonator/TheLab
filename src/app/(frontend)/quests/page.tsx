'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/app/(frontend)/_components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/_components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/_components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationButton,
  PaginationNext,
  PaginationPrevious,
} from '@/app/(frontend)/_components/ui/pagination'
import { Badge } from '@/app/(frontend)/_components/ui/badge'
import { Spinner } from '@/app/(frontend)/_components/ui/spinner'
// import { ShareButton } from '@(frontend)/components/ui/share-button'
import { Quest, QuestProduct, QuestUser } from '@/payload-types'
import { PaginatedDocs } from 'payload'

interface QuestWithState extends Quest {
  latestState?: string
}

function QuestsList() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [quests, setQuests] = useState<QuestWithState[]>([])
  const [questsMeta, setQuestsMeta] = useState<Partial<PaginatedDocs<Quest>>>({})
  const [products, setProducts] = useState<QuestProduct[]>([])
  const [users, setUsers] = useState<QuestUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get filter values from URL
  const productId = searchParams.get('productId')
  const userId = searchParams.get('userId')
  const state = searchParams.get('state')
  const page = searchParams.get('page')

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
        if (page) queryParams.append('page', page)

        const response = await fetch(`/api/quests?${queryParams.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch quests')
        }

        const data = await response.json()
        console.log('quests meta: ', data.meta)

        setQuests(data.docs)
        setQuestsMeta(data.meta)
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

  const isFilterButtonDisabled = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (params) return !params.size
    return false
  }

  isFilterButtonDisabled()

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
        return 'bg-background text-foreground border-1 border-foreground'
    }
  }

  return (
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
          <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
            <div className="grid md:grid-cols-3 gap-4 md:col-span-7">
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
            <Button
              className="text-sm mt-auto md:col-span-1"
              onClick={() => router.push('/quests')}
              disabled={isFilterButtonDisabled()}
            >
              Clear
            </Button>
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
          <span className="ml-3 text-lg text-foreground/50">Loading quests...</span>
        </div>
      ) : (
        <>
          {/* Results count */}
          <p className="text-sm text-foreground/50 mb-4">
            Showing {quests.length} {quests.length === 1 ? 'quest' : 'quests'}
          </p>

          {/* Quests list */}
          {quests.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-foreground/50">No quests found matching the selected filters.</p>
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
                  <Card className="relative overflow-hidden transition-colors cursor-pointer hover:outline-figma-purple hover:outline-1 ">
                    <CardContent className="p-0 relative">
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

                        <div className="flex flex-wrap gap-2 text-sm text-foreground/50">
                          <div>
                            Product:{' '}
                            {typeof quest.productId === 'object' ? quest.productId.name : 'Unknown'}
                          </div>
                          <div className="mx-2">•</div>
                          <div>
                            User: {typeof quest.userId === 'object' ? quest.userId.name : 'Unknown'}
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
                            <Button
                              size="sm"
                              variant="outline"
                              className="btn-figma--hover flex z-[2] items-center gap-1"
                              asChild
                            >
                              <Link href={`/quests/${quest.id}/proposal`}>
                                {quest.proposal ? 'Edit Proposal' : 'Write Proposal'}{' '}
                                <span>✏️</span>
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <Link
                      href={`/quests/${quest.id}`}
                      className="absolute w-full h-full top-0 left-0 rounded-lg focus:border-figma-purple focus:border-2"
                    />
                  </Card>
                  {/* </Link> */}
                </div>
              ))}
              {questsMeta && questsMeta.totalPages && questsMeta.totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    {questsMeta.prevPage && (
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                    )}
                    {Array(Math.min(8, questsMeta.totalPages))
                      .fill(0)
                      .map((_, i) => (
                        <PaginationItem key={`pagination-btn-${i}`}>
                          <PaginationButton onClick={() => updateFilter('page', String(i + 1))}>
                            {i + 1}
                          </PaginationButton>
                        </PaginationItem>
                      ))}

                    {/* <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem> */}
                    {questsMeta.nextPage && (
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function QuestsListPage() {
  return (
    <Suspense fallback={<Spinner size="md" />}>
      <QuestsList />
    </Suspense>
  )
}
