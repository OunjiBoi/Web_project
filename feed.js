document.addEventListener('DOMContentLoaded', () => {
    // 1. Profile & Upload
    const fileInput = document.getElementById('profile-upload');
    const profilePic = document.getElementById('current-profile-pic');
    const STORAGE_KEY_PIC = 'serverProfilePicUrl'; 

    // fetch('/get-profile').then(res => res.json()).then(data => {
    //     document.querySelectorAll('.username').forEach(el => el.innerText = data.username);
    //     const bioEl = document.querySelector('.bio');
    //     if (bioEl) bioEl.innerText = data.bio;
    //     loadPosts(data.username); 
    // });

    // 1. ดึง Username จาก Local Storage
    const loggedInUser = localStorage.getItem('currentUser');
    
    if (!loggedInUser) {
        // ถ้าไม่พบข้อมูลผู้ใช้ (ถือว่ายังไม่ล็อกอิน) ให้เด้งกลับไปหน้า Login
        alert('Please log in first.');
        // **ปรับชื่อไฟล์ 'login.html' ให้ตรงกับชื่อไฟล์ Login ของคุณ**
        window.location.href = 'login.html'; 
        return; // หยุดการทำงานต่อ
    }
    
    // 2. นำ Username มาแสดงผลบนหน้า Feed (แทนที่ชื่อเดิม)
    document.querySelectorAll('.username').forEach(el => el.innerText = loggedInUser);
    
    // 3. ตั้งค่า Bio และ Load Post
    const bioEl = document.querySelector('.bio');
    // ตั้ง Bio ให้เป็นชื่อผู้ใช้ที่ล็อกอิน
    if (bioEl) bioEl.innerText = 'Hello My name is ' + loggedInUser + ' nice to meet you'; 
    loadPosts(loggedInUser); // ส่งชื่อผู้ใช้ไปให้ฟังก์ชันโหลดโพสต์

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

    const chatButton = document.querySelector('.chat-button');
    if (chatButton) chatButton.onclick = () => window.location.href = 'chats.html';

    // 2. Search Logic (ส่วนสำคัญ: จับการพิมพ์ในช่องค้นหา)
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const text = e.target.value.trim();
            const myNameEl = document.querySelector('.username');
            const myName = myNameEl ? myNameEl.innerText : '';

            if (text.length > 0) {
                // ถ้ามีข้อความ ให้ค้นหา
                searchPosts(text);
            } else {
                // ถ้าลบข้อความหมด ให้โหลดโพสต์ทั้งหมดกลับมา
                loadPosts(myName);
            }
        });
    }
});

// ฟังก์ชันโหลดโพสต์ทั้งหมด (ปกติ)
async function loadPosts(currentUsername) {
    const feedContainer = document.querySelector('.feed');
    try {
        const response = await fetch('/get-posts');
        const posts = await response.json();

        // นับจำนวนโพสต์
        const myPostsCount = posts.filter(p => p.username === currentUsername).length;
        const countElements = document.querySelectorAll('.count');
        if (countElements.length > 0) countElements[0].innerText = myPostsCount;

        // ล้างหน้าจอแล้วใส่โพสต์
        feedContainer.innerHTML = ''; 
        posts.forEach(post => {
            const postElement = createPostHTML(post);
            feedContainer.appendChild(postElement); // ใช้ appendChild เพราะ Server เรียงมาให้แล้ว
        });
    } catch (err) { console.error("Error loading posts:", err); }
}

// ฟังก์ชันค้นหาโพสต์ (ใหม่)
async function searchPosts(keyword) {
    const feedContainer = document.querySelector('.feed');
    try {
        // ส่งคำค้นหาไปที่ Server
        const response = await fetch(`/search-posts?q=${encodeURIComponent(keyword)}`);
        const posts = await response.json();

        feedContainer.innerHTML = ''; // ล้างหน้าจอ

        if (posts.length === 0) {
            feedContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#aaa;">No posts found.</p>';
            return;
        }

        posts.forEach(post => {
            const postElement = createPostHTML(post);
            feedContainer.appendChild(postElement);
        });
    } catch (err) { console.error(err); }
}

function createPostHTML(post) {
    const div = document.createElement('div');
    div.className = 'post';

    const dateOptions = { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short' };
    const timeString = new Date(post.time_posted).toLocaleDateString('en-US', dateOptions);
    const rawImagePath = post.image_path || '';
    const safeImagePath = rawImagePath.replace(/\\/g, '/');
    const imageStyle = safeImagePath ? `background-image: url('${safeImagePath}');` : 'display: none;';
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

// --- Comment Modal Logic ---
const modal = document.getElementById('comment-modal');
const closeModal = document.querySelector('.close-modal');
let currentPostId = null;

async function openCommentModal(postId, imageUrl, ownerName, ownerPicUrl) {
    currentPostId = postId;
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
    document.getElementById('comments-list').innerHTML = '';
    
    modal.style.display = 'flex';
    loadComments(postId);
}

async function loadComments(postId) {
    const list = document.getElementById('comments-list');
    const myNameEl = document.querySelector('.username');
    const myName = myNameEl ? myNameEl.innerText : 'Guest';
    let myPic = localStorage.getItem('serverProfilePicUrl');
    if (!myPic) myPic = `https://ui-avatars.com/api/?name=${encodeURIComponent(myName)}&background=random&color=fff`;

    try {
        const res = await fetch(`/get-comments/${postId}`);
        const comments = await res.json();
        list.innerHTML = '';
        comments.forEach(c => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            let avatarUrl;
            if (c.username === myName) avatarUrl = myPic;
            else avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.username)}&background=random&color=fff&size=128`;

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
        list.scrollTop = list.scrollHeight;
    } catch (err) { console.error(err); }
}

document.getElementById('submit-comment-btn').addEventListener('click', async () => {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;

    let myName = 'Anonymous';
    const nameEl = document.querySelector('.username'); 
    if (nameEl) myName = nameEl.innerText;

    await fetch('/add-comment', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ postId: currentPostId, username: myName, text: text })
    });
    input.value = ''; 
    loadComments(currentPostId);
});

if (closeModal) closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
window.onclick = function(event) { if (event.target == modal) modal.style.display = 'none'; }