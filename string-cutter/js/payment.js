// ==================== STRIPE PAYMENT INTEGRATION ====================
// CẤU HÌNH STRIPE - ĐÃ CẬP NHẬT VỚI LINK THẬT

const STRIPE_CONFIG = {
    // Stripe Publishable Key (Test mode)
    publishableKey: 'pk_test_51234567890', // Sẽ cập nhật khi có key thật

    // Payment Links từ Stripe Dashboard
    paymentLinks: {
        // Gói chính
        basic: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00',      // 49,000đ
        premium: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00',    // 299,000đ - Cần tạo link riêng

        // Các gói nhỏ lẻ
        unlockCopy: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00', // 19,000đ
        unlockMultiInput: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00', // 29,000đ
        unlockHistory: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00', // 39,000đ
        unlockSpecialChars: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00', // 25,000đ
        unlockClicks: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00', // 15,000đ
        unlockAI: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00', // 49,000đ
        clearHistory: 'https://buy.stripe.com/test_6oU8wR1Nz51Pbyu293dQQ00' // 9,000đ
    },

    // URLs redirect (Vercel)
    successUrl: 'https://your-app.vercel.app/success.html',
    cancelUrl: 'https://your-app.vercel.app/index.html'
};

// Bảng giá VND
const PRICES_VND = {
    basic: { amount: 49000, display: '49,000đ', name: 'Gói Basic' },
    premium: { amount: 299000, display: '299,000đ', name: 'Gói Premium' },
    unlockCopy: { amount: 19000, display: '19,000đ', name: 'Mở khóa Copy' },
    unlockMultiInput: { amount: 29000, display: '29,000đ', name: 'Mở khóa Multi-Input' },
    unlockHistory: { amount: 39000, display: '39,000đ', name: 'Mở khóa Lịch sử' },
    unlockSpecialChars: { amount: 25000, display: '25,000đ', name: 'Mở khóa Ký tự đặc biệt' },
    unlockClicks: { amount: 15000, display: '15,000đ', name: 'Mở khóa Click vô hạn' },
    unlockAI: { amount: 49000, display: '49,000đ', name: 'Mở khóa AI' },
    clearHistory: { amount: 9000, display: '9,000đ', name: 'Xóa lịch sử' }
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
    console.log('⚠️ Stripe ready for Payment Links');
    return true;
}

// Xử lý thanh toán thật
async function processRealPayment(productId) {
    const paymentLink = STRIPE_CONFIG.paymentLinks[productId];

    if (!paymentLink || paymentLink.includes('YOUR_')) {
        console.log('Demo mode: Simulating payment...');
        return simulatePayment(productId);
    }

    // Lưu product vào localStorage để xử lý sau khi redirect về
    localStorage.setItem('pendingProduct', productId);
    localStorage.setItem('paymentStarted', Date.now().toString());

    // Redirect sang Stripe
    window.location.href = paymentLink;
}

// Kiểm tra thanh toán thành công (gọi khi load trang)
function checkPaymentSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const pendingProduct = localStorage.getItem('pendingProduct');

    if (sessionId || (window.location.pathname.includes('success') && pendingProduct)) {
        const product = pendingProduct || 'basic';
        unlockProduct(product);

        localStorage.removeItem('pendingProduct');
        localStorage.removeItem('paymentStarted');

        showPaymentSuccess(product);
        window.history.replaceState({}, '', window.location.pathname);

        return true;
    }

    return false;
}

// Unlock sản phẩm sau khi thanh toán
function unlockProduct(productId) {
    switch (productId) {
        case 'premium':
            userPermissions.plan = 'premium';
            userPermissions.characterLimit = true;
            userPermissions.specialCharacters = true;
            userPermissions.copyEnabled = true;
            userPermissions.multiInput = true;
            userPermissions.adFree = true;
            userPermissions.aiAnswer = true;
            userPermissions.historyAccess = true;
            userPermissions.unlimitedClicks = true;
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

        case 'unlockMultiInput':
            userPermissions.multiInput = true;
            break;

        case 'unlockHistory':
            userPermissions.historyAccess = true;
            break;

        case 'unlockSpecialChars':
            userPermissions.specialCharacters = true;
            break;

        case 'unlockClicks':
            userPermissions.unlimitedClicks = true;
            clickCount = 0;
            MAX_FREE_CLICKS = 999999;
            break;

        case 'unlockAI':
            userPermissions.aiAnswer = true;
            break;

        case 'clearHistory':
            // Cho phép xóa một lần
            userPermissions.clearHistoryEnabled = true;
            break;
    }

    saveUserPermissions();
    if (typeof updateUI === 'function') updateUI();
}

// Lưu permissions vào localStorage (VĨNH VIỄN vì đã trả tiền!)
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
function showPaymentSuccess(productId) {
    const product = PRICES_VND[productId];
    const message = `🎉 Thanh toán thành công! ${product?.name || 'Sản phẩm'} đã được mở khóa!`;

    if (typeof showToast === 'function') {
        showToast(message);
    } else {
        alert(message);
    }

    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.remove('hidden');
    }
}

// Demo payment simulation (Test mode)
function simulatePayment(productId) {
    return new Promise((resolve) => {
        setTimeout(() => {
            unlockProduct(productId);
            showPaymentSuccess(productId);
            resolve(true);
        }, 1500);
    });
}

// Ẩn tất cả quảng cáo (cho Premium users)
function hideAllAds() {
    document.querySelectorAll('.ad-banner, .sidebar-ads, [id*="monetag"]').forEach(el => {
        el.style.display = 'none';
    });
}

// ==================== HELPER: Show Payment Modal cho từng feature ====================

function showFeaturePaymentModal(productId, callback) {
    const product = PRICES_VND[productId];
    if (!product) return;

    showPaymentModal(
        `🔓 ${product.name}`,
        `Thanh toán ${product.display} để mở khóa tính năng này vĩnh viễn!`,
        product.display,
        product.display,
        null,
        callback
    );

    // Override pay button
    payBtn.onclick = async () => {
        const payText = payBtn.querySelector('.pay-text');
        const spinner = payBtn.querySelector('.loading-spinner');
        if (payText) payText.textContent = 'Đang xử lý...';
        if (spinner) spinner.classList.remove('hidden');
        payBtn.disabled = true;

        paymentModal.classList.add('hidden');
        await processRealPayment(productId);

        if (payText) payText.textContent = '💳 THANH TOÁN';
        if (spinner) spinner.classList.add('hidden');
        payBtn.disabled = false;
    };
}

// ==================== KHỞI TẠO ====================

document.addEventListener('DOMContentLoaded', () => {
    loadUserPermissions();
    initStripe();
    checkPaymentSuccess();
    if (typeof updateUI === 'function') updateUI();
    if (userPermissions.plan === 'premium' || userPermissions.adFree) {
        hideAllAds();
    }
});
