// ==================== QUẢNG CÁO THẬT - AD NETWORK INTEGRATION ====================
// Hỗ trợ: PropellerAds, Adsterra, hoặc tự host

const AD_CONFIG = {
    // Chọn ad network: 'propellerads', 'adsterra', 'self', 'none'
    network: 'propellerads',

    // PropellerAds Config
    // Đăng ký tại: https://propellerads.com
    propellerads: {
        // Sau khi đăng ký, lấy Zone ID từ dashboard
        zoneId: 'YOUR_ZONE_ID', // Thay bằng Zone ID thật
        // Các loại quảng cáo
        formats: {
            banner: true,      // Banner ads
            push: true,        // Push notifications
            interstitial: true // Popup giữa các action
        }
    },

    // Adsterra Config
    // Đăng ký tại: https://adsterra.com
    adsterra: {
        publisherId: 'YOUR_PUBLISHER_ID',
        bannerId: 'YOUR_BANNER_ID',
        popunderId: 'YOUR_POPUNDER_ID'
    },

    // Self-hosted ads (quảng cáo tự host)
    self: {
        banners: [
            {
                image: 'https://your-server.com/ads/banner1.jpg',
                link: 'https://your-affiliate-link.com',
                alt: 'Quảng cáo 1'
            },
            {
                image: 'https://your-server.com/ads/banner2.jpg',
                link: 'https://your-affiliate-link.com',
                alt: 'Quảng cáo 2'
            }
        ]
    },

    // Tần suất hiển thị ads
    frequency: {
        interstitialAfterCuts: 5,  // Hiện popup sau mỗi 5 lần cắt
        bannerRefreshSeconds: 60   // Refresh banner mỗi 60 giây
    }
};

// ==================== PROPELLERADS INTEGRATION ====================

function initPropellerAds() {
    if (AD_CONFIG.network !== 'propellerads') return;
    if (AD_CONFIG.propellerads.zoneId === 'YOUR_ZONE_ID') {
        console.log('⚠️ PropellerAds chưa được cấu hình');
        return;
    }

    // Push Notifications (Cần user consent)
    if (AD_CONFIG.propellerads.formats.push) {
        loadPropellerPush();
    }

    // Banner ads
    if (AD_CONFIG.propellerads.formats.banner) {
        loadPropellerBanner();
    }

    console.log('✅ PropellerAds initialized');
}

function loadPropellerPush() {
    // PropellerAds Push Notification script
    // Lấy code này từ dashboard PropellerAds sau khi đăng ký
    const script = document.createElement('script');
    script.src = `//propellerads.com/nacl.js?z=${AD_CONFIG.propellerads.zoneId}`;
    script.async = true;
    document.head.appendChild(script);
}

function loadPropellerBanner() {
    // Banner sẽ load vào các container có class 'ad-slot'
    const adSlots = document.querySelectorAll('.ad-slot');
    adSlots.forEach(slot => {
        const iframe = document.createElement('iframe');
        iframe.src = `//propellerads.com/banner/${AD_CONFIG.propellerads.zoneId}`;
        iframe.width = slot.dataset.width || '300';
        iframe.height = slot.dataset.height || '250';
        iframe.frameBorder = '0';
        iframe.scrolling = 'no';
        slot.appendChild(iframe);
    });
}

// ==================== ADSTERRA INTEGRATION ====================

function initAdsterra() {
    if (AD_CONFIG.network !== 'adsterra') return;
    if (AD_CONFIG.adsterra.publisherId === 'YOUR_PUBLISHER_ID') {
        console.log('⚠️ Adsterra chưa được cấu hình');
        return;
    }

    // Social Bar (floating ad)
    const script = document.createElement('script');
    script.src = `//www.highperformancedformats.com/${AD_CONFIG.adsterra.publisherId}/invoke.js`;
    script.async = true;
    document.head.appendChild(script);

    console.log('✅ Adsterra initialized');
}

// ==================== SELF-HOSTED ADS ====================

