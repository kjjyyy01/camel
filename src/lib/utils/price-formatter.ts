import { Property } from "@/types/property";

export interface PriceInfo {
  main: string;
  sub?: string;
  detail?: string;
}

/**
 * 매물 가격 정보를 포맷팅하여 반환
 */
export function formatPropertyPrice(property: Property): PriceInfo {
  const { price, deposit, monthly_rent, transaction_type } = property;

  // 매매
  if (transaction_type === "sale" && price) {
    const priceInMan = Math.floor(price / 10000);
    if (priceInMan >= 10000) {
      const eok = Math.floor(priceInMan / 10000);
      const remainingMan = priceInMan % 10000;
      return {
        main: `매매 ${eok}억${remainingMan > 0 ? ` ${remainingMan.toLocaleString()}만원` : "원"}`,
        detail: `총 ${price.toLocaleString()}원`,
      };
    } else {
      return {
        main: `매매 ${priceInMan.toLocaleString()}만원`,
        detail: `총 ${price.toLocaleString()}원`,
      };
    }
  }

  // 전세
  if (transaction_type === "jeonse" && deposit) {
    const depositInMan = Math.floor(deposit / 10000);
    if (depositInMan >= 10000) {
      const eok = Math.floor(depositInMan / 10000);
      const remainingMan = depositInMan % 10000;
      return {
        main: `전세 ${eok}억${remainingMan > 0 ? ` ${remainingMan.toLocaleString()}만원` : "원"}`,
        detail: `보증금 ${deposit.toLocaleString()}원`,
      };
    } else {
      return {
        main: `전세 ${depositInMan.toLocaleString()}만원`,
        detail: `보증금 ${deposit.toLocaleString()}원`,
      };
    }
  }

  // 월세
  if (transaction_type === "rent" && deposit && monthly_rent) {
    const depositInMan = Math.floor(deposit / 10000);
    return {
      main: `월세 ${depositInMan.toLocaleString()}만원`,
      sub: `월 ${monthly_rent.toLocaleString()}만원`,
      detail: `보증금 ${deposit.toLocaleString()}원 + 월세 ${(monthly_rent * 10000).toLocaleString()}원`,
    };
  }

  // 임대료만 있는 경우
  if (monthly_rent && !deposit) {
    return {
      main: `임대료 월 ${monthly_rent.toLocaleString()}만원`,
    };
  }

  // 보증금만 있는 경우
  if (deposit && !monthly_rent) {
    const depositInMan = Math.floor(deposit / 10000);
    return {
      main: `보증금 ${depositInMan.toLocaleString()}만원`,
      detail: `총 ${deposit.toLocaleString()}원`,
    };
  }

  return { main: "가격 문의" };
}

/**
 * 면적 정보를 포맷팅하여 반환
 */
export function formatArea(area: number): { sqm: string; pyeong: string } {
  const pyeong = Math.round(area * 0.3025);
  return {
    sqm: `${area}㎡`,
    pyeong: `${pyeong}평`,
  };
}

/**
 * 층수 정보를 포맷팅하여 반환
 */
export function formatFloor(floor?: number | string): string {
  if (!floor) return "-";
  
  if (typeof floor === "string") {
    return floor.includes("층") ? floor : `${floor}층`;
  }
  
  if (floor === 0) return "지상층";
  if (floor < 0) return `지하 ${Math.abs(floor)}층`;
  
  return `${floor}층`;
}