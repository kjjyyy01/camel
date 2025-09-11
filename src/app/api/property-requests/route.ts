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
    } = await supabase.auth.getUser();

    // 필수 필드 검증
    if (!body.inquirer_name || !body.inquirer_phone || !body.property_id) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다 (이름, 전화번호, 매물 ID 필수)' },
        { status: 400 }
      )
    }

    // 전화번호 정규화 및 형식 검증
    const normalizedPhone = body.inquirer_phone.replace(/[^\d]/g, '')
    if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다' },
        { status: 400 }
      )
    }

    // 하이픈 포함 형태로 포맷팅
    const formattedPhone = normalizedPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')

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
      inquirer_phone: formattedPhone, // 하이픈 포함 형태로 저장
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
    return NextResponse.json(
      { 
        error: '매물 의뢰 등록 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET: 매물 의뢰 목록 조회 (전화번호 기반 조회 또는 관리자용 전체 조회)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const rawPhone = url.searchParams.get('phone')

    // 전화번호가 제공된 경우 해당 전화번호의 의뢰만 조회
    if (rawPhone) {
      const supabase = await createClient()
      
      // 전화번호 정규화 및 형식 검증
      const normalizedPhone = rawPhone.replace(/[^\d]/g, '')
      if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
        return NextResponse.json(
          { error: '올바른 전화번호 형식이 아닙니다' },
          { status: 400 }
        )
      }

      // 하이픈 포함 형태로 포맷팅
      const formattedPhone = normalizedPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')

      // 해당 전화번호로 등록된 의뢰 조회
      const { data: propertyRequests, error } = await supabase
        .from('property_requests')
        .select('*')
        .eq('inquirer_phone', formattedPhone)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json(
          { 
            error: '의뢰 조회 중 오류가 발생했습니다',
            details: error.message
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        data: propertyRequests || [],
        count: propertyRequests?.length || 0
      })
    }

    // 전화번호가 없는 경우 관리자용 전체 조회
    const propertyRequests = await getAllPropertyRequests()

    return NextResponse.json({
      data: propertyRequests,
      count: propertyRequests.length
    })

  } catch (error) {
    return NextResponse.json(
      { 
        error: '매물 의뢰 목록을 가져오는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE: 매물 의뢰 취소 (삭제) - 전화번호 기반 인증
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const requestId = url.searchParams.get('id')
    const rawPhone = url.searchParams.get('phone')

    // 전화번호 정규화 및 포맷팅
    const normalizedPhone = rawPhone?.replace(/[^\d]/g, '') || ''
    const phone = normalizedPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')

    if (!requestId) {
      return NextResponse.json(
        { error: '의뢰 ID가 필요합니다' },
        { status: 400 }
      )
    }

    if (!phone) {
      return NextResponse.json(
        { error: '전화번호가 필요합니다' },
        { status: 400 }
      )
    }

    // 서버 사이드 Supabase 클라이언트 생성
    const supabase = await createClient()

    // 해당 의뢰가 입력된 전화번호와 일치하는지 확인
    const { data: existingRequest, error: fetchError } = await supabase
      .from('property_requests')
      .select('*')
      .eq('id', requestId)
      .eq('inquirer_phone', phone)
      .single()

    if (fetchError || !existingRequest) {
      return NextResponse.json(
        { 
          error: '해당 의뢰를 찾을 수 없거나 전화번호가 일치하지 않습니다'
        },
        { status: 404 }
      )
    }

    // 의뢰 삭제
    const { data: deleteData, error: deleteError } = await supabase
      .from('property_requests')
      .delete()
      .eq('id', requestId)
      .eq('inquirer_phone', phone)
      .select()

    if (deleteError) {
      return NextResponse.json(
        { 
          error: '의뢰 취소 중 오류가 발생했습니다',
          details: deleteError.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: '의뢰가 성공적으로 취소되었습니다',
        deletedData: deleteData
      },
      { status: 200 }
    )

  } catch (error) {
    return NextResponse.json(
      { 
        error: '의뢰 취소 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}