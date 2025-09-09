import { NextRequest, NextResponse } from 'next/server'
import { createPropertyRequest, getAllPropertyRequests } from '@/lib/api/property-requests'
import { CreatePropertyRequestData } from '@/types/property-request'

// POST: 새로운 매물 의뢰 생성
export async function POST(request: NextRequest) {
  try {
    console.log('=== 매물 의뢰 API 호출 시작 ===');
    const body = await request.json() as CreatePropertyRequestData
    console.log('받은 데이터:', body);

    // 필수 필드 검증
    if (!body.inquirer_name || !body.inquirer_phone || !body.property_id) {
      console.error('필수 필드 누락:', { 
        inquirer_name: !!body.inquirer_name, 
        inquirer_phone: !!body.inquirer_phone, 
        property_id: !!body.property_id 
      });
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다 (이름, 전화번호, 매물 ID 필수)' },
        { status: 400 }
      )
    }

    // 전화번호 형식 검증 (간단한 한국 전화번호 형식)
    const phoneRegex = /^[0-9-+()]*$/
    if (!phoneRegex.test(body.inquirer_phone) || body.inquirer_phone.length < 10) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다' },
        { status: 400 }
      )
    }

    // 예산 범위 검증
    if (body.budget_min && body.budget_max && body.budget_min > body.budget_max) {
      return NextResponse.json(
        { error: '최소 예산이 최대 예산보다 클 수 없습니다' },
        { status: 400 }
      )
    }

    // 매물 의뢰 생성
    console.log('createPropertyRequest 호출 전');
    const propertyRequest = await createPropertyRequest(body)
    console.log('createPropertyRequest 호출 후, 결과:', propertyRequest);

    return NextResponse.json(
      { 
        message: '매물 의뢰가 성공적으로 등록되었습니다',
        data: propertyRequest 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('매물 의뢰 생성 API 오류:', error)
    
    return NextResponse.json(
      { 
        error: '매물 의뢰 등록 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET: 매물 의뢰 목록 조회 (관리자용)
export async function GET() {
  try {
    const propertyRequests = await getAllPropertyRequests()

    return NextResponse.json({
      data: propertyRequests,
      count: propertyRequests.length
    })

  } catch (error) {
    console.error('매물 의뢰 목록 조회 API 오류:', error)
    
    return NextResponse.json(
      { 
        error: '매물 의뢰 목록을 가져오는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}