document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const passwordInput = document.getElementById('password-input');
    const FEED_PAGE = 'feed.html'; 

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                alert(`Login successful! Welcome, ${username}.`);
                
                // *** สำคัญ: จำชื่อผู้ใช้ไว้ใช้งานในหน้าอื่นๆ ***
                localStorage.setItem('myUsername', username);
                
                // ล้างรูปเก่า (เพื่อให้ไปโหลดรูปใหม่ของ user นี้ที่หน้า feed)
                localStorage.removeItem('serverProfilePicUrl'); 

                window.location.href = FEED_PAGE; 
            } else {
                alert('Username หรือ Password ไม่ถูกต้อง');
            }
        } catch (err) {
            console.error(err);
            alert('Server Error connecting.');
        }
    });
});