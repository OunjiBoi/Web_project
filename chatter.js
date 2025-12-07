window.onload = pageLoad;
var username= "Me"; // ตั้งชื่อผู้ใช้เริ่มต้น (แก้ได้ตามต้องการ)
var timer = null;
const CHAT_CONTAINER_ID = "chat-messages-container"; 

function pageLoad(){
	// 1. ตั้งค่าปุ่มส่งข้อความ
	var x = document.getElementById("send-msg-button");
	if (x) {
        x.onclick = sendMsg;
    }

    // 2. ตั้งค่าชื่อใน Header
    var contactName = document.getElementById("contact-name");
    if (contactName) {
        contactName.innerHTML = "Contact Name"; 
    }
	
    // 3. ตั้งค่าปุ่มย้อนกลับ (Back Arrow) ให้กลับไปหน้า Feed
    var backButton = document.querySelector(".back-arrow");
    if (backButton) {
        backButton.onclick = function() {
            window.location.href = "feed.html"; 
        };
    }

    // 4. ตั้งค่า Enter Key สำหรับช่องพิมพ์
    var inputField = document.getElementById("message-input-field");
    if (inputField) {
        inputField.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMsg();
            }
        });
    }

	// 5. เริ่มโหลดข้อความ
    // เรียก readLog() ได้แล้ว เพราะเราแก้เป็น function ด้านล่างแล้ว
	readLog(); 
	timer = setInterval (loadLog, 3000); 
}

function loadLog(){
	readLog();
}

function sendMsg(){
	var inputField = document.getElementById("message-input-field");
	var text = inputField.value.trim();
    if (text === "") {
        return; 
    }
	inputField.value = ""; 
	writeLog(text);
}

// --- ส่วนที่แก้ไข: เปลี่ยนจาก const ... = async () => เป็น async function ... ---

async function writeLog(msg) {
	let d = new Date();
	const messageData = {
		time: d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
		user: username,
		message: msg
	};

	try {
		await fetch("/outmsg", {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(messageData)
		});
        readLog(); // โหลดข้อความใหม่ทันทีหลังส่ง
	} catch (err) {
		console.error("Failed to send message", err);
	}
}

async function readLog() {
	try{
		let response = await fetch("/inmsg");
		let data = await response.json();
		postMsg(data);
	} catch (err){
		console.error("Failed to read log", err);
	}
}

// --------------------------------------------------------------------------

function postMsg(msg){
	var x = document.getElementById(CHAT_CONTAINER_ID);
    if (!x) return;
    
    // แปลงผลลัพธ์จาก Database (Array) หรือ JSON (Object) ให้เป็น Array
    let messages = [];
    if (Array.isArray(msg)) {
        messages = msg;
    } else {
        // กรณีเผื่อไว้สำหรับ JSON แบบเก่า (Object)
        messages = Object.values(msg);
    }
    
    // เช็คจำนวนข้อความเพื่อดูว่าต้องอัปเดตไหม
    const existingMessagesCount = x.children.length;
    
    if (messages.length !== existingMessagesCount) {
        // ล้างข้อความเก่า
        while(x.firstChild){
            x.removeChild(x.lastChild);
        }
        
        // วนลูปสร้างข้อความ
        for (var item of messages){
            
            var div_d = document.createElement("div");
            div_d.className = "message";
            
            // เช็คว่าเป็นข้อความเราหรือไม่
            const isSent = item.user === username;
            div_d.classList.add(isSent ? "sent" : "received");
            
            // เนื้อหาข้อความ
            var content = document.createElement("div");
            content.className = "message-content";
            
            if (isSent && item.message === "Hello mister Black!") {
                 content.classList.add("outgoing-highlight");
            }
            content.innerHTML = item.message; 
            
            // เวลา
            var timestamp = document.createElement("span");
            timestamp.className = "timestamp";
            timestamp.textContent = item.time;
            
            // จัดเรียง
            if (isSent) {
                div_d.append(content, timestamp); 
            } else {
                var avatar = document.createElement("img");
                avatar.className = "avatar";
                avatar.src = "https://via.placeholder.com/30/333333/FFFFFF?text=" + (item.user ? item.user.charAt(0) : "?");
                
                div_d.append(avatar, content, timestamp);
            }
            
            x.appendChild(div_d);
        }
        checkScroll();
    }
}

