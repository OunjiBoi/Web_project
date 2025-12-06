document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('regis-form');

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('r-email').value;
            const fullname = document.getElementById('r-fullname').value;
            const username = document.getElementById('r-username').value;
            const password = document.getElementById('r-password').value;
            const birthdate = document.getElementById('r-birthdate').value;
            const genderInput = document.querySelector('input[name="gender"]:checked');
            const gender = genderInput ? genderInput.value : 'other';

            const userData = { email, fullname, username, password, birthdate, gender };

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });

                if (response.ok) {
                    alert('สมัครสมาชิกสำเร็จ!');
                    // *** บันทึกชื่อผู้ใช้ ***
                    localStorage.setItem('myUsername', username);
                    localStorage.removeItem('serverProfilePicUrl'); 
                    window.location.href = 'feed.html';
                } else {
                    const msg = await response.text();
                    alert('สมัครไม่ผ่าน: ' + msg);
                }
            } catch (err) {
                console.error(err);
                alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
            }
        });
    }
});