// document.addEventListener('DOMContentLoaded', () => {
//     // --- ส่วนที่ 1: จัดการ Profile (เหมือนเดิม) ---
//     const fileInput = document.getElementById('profile-upload');
//     const profilePic = document.getElementById('current-profile-pic');
//     const STORAGE_KEY_PIC = 'serverProfilePicUrl'; 

//     // โหลดข้อมูล Profile Header
//     fetch('/get-profile')
//         .then(res => res.json())
//         .then(data => {
//             document.querySelectorAll('.username').forEach(el => el.innerText = data.username);
//             const bioEl = document.querySelector('.bio');
//             if (bioEl) bioEl.innerText = data.bio;
//         });

//     // โหลดรูป Profile
//     if (fileInput && profilePic) {
//         const savedPic = localStorage.getItem(STORAGE_KEY_PIC);
//         if (savedPic) profilePic.style.backgroundImage = `url('${savedPic}')`;

//         fileInput.addEventListener('change', async (e) => {
//             if (e.target.files[0]) {
//                 const formData = new FormData();
//                 formData.append('profilePic', e.target.files[0]);
//                 const res = await fetch('/upload-profile', { method: 'POST', body: formData });
//                 if (res.ok) {
//                     const data = await res.json();
//                     profilePic.style.backgroundImage = `url('${data.imageUrl}')`;
//                     localStorage.setItem(STORAGE_KEY_PIC, data.imageUrl);
//                 }
//             }
//         });
//     }

//     // ปุ่ม Chat Link
//     const chatButton = document.querySelector('.chat-button');
//     if (chatButton) {
//         chatButton.onclick = () => window.location.href = 'index.html';
//     }

//     // --- ส่วนที่ 2: โหลดโพสต์จาก Database (เพิ่มใหม่) ---
//     loadPosts();
// });

// async function loadPosts() {
//     const feedContainer = document.querySelector('.feed');
    
//     try {
//         const response = await fetch('/get-posts');
//         const posts = await response.json();

//         // ถ้ามีโพสต์ใหม่ ให้ล้างโพสต์ตัวอย่างออก (หรือจะเก็บไว้ก็ได้ ถ้าอยากล้างให้เอา comment ออก)
//         // feedContainer.innerHTML = ''; 

//         // วนลูปสร้างโพสต์ทีละอัน
//         posts.forEach(post => {
//             const postElement = createPostHTML(post);
//             // ใส่โพสต์ใหม่ไว้ด้านบนสุด
//             feedContainer.prepend(postElement); 
//         });

//     } catch (err) {
//         console.error("Error loading posts:", err);
//     }
// }

// function createPostHTML(post) {
//     const div = document.createElement('div');
//     div.className = 'post';

//     // แปลงเวลาให้สวยงาม
//     const dateOptions = { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' };
//     const timeString = new Date(post.time_posted).toLocaleDateString('en-US', dateOptions);

//     // เช็คว่ามีรูปไหม ถ้าไม่มีให้ซ่อน div รูป
//     const imageStyle = post.image_path ? `background-image: url('${post.image_path}');` : 'display: none;';

//     // สร้าง HTML ของโพสต์
//     div.innerHTML = `
//         <div class="post-header">
//             <div class="user-info">
//                 <div class="post-profile-pic" style="background-image: url('https://via.placeholder.com/40');"></div>
//                 <span class="post-username">${post.username}</span>
//             </div>
//             <span class="post-time">${timeString}</span>
//         </div>

//         <div class="post-content-text" style="padding: 0 15px 10px; color: #ddd;">
//             ${post.content}
//         </div>

//         <div class="post-image" style="${imageStyle}"></div>

//         <div class="post-footer">
//             <span class="action-icon">👍 Like</span>
//             <span class="action-icon">💬 Comment</span>
//             <span class="action-icon">📤 Share</span>
//         </div>
//     `;
//     return div;
// }



