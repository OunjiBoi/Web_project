// login.js

document.addEventListener('DOMContentLoaded', () => {
    // ดึง Form ตาม ID ที่เราเพิ่มใน HTML
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    
    // ** ตรวจสอบชื่อไฟล์ปลายทาง: ถ้าคุณเปลี่ยนชื่อ feed.html เป็น index.html ให้แก้ตรงนี้ **
    const FEED_PAGE = 'feed.html'; 
    
    // Username/Password สมมติสำหรับการทดสอบ
    const VALID_USERNAME = 'L';
    const VALID_PASSWORD = '1234'

    if (!loginForm) {
        console.error("Login form not found! Check the ID 'login-form' in your HTML.");
        return;
    }

    loginForm.addEventListener('submit', (e) => {
        
        // 1. สำคัญ: หยุดการทำงานของ Form ดั้งเดิมไม่ให้โหลดหน้าซ้ำ
        e.preventDefault(); 
        
        const username = usernameInput.value;
        const password = passwordInput.value;

        // 2. ตรวจสอบ Username/Password
        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
            
            // 3. บันทึก Username ใน Local Storage
            localStorage.setItem('currentUser', username);
            
            alert(`Login successful! Welcome, ${username}.`);
            
            // 4. เปลี่ยนหน้าไปยัง Feed
            window.location.href = FEED_PAGE; 
            
        } else {
            alert('Invalid username or password.');
        }
    });
});