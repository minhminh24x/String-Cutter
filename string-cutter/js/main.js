// ==================== DOM ELEMENTS ====================
const inputText = document.getElementById('inputText');
const cutPattern = document.getElementById('cutPattern');
const caseInsensitive = document.getElementById('caseInsensitive');
const cutAll = document.getElementById('cutAll');
const cutBtn = document.getElementById('cutBtn');
const outputText = document.getElementById('outputText');
const copyBtn = document.getElementById('copyBtn');
const cutCount = document.getElementById('cutCount');
const charRemoved = document.getElementById('charRemoved');
const historyList = document.getElementById('historyList');
const clearHistory = document.getElementById('clearHistory');
const toast = document.getElementById('toast');

const adBanner = document.getElementById('adBanner');
const closeAdBtn = document.getElementById('closeAd');
const currentPlanBadge = document.getElementById('currentPlan');
const upgradeBtn = document.getElementById('upgradeBtn');
const quotaFill = document.getElementById('quotaFill');
const quotaText = document.getElementById('quotaText');
const charCounter = document.getElementById('charCounter');
const addPatternBtn = document.getElementById('addPatternBtn');
const aiSection = document.getElementById('aiSection');
const aiAnswerBtn = document.getElementById('aiAnswerBtn');
const todayRevenue = document.getElementById('todayRevenue');

const paymentModal = document.getElementById('paymentModal');
const successModal = document.getElementById('successModal');
const plansModal = document.getElementById('plansModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const originalPrice = document.getElementById('originalPrice');
const currentPrice = document.getElementById('currentPrice');
const payBtn = document.getElementById('payBtn');
const cancelBtn = document.getElementById('cancelBtn');
const closeModalBtn = document.getElementById('closeModal');
const successOkBtn = document.getElementById('successOkBtn');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    updateUI();
    setupAdBanner();
    setupModals();
    setupEventListeners();
    setupClickTax();
    updateClickCounter();
});

