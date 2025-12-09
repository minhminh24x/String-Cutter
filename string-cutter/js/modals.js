// ==================== MODAL FUNCTIONS ====================

function showPaymentModal(title, description, origPrice, currPrice, feature, callback) {
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    originalPrice.textContent = origPrice;
    currentPrice.textContent = currPrice;

    currentPurchaseFeature = feature;
    currentPurchaseCallback = callback;

    paymentModal.classList.remove('hidden');
}

function processPurchase(callback) {
    const payText = payBtn.querySelector('.pay-text');
    const spinner = payBtn.querySelector('.loading-spinner');

    payText.style.display = 'none';
    spinner.classList.remove('hidden');

    try {
        document.getElementById('kachingSound').play();
    } catch (e) { }

    setTimeout(() => {
        paymentModal.classList.add('hidden');

        payText.style.display = 'inline';
        spinner.classList.add('hidden');

        if (currentPurchaseFeature) {
            userPermissions[currentPurchaseFeature] = true;
        }

        totalRevenue += Math.random() * 50 + 10;
        todayRevenue.textContent = totalRevenue.toFixed(2);

        successModal.classList.remove('hidden');

        if (callback) {
            callback();
        }
    }, 2000);
}

// Process purchase with GACHA instead of direct
function processPurchaseWithGacha(planType, callback) {
    const payText = payBtn.querySelector('.pay-text');
    const spinner = payBtn.querySelector('.loading-spinner');

    payText.style.display = 'none';
    spinner.classList.remove('hidden');

    try {
        document.getElementById('kachingSound').play();
    } catch (e) { }

    setTimeout(() => {
        paymentModal.classList.add('hidden');
        payText.style.display = 'inline';
        spinner.classList.add('hidden');

        totalRevenue += Math.random() * 50 + 10;
        todayRevenue.textContent = totalRevenue.toFixed(2);

        // Show Gacha wheel!
        showGachaModal(planType, callback);
    }, 1500);
}

