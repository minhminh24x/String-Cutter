// ==================== UI UPDATE FUNCTIONS ====================

function updateUI() {
    updatePlanBadge();
    updateQuota();
    updateLockedFeatures();
    updatePremiumDisplay();
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
            break;
    }
}

function updateQuota() {
    if (userPermissions.plan === 'premium') {
        // Premium: hide quota completely
        document.querySelector('.quota-bar').classList.add('hidden');
        inputText.removeAttribute('maxlength');
        inputText.placeholder = 'Nhập văn bản của bạn vào đây... (VÔ HẠN ký tự) 👑';
        return;
    }

    // IMPORTANT: Set max FIRST based on plan, BEFORE calculating remaining
    if (userPermissions.plan === 'basic') {
        dailyQuota.max = 500;
        inputText.setAttribute('maxlength', '500');
        inputText.placeholder = 'Nhập văn bản của bạn vào đây... (Tối đa 500 ký tự)';
    } else {
        // Free plan
        dailyQuota.max = 50;
        inputText.setAttribute('maxlength', '50');
        inputText.placeholder = 'Nhập văn bản của bạn vào đây... (Tối đa 50 ký tự cho gói miễn phí)';
    }

    // Reset used if it exceeds max (for downgrade)
    if (dailyQuota.used > dailyQuota.max) {
        dailyQuota.used = 0;
    }

    document.querySelector('.quota-bar').classList.remove('hidden');

    const remaining = dailyQuota.max - dailyQuota.used;
    const percentage = (remaining / dailyQuota.max) * 100;

    quotaFill.style.width = percentage + '%';
    quotaText.textContent = `${remaining}/${dailyQuota.max} ký tự`;

    if (percentage < 20) {
        quotaFill.classList.add('low');
    } else {
        quotaFill.classList.remove('low');
    }
}

function updateLockedFeatures() {
    // Copy button
    if (userPermissions.copyEnabled || userPermissions.plan === 'premium') {
        copyBtn.classList.remove('locked');
        const lockIcon = copyBtn.querySelector('.lock-icon');
        const vipLabel = copyBtn.querySelector('.vip-label');
        if (lockIcon) lockIcon.style.display = 'none';
        if (vipLabel) vipLabel.style.display = 'none';
    }

    // Add pattern button
    if (userPermissions.multiInput || userPermissions.plan === 'premium') {
        addPatternBtn.classList.remove('locked');
        const lockIcon = addPatternBtn.querySelector('.lock-icon');
        if (lockIcon) lockIcon.style.display = 'none';
    }

    // History
    if (userPermissions.historyAccess || userPermissions.plan === 'premium') {
        document.querySelector('.history-section').classList.add('unlocked');
    }

    // Upgrade button - hide for premium
    if (userPermissions.plan === 'premium') {
        upgradeBtn.classList.add('hidden');
    } else {
        upgradeBtn.classList.remove('hidden');
    }
}

function updatePremiumDisplay() {
    const limitWarning = document.querySelector('.limit-warning');
    const charCounter = document.getElementById('charCounter');

    if (userPermissions.plan === 'premium') {
        // Hide free tier warnings for premium users
        if (limitWarning) limitWarning.classList.add('hidden');
        if (charCounter) charCounter.classList.add('hidden');

        // Update input placeholder
        inputText.placeholder = 'Nhập văn bản của bạn vào đây... (VÔ HẠN ký tự) 👑';
        inputText.classList.remove('limit-reached');
    } else if (userPermissions.plan === 'basic') {
        // Show appropriate message for basic
        if (limitWarning) {
            limitWarning.classList.remove('hidden');
            limitWarning.innerHTML = '⚠️ Gói Basic cho phép 500 ký tự. <a href="#" class="upgrade-link">Nâng cấp Premium!</a>';
        }
        if (charCounter) charCounter.classList.remove('hidden');
        inputText.placeholder = 'Nhập văn bản của bạn vào đây... (Tối đa 500 ký tự)';
    } else {
        // Free tier
        if (limitWarning) limitWarning.classList.remove('hidden');
        if (charCounter) charCounter.classList.remove('hidden');
    }

    // Re-attach upgrade link events
    document.querySelectorAll('.upgrade-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            plansModal.classList.remove('hidden');
        });
    });
}

