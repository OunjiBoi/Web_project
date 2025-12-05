document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('username');
    const bioInput = document.getElementById('bio');
    const saveBtn = document.getElementById('save-btn');
    const backBtn = document.getElementById('back-btn'); // 1. อ้างอิงปุ่ม Back

    // โหลดข้อมูลเดิมมาแสดง
    fetch('/get-profile')
        .then(response => response.json())
        .then(data => {
            if (data.username) nameInput.value = data.username;
            if (data.bio) bioInput.value = data.bio;
        });

    // ปุ่ม Save
    saveBtn.addEventListener('click', async () => {
        const newData = {
            username: nameInput.value,
            bio: bioInput.value
        };

        try {
            const response = await fetch('/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            });

            if (response.ok) {
                alert("บันทึกข้อมูลเรียบร้อย!");
            } else {
                alert("เกิดข้อผิดพลาดในการบันทึก");
            }
        } catch (err) {
            console.error(err);
        }
    });

    // --- ส่วนที่ทำให้ปุ่ม Back ทำงาน ---
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'feed.html'; // สั่งให้เปลี่ยนหน้าไปที่ feed.html
        });
    }
});