function initSelfAds() {
    if (AD_CONFIG.network !== 'self') return;

    const adSlots = document.querySelectorAll('.ad-slot');
    const banners = AD_CONFIG.self.banners;

    adSlots.forEach((slot, index) => {
        const banner = banners[index % banners.length];
        slot.innerHTML = `
            <a href="${banner.link}" target="_blank" rel="noopener sponsored">
                <img src="${banner.image}" alt="${banner.alt}" style="max-width:100%;">
            </a>
        `;
    });

    // Rotate banners
    setInterval(() => {
        adSlots.forEach((slot, index) => {
            const randomBanner = banners[Math.floor(Math.random() * banners.length)];
            slot.innerHTML = `
                <a href="${randomBanner.link}" target="_blank" rel="noopener sponsored">
                    <img src="${randomBanner.image}" alt="${randomBanner.alt}" style="max-width:100%;">
                </a>
            `;
        });
    }, AD_CONFIG.frequency.bannerRefreshSeconds * 1000);

    console.log('✅ Self-hosted ads initialized');
}

// ==================== INTERSTITIAL ADS ====================

let cutCounter = 0;

function maybeShowInterstitialAd() {
    // Không hiện cho Premium users
    if (userPermissions && userPermissions.plan === 'premium') return;

    cutCounter++;

    if (cutCounter >= AD_CONFIG.frequency.interstitialAfterCuts) {
        cutCounter = 0;
        showInterstitialAd();
    }
}

function showInterstitialAd() {
    // Tạo interstitial overlay
    const overlay = document.createElement('div');
    overlay.id = 'interstitialAd';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    `;

    // Content
    overlay.innerHTML = `
        <div style="background: #1a1a2e; padding: 2rem; border-radius: 16px; text-align: center; max-width: 400px;">
            <p style="color: #888; margin-bottom: 1rem; font-size: 0.8rem;">QUẢNG CÁO</p>
            <div class="ad-slot" data-width="300" data-height="250" style="margin-bottom: 1rem; min-height: 250px; background: #0a0a1a; display: flex; align-items: center; justify-content: center; color: #666;">
                [Ad sẽ hiển thị ở đây]
            </div>
            <button id="closeInterstitial" style="padding: 0.75rem 2rem; background: linear-gradient(135deg, #6366f1, #a855f7); border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                Tiếp tục sau <span id="adCountdown">5</span>s
            </button>
            <p style="color: #ffd700; margin-top: 1rem; font-size: 0.85rem;">
                💎 Nâng cấp Premium để tắt quảng cáo!
            </p>
        </div>
    `;

    document.body.appendChild(overlay);

    // Countdown
    let countdown = 5;
    const countdownEl = document.getElementById('adCountdown');
    const closeBtn = document.getElementById('closeInterstitial');

    closeBtn.disabled = true;
    closeBtn.style.opacity = '0.5';

    const timer = setInterval(() => {
        countdown--;
        countdownEl.textContent = countdown;

        if (countdown <= 0) {
            clearInterval(timer);
            closeBtn.disabled = false;
            closeBtn.style.opacity = '1';
            closeBtn.textContent = 'Đóng quảng cáo';
        }
    }, 1000);

    closeBtn.addEventListener('click', () => {
        if (!closeBtn.disabled) {
            overlay.remove();
        }
    });

    // Load ad vào slot
    if (AD_CONFIG.network === 'propellerads') {
        loadPropellerBanner();
    } else if (AD_CONFIG.network === 'self') {
        const slot = overlay.querySelector('.ad-slot');
        const banner = AD_CONFIG.self.banners[Math.floor(Math.random() * AD_CONFIG.self.banners.length)];
        slot.innerHTML = `
            <a href="${banner.link}" target="_blank" rel="noopener sponsored">
                <img src="${banner.image}" alt="${banner.alt}" style="max-width:100%;">
            </a>
        `;
    }
}

// ==================== KHỞI TẠO ====================

function initAds() {
    // Không init cho Premium users
    if (userPermissions && userPermissions.plan === 'premium') {
        console.log('👑 Premium user - skipping ads');
        return;
    }

    switch (AD_CONFIG.network) {
        case 'propellerads':
            initPropellerAds();
            break;
        case 'adsterra':
            initAdsterra();
            break;
        case 'self':
            initSelfAds();
            break;
        case 'none':
            console.log('ℹ️ Ads disabled');
            break;
        default:
            console.log('⚠️ Unknown ad network');
    }
}

// Chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    // Delay để load user permissions trước
    setTimeout(initAds, 500);
});

// Export để dùng từ features.js
if (typeof window !== 'undefined') {
    window.maybeShowInterstitialAd = maybeShowInterstitialAd;
}