document.addEventListener('DOMContentLoaded', () => {
    // --- ส่วนที่ 1: จัดการ Profile (โหลดรูป/ชื่อ/อัปโหลด) ---
    const fileInput = document.getElementById('profile-upload');
    const profilePic = document.getElementById('current-profile-pic');
    const STORAGE_KEY_PIC = 'serverProfilePicUrl'; 

    // โหลดข้อมูล Profile Header (ชื่อ + Bio)
    fetch('/get-profile')
        .then(res => res.json())
        .then(data => {
            document.querySelectorAll('.username').forEach(el => el.innerText = data.username);
            const bioEl = document.querySelector('.bio');
            if (bioEl) bioEl.innerText = data.bio;
        });

    // โหลดรูป Profile มาแสดงในแถบซ้าย
    if (fileInput && profilePic) {
        const savedPic = localStorage.getItem(STORAGE_KEY_PIC);
        if (savedPic) profilePic.style.backgroundImage = `url('${savedPic}')`;

        // ฟังก์ชันอัปโหลดรูป
        fileInput.addEventListener('change', async (e) => {
            if (e.target.files[0]) {
                const formData = new FormData();
                formData.append('profilePic', e.target.files[0]);
                const res = await fetch('/upload-profile', { method: 'POST', body: formData });
                if (res.ok) {
                    const data = await res.json();
                    profilePic.style.backgroundImage = `url('${data.imageUrl}')`;
                    localStorage.setItem(STORAGE_KEY_PIC, data.imageUrl);
                    // รีโหลดหน้าเพื่อให้รูปในโพสต์อัปเดตตามด้วย (ถ้าต้องการ)
                    // location.reload(); 
                }
            }
        });
    }

    // ปุ่ม Chat Link
    const chatButton = document.querySelector('.chat-button');
    if (chatButton) {
        chatButton.onclick = () => window.location.href = 'index.html';
    }

    // --- ส่วนที่ 2: โหลดโพสต์จาก Database ---
    loadPosts();
});

async function loadPosts() {
    const feedContainer = document.querySelector('.feed');
    
    try {
        const response = await fetch('/get-posts');
        const posts = await response.json();

        // (ถ้าต้องการล้างโพสต์ตัวอย่างเก่าออก ให้ uncomment บรรทัดล่างนี้)
        // feedContainer.innerHTML = ''; 

        // วนลูปสร้างโพสต์
        posts.forEach(post => {
            const postElement = createPostHTML(post);
            feedContainer.prepend(postElement); // ใส่ไว้บนสุด
        });

    } catch (err) {
        console.error("Error loading posts:", err);
    }
}

function createPostHTML(post) {
    const div = document.createElement('div');
    div.className = 'post';

    // จัดรูปแบบเวลา
    const dateOptions = { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' };
    const timeString = new Date(post.time_posted).toLocaleDateString('en-US', dateOptions);

    // เช็คว่าโพสต์นี้มีรูปแนบมาไหม
    const imageStyle = post.image_path ? `background-image: url('${post.image_path}');` : 'display: none;';

    // --- ส่วนแก้ไขสำคัญ: ดึงรูปโปรไฟล์มาแสดง ---
    // 1. ดึงลิงก์รูปจาก LocalStorage (รูปของเราเอง)
    let userProfilePic = localStorage.getItem('serverProfilePicUrl');
    
    // 2. ถ้าไม่มีรูปในเครื่อง หรือโพสต์นี้ชื่อไม่ตรงกับเรา (เผื่ออนาคต) ให้ใช้รูป Default
    if (!userProfilePic) {
        userProfilePic = 'https://via.placeholder.com/40';
    }
    // ----------------------------------------

    div.innerHTML = `
        <div class="post-header">
            <div class="user-info">
                <div class="post-profile-pic" style="background-image: url('${userProfilePic}');"></div>
                <span class="post-username">${post.username}</span>
            </div>
            <span class="post-time">${timeString}</span>
        </div>

        <div class="post-content-text" style="padding: 0 15px 10px; color: #ddd;">
            ${post.content}
        </div>

        <div class="post-image" style="${imageStyle}"></div>

        <div class="post-footer">
            <span class="action-icon">👍 Like</span>
            <span class="action-icon">💬 Comment</span>
            <span class="action-icon">📤 Share</span>
        </div>
    `;
    return div;
}