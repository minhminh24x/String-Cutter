// ==================== MONETAG AD INTEGRATION ====================
// Đăng ký tại: https://publishers.monetag.com
// Dashboard: https://publishers.monetag.com/dashboard

const AD_CONFIG = {
    // Ad Network: monetag
    network: 'monetag',

    // Monetag Config - LẤY TỪ DASHBOARD SAU KHI ĐĂNG KÝ
    monetag: {
        // 1. Đăng ký website tại https://publishers.monetag.com
        // 2. Add site: string-cutter-kappa.vercel.app
        // 3. Chọn ad formats và lấy codes

        // Zone IDs - thay bằng IDs thật từ dashboard
        zones: {
            banner: 'YOUR_BANNER_ZONE_ID',      // In-Page Push hoặc Banner
            push: 'YOUR_PUSH_ZONE_ID',          // Web Push Notifications
            interstitial: 'YOUR_INTERSTITIAL_ID', // Interstitial/Popunder
            vignette: 'YOUR_VIGNETTE_ID'        // Vignette ads
        },

        // Site ID từ dashboard
        siteId: 'YOUR_SITE_ID',

        // Enable các loại ads
        formats: {
            inPagePush: true,      // In-page push (không cần permission)
            webPush: true,         // Web push notifications
            interstitial: true,    // Interstitial ads
            vignette: false        // Vignette banner
        }
    },

    // Tần suất hiển thị
    frequency: {
        interstitialAfterCuts: 5,   // Hiện interstitial sau mỗi 5 lần cắt
        pushPromptDelay: 30000      // Prompt push sau 30s
    }
};

// ==================== MONETAG INITIALIZATION ====================

function initMonetag() {
    if (AD_CONFIG.network !== 'monetag') return;

    // Không load ads cho Premium users
    if (userPermissions && (userPermissions.plan === 'premium' || userPermissions.adFree)) {
        console.log('👑 Premium user - skipping ads');
        return;
    }

    console.log('📺 Initializing Monetag ads...');

    // Load different ad formats
    if (AD_CONFIG.monetag.formats.inPagePush) {
        loadInPagePush();
    }

    if (AD_CONFIG.monetag.formats.webPush) {
        loadWebPush();
    }

    if (AD_CONFIG.monetag.formats.interstitial) {
        loadInterstitial();
    }
}

// In-Page Push Ads (không cần permission)
function loadInPagePush() {
    /*
    HƯỚNG DẪN: 
    1. Vào Monetag Dashboard > Sites > Your Site > Ad Units
    2. Tạo "In-Page Push" ad unit
    3. Copy code và paste vào đây
    
    Code mẫu từ Monetag:
    */

    // Uncomment và thay bằng code thật từ Monetag:
    /*
    (function(d,z,s){
        s.src='https://'+d+'/400/'+z;
        try{
            (document.body||document.documentElement).appendChild(s)
        }catch(e){}
    })('grsjauede.net', YOUR_ZONE_ID, document.createElement('script'));
    */

    console.log('ℹ️ In-Page Push: Chưa cấu hình - thêm code từ Monetag dashboard');
}

// Web Push Notifications
function loadWebPush() {
    /*
    HƯỚNG DẪN:
    1. Vào Monetag Dashboard > Sites > Your Site > Ad Units
    2. Tạo "Push Notifications" ad unit
    3. Copy script và paste vào đây
    
    Code mẫu:
    */

    // Uncomment và thay bằng code thật:
    /*
    var script = document.createElement('script');
    script.src = 'https://yoursite.monetag.com/push/YOUR_PUSH_ID';
    script.async = true;
    document.head.appendChild(script);
    */

    console.log('ℹ️ Web Push: Chưa cấu hình - thêm code từ Monetag dashboard');
}

// Interstitial Ads (popunder)
function loadInterstitial() {
    /*
    HƯỚNG DẪN:
    1. Vào Monetag Dashboard > Sites > Your Site > Ad Units  
    2. Tạo "Interstitial" hoặc "Popunder" ad unit
    3. Copy code
    
    Code mẫu:
    */

    // Uncomment và thay bằng code thật:
    /*
    (function(d,z,s){
        s.src='https://'+d+'/401/'+z;
        try{
            (document.body||document.documentElement).appendChild(s)
        }catch(e){}
    })('grsjauede.net', YOUR_INTERSTITIAL_ZONE, document.createElement('script'));
    */

    console.log('ℹ️ Interstitial: Chưa cấu hình - thêm code từ Monetag dashboard');
}

// ==================== INTERSTITIAL AD (Custom fallback) ====================

let cutCounter = 0;

function maybeShowInterstitialAd() {
    // Không hiện cho Premium/adFree users
    if (userPermissions && (userPermissions.plan === 'premium' || userPermissions.adFree)) {
        return;
    }

    cutCounter++;

    if (cutCounter >= AD_CONFIG.frequency.interstitialAfterCuts) {
        cutCounter = 0;
        showCustomInterstitial();
    }
}

function showCustomInterstitial() {
    // Tạo custom interstitial fallback
    const overlay = document.createElement('div');
    overlay.id = 'customInterstitial';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    overlay.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 2rem; border-radius: 20px; text-align: center; max-width: 400px; border: 2px solid #6366f1;">
            <p style="color: #888; font-size: 0.75rem; margin-bottom: 1rem;">QUẢNG CÁO</p>
            
            <div style="background: #0a0a1a; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                <p style="color: #ffd700; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">
                    💎 NÂNG CẤP PREMIUM
                </p>
                <p style="color: #9ca3af; font-size: 0.9rem; margin-bottom: 1rem;">
                    Chỉ 299,000đ - Mở khóa tất cả tính năng!
                </p>
                <button id="adUpgradeBtn" style="padding: 0.75rem 2rem; background: linear-gradient(135deg, #ffd700, #ffa500); border: none; border-radius: 8px; color: #000; font-weight: 700; cursor: pointer;">
                    👑 MUA NGAY
                </button>
            </div>
            
            <button id="closeInterstitialBtn" style="padding: 0.75rem 2rem; background: rgba(100,100,100,0.3); border: 1px solid #444; border-radius: 8px; color: #888; cursor: pointer; font-size: 0.85rem;">
                Tiếp tục sau <span id="adTimer">5</span>s
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Countdown
    let countdown = 5;
    const timerEl = document.getElementById('adTimer');
    const closeBtn = document.getElementById('closeInterstitialBtn');
    const upgradeBtn = document.getElementById('adUpgradeBtn');

    closeBtn.disabled = true;

    const timer = setInterval(() => {
        countdown--;
        if (timerEl) timerEl.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(timer);
            closeBtn.disabled = false;
            closeBtn.textContent = '✕ Đóng';
            closeBtn.style.color = '#fff';
        }
    }, 1000);

    closeBtn.addEventListener('click', () => {
        if (!closeBtn.disabled) {
            overlay.remove();
        }
    });

    upgradeBtn.addEventListener('click', () => {
        overlay.remove();
        if (typeof processRealPayment === 'function') {
            processRealPayment('premium');
        }
    });
}

// ==================== KHỞI TẠO ====================

function initAds() {
    // Delay để load permissions trước
    setTimeout(() => {
        initMonetag();
    }, 1000);
}

document.addEventListener('DOMContentLoaded', initAds);

// Export cho global use
if (typeof window !== 'undefined') {
    window.maybeShowInterstitialAd = maybeShowInterstitialAd;
}
