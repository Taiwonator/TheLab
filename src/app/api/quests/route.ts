import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@/payload.config'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId')
    const state = searchParams.get('state')
    
    const payload = await getPayload({ config })
    
    // Build the query
    const query: any = {}
    
    if (productId) {
      query.productId = {
        equals: productId,
      }
    }
    
    if (userId) {
      query.userId = {
        equals: userId,
      }
    }
    
    // Fetch quests with filters
    const quests = await payload.find({
      collection: 'quests',
      where: query,
      depth: 1, // Populate first-level relationships
      sort: '-dateCreated', // Sort by creation date, newest first
    })
    
    // If state filter is applied, we need to fetch state logs and filter quests
    if (state) {
      // Get all quest IDs
      const questIds = quests.docs.map(quest => quest.id)
      
      if (questIds.length === 0) {
        return NextResponse.json({ docs: [] })
      }
      
      // Fetch the latest state log for each quest
      const stateLogs = await payload.find({
        collection: 'quest-state-logs',
        where: {
          questId: {
            in: questIds,
          },
        },
        sort: '-timestamp', // Sort by timestamp, newest first
      })
      
      // Group state logs by quest ID and get the latest one
      const latestStateLogs = new Map()
      stateLogs.docs.forEach(log => {
        const questId = typeof log.questId === 'object' ? log.questId.id : log.questId
        if (!latestStateLogs.has(questId)) {
          latestStateLogs.set(questId, log.state)
        }
      })
      
      // Filter quests by state
      const filteredQuests = quests.docs.filter(quest => {
        const latestState = latestStateLogs.get(quest.id)
        return latestState === state
      })
      
      // Add the latest state to each quest
      const questsWithState = filteredQuests.map(quest => ({
        ...quest,
        latestState: latestStateLogs.get(quest.id),
      }))
      
      return NextResponse.json({
        docs: questsWithState,
      })
    } else {
      // If no state filter, still fetch the latest state for each quest
      const questIds = quests.docs.map(quest => quest.id)
      
      if (questIds.length === 0) {
        return NextResponse.json({ docs: [] })
      }
      
      // Fetch the latest state log for each quest
      const stateLogs = await payload.find({
        collection: 'quest-state-logs',
        where: {
          questId: {
            in: questIds,
          },
        },
        sort: '-timestamp', // Sort by timestamp, newest first
      })
      
      // Group state logs by quest ID and get the latest one
      const latestStateLogs = new Map()
      stateLogs.docs.forEach(log => {
        const questId = typeof log.questId === 'object' ? log.questId.id : log.questId
        if (!latestStateLogs.has(questId)) {
          latestStateLogs.set(questId, log.state)
        }
      })
      
      // Add the latest state to each quest
      const questsWithState = quests.docs.map(quest => ({
        ...quest,
        latestState: latestStateLogs.get(quest.id),
      }))
      
      return NextResponse.json({
        docs: questsWithState,
      })
    }
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch quests', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
