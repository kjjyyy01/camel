"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useLikesStore from "@/stores/likes-store";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ArrowLeft, X } from "lucide-react";
import { Property } from "@/types/property";
import { generateMockProperties } from "@/lib/utils/data-normalizer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLikesHydration } from "@/hooks/use-likes-hydration";

export default function LikesPage() {
  const router = useRouter();
  const { getLikedProperties, clearAllLikes } = useLikesStore();
  const isHydrated = useLikesStore(state => state.isHydrated);
  const [likedProperties, setLikedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  useLikesHydration();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadLikedProperties = () => {
      if (!mounted || !isHydrated) return;
      
      try {
        setIsLoading(true);
        
        // Mock 데이터에서 좋아요한 매물 정보 가져오기
        const mockProperties = generateMockProperties();
        const likedIds = getLikedProperties().map(p => p.id);
        const fullProperties = mockProperties.filter(p => likedIds.includes(p.id));
        
        setLikedProperties(fullProperties);
      } catch (error) {
        console.error("좋아요한 매물 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLikedProperties();
    
    // Zustand 스토어 구독하여 변경사항 감지
    const unsubscribe = useLikesStore.subscribe(loadLikedProperties);
    
    return () => unsubscribe();
  }, [mounted, isHydrated, getLikedProperties]);

  const handleClearAll = () => {
    clearAllLikes();
    setLikedProperties([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">돌아가기</span>
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                <h1 className="text-xl font-bold">좋아요한 매물</h1>
                <span className="text-sm text-gray-500">({likedProperties.length}개)</span>
              </div>
            </div>
            
            {likedProperties.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">전체 삭제</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>좋아요 목록 전체 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      모든 좋아요한 매물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAll}>삭제</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="container mx-auto px-4 py-8">
        {likedProperties.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">좋아요한 매물이 없습니다</h2>
              <p className="text-gray-500 mb-6">
                마음에 드는 매물을 찾아 하트를 눌러보세요!
              </p>
              <Button onClick={() => router.push("/properties")}>
                매물 둘러보기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedProperties.map((property) => (
              <PropertyCard 
                key={property.id}
                property={property}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}