function checkScroll(){
	var chatbox = document.getElementById(CHAT_CONTAINER_ID);
    if (chatbox) {
        var isAtBottom = chatbox.scrollTop + chatbox.clientHeight >= chatbox.scrollHeight - 50;
        if (!isAtBottom) {
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    }
}




// window.onload = pageLoad;
// var username = "George"; // ค่าเริ่มต้น
// var timer = null;
// const CHAT_CONTAINER_ID = "chat-messages-container";
// var contactName = "Chat Room"; // <--- กำหนดชื่อผู้ติดต่อเริ่มต้น

// async function pageLoad() {
//     // ดึงชื่อผู้ใช้
//     try {
//         let res = await fetch('/get-profile');
//         let data = await res.json();
//         if (data.username) username = data.username;
//     } catch (e) { console.error(e); }

//     document.getElementById("contact-name").innerHTML = "Chat Room";

//     // ปุ่ม Back
//     const backBtn = document.querySelector(".back-arrow");
//     if (backBtn) backBtn.onclick = () => window.location.href = "feed.html";

//     // ปุ่ม Send
//     const sendBtn = document.getElementById("send-msg-button");
//     if (sendBtn) sendBtn.onclick = sendMsg;

//     // ปุ่ม Enter
//     const input = document.getElementById("message-input-field");
//     if (input) {
//         input.addEventListener("keypress", (e) => {
//             if (e.key === "Enter") { e.preventDefault(); sendMsg(); }
//         });
//     }

//     // --- ส่วนเพิ่มใหม่: จัดการอัปโหลดรูปในแชท ---
//     const chatImageInput = document.getElementById('chat-image-input');
//     if (chatImageInput) {
//         chatImageInput.addEventListener('change', async (e) => {
//             if (e.target.files.length > 0) {
//                 const formData = new FormData();
//                 formData.append('chatImage', e.target.files[0]);

//                 try {
//                     // 1. อัปโหลดรูปไป Server
//                     const res = await fetch('/upload-chat-image', { method: 'POST', body: formData });
//                     if (res.ok) {
//                         const data = await res.json();
//                         // 2. ส่งข้อความเป็น HTML Tag <img> เพื่อให้แสดงรูป
//                         writeLog(`<img src="${data.imageUrl}" class="chat-uploaded-image">`);
//                     }
//                 } catch (err) { console.error(err); }
//                 e.target.value = ''; // ล้างค่าเพื่อให้เลือกรูปเดิมซ้ำได้
//             }
//         });
//     }
//     // ------------------------------------------

//     readLog();
//     timer = setInterval(loadLog, 3000);
// }

// function loadLog() { readLog(); }

// function sendMsg() {
//     var input = document.getElementById("message-input-field");
//     var text = input.value.trim();
//     if (!text) return;
//     input.value = "";
//     writeLog(text);
// }

// async function writeLog(msg) {
//     let d = new Date();
//     let timeStr = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    
//     await fetch("/outmsg", {
//         method: "POST",
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ time: timeStr, user: username, message: msg })
//     });
//     readLog();
// }

// async function editMessage(id, newMsg) {
//     await fetch("/editmsg", {
//         method: "POST",
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id: id, message: newMsg })
//     });
//     readLog();
// }

// async function readLog() {
//     try {
//         let res = await fetch("/inmsg");
//         let data = await res.json();
//         postMsg(data);
//     } catch (e) { console.error(e); }
// }

// function postMsg(msg) {
//     var x = document.getElementById(CHAT_CONTAINER_ID);
//     if (!x) return;

//     let messages = Array.isArray(msg) ? msg : Object.values(msg);
//     x.innerHTML = ""; 

//     for (let item of messages) {
//         let div = document.createElement("div");
//         div.className = "message " + (item.user === username ? "sent" : "received");

//         let content = document.createElement("div");
//         content.className = "message-content";
//         content.innerHTML = item.message; // ตรงนี้จะ render <img> ถ้ามี tag html

//         // Logic คลิกแก้ไข (เฉพาะข้อความตัวอักษร)
//         if (item.user === username) {
//             // เช็คว่าไม่ใช่รูปภาพถึงจะให้แก้ได้
//             if (!item.message.includes('<img')) {
//                 content.style.cursor = "pointer";
//                 content.title = "Click to edit";
//                 content.onclick = () => {
//                     let newText = prompt("Edit your message:", item.message);
//                     if (newText && newText.trim() !== "" && newText !== item.message) {
//                         editMessage(item.id, newText);
//                     }
//                 };
//             }
//         }
        
//         let time = document.createElement("span");
//         time.className = "timestamp";
//         time.innerText = item.time;

