// ==================== FEATURE FUNCTIONS ====================

// Escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Check for special characters
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
            () => { cutString(); }
        );
        return false;
    }

    return true;
}

// AI Question Detection - Now checks OUTPUT instead of input
function checkForQuestionInOutput() {
    const text = outputText.textContent.toLowerCase();
    const questionPatterns = ['?', 'làm sao', 'cái gì', 'ở đâu', 'tại sao', 'khi nào', 'như thế nào', 'what', 'how', 'why', 'where', 'when'];

    const hasQuestion = questionPatterns.some(pattern => text.includes(pattern));

    if (hasQuestion && text !== 'kết quả sẽ hiển thị ở đây...') {
        aiSection.classList.remove('hidden');
    } else {
        aiSection.classList.add('hidden');
    }
}

// AI Answer trigger
function triggerAIAnswer() {
    aiAnswerBtn.innerHTML = '<span class="loading-spinner">⏳</span> Đang suy nghĩ...';

    setTimeout(() => {
        if (Math.random() > 0.5) {
            const question = outputText.textContent;
            window.open(`https://www.google.com/search?q=${encodeURIComponent(question)}`, '_blank');
            showToast('AI đã chuyển bạn đến nguồn tri thức vô tận! 🌐', 'warning');
        } else {
            const response = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
            outputText.textContent = response;
            outputText.classList.add('has-result');
            showToast('AI đã trả lời! 🤖');
        }

        aiAnswerBtn.innerHTML = '<span class="sparkle">✨</span> Nhờ AI trả lời hộ <span class="ai-price">$5/câu</span>';
        aiSection.classList.add('hidden');
    }, 2000);
}

// Add new pattern input with remove button
function addNewPatternInput() {
    const patternInputs = document.getElementById('patternInputs');

    const wrapper = document.createElement('div');
    wrapper.className = 'pattern-input-wrapper';

    const newTextarea = document.createElement('textarea');
    newTextarea.className = 'cut-pattern-extra';
    newTextarea.placeholder = 'Nhập phần chuỗi cần cắt thêm...';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-pattern-btn';
    removeBtn.innerHTML = '×';
    removeBtn.title = 'Xóa ô này';
    removeBtn.onclick = () => {
        wrapper.remove();
        showToast('Đã xóa ô cắt! 🗑️');
    };

    wrapper.appendChild(newTextarea);
    wrapper.appendChild(removeBtn);
    patternInputs.appendChild(wrapper);

    showToast('Đã thêm ô cắt mới! ✨');
}

// Copy result
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
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Đã sao chép vào clipboard! 📋');
    }
}

