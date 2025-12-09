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

// Current feature being purchased
let currentPurchaseFeature = null;
let currentPurchaseCallback = null;

// History array
let history = JSON.parse(localStorage.getItem('cutHistory')) || [];

// ==================== EVIL FEATURES STATE ====================

// Click Tax - limit clicks for free users
let clickCount = 0;
const MAX_FREE_CLICKS = 20;
let clickTaxPaid = false;

// Subscription Decay - premium expires over time
let subscriptionTimeLeft = 0; // seconds
let subscriptionInterval = null;

// Artificial Lag - fake processing queue
let queuePosition = Math.floor(Math.random() * 20000) + 5000;
let isProcessing = false;

// Captcha state
let captchaSolved = false;
let captchaAttempts = 0;

// Cookie consent
let cookieAccepted = false;
let cookiePopupCount = 0;

// Gacha results
const GACHA_RESULTS = [
    { id: 'fail', label: 'Chúc may mắn lần sau! 😢', chance: 0.50, color: '#ef4444' },
    { id: 'discount1', label: 'Giảm giá 1%! 🎉', chance: 0.20, color: '#f59e0b' },
    { id: 'discount5', label: 'Giảm giá 5%! 🎊', chance: 0.15, color: '#f59e0b' },
    { id: 'extratry', label: '+1 Lượt quay! 🔄', chance: 0.10, color: '#3b82f6' },
    { id: 'basic', label: 'Gói Basic! ⭐', chance: 0.04, color: '#10b981' },
    { id: 'premium', label: 'GÓI PREMIUM! 👑', chance: 0.01, color: '#ffd700' }
];

// Impossible captcha questions
const CAPTCHA_QUESTIONS = [
    { q: "Nhập chính xác 10 chữ số đầu tiên của số Pi sau dấu phẩy:", a: "1415926535" },
    { q: "Căn bậc 2 của 2 (6 chữ số thập phân):", a: "1.414213" },
    { q: "Năm sinh của Alan Turing:", a: "1912" },
    { q: "Có bao nhiêu mili giây trong 1 ngày?", a: "86400000" },
    { q: "Mã màu HEX của màu 'Rebecca Purple':", a: "#663399" }
];
