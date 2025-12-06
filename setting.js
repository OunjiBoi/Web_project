document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('username');
    const bioInput = document.getElementById('bio');
    const saveBtn = document.getElementById('save-btn');
    const backBtn = document.getElementById('back-btn');

    // ดึงชื่อจาก Storage
    const myUsername = localStorage.getItem('myUsername');
    if(!myUsername) {
        window.location.href = 'index.html';
        return;
    }

    fetch(`/get-profile?username=${myUsername}`)
        .then(response => response.json())
        .then(data => {
            if (data.username) nameInput.value = data.username;
            if (data.bio) bioInput.value = data.bio;
        });

    saveBtn.addEventListener('click', async () => {
        const newData = { username: myUsername, bio: bioInput.value }; // ส่งชื่อเดิมไปอ้างอิง (ถ้าจะเปลี่ยนชื่อต้องแก้ logic เพิ่ม)
        try {
            const response = await fetch('/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });
            if (response.ok) alert("บันทึกข้อมูลเรียบร้อย!");
            else alert("เกิดข้อผิดพลาดในการบันทึก");
        } catch (err) { console.error(err); }
    });

    if (backBtn) {
        backBtn.addEventListener('click', () => { window.location.href = 'feed.html'; });
    }
});