//         if (item.user === username) {
//             div.append(content, time);
//         } else {
//             let avatar = document.createElement("img");
//             avatar.className = "avatar";
//             avatar.src = "https://via.placeholder.com/30?text=" + (item.user ? item.user.charAt(0) : "?");
//             div.append(avatar, content, time);
//         }
//         x.appendChild(div);
//     }
//     if (x.scrollHeight - x.scrollTop <= x.clientHeight + 200) {
//         x.scrollTop = x.scrollHeight;
//     }
// }



// window.onload = pageLoad;
// var username = localStorage.getItem('myUsername') || "Guest"; // ใช้ชื่อจาก Storage
// var currentContact = ""; // <<< เก็บชื่อคู่สนทนาปัจจุบัน
// var timer = null;
// const CHAT_CONTAINER_ID = "chat-messages-container"; 

// async function pageLoad() {
//     // 1. ตั้งค่าปุ่มส่งข้อความ
//     const sendBtn = document.getElementById("send-msg-button");
//     if (sendBtn) sendBtn.onclick = sendMsg;
//     const input = document.getElementById("message-input-field");
//     if (input) {
//         input.addEventListener("keypress", (e) => {
//             if (e.key === "Enter") { e.preventDefault(); sendMsg(); }
//         });
//     }

//     // 2. ตั้งค่าปุ่มย้อนกลับ
//     const backBtn = document.querySelector(".back-arrow");
//     if (backBtn) backBtn.onclick = () => window.location.href = "feed.html";
    
//     // 3. โหลดรายชื่อผู้ติดต่อ 
//     await loadContacts(); 

//     // 4. เริ่มโหลดข้อความอัตโนมัติ 
//     if (currentContact) {
//         loadMsg(); 
//         timer = setInterval(loadMsg, 2000); 
//     } else {
//         document.getElementById("contact-name").innerHTML = "No Contacts";
//     }

//     // 5. ตั้งค่า Image Upload
//     const chatImageInput = document.getElementById('chat-image-input');
//     if (chatImageInput) {
//         chatImageInput.addEventListener('change', async (e) => {
//             if (e.target.files.length > 0) {
//                 const formData = new FormData();
//                 formData.append('chatImage', e.target.files[0]);
//                 try {
//                     const res = await fetch('/upload-chat-image', { method: 'POST', body: formData });
//                     if (res.ok) {
//                         const data = await res.json();
//                         // ส่งรูปภาพเป็นข้อความ HTML tag
//                         sendMsg(data.imageUrl); 
//                     } else {
//                         console.error('Image upload failed');
//                     }
//                 } catch (err) { console.error('Upload error:', err); }
//                 e.target.value = null; 
//             }
//         });
//     }
// }

// // ----------------------------------------------------
// // F U N C T I O N S
// // ----------------------------------------------------

// // 🌟 ฟังก์ชันส่งข้อความ
// function sendMsg(imageUrl = null) {
//     const input = document.getElementById("message-input-field");
//     let text = input.value.trim();

//     // ถ้ารูปภาพเป็น null และข้อความว่างเปล่า ให้หยุด
//     if (!imageUrl && !text) return; 

//     const messageToSend = imageUrl || text;
    
//     // ล้างช่อง input ถ้าไม่ใช่การส่งรูปภาพ
//     if (!imageUrl) input.value = "";
    
//     writeLog(messageToSend);
// }

// // 🌟 ฟังก์ชันบันทึกและส่งข้อความไปยัง Server (P2P)
// async function writeLog(msg) {
//     let d = new Date();
//     let timeStr = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

//     // ตรวจสอบว่ามีคู่สนทนาปัจจุบันหรือไม่
//     if (!currentContact || currentContact === "Guest") {
//         console.warn("Cannot send message: No current contact selected.");
//         return;
//     }
    
//     const messageData = {
//         user: username,
//         contact: currentContact, // <<< ส่งคู่สนทนาปัจจุบันไปด้วย
//         message: msg,
//         time: timeStr
//     };

//     try {
//         await fetch("/send-message", { // <<< ใช้ API สำหรับ P2P
//             method: "POST",
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(messageData)
//         });
//         loadMsg(); // โหลดข้อความใหม่ทันทีหลังส่ง
//     } catch (err) {
//         console.error("Failed to send message", err);
//     }
// }

// // 🌟 ฟังก์ชันโหลดรายชื่อผู้ติดต่อจาก Server
// async function loadContacts() {
//     const listContainer = document.getElementById('chat-contact-list');
//     if (!listContainer) return;
//     listContainer.innerHTML = ''; 