// ==================== GACHA WHEEL ====================
function showGachaModal(planType, successCallback) {
    const gachaModal = document.getElementById('gachaModal');
    const gachaWheel = document.getElementById('gachaWheel');
    const gachaResult = document.getElementById('gachaResult');
    const gachaSpinBtn = document.getElementById('gachaSpinBtn');
    const gachaDesc = document.querySelector('.gacha-desc');

    if (!gachaModal) {
        successCallback();
        return;
    }

    // Update description based on plan type
    if (gachaDesc) {
        if (planType === 'basic') {
            gachaDesc.textContent = 'Quay để nhận phần thưởng! Tỉ lệ trúng Premium: 1% 😈';
        } else {
            gachaDesc.textContent = 'Quay để nhận phần thưởng! Tỉ lệ trúng Premium: 10% 🎉';
        }
    }

    gachaModal.classList.remove('hidden');
    gachaResult.classList.add('hidden');
    gachaWheel.style.transform = 'rotate(0deg)';
    gachaSpinBtn.disabled = false;
    gachaSpinBtn.textContent = '🎰 QUAY NGAY!';

    gachaSpinBtn.onclick = () => {
        gachaSpinBtn.disabled = true;
        gachaSpinBtn.textContent = 'Đang quay...';

        // Random spin
        const spins = 5 + Math.random() * 5; // 5-10 full rotations
        const extraDegrees = Math.random() * 360;
        const totalDegrees = spins * 360 + extraDegrees;

        gachaWheel.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        gachaWheel.style.transform = `rotate(${totalDegrees}deg)`;

        setTimeout(() => {
            // Different rates based on which plan user is trying to buy
            // Buying Basic: 1% premium, 10% basic (guaranteed basic on fail)
            // Buying Premium: 10% premium, 90% basic (at least basic guaranteed)
            let result;
            const rand = Math.random();

            if (planType === 'basic') {
                // Buying Basic: 1% premium, 15% basic, 84% fail (but get basic anyway as consolation)
                if (rand <= 0.01) {
                    result = { id: 'premium', label: 'GÓI PREMIUM! 👑', color: '#ffd700' };
                } else if (rand <= 0.16) {
                    result = { id: 'basic', label: 'Gói Basic! ⭐', color: '#10b981' };
                } else {
                    // "Fail" but still get basic as consolation prize
                    result = { id: 'basic_consolation', label: 'Phần thưởng an ủi: Gói Basic 😅', color: '#10b981' };
                }
            } else {
                // Buying Premium: 10% premium, 90% basic (minimum)
                if (rand <= 0.10) {
                    result = { id: 'premium', label: 'GÓI PREMIUM! 👑', color: '#ffd700' };
                } else {
                    // "Fail" but still get basic as consolation
                    result = { id: 'basic_consolation', label: 'Suýt chút nữa! Nhận Gói Basic 😭', color: '#10b981' };
                }
            }

            // Nearly miss premium effect (EVIL!) - only for premium spins
            if (result.id === 'premium' && planType === 'premium' && Math.random() > 0.5) {
                // 50% chance to "almost" win but slip
                result = { id: 'basic_consolation', label: 'SUÝT NỮA THÔI! Nhận Basic... 💔', color: '#10b981' };
                showToast('Vòng quay trượt nhẹ ở giây cuối! 😱', 'warning');
            }

            // Show result
            gachaResult.classList.remove('hidden');
            gachaResult.style.color = result.color;
            gachaResult.innerHTML = `<div class="gacha-result-icon">${result.id === 'premium' ? '👑' : '⭐'}</div><div class="gacha-result-text">${result.label}</div>`;

            // Handle result
            if (result.id === 'premium') {
                setTimeout(() => {
                    gachaModal.classList.add('hidden');
                    userPermissions.plan = 'premium';
                    userPermissions.characterLimit = true;
                    userPermissions.specialCharacters = true;
                    userPermissions.copyEnabled = true;
                    userPermissions.multiInput = true;
                    userPermissions.adFree = true;
                    userPermissions.aiAnswer = true;
                    userPermissions.historyAccess = true;
                    adBanner.classList.add('hidden');
                    // Start decay timer (60 seconds for premium)
                    startSubscriptionDecay(60);
                    successModal.classList.remove('hidden');
                    updateUI();
                }, 2000);
            } else if (result.id === 'basic' || result.id === 'basic_consolation') {
                setTimeout(() => {
                    gachaModal.classList.add('hidden');
                    userPermissions.plan = 'basic';
                    userPermissions.characterLimit = true;
                    userPermissions.specialCharacters = true;
                    userPermissions.copyEnabled = true;
                    userPermissions.multiInput = true;
                    // Start decay timer (30 seconds for basic)
                    startSubscriptionDecay(30);
                    successModal.classList.remove('hidden');
                    updateUI();
                }, 2000);
            } else if (result.id === 'extratry') {
                gachaSpinBtn.disabled = false;
                gachaSpinBtn.textContent = '🎰 QUAY LẠI!';
                showToast('+1 lượt quay! May mắn ghê! 🍀');
            } else {
                // Fail - close after delay
                setTimeout(() => {
                    gachaModal.classList.add('hidden');
                    showToast('Thất bại! Thử lại lần sau nhé! 💔', 'error');
                }, 2500);
            }
        }, 4200);
    };
}

// ==================== COOKIE CONSENT NIGHTMARE ====================
function showCookieConsent() {
    const cookieModal = document.getElementById('cookieModal');
    if (!cookieModal || cookieAccepted) return;

    cookieModal.classList.remove('hidden');
    cookiePopupCount++;

    // Make popup bigger each time it's shown
    const scale = 1 + (cookiePopupCount * 0.1);
    cookieModal.querySelector('.modal-content').style.transform = `scale(${Math.min(scale, 1.5)})`;
}

function setupCookieConsent() {
    const cookieModal = document.getElementById('cookieModal');
    const acceptAllBtn = document.getElementById('cookieAcceptAll');
    const customizeBtn = document.getElementById('cookieCustomize');
    const closeCookieBtn = document.getElementById('closeCookieModal');

    if (!cookieModal) return;

    // Show on load
    setTimeout(() => showCookieConsent(), 1000);

    // Accept all - easy path
    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', () => {
            cookieAccepted = true;
            cookieModal.classList.add('hidden');
            showToast('Cảm ơn! Dữ liệu của bạn giờ là của chúng tôi! 🍪', 'warning');
        });
    }

    // Customize - nightmare path
    if (customizeBtn) {
        customizeBtn.addEventListener('click', () => {
            showToast('Tính năng này đang được phát triển... bởi 1 intern... trong 10 năm nữa 🐌', 'warning');
        });
    }

    // Close button - popup comes back bigger!
    if (closeCookieBtn) {
        closeCookieBtn.addEventListener('click', () => {
            cookieModal.classList.add('hidden');
            // Come back in 3 seconds, BIGGER!
            setTimeout(() => {
                if (!cookieAccepted) {
                    showCookieConsent();
                }
            }, 3000);
        });
    }
}

