document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('post-image');
    const previewContainer = document.getElementById('preview-container');
    const previewImage = document.getElementById('image-preview');
    const uploadIcon = document.getElementById('upload-icon');
    const contentInput = document.getElementById('post-content');
    const uploadBtn = document.getElementById('upload-btn');
    const backBtn = document.getElementById('back-btn');

    // 1. แสดงตัวอย่างรูปภาพเมื่อเลือกไฟล์
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                uploadIcon.style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    });

    // 2. ปุ่ม Post: ส่งข้อมูลไป Server
    uploadBtn.addEventListener('click', async () => {
        // ดึงชื่อ User จาก Database ก่อน (เพื่อให้รู้ว่าใครโพสต์)
        let currentUsername = 'Anonymous';
        try {
            const res = await fetch('/get-profile');
            const data = await res.json();
            if (data.username) currentUsername = data.username;
        } catch (err) { console.error(err); }

        // เตรียมข้อมูลส่ง
        const formData = new FormData();
        formData.append('username', currentUsername);
        formData.append('content', contentInput.value);
        if (fileInput.files[0]) {
            formData.append('postImage', fileInput.files[0]);
        }

        // ยิงไปที่ Server
        try {
            const response = await fetch('/create-post', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Post created!');
                window.location.href = 'feed.html'; // กลับไปหน้า Feed
            } else {
                alert('Failed to create post');
            }
        } catch (err) {
            console.error(err);
        }
    });

    // 3. ปุ่ม Back
    backBtn.addEventListener('click', () => {
        window.location.href = 'feed.html';
    });
});