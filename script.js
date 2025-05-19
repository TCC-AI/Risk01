// 全局變數
const API_URL = 'https://script.google.com/macros/s/AKfycbwqcz8CNrqM4gMKZjzaH40WFkUP6wHGaZhe-2Q3GIiez-63RcbGQXxm5ibQnhsy_p_L/exec';
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
                        userName.textContent = `姓名：${currentUser.name}`;
            
            // 切換到主畫面
            loginContainer.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            
            // 清空登入表單
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            loginMessage.textContent = '';
            loginMessage.className = 'message';
            
            // 載入風險項目
            loadRiskItems();
        } else {
            showMessage(loginMessage, data.message || '登入失敗', 'error');
        }
    } catch (error) {
        console.error('登入錯誤:', error);
        showMessage(loginMessage, '系統錯誤，請稍後再試', 'error');
    } finally {
        hideLoading();
    }
}

// 處理修改密碼
async function handleChangePassword() {
    const username = document.getElementById('cp-username').value.trim();
    const currentPassword = document.getElementById('cp-current-password').value.trim();
    const newPassword = document.getElementById('cp-new-password').value.trim();
    const confirmPassword = document.getElementById('cp-confirm-password').value.trim();
    
    if (!username || !currentPassword || !newPassword || !confirmPassword) {
        showMessage(changePasswordMessage, '請填寫所有欄位', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage(changePasswordMessage, '新密碼與確認密碼不符', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}?action=changePassword&username=${encodeURIComponent(username)}&currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`);
        const data = await response.json();
        
        if (data.success) {
            showMessage(changePasswordMessage, '密碼修改成功！', 'success');
            document.getElementById('cp-username').value = '';
            document.getElementById('cp-current-password').value = '';
            document.getElementById('cp-new-password').value = '';
            document.getElementById('cp-confirm-password').value = '';
        } else {
            showMessage(changePasswordMessage, data.message || '密碼修改失敗', 'error');
        }
    } catch (error) {
        console.error('修改密碼錯誤:', error);
        showMessage(changePasswordMessage, '系統錯誤，請稍後再試', 'error');
    } finally {
        hideLoading();
    }
}

// 處理登出
function handleLogout() {
    // 清空用戶資訊
    currentUser = {
        department: '',
        name: ''
    };
    
    // 清空風險項目
    riskItems = [];
    riskItemsList.innerHTML = '';
    
    // 切換回登入畫面
    mainContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
}

// 載入風險項目
async function loadRiskItems() {
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}?action=getRiskItems&department=${encodeURIComponent(currentUser.department)}`);
        const data = await response.json();
        
        if (data.success) {
            riskItems = data.items;
            renderRiskItems();
        } else {
            alert(data.message || '載入風險項目失敗');
        }
    } catch (error) {
        console.error('載入風險項目錯誤:', error);
        alert('系統錯誤，請稍後再試');
    } finally {
        hideLoading();
    }
}

// 渲染風險項目列表
function renderRiskItems() {
    riskItemsList.innerHTML = '';
    
    if (riskItems.length === 0) {
        riskItemsList.innerHTML = '<p>沒有風險項目</p>';
        return;
    }
    
    riskItems.forEach((item, index) => {
        const riskItemElement = document.createElement('div');
        riskItemElement.className = 'risk-item';
        
        riskItemElement.innerHTML = `
            <h3>${item.name}</h3>
            <div class="risk-details">
                <p><strong>風險描述：</strong>${item.description || '無'}</p>
                <p><strong>風險類別：</strong>${item.category || '無'}</p>
                <p><strong>風險等級：</strong>${item.level || '無'}</p>
                <p><strong>相關聯部門：</strong>${item.relatedDepartments || '無'}</p>
            </div>
            <div class="risk-inventory">
                <div class="form-row">
                    <div class="radio-group">
                        <div class="radio-option">
                            <input type="radio" id="increased-yes-${index}" name="increased-${index}" value="yes">
                            <label for="increased-yes-${index}">本月有增加</label>
                        </div>
                        <div class="radio-option">
                            <input type="radio" id="increased-no-${index}" name="increased-${index}" value="no" checked>
                            <label for="increased-no-${index}">本月無增加</label>
                        </div>
                    </div>
                </div>
                <div class="form-row occurrences-container" style="display: none;">
                    <label for="occurrences-${index}">發生次數：</label>
                    <input type="number" id="occurrences-${index}" class="occurrences-input" min="1" value="1">
                </div>
                <div class="form-row occurrences-container" style="display: none;">
                    <label for="reason-${index}">原因：</label>
                    <textarea id="reason-${index}" class="reason-input" rows="3" placeholder="請說明原因"></textarea>
                </div>
            </div>
        `;
        
        riskItemsList.appendChild(riskItemElement);
        
        // 添加事件監聽器
        const yesRadio = document.getElementById(`increased-yes-${index}`);
        const noRadio = document.getElementById(`increased-no-${index}`);
        const occurrencesContainers = riskItemElement.querySelectorAll('.occurrences-container');
        
        yesRadio.addEventListener('change', () => {
            occurrencesContainers.forEach(container => {
                container.style.display = 'block';
            });
        });
        
        noRadio.addEventListener('change', () => {
            occurrencesContainers.forEach(container => {
                container.style.display = 'none';
            });
        });
    });
}

// 處理提交盤點
async function handleSubmitInventory() {
    if (riskItems.length === 0) {
        alert('沒有風險項目可供盤點');
        return;
    }
    
    const responses = [];
    
    riskItems.forEach((item, index) => {
        const increased = document.querySelector(`input[name="increased-${index}"]:checked`).value === 'yes';
        let occurrences = 0;
        let reason = '';
        
        if (increased) {
            occurrences = parseInt(document.getElementById(`occurrences-${index}`).value) || 0;
            reason = document.getElementById(`reason-${index}`).value.trim();
            
            if (occurrences <= 0) {
                alert(`請為「${item.name}」輸入有效的發生次數`);
                return;
            }
            
            if (!reason) {
                alert(`請為「${item.name}」輸入發生原因`);
                return;
            }
        }
        
        responses.push({
            riskName: item.name,
            increased,
            occurrences,
            reason
        });
    });
    
    if (responses.length !== riskItems.length) {
        return;
    }
    
    if (confirm('確定要提交盤點結果嗎？')) {
        showLoading();
        
        try {
            const response = await fetch(`${API_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'submitInventory',
                    department: currentUser.department,
                    responses: responses
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('盤點結果已成功提交！');
                resetInventoryForm();
            } else {
                alert(data.message || '提交盤點結果失敗');
            }
        } catch (error) {
            console.error('提交盤點錯誤:', error);
            alert('系統錯誤，請稍後再試');
        } finally {
            hideLoading();
        }
    }
}

// 重置盤點表單
function resetInventoryForm() {
    riskItems.forEach((item, index) => {
        document.getElementById(`increased-no-${index}`).checked = true;
        document.getElementById(`occurrences-${index}`).value = 1;
        document.getElementById(`reason-${index}`).value = '';
        
        const occurrencesContainers = document.querySelectorAll(`.risk-item:nth-child(${index + 1}) .occurrences-container`);
        occurrencesContainers.forEach(container => {
            container.style.display = 'none';
        });
    });
}

// 顯示訊息
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
}

