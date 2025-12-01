document.addEventListener('DOMContentLoaded', () => {
    // --- ส่วนที่ 1: จัดการ Profile ---
    const fileInput = document.getElementById('profile-upload');
    const profilePic = document.getElementById('current-profile-pic');
    const STORAGE_KEY_PIC = 'serverProfilePicUrl'; 

    // โหลดข้อมูล Profile Header (ชื่อ + Bio)
    fetch('/get-profile')
        .then(res => res.json())
        .then(data => {
            // 1. อัปเดตชื่อและ Bio ในหน้าเว็บ
            document.querySelectorAll('.username').forEach(el => el.innerText = data.username);
            const bioEl = document.querySelector('.bio');
            if (bioEl) bioEl.innerText = data.bio;

            // 2. เมื่อได้ชื่อ User มาแล้ว ค่อยไปโหลดโพสต์และนับจำนวน
            loadPosts(data.username); 
        });

    // โหลดรูป Profile
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

    // ปุ่ม Chat Link
    const chatButton = document.querySelector('.chat-button');
    if (chatButton) {
        chatButton.onclick = () => window.location.href = 'index.html';
    }
});

// ฟังก์ชันโหลดโพสต์ (รับ parameter username เข้ามาเพื่อใช้เปรียบเทียบ)
async function loadPosts(currentUsername) {
    const feedContainer = document.querySelector('.feed');
    
    try {
        const response = await fetch('/get-posts');
        const posts = await response.json();

        // --- ส่วนที่เพิ่มใหม่: คำนวณจำนวนโพสต์ของเรา ---
        // นับเฉพาะโพสต์ที่ชื่อคนโพสต์ (p.username) ตรงกับชื่อเรา (currentUsername)
        const myPostsCount = posts.filter(p => p.username === currentUsername).length;

        // อัปเดตตัวเลขใน HTML (หา class .count ตัวแรกที่เป็นของ Posts)
        const countElements = document.querySelectorAll('.count');
        if (countElements.length > 0) {
            countElements[0].innerText = myPostsCount;
        }
        // ---------------------------------------------

        // วนลูปสร้างโพสต์
        posts.forEach(post => {
            const postElement = createPostHTML(post);
            feedContainer.prepend(postElement); 
        });

    } catch (err) {
        console.error("Error loading posts:", err);
    }
}

function createPostHTML(post) {
    const div = document.createElement('div');
    div.className = 'post';

    const dateOptions = { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' };
    const timeString = new Date(post.time_posted).toLocaleDateString('en-US', dateOptions);

    const imageStyle = post.image_path ? `background-image: url('${post.image_path}');` : 'display: none;';

    // ดึงรูปโปรไฟล์
    let userProfilePic = localStorage.getItem('serverProfilePicUrl');
    if (!userProfilePic) userProfilePic = 'https://via.placeholder.com/40';

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