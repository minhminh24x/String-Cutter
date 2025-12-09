// ==================== STRIPE PAYMENT INTEGRATION ====================
// Configured for: https://string-cutter-kappa.vercel.app/

const STRIPE_CONFIG = {
    // Stripe Payment Links - TẠO THÊM CÁC LINK NÀY TRONG STRIPE DASHBOARD
    paymentLinks: {
        // Gói chính
        basic: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00',     // 49,000đ
        premium: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00',   // 299,000đ (tạo link mới)

        // Các tính năng riêng lẻ (cần tạo thêm links trong Stripe)
        unlockCopy: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00',        // 19,000đ
        unlockHistory: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00',     // 29,000đ  
        unlockMultiInput: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00',  // 19,000đ
        unlockSpecialChars: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00',// 9,000đ
        unlockNoCharLimit: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00', // 29,000đ
        unlockClickTax: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00',    // 49,000đ
        aiAnswer: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00',          // 5,000đ
        clearHistory: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00'       // 199,000đ
    },

    // Giá VND cho hiển thị
    prices: {
        basic: '49,000đ',
        premium: '299,000đ',
        unlockCopy: '19,000đ',
        unlockHistory: '29,000đ',
        unlockMultiInput: '19,000đ',
        unlockSpecialChars: '9,000đ',
        unlockNoCharLimit: '29,000đ',
        unlockClickTax: '49,000đ',
        aiAnswer: '5,000đ',
        clearHistory: '199,000đ'
    },

    // URLs redirect
    baseUrl: 'https://string-cutter-kappa.vercel.app',
    successUrl: 'https://string-cutter-kappa.vercel.app/success.html',
    cancelUrl: 'https://string-cutter-kappa.vercel.app/index.html'
};

// ==================== PAYMENT FUNCTIONS ====================

// Xử lý thanh toán thật - redirect đến Stripe
function processRealPayment(featureType) {
    const paymentLink = STRIPE_CONFIG.paymentLinks[featureType];

    if (!paymentLink || paymentLink.includes('YOUR_')) {
        console.error('Payment link not configured for:', featureType);
        showToast('Lỗi cấu hình thanh toán!', 'error');
        return;
    }

    // Lưu thông tin để xử lý sau redirect
    localStorage.setItem('pendingFeature', featureType);
    localStorage.setItem('paymentStarted', Date.now().toString());

    // Mở Stripe Payment Link trong tab mới hoặc redirect
    window.open(paymentLink, '_blank');

    // Hiển thị thông báo
    showToast('Đang mở trang thanh toán... 💳');

    // Sau 3 giây, nhắc user confirm
    setTimeout(() => {
        if (confirm('Bạn đã hoàn tất thanh toán?')) {
            unlockFeature(featureType);
            showPaymentSuccess(featureType);
        } else {
            showToast('Thanh toán bị hủy!', 'warning');
            localStorage.removeItem('pendingFeature');
        }
    }, 3000);
}

// Unlock tính năng cụ thể
function unlockFeature(featureType) {
    switch (featureType) {
        case 'premium':
            userPermissions.plan = 'premium';
            userPermissions.characterLimit = true;
            userPermissions.specialCharacters = true;
            userPermissions.copyEnabled = true;
            userPermissions.multiInput = true;
            userPermissions.adFree = true;
            userPermissions.aiAnswer = true;
            userPermissions.historyAccess = true;
            clickTaxPaid = true;
            hideAllAds();
            break;

        case 'basic':
            userPermissions.plan = 'basic';
            userPermissions.characterLimit = true;
            userPermissions.specialCharacters = true;
            userPermissions.copyEnabled = true;
            userPermissions.multiInput = true;
            break;

        case 'unlockCopy':
            userPermissions.copyEnabled = true;
            break;

        case 'unlockHistory':
            userPermissions.historyAccess = true;
            break;

        case 'unlockMultiInput':
            userPermissions.multiInput = true;
            break;

        case 'unlockSpecialChars':
            userPermissions.specialCharacters = true;
            break;

        case 'unlockNoCharLimit':
            userPermissions.characterLimit = true;
            break;

        case 'unlockClickTax':
            clickTaxPaid = true;
            clickCount = 0;
            MAX_FREE_CLICKS = 999999;
            break;

        case 'aiAnswer':
            userPermissions.aiAnswer = true;
            break;

        case 'clearHistory':
            // Đã mua quyền xóa
            history = [];
            localStorage.removeItem('cutHistory');
            if (typeof renderHistory === 'function') renderHistory();
            break;
    }

    saveUserPermissions();
    if (typeof updateUI === 'function') updateUI();
}

// Lưu permissions vào localStorage
function saveUserPermissions() {
    localStorage.setItem('userPermissions', JSON.stringify(userPermissions));
    localStorage.setItem('clickTaxPaid', clickTaxPaid.toString());
}

// Load permissions từ localStorage
function loadUserPermissions() {
    const saved = localStorage.getItem('userPermissions');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            Object.assign(userPermissions, parsed);
        } catch (e) {
            console.error('Error loading permissions:', e);
        }
    }

    // Load click tax status
    const clickTaxSaved = localStorage.getItem('clickTaxPaid');
    if (clickTaxSaved === 'true') {
        clickTaxPaid = true;
        MAX_FREE_CLICKS = 999999;
    }

    return saved !== null;
}

// Show success message
function showPaymentSuccess(featureType) {
    const featureNames = {
        basic: 'Gói Basic ⭐',
        premium: 'Gói Premium 👑',
        unlockCopy: 'Sao chép kết quả 📋',
        unlockHistory: 'Lịch sử cắt 📜',
        unlockMultiInput: 'Multi-input 📝',
        unlockSpecialChars: 'Ký tự đặc biệt ✨',
        unlockNoCharLimit: 'Không giới hạn ký tự ∞',
        unlockClickTax: 'Click không giới hạn 🖱️',
        aiAnswer: 'AI trả lời 🤖',
        clearHistory: 'Xóa lịch sử 🗑️'
    };

    const name = featureNames[featureType] || featureType;
    showToast(`🎉 Đã mở khóa: ${name}!`);

    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.remove('hidden');
    }
}

// Ẩn tất cả quảng cáo (cho Premium)
function hideAllAds() {
    document.querySelectorAll('.ad-banner, .sidebar-ads, [id*="monetag"], [class*="monetag"]').forEach(el => {
        el.style.display = 'none';
    });
}

// Hiển thị modal thanh toán với giá thật
function showRealPaymentModal(featureType, title, description) {
    const price = STRIPE_CONFIG.prices[featureType] || '???';

    showPaymentModal(
        title,
        description,
        price,
        price,
        null,
        () => { }
    );

    // Override pay button
    payBtn.onclick = () => {
        paymentModal.classList.add('hidden');
        processRealPayment(featureType);
    };
}

// ==================== KHỞI TẠO ====================

document.addEventListener('DOMContentLoaded', () => {
    loadUserPermissions();

    if (typeof updateUI === 'function') updateUI();

    if (userPermissions.plan === 'premium' || userPermissions.adFree) {
        hideAllAds();
    }
});
