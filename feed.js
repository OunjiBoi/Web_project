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

    const searchInputPost = document.getElementById('search-input-post'); // ค้นหา Post (เดิมคือ search-input)
    const searchInputUser = document.getElementById('user-search-input'); // เปลี่ยนชื่อตัวแปรเพื่อไม่ให้ซ้ำกับ searchInput เดิม
    const searchButton = document.getElementById('search-user-btn');
    const postsContainer = document.getElementById('posts-container');
    const createButton = document.querySelector('.create-post-button');


    // 2. ดึงข้อมูล Profile โดยส่ง username ไปด้วย
    fetch(`/get-profile?username=${myUsername}`)
        .then(res => res.json())
        .then(data => {
            // อัปเดตหน้าจอ
            document.querySelectorAll('.username').forEach(el => el.innerText = data.username);
            const bioEl = document.querySelector('.bio');
            if (bioEl) bioEl.innerText = data.bio;

            //แสดงจำนวนเพื่อน
            const friendsCountEl = document.querySelectorAll('.count')[1];
            if (friendsCountEl && data.friendsCount !== undefined){
                // friendsCountEl.innerText = data.friendsCount; // ปิดการใช้ API เพื่อนับ
            }
            
            // ถ้ามีรูปใน DB ให้ใช้เลย
            if (data.profile_pic) {
                if(profilePic) profilePic.style.backgroundImage = `url('${data.profile_pic}')`;
                localStorage.setItem(STORAGE_KEY_PIC, data.profile_pic);
            }

            loadPosts(data.username); 
            loadOnlineFriends(data.username);
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
    if (chatButton) chatButton.onclick = () => window.location.href = 'chatter.html';

    // const searchInput = document.getElementById('search-input');
    // if (searchInput) {
    //     searchInput.addEventListener('input', (e) => {
    //         const text = e.target.value.trim();
    //         const postsContainer = document.getElementById('posts-container');
    //         const createButton = document.querySelector('.create-post-button');

    //         if (text.length > 0) {
    //             searchPosts(text);
    //             postsContainer.classList.remove('user-search-results');
    //             createButton.style.display = 'block';
    //         }
    //         else loadPosts(myUsername);
    //     });
    // }

    // --- Logic สำหรับ Search Posts (ช่องค้นหาเดิม) ---
    if (searchInputPost) {
        searchInputPost.addEventListener('input', (e) => {
            const text = e.target.value.trim();
            if (text.length > 0) searchPosts(text);
            else loadPosts(myUsername);
        });
    }

    // --- Logic สำหรับ Search Users (ค้นหาเพื่อนใหม่) ---
    if (searchButton && searchInputUser) {
        // ... (โค้ด Search Users ยังอยู่ แต่จะไม่ได้ใช้ในการแชทจำลอง) ...
        searchButton.addEventListener('click', () => {
            const keyword = searchInputUser.value.trim();
            if (keyword) {
                // searchUsers(keyword);
                // // อาจจะต้องซ่อน input ค้นหา Post เดิมด้วย
                // if (searchInput) searchInput.style.display = 'none'; 
                // createButton.style.display = 'none'; 
                // postsContainer.classList.add('user-search-results');

                // ซ่อน input ค้นหา Post และปุ่มสร้างโพสต์
                if (searchInputPost) searchInputPost.style.display = 'none'; 
                if (createButton) createButton.style.display = 'none'; 
                if (postsContainer) postsContainer.classList.add('user-search-results');

                searchUsers(keyword, myUsername);
            } else {
                // if (searchInput) searchInput.style.display = 'block'; 
                // createButton.style.display = 'block';
                // postsContainer.classList.remove('user-search-results');

                // กลับไปแสดง Feed ปกติ
                if (searchInputPost) searchInputPost.style.display = 'block'; 
                if (createButton) createButton.style.display = 'block';
                if (postsContainer) postsContainer.classList.remove('user-search-results');
                loadPosts(myUsername);
            }
        });

        // เพิ่ม Event สำหรับ Enter Key ด้วย
        searchInputUser.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchButton.click();
        });
    }

    // ฟังก์ชันค้นหาผู้ใช้
    async function searchUsers(keyword, myName) {
        try {
            const response = await fetch(`/search-users?keyword=${encodeURIComponent(keyword)}&myUsername=${myName}`);
            const users = await response.json();
            postsContainer.innerHTML = ''; // เคลียร์หน้า Feed

            if (users.length === 0) {
                postsContainer.innerHTML = '<h2 style="color: var(--light-text-color); text-align: center; margin-top: 30px;">No users found.</h2>';
                return;
            }

            users.forEach(user => {
                if (user.username !== myName) {
                    postsContainer.appendChild(renderUserCard(user, myName));
                }
            });

        } catch (err) {
            console.error("Error searching users:", err);
            postsContainer.innerHTML = '<h2 style="color: red; text-align: center;">Error searching users.</h2>';
        }
    }

    // // ฟังก์ชันสร้าง User Card สำหรับแสดงผลการค้นหา
    function renderUserCard(user, myName) {
        const div = document.createElement('div');
        div.className = 'user-card post'; // ใช้ class post เพื่อให้ได้ style ที่คล้ายกัน
        
        const isPending = user.friend_status === 'pending';
        const isFriend = user.friend_status === 'accepted';
        let buttonText = '+ Add Friend';
        if (isPending) buttonText = 'Request Sent';
        if (isFriend) buttonText = 'Friends';

        const avatarUrl = user.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&color=fff&size=40`;
        
        div.innerHTML = `
            <div class="post-header" style="justify-content: flex-start; align-items: center;">
                <img src="${avatarUrl}" class="post-profile-pic" style="width: 50px; height: 50px; margin-right: 15px;">
                <span class="post-username" style="font-size: 1.1em;">${user.username}</span>
            </div>
            <div style="text-align: right; margin-top: -30px;">
                <button class="action-button add-friend-btn" 
                        data-username="${user.username}" 
                        ${isPending || isFriend ? 'disabled' : ''}
                        style="background: var(--chat-button-bg); color: var(--text-color); padding: 5px 10px; border: none; border-radius: 5px; cursor: pointer;">
                    ${buttonText}
                </button>
            </div>
        `;
        
        const btn = div.querySelector('.add-friend-btn');
        if (btn && !isPending && !isFriend) {
            btn.addEventListener('click', () => sendFriendRequest(user.username, myName, btn));
        }

        return div;
    }

    // // ฟังก์ชันจัดการการส่งคำขอเป็นเพื่อน
    async function sendFriendRequest(targetUsername, myName, buttonElement) {
        buttonElement.disabled = true;
        buttonElement.innerText = 'Sending...';
        try {
            // ต้องสร้าง API Endpoint '/add-friend' ใน Backend 
            const res = await fetch('/add-friend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sender: myName, receiver: targetUsername })
            });

            if (res.ok) {
                buttonElement.innerText = 'Request Sent';
                alert(`Friend request sent to ${targetUsername}`);
            } else {
                buttonElement.disabled = false;
                buttonElement.innerText = '+ Add Friend';
                alert('Failed to send friend request.');
            }
        } catch (err) {
            console.error("Error sending friend request:", err);
            buttonElement.disabled = false;
            buttonElement.innerText = '+ Add Friend';
            alert('An error occurred.');
        }
    }

    // MODIFIED FUNCTION: โหลดรายชื่อเพื่อนออนไลน์ (จำลอง)
    async function loadOnlineFriends(currentUsername) {
        const friendListUl = document.getElementById('online-friends-list');
        if (!friendListUl) return;
        friendListUl.innerHTML = '';
        
        const friends = [];
        if (currentUsername === 'Account1') {
            friends.push({ username: 'Account2' });
        } else if (currentUsername === 'Account2') {
            friends.push({ username: 'Account1' });
        }
        
        friends.forEach(friend => {
            const li = document.createElement('li');
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.username)}&background=random&color=fff&size=40`;
            li.innerHTML = `
                <div class="friend-pic" style="background-image: url('${avatarUrl}');"></div>
                <span>${friend.username}</span>
            `;
            friendListUl.appendChild(li);
        });
        
        // อัปเดตจำนวนเพื่อนใน Profile Card
        const countElements = document.querySelectorAll('.count');
        if (countElements.length >= 2) countElements[1].innerText = friends.length;
    }

});

function filterFriends(searchText) {
    const friendsList = document.querySelector('.friends-list');
    if (!friendsList) return;

    // ดึงรายการเพื่อนทั้งหมด (li)
    const friendItems = friendsList.querySelectorAll('li');
    const lowerSearchText = searchText.toLowerCase();

    friendItems.forEach(item => {
        // ดึงชื่อเพื่อนจาก <span>
        const friendNameSpan = item.querySelector('span');
        const friendName = friendNameSpan ? friendNameSpan.textContent.toLowerCase() : '';

        if (friendName.includes(lowerSearchText) || searchText === '') {
            // ถ้าชื่อเพื่อนมีข้อความที่ค้นหา หรือช่องค้นหาว่างเปล่า ให้แสดงรายการนั้น
            item.style.display = 'flex'; // ใช้ 'flex' ตาม CSS เดิม
        } else {
            // ถ้าไม่ตรง ให้ซ่อนรายการนั้น
            item.style.display = 'none';
        }
    });
}

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