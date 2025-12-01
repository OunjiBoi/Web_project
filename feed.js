// document.addEventListener('DOMContentLoaded', () => {
//     const fileInput = document.getElementById('profile-upload');
//     const profilePic = document.getElementById('current-profile-pic');
    
//     // Key สำหรับจำ URL รูปไว้ (ถ้า Refresh หน้าจะได้ไม่หาย)
//     const STORAGE_KEY = 'serverProfilePicUrl'; 

//     if (fileInput && profilePic) {
//         // 1. โหลดรูปล่าสุดมาแสดง
//         const savedPicUrl = localStorage.getItem(STORAGE_KEY);
//         if (savedPicUrl) {
//             profilePic.style.backgroundImage = `url('${savedPicUrl}')`;
//         }

//         // 2. เมื่อเลือกไฟล์รูปภาพ
//         fileInput.addEventListener('change', async function(event) {
//             if (event.target.files && event.target.files[0]) {
//                 const file = event.target.files[0];

//                 // เตรียมข้อมูลเพื่อส่งไป Server
//                 const formData = new FormData();
//                 formData.append('profilePic', file); // ชื่อนี้ต้องตรงกับ upload.single ใน server.js

//                 try {
//                     // ยิง Request ไปที่ Server
//                     const response = await fetch('/upload-profile', {
//                         method: 'POST',
//                         body: formData
//                     });

//                     if (response.ok) {
//                         const data = await response.json();
//                         // data.imageUrl คือที่อยู่ไฟล์บน Server (เช่น /uploads/170123.jpg)
                        
//                         // แสดงรูปใหม่ทันที
//                         profilePic.style.backgroundImage = `url('${data.imageUrl}')`;
                        
//                         // บันทึก URL ลง LocalStorage
//                         localStorage.setItem(STORAGE_KEY, data.imageUrl);
//                     } else {
//                         console.error("Upload failed");
//                         alert("อัปโหลดไม่สำเร็จ โปรดลองใหม่");
//                     }
//                 } catch (err) {
//                     console.error("Error uploading file:", err);
//                 }
//             }
//         });
//     }

//     // --- ส่วนปุ่ม Chat Link ไปหน้า index.html ---
//     const chatButton = document.querySelector('.chat-button');
//     if (chatButton) {
//         chatButton.addEventListener('click', () => {
//             window.location.href = 'index.html';
//         });
//     }
// });



document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('profile-upload');
    const profilePic = document.getElementById('current-profile-pic');
    const STORAGE_KEY_PIC = 'serverProfilePicUrl'; 

    // 1. โหลดข้อมูลโปรไฟล์ (ชื่อ + Bio) จาก Database
    fetch('/get-profile')
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll('.username').forEach(el => el.innerText = data.username);
            const bioEl = document.querySelector('.bio');
            if (bioEl) bioEl.innerText = data.bio;
        });

    // 2. จัดการรูปภาพ (โหลด + อัปโหลด)
    if (fileInput && profilePic) {
        const savedPic = localStorage.getItem(STORAGE_KEY_PIC);
        if (savedPic) profilePic.style.backgroundImage = `url('${savedPic}')`;

        fileInput.addEventListener('change', async (e) => {
            if (e.target.files[0]) {
                const formData = new FormData();
                formData.append('profilePic', e.target.files[0]);

                const res = await fetch('/upload-profile', { method: 'POST', body: formData });
                if (res.ok) {
                    const data = await res.json();
                    profilePic.style.backgroundImage = `url('${data.imageUrl}')`;
                    localStorage.setItem(STORAGE_KEY_PIC, data.imageUrl);
                }
            }
        });
    }

    // 3. ปุ่ม Chat Link
    const chatButton = document.querySelector('.chat-button');
    if (chatButton) {
        chatButton.onclick = () => window.location.href = 'index.html';
    }
});