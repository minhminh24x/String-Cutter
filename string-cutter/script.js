// ==================== USER PERMISSIONS STATE ====================
const userPermissions = {
    plan: 'free', // 'free', 'basic', 'premium'
    characterLimit: false,
    specialCharacters: false,
    copyEnabled: false,
    multiInput: false,
    adFree: false,
    aiAnswer: false,
    historyAccess: false
};

// Daily quota tracking
let dailyQuota = {
    used: 0,
    max: 50
};

// Revenue counter (for fun)
let totalRevenue = 0;

// Special characters that require premium
const SPECIAL_CHARS = /[@#$%^&*(){}[\]|\\:;"'<>,.?\/~`!]/;

// AI troll responses
const AI_RESPONSES = [
    "Theo dữ liệu của tôi, câu trả lời là 42. 🤖",
    "Vấn đề này nhân phẩm bạn chưa đủ để biết. 😎",
    "Tôi đã suy nghĩ 0.0001 giây và kết luận: Bạn tự tìm đi! 💅",
    "Error 404: Não của tôi không tìm thấy câu trả lời. 🧠",
    "Hỏi Google đi bạn êi, tôi đang bận đếm tiền. 💰",
    "Câu trả lời nằm trong trái tim bạn. Tôi nghiêm túc đấy. ❤️",
    "Theo như ChatGPT đã nói với tôi: 'Không biết'. 🤷",
    "Bạn có chắc muốn biết không? Vì tôi không biết. 😅"
];

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

// New elements
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

// Modals
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

// History array
let history = JSON.parse(localStorage.getItem('cutHistory')) || [];

// Current feature being purchased
let currentPurchaseFeature = null;
let currentPurchaseCallback = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    updateUI();
    setupAdBanner();
});

