import { NextRequest, NextResponse } from 'next/server'
import { getUserPropertyRequests } from '@/lib/api/property-requests'

// GET: 특정 사용자의 매물 의뢰 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다' },
        { status: 400 }
      )
    }

    const propertyRequests = await getUserPropertyRequests(userId)

    return NextResponse.json({
      data: propertyRequests,
      count: propertyRequests.length
    })

  } catch (error) {
    console.error('사용자 매물 의뢰 목록 조회 API 오류:', error)
    
    return NextResponse.json(
      { 
        error: '매물 의뢰 목록을 가져오는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}