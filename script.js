// 全局變數
const API_URL = 'https://script.google.com/macros/s/您的部署ID/exec';
let currentUser = {
    department: '',
    name: ''
};
let riskItems = [];

// DOM 元素
const loginContainer = document.getElementById('login-container');
const changePasswordContainer = document.getElementById('change-password-container');
const mainContainer = document.getElementById('main-container');
const loginMessage = document.getElementById('login-message');
const changePasswordMessage = document.getElementById('change-password-message');
const userDepartment = document.getElementById('user-department');
const userName = document.getElementById('user-name');
const riskItemsList = document.getElementById('risk-items-list');

// 事件監聽器
document.addEventListener('DOMContentLoaded', () => {
    // 登入按鈕
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    
    // 修改密碼按鈕
    document.getElementById('change-password-btn').addEventListener('click', () => {
        loginContainer.classList.add('hidden');
        changePasswordContainer.classList.remove('hidden');
    });
    
    // 返回登入按鈕
    document.getElementById('back-to-login-btn').addEventListener('click', () => {
        changePasswordContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
        document.getElementById('change-password-message').textContent = '';
        document.getElementById('change-password-message').className = 'message';
    });
    
    // 確認修改密碼按鈕
    document.getElementById('submit-change-password-btn').addEventListener('click', handleChangePassword);
    
    // 登出按鈕
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // 送出盤點按鈕
    document.getElementById('submit-inventory-btn').addEventListener('click', handleSubmitInventory);
    
    // 重置按鈕
    document.getElementById('reset-btn').addEventListener('click', resetInventoryForm);
});

// 顯示載入中
function showLoading() {
    let loading = document.getElementById('loading');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loading';
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        loading.appendChild(spinner);
        document.body.appendChild(loading);
    }
    loading.style.display = 'flex';
}

// 隱藏載入中
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// 處理登入
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !password) {
        showMessage(loginMessage, '請輸入帳號和密碼', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
        const data = await response.json();
        
        if (data.success) {
            currentUser.department = data.department;
            currentUser.name = data.name;
            
            // 更新用戶資訊顯示
            userDepartment.textContent = `部門：${currentUser.department}`;
            userName.textContent