// ==================== CLICK TAX SETUP ====================
function setupClickTax() {
    document.addEventListener('click', (e) => {
        // Don't count clicks on modals or if premium/paid
        if (e.target.closest('.modal')) return;
        if (userPermissions.plan === 'premium' || clickTaxPaid) return;

        if (!trackClick()) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
}

// ==================== AD BANNER SETUP ====================
function setupAdBanner() {
    closeAdBtn.addEventListener('mouseover', () => {
        if (!userPermissions.adFree && userPermissions.plan !== 'premium') {
            const randomX = Math.random();
            const randomY = Math.random();
            closeAdBtn.style.setProperty('--random-x', randomX);
            closeAdBtn.style.setProperty('--random-y', randomY);
            closeAdBtn.style.transform = `translate(${(randomX - 0.5) * 200}px, ${(randomY - 0.5) * 50}px)`;
        }
    });

    closeAdBtn.addEventListener('click', () => {
        if (userPermissions.adFree || userPermissions.plan === 'premium') {
            adBanner.classList.add('hidden');
        } else {
            showPaymentModal(
                '🔇 Tắt quảng cáo',
                'Mua gói "Mắt đại bàng" để tắt quảng cáo vĩnh viễn và bảo vệ đôi mắt quý giá của bạn!',
                '$29.99',
                '$0.00',
                'adFree',
                () => {
                    adBanner.classList.add('hidden');
                    showToast('Quảng cáo đã được tắt vĩnh viễn! 🎉');
                }
            );
        }
    });
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Input text events
    inputText.addEventListener('input', () => {
        updateCharCounter();

        const length = inputText.value.length;
        const maxLength = userPermissions.plan === 'premium' ? Infinity :
            (userPermissions.plan === 'basic' ? 500 : 50);

        if (length >= maxLength && userPermissions.plan === 'free') {
            inputText.classList.add('limit-reached');

            if (!userPermissions.characterLimit) {
                showPaymentModal(
                    '📝 Hết hạn ngạch ký tự!',
                    `Bạn đã sử dụng hết ${maxLength} ký tự miễn phí trong ngày. Mở khóa gói "Tiểu thuyết gia" để nhập tiếp?`,
                    '$19.99',
                    '$0.00',
                    'characterLimit',
                    () => {
                        inputText.classList.remove('limit-reached');
                        if (userPermissions.plan === 'free') {
                            userPermissions.plan = 'basic';
                        }
                        updateUI();
                    }
                );
            }
        } else {
            inputText.classList.remove('limit-reached');
        }

        autoResize(inputText);
    });

    // Cut button
    cutBtn.addEventListener('click', cutString);

    // Copy button
    copyBtn.addEventListener('click', () => {
        if (copyBtn.classList.contains('locked')) {
            // THANH TOÁN THẬT
            if (typeof showRealPaymentModal === 'function') {
                showRealPaymentModal(
                    'unlockCopy',
                    '📋 Mở khóa Sao chép',
                    'Sao chép kết quả về clipboard của bạn. Tính năng cơ bản nhưng rất hữu ích!'
                );
            } else {
                showToast('Cần nâng cấp để sao chép!', 'warning');
            }
            return;
        }
        copyResult();
    });

    // Add pattern button
    addPatternBtn.addEventListener('click', () => {
        if (addPatternBtn.classList.contains('locked')) {
            // THANH TOÁN THẬT
            if (typeof showRealPaymentModal === 'function') {
                showRealPaymentModal(
                    'unlockMultiInput',
                    '➕ Đa nhiệm - Multi Input',
                    'Cắt nhiều chuỗi cùng lúc với nhiều ô nhập. Tiết kiệm thời gian đáng kể!'
                );
            } else {
                showToast('Cần mua tính năng này!', 'warning');
            }
            return;
        }
        addNewPatternInput();
    });

    // AI Answer button - THANH TOÁN THẬT
    aiAnswerBtn.addEventListener('click', () => {
        if (userPermissions.plan !== 'premium' && !userPermissions.aiAnswer) {
            if (typeof showRealPaymentModal === 'function') {
                showRealPaymentModal(
                    'aiAnswer',
                    '🤖 AI Trả lời',
                    'AI sẽ phân tích và trả lời câu hỏi trong kết quả của bạn. Thông minh và nhanh chóng!'
                );
            } else {
                showToast('Cần mua tính năng AI!', 'warning');
            }
            return;
        }
        triggerAIAnswer();
    });

    // History unlock button - THANH TOÁN THẬT
    document.querySelector('.unlock-history-btn').addEventListener('click', () => {
        if (typeof showRealPaymentModal === 'function') {
            showRealPaymentModal(
                'unlockHistory',
                '📜 Mở khóa Lịch sử',
                'Xem lại tất cả các pattern bạn đã cắt. Dữ liệu quá khứ rất giá trị!'
            );
        } else {
            showPaymentModal(
                '📜 Mở khóa lịch sử',
                'Xem lại tất cả các pattern bạn đã cắt.',
                '29,000đ',
                '29,000đ',
                'historyAccess',
                () => {
                    updateUI();
                    showToast('Đã mở khóa lịch sử! 📜');
                }
            );
        }
    });

    // Clear history - REAL PAYMENT!
    clearHistory.addEventListener('click', () => {
        if (userPermissions.plan !== 'premium') {
            // Sử dụng thanh toán thật
            if (typeof showRealPaymentModal === 'function') {
                showRealPaymentModal(
                    'clearHistory',
                    '🗑️ Xóa lịch sử cao cấp',
                    'Bạn muốn xóa CHÍNH lịch sử của mình? Tính năng này yêu cầu thanh toán để đảm bảo bạn thực sự muốn xóa.'
                );
            } else {
                showToast('Cần nâng cấp Premium để xóa lịch sử!', 'warning');
            }
            return;
        }
        history = [];
        localStorage.removeItem('cutHistory');
        renderHistory();
        showToast('Đã xóa lịch sử! 🗑️');
    });

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            cutString();
        }
    });

    // Auto-resize for cut pattern
    cutPattern.addEventListener('input', () => autoResize(cutPattern));

    // Upgrade links
    document.querySelectorAll('.upgrade-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            plansModal.classList.remove('hidden');
        });
    });
}

// ==================== FINAL EVIL FEATURES ====================

// Play error sound for locked features
function playErrorSound() {
    try {
        const errorSound = document.getElementById('errorSound');
        if (errorSound) {
            errorSound.currentTime = 0;
            errorSound.volume = 0.8;
            errorSound.play();
        }
    } catch (e) { }
}

// Setup Support Chat
function setupSupportChat() {
    const chatBtn = document.getElementById('supportChatBtn');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChatBtn');

    if (!chatBtn) return;

    chatBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
    });

    closeChat.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });
}

// Setup Rating Modal
let currentRating = 0;
let cutCountForRating = 0;

