document.addEventListener('DOMContentLoaded', () => {
    // 1. ตรวจสอบว่าล็อกอินหรือยัง
    const myUsername = localStorage.getItem('myUsername');
    if (!myUsername) {
        alert("กรุณาล็อกอินก่อน");
        window.location.href = 'index.html';
        return;
    }

    const fileInput = document.getElementById('profile-upload');
    const profilePic = document.getElementById('current-profile-pic');
    const STORAGE_KEY_PIC = 'serverProfilePicUrl'; 

    // 2. ดึงข้อมูล Profile โดยส่ง username ไปด้วย
    fetch(`/get-profile?username=${myUsername}`)
        .then(res => res.json())
        .then(data => {
            // อัปเดตหน้าจอ
            document.querySelectorAll('.username').forEach(el => el.innerText = data.username);
            const bioEl = document.querySelector('.bio');
            if (bioEl) bioEl.innerText = data.bio;
            
            // ถ้ามีรูปใน DB ให้ใช้เลย
            if (data.profile_pic) {
                if(profilePic) profilePic.style.backgroundImage = `url('${data.profile_pic}')`;
                localStorage.setItem(STORAGE_KEY_PIC, data.profile_pic);
            }

            loadPosts(data.username); 
        });

    if (fileInput && profilePic) {
        const savedPic = localStorage.getItem(STORAGE_KEY_PIC);
        if (savedPic) profilePic.style.backgroundImage = `url('${savedPic}')`;

        fileInput.addEventListener('change', async (e) => {
            if (e.target.files[0]) {
                const formData = new FormData();
                formData.append('profilePic', e.target.files[0]);
                formData.append('username', myUsername); // ส่งชื่อไปบอกว่าใครอัปโหลด

                const res = await fetch('/upload-profile', { method: 'POST', body: formData });
                if (res.ok) {
                    const data = await res.json();
                    profilePic.style.backgroundImage = `url('${data.imageUrl}')`;
                    localStorage.setItem(STORAGE_KEY_PIC, data.imageUrl);
                    setTimeout(() => location.reload(), 500);
                }
            }
        });
    }

    const chatButton = document.querySelector('.chat-button');
    if (chatButton) chatButton.onclick = () => window.location.href = 'index.html';

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const text = e.target.value.trim();
            if (text.length > 0) searchPosts(text);
            else loadPosts(myUsername);
        });
    }
});

async function loadPosts(currentUsername) {
    const feedContainer = document.querySelector('.feed');
    try {
        const response = await fetch('/get-posts');
        const posts = await response.json();

        const myPostsCount = posts.filter(p => p.username === currentUsername).length;
        const countElements = document.querySelectorAll('.count');
        if (countElements.length > 0) countElements[0].innerText = myPostsCount;

        feedContainer.innerHTML = ''; 
        posts.forEach(post => {
            const postElement = createPostHTML(post);
            feedContainer.appendChild(postElement); 
        });
    } catch (err) { console.error("Error loading posts:", err); }
}

async function searchPosts(keyword) {
    const feedContainer = document.querySelector('.feed');
    try {
        const response = await fetch(`/search-posts?q=${encodeURIComponent(keyword)}`);
        const posts = await response.json();
        feedContainer.innerHTML = ''; 
        if (posts.length === 0) {
            feedContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#aaa;">No posts found.</p>';
            return;
        }
        posts.forEach(post => feedContainer.appendChild(createPostHTML(post)));
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
    
    // รูปโปรไฟล์คนโพสต์
    let userProfilePic = post.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.username)}&background=random&color=fff`;

    div.innerHTML = `
        <div class="post-header">
            <div class="user-info">
                <img src="${userProfilePic}" class="post-profile-pic" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(post.username)}&background=random&color=fff'">
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

// Modal Logic
const modal = document.getElementById('comment-modal');
const closeModal = document.querySelector('.close-modal');
let currentPostId = null;

async function openCommentModal(postId, imageUrl, ownerName, ownerPicUrl) {
    currentPostId = postId;
    const modalImg = document.getElementById('modal-post-image');
    if (imageUrl && imageUrl !== 'undefined' && imageUrl !== '') {
        modalImg.src = imageUrl;
        modalImg.style.display = 'block';
        document.querySelector('.modal-left').style.display = 'flex';
    } else {
        modalImg.style.display = 'none';
        document.querySelector('.modal-left').style.display = 'none';
    }
    document.getElementById('modal-owner-name').innerText = ownerName;
    const ownerImg = document.getElementById('modal-owner-pic');
    ownerImg.src = ownerPicUrl;
    ownerImg.onerror = () => ownerImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=random&color=fff`;

    document.getElementById('comments-list').innerHTML = '';
    modal.style.display = 'flex';
    loadComments(postId);
}

async function loadComments(postId) {
    const list = document.getElementById('comments-list');
    const myName = localStorage.getItem('myUsername') || 'Guest';
    let myPic = localStorage.getItem('serverProfilePicUrl');
    if (!myPic) myPic = `https://ui-avatars.com/api/?name=${encodeURIComponent(myName)}&background=random&color=fff`;

    try {
        const res = await fetch(`/get-comments/${postId}`);
        const comments = await res.json();
        list.innerHTML = '';
        comments.forEach(c => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            
            // เช็คว่าใครคอมเมนต์เพื่อเลือกรูป
            let avatarUrl;
            if (c.username === myName) avatarUrl = myPic;
            else avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.username)}&background=random&color=fff&size=128`;

            item.innerHTML = `
                <img src="${avatarUrl}" class="avatar-small" style="object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.username)}&background=random&color=fff'">
                <div>
                    <span class="username-bold">${c.username}</span>
                    <span class="comment-text">${c.comment_text}</span>
                </div>
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

    const myName = localStorage.getItem('myUsername');
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