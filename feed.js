// document.addEventListener('DOMContentLoaded', () => {
//     const fileInput = document.getElementById('profile-upload');
//     const profilePic = document.getElementById('current-profile-pic');
//     const STORAGE_KEY = 'uploadedProfilePic';

//     if (fileInput && profilePic) {

//         const savedPicUrl = localStorage.getItem(STORAGE_KEY);
//         if (savedPicUrl) {
//             profilePic.style.backgroundImage = `url('${savedPicUrl}')`;
//         }

//         fileInput.addEventListener('change', function(event) {
//             if (event.target.files && event.target.files[0]) {
//                 const reader = new FileReader();

//                 reader.onload = function(e) {
//                     const newPicUrl = e.target.result;

//                     profilePic.style.backgroundImage = `url('${newPicUrl}')`;

//                     localStorage.setItem(STORAGE_KEY, newPicUrl);
//                 };

//                 reader.readAsDataURL(event.target.files[0]);
//             }
//         });
//     } else {
//         console.error("Profile upload element not found.");
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('profile-upload');
    const profilePic = document.getElementById('current-profile-pic');
    const STORAGE_KEY = 'serverProfilePic';

    if (fileInput && profilePic) {

        const chatButton = document.querySelector('.chat-button'); //
    if (chatButton) {
        chatButton.addEventListener('click', () => {
            window.location.href = 'index.html'; // ไปหน้าแชท
        });
    }


        // โหลดรูปเดิม (ตอนนี้จะเป็น URL ที่ชี้ไปที่ Server เช่น /uploads/...)
        const savedPicUrl = localStorage.getItem(STORAGE_KEY);
        if (savedPicUrl) {
            profilePic.style.backgroundImage = `url('${savedPicUrl}')`;
        }

        fileInput.addEventListener('change', async function(event) {
            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                
                // เตรียมข้อมูลไฟล์เพื่อส่ง
                const formData = new FormData();
                formData.append('profilePic', file);

                try {
                    // ส่งไฟล์ไปให้ Server.js บันทึก
                    const response = await fetch('/upload-profile', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const newPicUrl = data.imageUrl; // ได้ Path รูปกลับมา

                        // แสดงผลและจำค่าไว้
                        profilePic.style.backgroundImage = `url('${newPicUrl}')`;
                        localStorage.setItem(STORAGE_KEY, newPicUrl);
                    } else {
                        console.error('Upload failed');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        });
    } else {
        console.error("Profile upload element not found.");
    }
});