function setupRatingModal() {
    const ratingModal = document.getElementById('ratingModal');
    const stars = document.querySelectorAll('.star');
    const submitBtn = document.getElementById('submitRating');
    const feedback = document.getElementById('ratingFeedback');

    if (!ratingModal) return;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);

            // Update stars visual
            stars.forEach((s, i) => {
                if (i < currentRating) {
                    s.textContent = '★';
                    s.classList.add('selected');
                } else {
                    s.textContent = '☆';
                    s.classList.remove('selected');
                }
            });

            // Show feedback based on rating
            if (currentRating < 5) {
                feedback.innerHTML = '😢 Chỉ có ' + currentRating + ' sao thôi sao? Bạn chắc muốn 5 sao đúng không?';
            } else {
                feedback.innerHTML = '🎉 Tuyệt vời! Bạn thật có gu!';
            }
        });

        star.addEventListener('mouseover', () => {
            stars.forEach((s, i) => {
                if (i < parseInt(star.dataset.rating)) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });

        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('active'));
        });
    });

    // Submit button - runs away if < 5 stars!
    submitBtn.addEventListener('mouseover', () => {
        if (currentRating > 0 && currentRating < 5) {
            const randomX = (Math.random() - 0.5) * 200;
            const randomY = (Math.random() - 0.5) * 100;
            submitBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }
    });

    submitBtn.addEventListener('click', () => {
        if (currentRating === 5) {
            ratingModal.classList.add('hidden');
            showToast('Cảm ơn bạn đã đánh giá 5 sao! ⭐⭐⭐⭐⭐');
            currentRating = 0;
            submitBtn.style.transform = '';
            stars.forEach(s => {
                s.textContent = '☆';
                s.classList.remove('selected');
            });
            feedback.innerHTML = '';
        } else if (currentRating > 0) {
            playErrorSound();
            showToast('Bạn chắc muốn cho 5 sao mà đúng không? 😉', 'warning');
        } else {
            showToast('Vui lòng chọn số sao!', 'error');
        }
    });
}

// Show rating modal after cuts
function maybeShowRatingModal() {
    cutCountForRating++;

    // Show every 3 cuts for free users, every 5 for basic
    const threshold = userPermissions.plan === 'free' ? 3 : 5;

    if (userPermissions.plan !== 'premium' && cutCountForRating >= threshold) {
        cutCountForRating = 0;
        setTimeout(() => {
            document.getElementById('ratingModal').classList.remove('hidden');
        }, 500);
    }
}

// Setup Terms of Service Modal
function setupTosModal() {
    const tosModal = document.getElementById('tosModal');
    const tosContent = document.getElementById('tosContent');
    const progressFill = document.getElementById('tosProgressFill');
    const progressText = document.getElementById('tosProgressText');
    const agreeBtn = document.getElementById('tosAgreeBtn');

    if (!tosModal || !tosContent) return;

    // Generate endless ToS content
    const loremBase = `
        ĐIỀU KHOẢN SỬ DỤNG STRING CUTTER PRO™
        
        Điều 1: Bằng việc sử dụng công cụ này, bạn đồng ý rằng chúng tôi có quyền thu thập, bán, và chia sẻ mọi dữ liệu của bạn với bất kỳ ai chúng tôi muốn, bao gồm nhưng không giới hạn: FBI, CIA, KGB, Mẹ bạn, Bạn gái/bạn trai cũ của bạn, và 847 đối tác quảng cáo.
        
        Điều 2: Mọi chuỗi bạn cắt sẽ tự động trở thành tài sản trí tuệ của String Cutter PRO™. Bạn không được phép sử dụng kết quả cắt cho bất kỳ mục đích nào mà không có sự đồng ý bằng văn bản từ CEO của chúng tôi (người hiện đang bận đếm tiền).
        
        Điều 3: Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào, bao gồm: mất thời gian, mất não, mất tiền, mất bạn bè, hoặc mất niềm tin vào nhân loại.
        
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        
    `;

    // Generate ~500 paragraphs
    let fullContent = '';
    for (let i = 0; i < 200; i++) {
        fullContent += `<p><strong>Điều ${i + 4}:</strong> ${loremBase}</p>`;
    }
    tosContent.innerHTML = fullContent;

    // Track scroll progress
    tosContent.addEventListener('scroll', () => {
        const scrollPercent = (tosContent.scrollTop / (tosContent.scrollHeight - tosContent.clientHeight)) * 100;
        progressFill.style.width = scrollPercent + '%';
        progressText.textContent = Math.round(scrollPercent) + '%';

        if (scrollPercent >= 99) {
            agreeBtn.disabled = false;
            agreeBtn.textContent = '✅ TÔI ĐỒNG Ý (cuối cùng!)';
        }
    });

    agreeBtn.addEventListener('click', () => {
        if (!agreeBtn.disabled) {
            tosModal.classList.add('hidden');
            showToast('Bạn đã đồng ý với 200 điều khoản! 📜');
        }
    });
}

// Show ToS modal (on first purchase)
function showTosModal() {
    const tosModal = document.getElementById('tosModal');
    if (tosModal) {
        tosModal.classList.remove('hidden');
    }
}

// Initialize all final evil features
function initFinalEvilFeatures() {
    setupSupportChat();
    setupRatingModal();
    setupTosModal();
}

// Call from DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initFinalEvilFeatures();
});