// ==================== AD BANNER (TROLL) ====================
function setupAdBanner() {
    // Make close button run away
    closeAdBtn.addEventListener('mouseover', () => {
        if (!userPermissions.adFree) {
            const randomX = Math.random();
            const randomY = Math.random();
            closeAdBtn.style.setProperty('--random-x', randomX);
            closeAdBtn.style.setProperty('--random-y', randomY);
            closeAdBtn.style.transform = `translate(${(randomX - 0.5) * 200}px, ${(randomY - 0.5) * 50}px)`;
        }
    });

    closeAdBtn.addEventListener('click', () => {
        if (userPermissions.adFree) {
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

// ==================== UPDATE UI BASED ON PERMISSIONS ====================
function updateUI() {
    // Update plan badge
    updatePlanBadge();

    // Update quota
    updateQuota();

    // Update locked features appearance
    updateLockedFeatures();

    // Update revenue display
    todayRevenue.textContent = totalRevenue.toFixed(2);
}

function updatePlanBadge() {
    currentPlanBadge.className = 'plan-badge ' + userPermissions.plan;

    switch (userPermissions.plan) {
        case 'free':
            currentPlanBadge.textContent = '🐀 DÂN ĐEN';
            break;
        case 'basic':
            currentPlanBadge.textContent = '👨‍💼 CÔNG DÂN GƯƠNG MẪU';
            break;
        case 'premium':
            currentPlanBadge.textContent = '👑 TƯ BẢN THƯỢNG HẠNG';
            upgradeBtn.style.display = 'none';
            break;
    }
}

function updateQuota() {
    const remaining = dailyQuota.max - dailyQuota.used;
    const percentage = (remaining / dailyQuota.max) * 100;

    quotaFill.style.width = percentage + '%';
    quotaText.textContent = `${remaining}/${dailyQuota.max} ký tự`;

    if (percentage < 20) {
        quotaFill.classList.add('low');
    } else {
        quotaFill.classList.remove('low');
    }

    // Update input maxlength based on plan
    if (userPermissions.plan === 'premium') {
        inputText.removeAttribute('maxlength');
        dailyQuota.max = Infinity;
        quotaText.textContent = '∞ VÔ HẠN';
        quotaFill.style.width = '100%';
    } else if (userPermissions.plan === 'basic') {
        inputText.setAttribute('maxlength', '500');
        dailyQuota.max = 500;
    } else {
        inputText.setAttribute('maxlength', '50');
        dailyQuota.max = 50;
    }
}

function updateLockedFeatures() {
    // Copy button
    if (userPermissions.copyEnabled) {
        copyBtn.classList.remove('locked');
        copyBtn.querySelector('.lock-icon').style.display = 'none';
        copyBtn.querySelector('.vip-label').style.display = 'none';
    }

    // Add pattern button
    if (userPermissions.multiInput) {
        addPatternBtn.classList.remove('locked');
        addPatternBtn.querySelector('.lock-icon').style.display = 'none';
    }

    // History
    if (userPermissions.historyAccess) {
        document.querySelector('.history-section').classList.add('unlocked');
    }
}

// ==================== CHARACTER LIMIT CHECK ====================
inputText.addEventListener('input', () => {
    const length = inputText.value.length;
    const maxLength = userPermissions.plan === 'premium' ? Infinity :
        (userPermissions.plan === 'basic' ? 500 : 50);

    // Update counter
    charCounter.textContent = userPermissions.plan === 'premium' ?
        `${length} ký tự` : `${length}/${maxLength}`;

    // Update counter color
    if (length >= maxLength * 0.9) {
        charCounter.classList.add('danger');
        charCounter.classList.remove('warning');
    } else if (length >= maxLength * 0.7) {
        charCounter.classList.add('warning');
        charCounter.classList.remove('danger');
    } else {
        charCounter.classList.remove('warning', 'danger');
    }

    // Limit reached warning
    if (length >= maxLength && userPermissions.plan !== 'premium') {
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

    // Check for question marks (AI feature trigger)
    checkForQuestion();

    // Auto resize
    autoResize(inputText);
});

// ==================== AI QUESTION DETECTION ====================
function checkForQuestion() {
    const text = inputText.value.toLowerCase();
    const questionPatterns = ['?', 'làm sao', 'cái gì', 'ở đâu', 'tại sao', 'khi nào', 'như thế nào', 'what', 'how', 'why', 'where', 'when'];

    const hasQuestion = questionPatterns.some(pattern => text.includes(pattern));

    if (hasQuestion) {
        aiSection.classList.remove('hidden');
    } else {
        aiSection.classList.add('hidden');
    }
}

// ==================== SPECIAL CHARACTER CHECK ====================
function hasSpecialCharacters(str) {
    return SPECIAL_CHARS.test(str);
}

function checkSpecialCharacterPermission(pattern) {
    if (!hasSpecialCharacters(pattern)) return true;

    if (userPermissions.plan === 'premium') return true;

    if (!userPermissions.specialCharacters) {
        showPaymentModal(
            '☢️ Phát hiện ký tự nguy hiểm!',
            'Chuỗi của bạn chứa ký tự đặc biệt cao cấp (@#$%^&*...). Cần mua gói "Xử lý chất thải độc hại" để cắt ký tự này.',
            '$49.99',
            '$0.00',
            'specialCharacters',
            () => {
                cutString(); // Retry after purchase
            }
        );
        return false;
    }

    return true;
}

// ==================== COPY FEATURE (LOCKED) ====================
copyBtn.addEventListener('click', () => {
    if (copyBtn.classList.contains('locked')) {
        showPaymentModal(
            '📋 Sao chép cao cấp',
            'Tính năng Sao chép nhanh chỉ dành cho hội viên VIP. Bạn có muốn nâng cấp để bảo vệ ngón tay không?',
            '$9.99',
            '$0.00',
            'copyEnabled',
            () => {
                copyResult();
                updateUI();
            }
        );
        return;
    }

    copyResult();
});

// ==================== MULTI-INPUT FEATURE (LOCKED) ====================
addPatternBtn.addEventListener('click', () => {
    if (addPatternBtn.classList.contains('locked')) {
        showPaymentModal(
            '➕ Đa nhiệm cao cấp',
            'Nâng cấp lên gói "Đa nhiệm" để cắt nhiều chuỗi cùng lúc. Tiết kiệm thời gian - Tiết kiệm cuộc đời!',
            '$99.99',
            '$0.00',
            'multiInput',
            () => {
                addNewPatternInput();
                updateUI();
            }
        );
        return;
    }

    addNewPatternInput();
});

function addNewPatternInput() {
    const patternInputs = document.getElementById('patternInputs');
    const newTextarea = document.createElement('textarea');
    newTextarea.className = 'cut-pattern-extra';
    newTextarea.placeholder = 'Nhập phần chuỗi cần cắt thêm...';
    patternInputs.appendChild(newTextarea);
    showToast('Đã thêm ô cắt mới! ✨');
}

// ==================== AI ANSWER FEATURE (TROLL) ====================
aiAnswerBtn.addEventListener('click', () => {
    if (userPermissions.plan !== 'premium' && !userPermissions.aiAnswer) {
        showPaymentModal(
            '🤖 Thuê AI thông minh',
            'Phí thuê AI siêu cấp: $5/câu. AI của chúng tôi được huấn luyện bởi... Google Search!',
            '$5.00',
            '$0.00',
            'aiAnswer',
            () => {
                triggerAIAnswer();
            }
        );
        return;
    }

    triggerAIAnswer();
});

function triggerAIAnswer() {
    // Show loading
    aiAnswerBtn.innerHTML = '<span class="loading-spinner">⏳</span> Đang suy nghĩ...';

    setTimeout(() => {
        // Random choice: open Google or show troll response
        if (Math.random() > 0.5) {
            // Open Google with the question
            const question = inputText.value;
            window.open(`https://www.google.com/search?q=${encodeURIComponent(question)}`, '_blank');
            showToast('AI đã chuyển bạn đến nguồn tri thức vô tận! 🌐', 'warning');
        } else {
            // Show troll response
            const response = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
            outputText.textContent = response;
            outputText.classList.add('has-result');
            showToast('AI đã trả lời! 🤖');
        }

        // Reset button
        aiAnswerBtn.innerHTML = '<span class="sparkle">✨</span> Nhờ AI trả lời hộ <span class="ai-price">$5/câu</span>';
    }, 2000);
}

// ==================== HISTORY UNLOCK ====================
document.querySelector('.unlock-history-btn').addEventListener('click', () => {
    showPaymentModal(
        '📜 Mở khóa lịch sử',
        'Xem lại tất cả các pattern bạn đã cắt. Dữ liệu quá khứ là vàng!',
        '$2.99',
        '$0.00',
        'historyAccess',
        () => {
            updateUI();
            showToast('Đã mở khóa lịch sử! 📜');
        }
    );
});

// ==================== UPGRADE BUTTON ====================
upgradeBtn.addEventListener('click', () => {
    plansModal.classList.remove('hidden');
});

// Plan selection
document.querySelectorAll('.plan-btn[data-plan]').forEach(btn => {
    btn.addEventListener('click', () => {
        const plan = btn.dataset.plan;
        plansModal.classList.add('hidden');

        if (plan === 'basic') {
            processPurchase(() => {
                userPermissions.plan = 'basic';
                userPermissions.characterLimit = true;
                userPermissions.specialCharacters = true;
                userPermissions.copyEnabled = true;
                userPermissions.multiInput = true;
                dailyQuota.max = 500;
                updateUI();
            });
        } else if (plan === 'premium') {
            processPurchase(() => {
                userPermissions.plan = 'premium';
                userPermissions.characterLimit = true;
                userPermissions.specialCharacters = true;
                userPermissions.copyEnabled = true;
                userPermissions.multiInput = true;
                userPermissions.adFree = true;
                userPermissions.aiAnswer = true;
                userPermissions.historyAccess = true;
                adBanner.classList.add('hidden');
                dailyQuota.max = Infinity;
                updateUI();
            });
        }
    });
});

document.querySelector('.close-plans').addEventListener('click', () => {
    plansModal.classList.add('hidden');
});

// ==================== PAYMENT MODAL ====================
function showPaymentModal(title, description, origPrice, currPrice, feature, callback) {
    modalTitle.textContent = title;
    modalDescription.textContent = description;
    originalPrice.textContent = origPrice;
    currentPrice.textContent = currPrice;

    currentPurchaseFeature = feature;
    currentPurchaseCallback = callback;

    paymentModal.classList.remove('hidden');
}

payBtn.addEventListener('click', () => {
    processPurchase(currentPurchaseCallback);
});

function processPurchase(callback) {
    const payText = payBtn.querySelector('.pay-text');
    const spinner = payBtn.querySelector('.loading-spinner');

    // Show loading
    payText.style.display = 'none';
    spinner.classList.remove('hidden');

    // Play ka-ching sound
    try {
        document.getElementById('kachingSound').play();
    } catch (e) { }

    // Simulate processing
    setTimeout(() => {
        paymentModal.classList.add('hidden');

        // Reset button
        payText.style.display = 'inline';
        spinner.classList.add('hidden');

        // Update permission
        if (currentPurchaseFeature) {
            userPermissions[currentPurchaseFeature] = true;
        }

        // Update revenue (random amount for fun)
        totalRevenue += Math.random() * 50 + 10;
        todayRevenue.textContent = totalRevenue.toFixed(2);

        // Show success
        successModal.classList.remove('hidden');

        // Execute callback
        if (callback) {
            callback();
        }
    }, 2000);
}

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

// ==================== MAIN CUT FUNCTION ====================
function cutString() {
    const input = inputText.value;
    const pattern = cutPattern.value;

    if (!input) {
        showToast('Vui lòng nhập văn bản!', 'error');
        inputText.focus();
        return;
    }

    if (!pattern) {
        showToast('Vui lòng nhập phần cần cắt!', 'error');
        cutPattern.focus();
        return;
    }

    // Check special character permission
    if (!checkSpecialCharacterPermission(pattern)) {
        return;
    }

    // Escape special characters for literal matching
    const escapedPattern = escapeRegExp(pattern);

    // Create regex flags
    let flags = caseInsensitive.checked ? 'i' : '';
    if (cutAll.checked) {
        flags += 'g';
    }

    try {
        const regex = new RegExp(escapedPattern, flags);

        // Count matches before replacing (always use 'g' flag for counting)
        const countFlags = flags.includes('g') ? flags : flags + 'g';
        const matches = input.match(new RegExp(escapedPattern, countFlags)) || [];
        const matchCount = matches.length;
        const charsToRemove = matches.reduce((sum, match) => sum + match.length, 0);

        // Perform the cut
        let result = input.replace(regex, '');

        // Also process extra pattern inputs
        const extraPatterns = document.querySelectorAll('.cut-pattern-extra');
        extraPatterns.forEach(textarea => {
            if (textarea.value) {
                const extraEscaped = escapeRegExp(textarea.value);
                result = result.replace(new RegExp(extraEscaped, flags), '');
            }
        });

        // Optimize whitespace: 
        // 1. Collapse multiple blank lines into single newline
        result = result.replace(/\n\s*\n/g, '\n');
        // 2. Collapse multiple spaces into single space
        result = result.replace(/  +/g, ' ');
        // 3. Trim each line
        result = result.split('\n').map(line => line.trim()).join('\n');
        // 4. Trim overall
        result = result.trim();

        // Update output
        outputText.textContent = result;
        outputText.classList.add('has-result');

        // Update stats
        cutCount.textContent = matchCount;
        charRemoved.textContent = charsToRemove;

        // Add to history
        if (matchCount > 0) {
            addToHistory(pattern);
        }

        // Update quota
        dailyQuota.used += input.length;
        updateQuota();

        // Show success toast
        if (matchCount > 0) {
            showToast(`Đã cắt ${matchCount} lần thành công! ✂️`);
        } else {
            showToast('Không tìm thấy chuỗi cần cắt!', 'warning');
        }

    } catch (error) {
        showToast('Có lỗi xảy ra: ' + error.message, 'error');
    }
}

// Escape special regex characters for literal string matching
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==================== HISTORY FUNCTIONS ====================
function addToHistory(pattern) {
    // Remove duplicate if exists
    history = history.filter(item => item.pattern !== pattern);

    // Add new item at the beginning
    history.unshift({
        pattern: pattern,
        time: new Date().toLocaleTimeString('vi-VN')
    });

    // Keep only last 10 items
    history = history.slice(0, 10);

    // Save to localStorage
    localStorage.setItem('cutHistory', JSON.stringify(history));

    // Re-render history
    renderHistory();
}

function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">Chưa có lịch sử cắt nào...</p>';
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" data-index="${index}">
            <span class="history-pattern" title="${escapeHtml(item.pattern)}">${escapeHtml(item.pattern)}</span>
            <span class="history-time">${item.time}</span>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            if (!userPermissions.historyAccess) {
                showToast('Mở khóa Premium để sử dụng lịch sử! 🔒', 'warning');
                return;
            }
            const index = parseInt(item.dataset.index);
            cutPattern.value = history[index].pattern;
            cutPattern.classList.add('highlight');
            setTimeout(() => cutPattern.classList.remove('highlight'), 2000);
        });
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== COPY RESULT ====================
async function copyResult() {
    const text = outputText.textContent;

    if (text === 'Kết quả sẽ hiển thị ở đây...') {
        showToast('Chưa có kết quả để sao chép!', 'warning');
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast('Đã sao chép vào clipboard! 📋');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Đã sao chép vào clipboard! 📋');
    }
}

// ==================== CLEAR HISTORY ====================
clearHistory.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('cutHistory');
    renderHistory();
    showToast('Đã xóa lịch sử! 🗑️');
});

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast show ' + type;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ==================== EVENT LISTENERS ====================
cutBtn.addEventListener('click', cutString);

// Keyboard shortcut: Ctrl/Cmd + Enter to cut
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        cutString();
    }
});

// Auto-resize textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

cutPattern.addEventListener('input', () => autoResize(cutPattern));

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', () => {
        paymentModal.classList.add('hidden');
        successModal.classList.add('hidden');
        plansModal.classList.add('hidden');
    });
});

// Upgrade links
document.querySelectorAll('.upgrade-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        plansModal.classList.remove('hidden');
    });
});