function setupModals() {
    // Payment modal events
    payBtn.addEventListener('click', () => {
        processPurchase(currentPurchaseCallback);
    });

    cancelBtn.addEventListener('click', () => {
        paymentModal.classList.add('hidden');
        showToast('Bạn chọn tiếp tục chịu khổ... 😢', 'warning');
    });

    closeModalBtn.addEventListener('click', () => {
        paymentModal.classList.add('hidden');
    });

    successOkBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
    });

    // Plans modal - now with GACHA!
    upgradeBtn.addEventListener('click', () => {
        plansModal.classList.remove('hidden');
    });

    document.querySelectorAll('.plan-btn[data-plan]').forEach(btn => {
        btn.addEventListener('click', () => {
            const plan = btn.dataset.plan;
            plansModal.classList.add('hidden');

            // Show ToS first! (EVIL!)
            const tosModal = document.getElementById('tosModal');
            if (tosModal && !tosModal.dataset.agreed) {
                tosModal.classList.remove('hidden');

                // After agreeing to ToS, show payment
                const tosAgreeBtn = document.getElementById('tosAgreeBtn');
                tosAgreeBtn.onclick = () => {
                    tosModal.classList.add('hidden');
                    tosModal.dataset.agreed = 'true';
                    showPurchaseFlow(plan);
                };
                return;
            }

            showPurchaseFlow(plan);
        });
    });
}

// Helper function for purchase flow - NOW WITH REAL PAYMENT!
function showPurchaseFlow(plan) {
    // Giá thật bằng VND
    const prices = {
        basic: '49,000đ',
        premium: '299,000đ'
    };

    // Show payment modal với giá thật
    showPaymentModal(
        plan === 'premium' ? '👑 Gói Premium - VIP Forever' : '👨‍💼 Gói Basic - Nâng cấp',
        plan === 'premium'
            ? 'Mở khóa TẤT CẢ tính năng vĩnh viễn! Không quảng cáo, không giới hạn.'
            : 'Mở khóa 500 ký tự, copy, multi-input và ký tự đặc biệt.',
        prices[plan],
        prices[plan], // Không discount
        null,
        () => { }
    );

    // Override pay button để gọi thanh toán thật
    payBtn.onclick = async () => {
        // Hiển thị loading
        const payText = payBtn.querySelector('.pay-text');
        const spinner = payBtn.querySelector('.loading-spinner');
        if (payText) payText.textContent = 'Đang chuyển hướng...';
        if (spinner) spinner.classList.remove('hidden');
        payBtn.disabled = true;

        // Đóng modal payment
        paymentModal.classList.add('hidden');

        // Gọi thanh toán thật (từ payment.js)
        if (typeof processRealPayment === 'function') {
            await processRealPayment(plan);
        } else {
            // Fallback nếu payment.js chưa load
            console.log('Payment.js not loaded, using demo mode');
            unlockPlan(plan);
            showPaymentSuccess(plan);
        }

        // Reset button
        if (payText) payText.textContent = '💳 THANH TOÁN NGAY';
        if (spinner) spinner.classList.add('hidden');
        payBtn.disabled = false;
    };
}

function setupModalsRest() {
    document.querySelector('.close-plans').addEventListener('click', () => {
        plansModal.classList.add('hidden');
    });

    // Close modals on overlay click (but not cookie modal!)
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal && modal.id !== 'cookieModal') {
                modal.classList.add('hidden');
            }
        });
    });

    // Setup subscription expired modal
    const renewBtn = document.getElementById('renewSubscription');
    if (renewBtn) {
        renewBtn.addEventListener('click', () => {
            document.getElementById('subscriptionExpiredModal').classList.add('hidden');
            plansModal.classList.remove('hidden');
        });
    }

    // Setup cookie consent
    setupCookieConsent();
}

// Initialize modals rest after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    setupModalsRest();
});

