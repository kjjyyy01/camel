import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreatePropertyRequestData } from '@/types/property-request'
import { getAllPropertyRequests } from '@/lib/api/property-requests'

// POST: 새로운 매물 의뢰 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreatePropertyRequestData

    // 서버 사이드 Supabase 클라이언트 생성
    const supabase = await createClient();

    // 현재 로그인된 사용자 정보 가져오기
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // 필수 필드 검증
    if (!body.inquirer_name || !body.inquirer_phone || !body.property_id) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다 (이름, 전화번호, 매물 ID 필수)' },
        { status: 400 }
      )
    }

    // 전화번호 형식 검증
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


    // INSERT 할 데이터 준비
    const insertData = {
      property_id: body.property_id,
      inquirer_name: body.inquirer_name,
      inquirer_phone: body.inquirer_phone,
      user_id: user?.id || null, // 로그인된 경우 user.id, 아니면 null 허용
      inquirer_email: body.inquirer_email || null,
      request_type: body.request_type || 'consultation',
      message: body.message || null,
      budget_min: body.budget_min || null,
      budget_max: body.budget_max || null,
    };


    // 직접 테이블에 INSERT
    const { data: propertyRequest, error } = await supabase
      .from("property_requests")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("매물 의뢰 생성 실패:", error);
      return NextResponse.json(
        { 
          error: '매물 의뢰 등록 중 오류가 발생했습니다',
          details: error.message
        },
        { status: 500 }
      )
    }


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