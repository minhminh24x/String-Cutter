// ==================== STRIPE PAYMENT INTEGRATION ====================
// Cấu hình Stripe - THAY ĐỔI CÁC GIÁ TRỊ NÀY!

const STRIPE_CONFIG = {
    // BƯỚC 1: Lấy Publishable Key từ Stripe Dashboard
    // https://dashboard.stripe.com/apikeys
    publishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE', // Thay bằng key thật

    // BƯỚC 2: Tạo Payment Links từ Stripe Dashboard
    // https://dashboard.stripe.com/payment-links
    paymentLinks: {
        // Tạo 2 Payment Links trong Stripe Dashboard với giá:
        // - Basic: 49,000 VND
        // - Premium: 299,000 VND
        basic: 'https://buy.stripe.com/YOUR_BASIC_LINK', // ~49k VND
        premium: 'https://buy.stripe.com/YOUR_PREMIUM_LINK' // ~299k VND
    },

    // BƯỚC 3: Đặt URLs redirect sau khi thanh toán
    successUrl: window.location.origin + '/success.html',
    cancelUrl: window.location.origin + '/index.html'
};

// ==================== PAYMENT FUNCTIONS ====================

// Khởi tạo Stripe
let stripeInstance = null;

async function initStripe() {
    if (typeof Stripe !== 'undefined' && STRIPE_CONFIG.publishableKey.startsWith('pk_')) {
        stripeInstance = Stripe(STRIPE_CONFIG.publishableKey);
        console.log('✅ Stripe initialized');
        return true;
    }
    console.log('⚠️ Stripe not configured - using demo mode');
    return false;
}

// Xử lý thanh toán thật
async function processRealPayment(planType) {
    // Nếu Stripe chưa config, fallback về demo mode
    if (!STRIPE_CONFIG.publishableKey.startsWith('pk_')) {
        console.log('Demo mode: Simulating payment...');
        return simulatePayment(planType);
    }

    // Redirect đến Stripe Payment Link
    const paymentLink = planType === 'premium'
        ? STRIPE_CONFIG.paymentLinks.premium
        : STRIPE_CONFIG.paymentLinks.basic;

    // Lưu plan vào localStorage để xử lý sau khi redirect về
    localStorage.setItem('pendingPlan', planType);
    localStorage.setItem('paymentStarted', Date.now().toString());

    // Redirect sang Stripe
    window.location.href = paymentLink;
}

// Kiểm tra thanh toán thành công (gọi khi load trang)
function checkPaymentSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const pendingPlan = localStorage.getItem('pendingPlan');

    // Nếu có session_id từ Stripe redirect
    if (sessionId || (window.location.pathname.includes('success') && pendingPlan)) {
        // Unlock plan
        const plan = pendingPlan || 'basic';
        unlockPlan(plan);

        // Clear pending state
        localStorage.removeItem('pendingPlan');
        localStorage.removeItem('paymentStarted');

        // Show success
        showPaymentSuccess(plan);

        // Remove query params
        window.history.replaceState({}, '', window.location.pathname);

        return true;
    }

    return false;
}

// Unlock plan sau khi thanh toán
function unlockPlan(planType) {
    if (planType === 'premium') {
        userPermissions.plan = 'premium';
        userPermissions.characterLimit = true;
        userPermissions.specialCharacters = true;
        userPermissions.copyEnabled = true;
        userPermissions.multiInput = true;
        userPermissions.adFree = true;
        userPermissions.aiAnswer = true;
        userPermissions.historyAccess = true;

        // Premium KHÔNG hết hạn (đã trả tiền thật!)
        // Không gọi startSubscriptionDecay
    } else {
        userPermissions.plan = 'basic';
        userPermissions.characterLimit = true;
        userPermissions.specialCharacters = true;
        userPermissions.copyEnabled = true;
        userPermissions.multiInput = true;
    }

    // Lưu vào localStorage để giữ sau khi refresh
    saveUserPermissions();

    // Update UI
    if (typeof updateUI === 'function') updateUI();

    // Ẩn quảng cáo nếu Premium
    if (planType === 'premium') {
        const adBanner = document.getElementById('adBanner');
        if (adBanner) adBanner.classList.add('hidden');

        // Ẩn PropellerAds nếu có
        hideAllAds();
    }
}

// Lưu permissions vào localStorage
function saveUserPermissions() {
    localStorage.setItem('userPermissions', JSON.stringify(userPermissions));
}

// Load permissions từ localStorage
function loadUserPermissions() {
    const saved = localStorage.getItem('userPermissions');
    if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(userPermissions, parsed);
        return true;
    }
    return false;
}

// Show success message
function showPaymentSuccess(planType) {
    const planName = planType === 'premium' ? 'Premium 👑' : 'Basic ⭐';
    const message = `🎉 Thanh toán thành công! Bạn đã được nâng cấp lên ${planName}!`;

    if (typeof showToast === 'function') {
        showToast(message);
    } else {
        alert(message);
    }

    // Show success modal
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.remove('hidden');
    }
}

// Demo payment simulation (khi chưa config Stripe)
function simulatePayment(planType) {
    return new Promise((resolve) => {
        // Giả lập xử lý 2 giây
        setTimeout(() => {
            unlockPlan(planType);
            showPaymentSuccess(planType);
            resolve(true);
        }, 2000);
    });
}

// Ẩn tất cả quảng cáo (cho Premium users)
function hideAllAds() {
    // Ẩn banner quảng cáo fake
    document.querySelectorAll('.ad-banner, .sidebar-ads').forEach(el => {
        el.style.display = 'none';
    });

    // Ẩn PropellerAds/Adsterra ads nếu có
    document.querySelectorAll('[id^="propeller"], [class*="adsterra"]').forEach(el => {
        el.style.display = 'none';
    });
}

// ==================== KHỞI TẠO ====================

// Chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    // Load saved permissions
    loadUserPermissions();

    // Init Stripe
    initStripe();

    // Check payment success (từ Stripe redirect)
    checkPaymentSuccess();

    // Update UI theo permissions đã lưu
    if (typeof updateUI === 'function') updateUI();

    // Ẩn ads nếu đã Premium
    if (userPermissions.plan === 'premium') {
        hideAllAds();
    }
});