function updateCharCounter() {
    if (userPermissions.plan === 'premium') {
        charCounter.classList.add('hidden');
        return;
    }

    charCounter.classList.remove('hidden');
    const length = inputText.value.length;
    const maxLength = userPermissions.plan === 'basic' ? 500 : 50;

    charCounter.textContent = `${length}/${maxLength}`;

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
}

// Toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast show ' + type;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Auto-resize textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

// ==================== EVIL UI FUNCTIONS ====================

// Update click counter display
function updateClickCounter() {
    const clickDisplay = document.getElementById('clickCounter');
    if (!clickDisplay) return;

    if (userPermissions.plan === 'premium' || clickTaxPaid) {
        clickDisplay.classList.add('hidden');
        return;
    }

    clickDisplay.classList.remove('hidden');
    const remaining = MAX_FREE_CLICKS - clickCount;
    clickDisplay.textContent = `🖱️ Click còn lại: ${remaining}/${MAX_FREE_CLICKS}`;

    if (remaining <= 5) {
        clickDisplay.classList.add('danger');
    } else if (remaining <= 10) {
        clickDisplay.classList.add('warning');
    }
}

// Update subscription timer display
function updateSubscriptionTimer() {
    const timerDisplay = document.getElementById('subscriptionTimer');
    if (!timerDisplay) return;

    if (subscriptionTimeLeft <= 0) {
        timerDisplay.classList.add('hidden');
        return;
    }

    timerDisplay.classList.remove('hidden');
    const minutes = Math.floor(subscriptionTimeLeft / 60);
    const seconds = subscriptionTimeLeft % 60;
    timerDisplay.innerHTML = `⏱️ Gói hết hạn: <span class="timer-countdown">${minutes}:${seconds.toString().padStart(2, '0')}</span>`;

    if (subscriptionTimeLeft <= 30) {
        timerDisplay.classList.add('expiring');
    }
}

// Start subscription decay
function startSubscriptionDecay(seconds) {
    subscriptionTimeLeft = seconds;

    if (subscriptionInterval) {
        clearInterval(subscriptionInterval);
    }

    subscriptionInterval = setInterval(() => {
        subscriptionTimeLeft--;
        updateSubscriptionTimer();

        if (subscriptionTimeLeft <= 0) {
            clearInterval(subscriptionInterval);
            // Downgrade plan
            if (userPermissions.plan === 'premium') {
                userPermissions.plan = 'basic';
                showToast('⚠️ Gói Premium đã hết hạn! Bạn bị hạ xuống Basic.', 'warning');
            } else if (userPermissions.plan === 'basic') {
                userPermissions.plan = 'free';
                showToast('💀 Gói Basic đã hết hạn! Chào mừng trở lại Dân Đen!', 'error');
            }
            updateUI();
            showSubscriptionExpiredModal();
        }
    }, 1000);
}

// Show processing queue (fake lag)
function showProcessingQueue(callback) {
    const processingModal = document.getElementById('processingModal');
    const queueNumber = document.getElementById('queueNumber');
    const processingBar = document.getElementById('processingBar');

    if (!processingModal) return callback();

    processingModal.classList.remove('hidden');
    isProcessing = true;

    let currentPos = queuePosition;
    const totalTime = userPermissions.plan === 'basic' ? 3000 : 5000; // 3s for basic, 5s for free
    const interval = 50;
    const steps = totalTime / interval;
    const decrement = currentPos / steps;

    let progress = 0;

    const processInterval = setInterval(() => {
        currentPos = Math.max(1, Math.floor(currentPos - decrement));
        progress += (100 / steps);

        queueNumber.textContent = currentPos.toLocaleString();
        processingBar.style.width = progress + '%';

        if (progress >= 100) {
            clearInterval(processInterval);
            setTimeout(() => {
                processingModal.classList.add('hidden');
                isProcessing = false;
                queuePosition = Math.floor(Math.random() * 20000) + 5000; // Reset for next time
                callback();
            }, 300);
        }
    }, interval);
}
