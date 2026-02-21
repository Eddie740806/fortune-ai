import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 綠界設定（測試環境）
const ECPAY_CONFIG = {
  // 正式環境：填入你的商店資訊
  MerchantID: process.env.ECPAY_MERCHANT_ID || '3002607',  // 測試商店代號
  HashKey: process.env.ECPAY_HASH_KEY || 'pwFHCqoQZGmho4w6',  // 測試 HashKey
  HashIV: process.env.ECPAY_HASH_IV || 'EkRm7iFT261dpevs',  // 測試 HashIV
  
  // API 網址
  ApiUrl: process.env.ECPAY_API_URL || 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
  
  // 是否為測試模式
  TestMode: !process.env.ECPAY_MERCHANT_ID,
};

// 產生訂單編號
function generateOrderId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HY${dateStr}${timeStr}${random}`;
}

// 綠界 CheckMacValue 計算
function generateCheckMacValue(params: Record<string, string>): string {
  // 1. 按照 A-Z 排序
  const sortedKeys = Object.keys(params).sort();
  
  // 2. 組成 QueryString
  let queryString = `HashKey=${ECPAY_CONFIG.HashKey}`;
  for (const key of sortedKeys) {
    queryString += `&${key}=${params[key]}`;
  }
  queryString += `&HashIV=${ECPAY_CONFIG.HashIV}`;
  
  // 3. URL Encode（小寫）
  queryString = encodeURIComponent(queryString).toLowerCase();
  
  // 4. 轉換特殊字元（綠界規定）
  queryString = queryString
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%20/g, '+');
  
  // 5. SHA256 加密後轉大寫
  const hash = crypto.createHash('sha256').update(queryString).digest('hex').toUpperCase();
  
  return hash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productType, amount } = body;
    
    // 驗證參數
    if (!productType || !amount) {
      return NextResponse.json(
        { success: false, error: '缺少必要參數' },
        { status: 400 }
      );
    }
    
    // 產生訂單編號
    const orderId = generateOrderId();
    
    // 商品名稱
    const itemName = productType === 'interpretation' 
      ? '好運大師-完整解盤' 
      : '好運大師-追問加購';
    
    // 測試模式：直接回傳成功
    if (ECPAY_CONFIG.TestMode) {
      console.log('📌 測試模式：模擬付款成功');
      console.log('訂單編號:', orderId);
      console.log('商品:', itemName);
      console.log('金額:', amount);
      
      return NextResponse.json({
        success: true,
        testMode: true,
        orderId,
        message: '測試模式：付款模擬成功',
      });
    }
    
    // 正式模式：產生綠界付款參數
    const now = new Date();
    const tradeDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://haoyundashi.vercel.app';
    
    const params: Record<string, string> = {
      MerchantID: ECPAY_CONFIG.MerchantID,
      MerchantTradeNo: orderId,
      MerchantTradeDate: tradeDate,
      PaymentType: 'aio',
      TotalAmount: String(amount),
      TradeDesc: encodeURIComponent('好運大師命理服務'),
      ItemName: itemName,
      ReturnURL: `${baseUrl}/api/payment/callback`,
      ClientBackURL: `${baseUrl}/payment/success?orderId=${orderId}`,
      ChoosePayment: 'ALL',
      EncryptType: '1',
    };
    
    // 計算檢查碼
    params.CheckMacValue = generateCheckMacValue(params);
    
    // 回傳付款資訊
    return NextResponse.json({
      success: true,
      testMode: false,
      orderId,
      paymentUrl: ECPAY_CONFIG.ApiUrl,
      params,
    });
    
  } catch (error) {
    console.error('建立訂單錯誤:', error);
    return NextResponse.json(
      { success: false, error: '建立訂單失敗' },
      { status: 500 }
    );
  }
}