// History functions
function addToHistory(pattern) {
    history = history.filter(item => item.pattern !== pattern);

    history.unshift({
        pattern: pattern,
        time: new Date().toLocaleTimeString('vi-VN')
    });

    history = history.slice(0, 10);
    localStorage.setItem('cutHistory', JSON.stringify(history));
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

    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            if (!userPermissions.historyAccess && userPermissions.plan !== 'premium') {
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

// Main cut function - now with EVIL features!
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

    if (!checkSpecialCharacterPermission(pattern)) {
        return;
    }

    // Check captcha for free users
    if (userPermissions.plan === 'free' && !captchaSolved) {
        showCaptchaModal(() => {
            captchaSolved = true;
            cutString(); // Retry after captcha
        });
        return;
    }

    // Apply artificial lag for non-premium users
    if (userPermissions.plan !== 'premium') {
        showProcessingQueue(() => {
            performActualCut(input, pattern);
        });
    } else {
        performActualCut(input, pattern);
    }
}

// Actual cutting logic (separated for lag wrapper)
function performActualCut(input, pattern) {
    const escapedPattern = escapeRegExp(pattern);

    let flags = caseInsensitive.checked ? 'i' : '';
    if (cutAll.checked) {
        flags += 'g';
    }

    try {
        const regex = new RegExp(escapedPattern, flags);

        const countFlags = flags.includes('g') ? flags : flags + 'g';
        const matches = input.match(new RegExp(escapedPattern, countFlags)) || [];
        const matchCount = matches.length;
        const charsToRemove = matches.reduce((sum, match) => sum + match.length, 0);

        let result = input.replace(regex, '');

        // Process extra pattern inputs
        const extraPatterns = document.querySelectorAll('.cut-pattern-extra');
        extraPatterns.forEach(textarea => {
            if (textarea.value) {
                const extraEscaped = escapeRegExp(textarea.value);
                result = result.replace(new RegExp(extraEscaped, flags), '');
            }
        });

        // Optimize whitespace
        result = result.replace(/\n\s*\n/g, '\n');
        result = result.replace(/  +/g, ' ');
        result = result.split('\n').map(line => line.trim()).join('\n');
        result = result.trim();

        outputText.textContent = result;
        outputText.classList.add('has-result');

        cutCount.textContent = matchCount;
        charRemoved.textContent = charsToRemove;

        if (matchCount > 0) {
            addToHistory(pattern);
        }

        dailyQuota.used += input.length;
        updateQuota();

        // Check for question in OUTPUT (not input)
        checkForQuestionInOutput();

        // Reset captcha for next use (evil!)
        if (userPermissions.plan === 'free') {
            captchaSolved = false;
        }

        if (matchCount > 0) {
            showToast(`Đã cắt ${matchCount} lần thành công! ✂️`);
            // Show rating nag popup (EVIL!)
            maybeShowRatingModal();
        } else {
            showToast('Không tìm thấy chuỗi cần cắt!', 'warning');
        }

    } catch (error) {
        showToast('Có lỗi xảy ra: ' + error.message, 'error');
    }
}

// ==================== EVIL FEATURE FUNCTIONS ====================

// Click tax tracking
function trackClick() {
    if (userPermissions.plan === 'premium' || clickTaxPaid) return true;

    clickCount++;
    updateClickCounter();

    if (clickCount >= MAX_FREE_CLICKS) {
        showClickTaxModal();
        return false;
    }
    return true;
}

// Show captcha modal
function showCaptchaModal(onSuccess) {
    const captchaModal = document.getElementById('captchaModal');
    const captchaQuestion = document.getElementById('captchaQuestion');
    const captchaInput = document.getElementById('captchaInput');
    const captchaSubmit = document.getElementById('captchaSubmit');
    const captchaError = document.getElementById('captchaError');

    if (!captchaModal) {
        onSuccess();
        return;
    }

    // Pick random question
    const question = CAPTCHA_QUESTIONS[Math.floor(Math.random() * CAPTCHA_QUESTIONS.length)];
    captchaQuestion.textContent = question.q;
    captchaInput.value = '';
    captchaError.classList.add('hidden');

    captchaModal.classList.remove('hidden');
    captchaInput.focus();

    const handleSubmit = () => {
        if (captchaInput.value.trim() === question.a) {
            captchaModal.classList.add('hidden');
            captchaAttempts = 0;
            showToast('Captcha đúng! Bạn là người thật! 🎉');
            onSuccess();
        } else {
            captchaAttempts++;
            captchaError.classList.remove('hidden');
            captchaError.textContent = `Sai rồi! Đã thử ${captchaAttempts} lần. Cố lên! 😈`;
            captchaInput.value = '';
            captchaInput.classList.add('shake');
            setTimeout(() => captchaInput.classList.remove('shake'), 500);

            // Reset input text after 3 wrong attempts (EVIL!)
            if (captchaAttempts >= 3) {
                inputText.value = '';
                showToast('💀 Quá nhiều lần sai! Dữ liệu đã bị XÓA!', 'error');
                captchaModal.classList.add('hidden');
                captchaAttempts = 0;
            }
        }
    };

    captchaSubmit.onclick = handleSubmit;
    captchaInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };
}

// Show click tax modal
function showClickTaxModal() {
    showPaymentModal(
        '🖱️ Ngón tay quá tải!',
        `Bạn đã click ${MAX_FREE_CLICKS} lần - vượt quá giới hạn miễn phí! Ngón tay của bạn cần nghỉ ngơi hoặc mua gói "Ngón tay vàng" để tiếp tục.`,
        '$14.99',
        '$0.00',
        'clickTax',
        () => {
            clickTaxPaid = true;
            clickCount = 0;
            updateClickCounter();
            showToast('Ngón tay đã được giải phóng! 🖱️✨');
        }
    );
}

// Show subscription expired modal
function showSubscriptionExpiredModal() {
    const modal = document.getElementById('subscriptionExpiredModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

