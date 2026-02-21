/**
 * 好運大師 - 定價設定
 */

export const pricingConfig = {
  // 完整解盤
  interpretation: {
    originalPrice: 399,
    salePrice: 199,
    includesFollowUps: 1,  // 含 1 次追問
    description: '八字+紫微深度分析',
  },
  
  // 追問加購
  followUp: {
    price: 69,
    description: '針對命盤深度回答',
  },
  
  // 限時特價設定
  sale: {
    enabled: true,
    badge: '限時特價',
    endDate: null,  // null = 永久
  },
};

export type PricingConfig = typeof pricingConfig;
