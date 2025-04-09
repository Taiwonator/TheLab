'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@(frontend)/components/ui/card'

export default function ImpactNetworkPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Impact Network</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-0 overflow-hidden">
          <div className="w-full aspect-[16/9] relative">
            <iframe
              style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
              width="100%"
              height="100%"
              src="https://embed.figma.com/board/o3yWU7xYO2adcL1cCTgGik/Event-Pages?node-id=53-835&embed-host=share"
              allowFullScreen
              className="absolute inset-0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
