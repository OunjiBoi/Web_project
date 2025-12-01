document.addEventListener('DOMContentLoaded', () => {
    // --- ส่วนที่ 1: จัดการ Profile (โหลดรูป/ชื่อ/อัปโหลด) ---
    const fileInput = document.getElementById('profile-upload');
    const profilePic = document.getElementById('current-profile-pic');
    const STORAGE_KEY_PIC = 'serverProfilePicUrl'; 

    // โหลดข้อมูล Profile Header (ชื่อ + Bio)
    fetch('/get-profile')
        .then(res => res.json())
        .then(data => {
            // อัปเดตชื่อและ Bio ในหน้าเว็บ
            document.querySelectorAll('.username').forEach(el => el.innerText = data.username);
            const bioEl = document.querySelector('.bio');
            if (bioEl) bioEl.innerText = data.bio;
            
            // เมื่อได้ชื่อแล้ว ให้ไปโหลดโพสต์
            loadPosts(data.username); 
        });

    // จัดการรูป Profile
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
    if (chatButton) chatButton.onclick = () => window.location.href = 'index.html';
});

// ==========================================
// ส่วนจัดการ Feed และ Post
// ==========================================

async function loadPosts(currentUsername) {
    const feedContainer = document.querySelector('.feed');
    try {
        const response = await fetch('/get-posts');
        const posts = await response.json();

        // 1. นับจำนวนโพสต์ของเรา
        const myPostsCount = posts.filter(p => p.username === currentUsername).length;
        const countElements = document.querySelectorAll('.count');
        if (countElements.length > 0) countElements[0].innerText = myPostsCount;

        // (ถ้าต้องการล้างโพสต์ตัวอย่างเก่าออก ให้ uncomment บรรทัดล่างนี้)
        // feedContainer.innerHTML = ''; 

        // 2. แสดงโพสต์ (เรียงจากใหม่ไปเก่า)
        posts.forEach(post => {
            const postElement = createPostHTML(post);
            feedContainer.prepend(postElement); 
        });
    } catch (err) { console.error("Error loading posts:", err); }
}

function createPostHTML(post) {
    const div = document.createElement('div');
    div.className = 'post';

    // จัดรูปแบบเวลา
    const dateOptions = { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' };
    const timeString = new Date(post.time_posted).toLocaleDateString('en-US', dateOptions);

    // จัดการ Path รูปภาพ (เปลี่ยน \ เป็น / เพื่อกัน Error)
    const rawImagePath = post.image_path || '';
    const safeImagePath = rawImagePath.replace(/\\/g, '/');
    const imageStyle = safeImagePath ? `background-image: url('${safeImagePath}');` : 'display: none;';

    // ดึงรูปโปรไฟล์จริงของเรามาใช้ใน header ของโพสต์
    let userProfilePic = localStorage.getItem('serverProfilePicUrl') || 'https://via.placeholder.com/40';

    div.innerHTML = `
        <div class="post-header">
            <div class="user-info">
                <div class="post-profile-pic" style="background-image: url('${userProfilePic}');"></div>
                <span class="post-username">${post.username}</span>
            </div>
            <span class="post-time">${timeString}</span>
        </div>
        <div class="post-content-text" style="padding: 0 15px 10px; color: #ddd;">${post.content}</div>
        <div class="post-image" style="${imageStyle}"></div>
        <div class="post-footer">
            <span class="action-icon">👍 Like</span>
            <span class="action-icon" onclick="openCommentModal(${post.id}, '${safeImagePath}', '${post.username}', '${userProfilePic}')">💬 Comment</span>
            <span class="action-icon">📤 Share</span>
        </div>
    `;
    return div;
}

// ==========================================
// ส่วนจัดการ Comment Modal
// ==========================================
const modal = document.getElementById('comment-modal');
const closeModal = document.querySelector('.close-modal');
let currentPostId = null;

async function openCommentModal(postId, imageUrl, ownerName, ownerPicUrl) {
    currentPostId = postId;
    
    // ตั้งค่ารูปโพสต์และข้อมูลเจ้าของโพสต์ใน Modal
    const modalImg = document.getElementById('modal-post-image');
    if (imageUrl) {
        modalImg.src = imageUrl;
        modalImg.style.display = 'block';
        document.querySelector('.modal-left').style.display = 'flex';
    } else {
        modalImg.style.display = 'none';
        document.querySelector('.modal-left').style.display = 'none';
    }

    document.getElementById('modal-owner-name').innerText = ownerName;
    document.getElementById('modal-owner-pic').src = ownerPicUrl;
    document.getElementById('comments-list').innerHTML = ''; // ล้างแชทเก่า

    modal.style.display = 'flex';
    loadComments(postId);
}

// ฟังก์ชันโหลดคอมเมนต์ (แก้ไขให้รองรับภาษาไทย + รูปจริง)
async function loadComments(postId) {
    const list = document.getElementById('comments-list');
    
    // ดึงชื่อและรูปจริงของเราเตรียมไว้
    const myNameEl = document.querySelector('.username');
    const myName = myNameEl ? myNameEl.innerText : 'Guest';
    let myPic = localStorage.getItem('serverProfilePicUrl');
    // ถ้าไม่มีรูปจริง ให้สร้างรูปจากชื่อตัวเอง
    if (!myPic) myPic = `https://ui-avatars.com/api/?name=${encodeURIComponent(myName)}&background=random&color=fff`;

    try {
        const res = await fetch(`/get-comments/${postId}`);
        const comments = await res.json();
        
        list.innerHTML = ''; 
        
        comments.forEach(c => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            
            let avatarUrl;
            
            // เช็คว่าใครเป็นคนคอมเมนต์
            if (c.username === myName) {
                // ถ้าเป็นเรา -> ใช้รูปโปรไฟล์จริง
                avatarUrl = myPic;
            } else {
                // ถ้าเป็นคนอื่น -> สร้างรูปจากชื่อ (ใช้ ui-avatars รองรับภาษาไทยได้ดี)
                avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.username)}&background=random&color=fff&size=128`;
            }

            item.innerHTML = `
                <img src="${avatarUrl}" class="avatar-small" style="object-fit: cover;">
                <div>
                    <span class="username-bold">${c.username}</span>
                    <span class="comment-text">${c.comment_text}</span>
                </div>
                <span class="comment-heart">♡</span>
            `;
            list.appendChild(item);
        });
        
        list.scrollTop = list.scrollHeight; // เลื่อนลงล่างสุด
        
    } catch (err) { console.error(err); }
}

// ปุ่มส่งคอมเมนต์
document.getElementById('submit-comment-btn').addEventListener('click', async () => {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;

    let myName = 'Anonymous';
    const nameEl = document.querySelector('.username'); 
    if (nameEl) myName = nameEl.innerText;

    try {
        await fetch('/add-comment', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ postId: currentPostId, username: myName, text: text })
        });
        
        input.value = ''; 
        loadComments(currentPostId); // โหลดคอมเมนต์ใหม่ทันที
    } catch (err) { console.error("Error posting comment:", err); }
});

// ปิด Modal
if (closeModal) {
    closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
}
window.onclick = function(event) {
    if (event.target == modal) modal.style.display = 'none';
}