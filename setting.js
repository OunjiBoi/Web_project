document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('username');
    const bioInput = document.getElementById('bio');
    const saveBtn = document.getElementById('save-btn');
    const backBtn = document.getElementById('back-btn');

    fetch('/get-profile')
        .then(response => response.json())
        .then(data => {
            if (data.username) nameInput.value = data.username;
            if (data.bio) bioInput.value = data.bio;
        });

    saveBtn.addEventListener('click', async () => {
        const newData = { username: nameInput.value, bio: bioInput.value };
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
