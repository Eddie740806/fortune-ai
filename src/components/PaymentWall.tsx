'use client';

import { useState } from 'react';
import { pricingConfig } from '@/config/pricing';

interface PaymentWallProps {
  onPaymentSuccess: () => void;
  productType: 'interpretation' | 'followUp';
}

export default function PaymentWall({ onPaymentSuccess, productType }: PaymentWallProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const price = productType === 'interpretation' 
    ? pricingConfig.interpretation.salePrice 
    : pricingConfig.followUp.price;
  
  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // TODO: 串接綠界金流
      // 目前先用模擬成功
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType,
          amount: price,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // 正式環境會跳轉到綠界付款頁面
        // window.location.href = data.paymentUrl;
        
        // 測試模式：直接模擬付款成功
        if (data.testMode) {
          setTimeout(() => {
            onPaymentSuccess();
            setIsProcessing(false);
          }, 1500);
        }
      } else {
        alert('建立訂單失敗：' + data.error);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('付款錯誤:', error);
      alert('付款發生錯誤，請稍後再試');
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative p-6 md:p-8 bg-gradient-to-br from-amber-950/40 via-purple-950/40 to-indigo-950/40 rounded-2xl border-2 border-amber-400/40 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
      {/* 鎖定圖標 */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-amber-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-2xl">🔒</span>
      </div>
      
      <div className="text-center pt-4">
        <h3 className="text-2xl font-bold mb-2">
          <span className="bg-gradient-to-r from-amber-300 to-purple-300 bg-clip-text text-transparent">
            {productType === 'interpretation' ? '解鎖完整解盤' : '追問加購'}
          </span>
        </h3>
        
        <p className="text-gray-400 mb-6">
          {productType === 'interpretation' 
            ? '八字+紫微雙系統深度分析，揭示命運全貌'
            : '針對您的命盤，深度解答任何問題'
          }
        </p>
        
        {/* 價格區 */}
        <div className="mb-6">
          {productType === 'interpretation' && pricingConfig.sale.enabled && (
            <div className="inline-block px-3 py-1 bg-red-500/80 text-white text-sm font-bold rounded-full mb-2">
              {pricingConfig.sale.badge}
            </div>
          )}
          
          <div className="flex items-center justify-center gap-3">
            {productType === 'interpretation' && (
              <span className="text-gray-500 line-through text-xl">
                NT${pricingConfig.interpretation.originalPrice}
              </span>
            )}
            <span className="text-4xl font-bold text-amber-300">
              NT${price}
            </span>
          </div>
          
          {productType === 'interpretation' && (
            <p className="text-purple-300/80 text-sm mt-2">
              含 {pricingConfig.interpretation.includesFollowUps} 次追問
            </p>
          )}
        </div>
        
        {/* 付款按鈕 */}
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full py-4 text-xl font-bold rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-purple-600 text-white hover:from-amber-400 hover:via-amber-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] active:scale-[0.98]"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              處理中...
            </span>
          ) : (
            <span>立即解鎖 🔓</span>
          )}
        </button>
        
        {/* 付款方式 */}
        <div className="mt-4 flex items-center justify-center gap-4 text-gray-500 text-sm">
          <span>💳 信用卡</span>
          <span>🏧 ATM</span>
          <span>🏪 超商</span>
        </div>
        
        {/* 安全提示 */}
        <p className="mt-4 text-gray-600 text-xs">
          🔐 付款由綠界科技安全處理
        </p>
      </div>
    </div>
  );
}