//     try {
//         // ดึงรายชื่อผู้ติดต่อทั้งหมดจาก Server
//         const res = await fetch(`/get-contacts?username=${username}`);
//         if (!res.ok) throw new Error('Failed to fetch contacts');
        
//         const contacts = await res.json();
        
//         if (contacts.length === 0) {
//             listContainer.innerHTML = `<p style="padding: 10px; color: #999;">No other users found. (User: ${username})</p>`;
//             return;
//         }

//         let firstContactName = contacts[0].username;

//         // สร้าง Element สำหรับเพื่อนแต่ละคน
//         contacts.forEach(contact => {
//             const item = document.createElement('div');
//             // ใช้ class 'chat-item' ที่มีอยู่แล้ว
//             item.className = 'chat-item';
            
//             // ตั้ง active ให้กับเพื่อนคนแรกและกำหนดเป็น currentContact
//             if (contact.username === firstContactName) {
//                 item.classList.add('active-chat-item');
//                 currentContact = firstContactName;
//             }

//             item.setAttribute('data-username', contact.username);
            
//             const avatarUrl = contact.profile_pic || `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.username)}&background=ff9800&color=fff&size=40`;

//             item.innerHTML = `
//                 <img src="${avatarUrl}" alt="Avatar" class="avatar" style="object-fit: cover;">
//                 <div class="chat-info">
//                     <div class="chat-name">${contact.username}</div>
//                     <div class="last-message">Start chatting...</div>
//                 </div>
//             `;
            
//             item.onclick = () => selectContact(contact.username);

//             listContainer.appendChild(item);
//         });

//         // ตั้งค่าชื่อใน Header
//         document.getElementById("contact-name").innerHTML = currentContact;

//     } catch (err) {
//         console.error('Error loading contacts:', err);
//         listContainer.innerHTML = '<p style="padding: 10px; color: red;">Failed to load contacts.</p>';
//     }
// }

// // 🌟 ฟังก์ชันสำหรับเลือกคู่สนทนาและโหลดข้อความของคู่นั้น
// function selectContact(contactName) {
//     if (contactName === currentContact) return;

//     // 1. อัปเดตชื่อผู้ติดต่อใน Header
//     document.getElementById("contact-name").innerHTML = contactName;
//     currentContact = contactName;

//     // 2. เน้นผู้ติดต่อที่ถูกเลือก
//     document.querySelectorAll('.chat-item').forEach(item => {
//         item.classList.remove('active-chat-item');
//         if (item.getAttribute('data-username') === contactName) {
//             item.classList.add('active-chat-item');
//         }
//     });

//     // 3. หยุด Timer เก่า (ถ้ามี) และโหลดข้อความใหม่
//     if (timer) clearInterval(timer);
//     document.getElementById(CHAT_CONTAINER_ID).innerHTML = ''; 
//     loadMsg(); 
//     timer = setInterval(loadMsg, 2000); 
// }


// // 🌟 ฟังก์ชันโหลดข้อความ (P2P)
// async function loadMsg() {
//     const x = document.getElementById("chat-messages-container");
//     if (!x || !currentContact) return;

//     try {
//         // ใช้ path สั้นๆ เพื่อป้องกัน ERR_NAME_NOT_RESOLVED หากรันบน server เดียวกัน
//         const res = await fetch(`/get-messages?user1=${username}&user2=${currentContact}`);
//         const messages = await res.json();

//         x.innerHTML = ""; // ล้างหน้าจอแชทเก่า
//         for (let item of messages) {
//             let div = document.createElement("div");
//             div.className = "message " + (item.user === username ? "sent" : "received");

//             let content = document.createElement("div");
//             content.className = "message-content";
            
//             // --- จุดสำคัญ: ต้องใส่ .message เพื่อดึงข้อความออกมา ---
//             content.innerHTML = item.message; 

//             let time = document.createElement("span");
//             time.className = "timestamp";
//             time.innerText = item.time;

//             div.append(content, time);
//             x.appendChild(div);
//         }
        
//         // เลื่อนลงไปที่ข้อความล่าสุดเสมอ
//         x.scrollTop = x.scrollHeight;

//     } catch (err) {
//         console.error('Error:', err);
//     }
// }

// // ฟังก์ชันแก้ไขข้อความ (ใช้ P2P API)
// async function editMessage(messageId, newText) {
//     try {
//         const res = await fetch('/edit-message', { // <<< ใช้ API สำหรับ P2P
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ messageId, newText })
//         });

//         if (res.ok) {
//             loadMsg(); 
//         } else {
//             alert('Failed to edit message.');
//         }
//     } catch (err) {
//         console.error('Error editing message:', err);
//     }
// }