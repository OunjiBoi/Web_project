// window.onload = pageLoad;
// var username= "Me"; // ตั้งชื่อผู้ใช้เริ่มต้น (แก้ได้ตามต้องการ)
// var timer = null;
// const CHAT_CONTAINER_ID = "chat-messages-container"; 

// function pageLoad(){
// 	// 1. ตั้งค่าปุ่มส่งข้อความ
// 	var x = document.getElementById("send-msg-button");
// 	if (x) {
//         x.onclick = sendMsg;
//     }

//     // 2. ตั้งค่าชื่อใน Header
//     var contactName = document.getElementById("contact-name");
//     if (contactName) {
//         contactName.innerHTML = "Contact Name"; 
//     }
	
//     // 3. ตั้งค่าปุ่มย้อนกลับ (Back Arrow) ให้กลับไปหน้า Feed
//     var backButton = document.querySelector(".back-arrow");
//     if (backButton) {
//         backButton.onclick = function() {
//             window.location.href = "feed.html"; 
//         };
//     }

//     // 4. ตั้งค่า Enter Key สำหรับช่องพิมพ์
//     var inputField = document.getElementById("message-input-field");
//     if (inputField) {
//         inputField.addEventListener("keypress", function(event) {
//             if (event.key === "Enter") {
//                 event.preventDefault();
//                 sendMsg();
//             }
//         });
//     }

// 	// 5. เริ่มโหลดข้อความ
//     // เรียก readLog() ได้แล้ว เพราะเราแก้เป็น function ด้านล่างแล้ว
// 	readLog(); 
// 	timer = setInterval (loadLog, 3000); 
// }

// function loadLog(){
// 	readLog();
// }

// function sendMsg(){
// 	var inputField = document.getElementById("message-input-field");
// 	var text = inputField.value.trim();
//     if (text === "") {
//         return; 
//     }
// 	inputField.value = ""; 
// 	writeLog(text);
// }

// // --- ส่วนที่แก้ไข: เปลี่ยนจาก const ... = async () => เป็น async function ... ---

// async function writeLog(msg) {
// 	let d = new Date();
// 	const messageData = {
// 		time: d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
// 		user: username,
// 		message: msg
// 	};

// 	try {
// 		await fetch("/outmsg", {
// 			method: "POST",
// 			headers: {
// 				'Accept': 'application/json',
// 				'Content-Type': 'application/json'
// 			},
// 			body: JSON.stringify(messageData)
// 		});
//         readLog(); // โหลดข้อความใหม่ทันทีหลังส่ง
// 	} catch (err) {
// 		console.error("Failed to send message", err);
// 	}
// }

// async function readLog() {
// 	try{
// 		let response = await fetch("/inmsg");
// 		let data = await response.json();
// 		postMsg(data);
// 	} catch (err){
// 		console.error("Failed to read log", err);
// 	}
// }

// // --------------------------------------------------------------------------

// function postMsg(msg){
// 	var x = document.getElementById(CHAT_CONTAINER_ID);
//     if (!x) return;
    
//     // แปลงผลลัพธ์จาก Database (Array) หรือ JSON (Object) ให้เป็น Array
//     let messages = [];
//     if (Array.isArray(msg)) {
//         messages = msg;
//     } else {
//         // กรณีเผื่อไว้สำหรับ JSON แบบเก่า (Object)
//         messages = Object.values(msg);
//     }
    
//     // เช็คจำนวนข้อความเพื่อดูว่าต้องอัปเดตไหม
//     const existingMessagesCount = x.children.length;
    
//     if (messages.length !== existingMessagesCount) {
//         // ล้างข้อความเก่า
//         while(x.firstChild){
//             x.removeChild(x.lastChild);
//         }
        
//         // วนลูปสร้างข้อความ
//         for (var item of messages){
            
//             var div_d = document.createElement("div");
//             div_d.className = "message";
            
//             // เช็คว่าเป็นข้อความเราหรือไม่
//             const isSent = item.user === username;
//             div_d.classList.add(isSent ? "sent" : "received");
            
//             // เนื้อหาข้อความ
//             var content = document.createElement("div");
//             content.className = "message-content";
            
//             if (isSent && item.message === "Hello mister Black!") {
//                  content.classList.add("outgoing-highlight");
//             }
//             content.innerHTML = item.message; 
            
//             // เวลา
//             var timestamp = document.createElement("span");
//             timestamp.className = "timestamp";
//             timestamp.textContent = item.time;
            
//             // จัดเรียง
//             if (isSent) {
//                 div_d.append(content, timestamp); 
//             } else {
//                 var avatar = document.createElement("img");
//                 avatar.className = "avatar";
//                 avatar.src = "https://via.placeholder.com/30/333333/FFFFFF?text=" + (item.user ? item.user.charAt(0) : "?");
                
//                 div_d.append(avatar, content, timestamp);
//             }
            
//             x.appendChild(div_d);
//         }
//         checkScroll();
//     }
// }

// function checkScroll(){
// 	var chatbox = document.getElementById(CHAT_CONTAINER_ID);
//     if (chatbox) {
//         var isAtBottom = chatbox.scrollTop + chatbox.clientHeight >= chatbox.scrollHeight - 50;
//         if (!isAtBottom) {
//             chatbox.scrollTop = chatbox.scrollHeight;
//         }
//     }
// }






window.onload = pageLoad;
var username = "George"; // ค่าเริ่มต้น
var timer = null;
const CHAT_CONTAINER_ID = "chat-messages-container";

async function pageLoad() {
    // ดึงชื่อผู้ใช้ล่าสุดจาก Database ก่อนเริ่มแชท
    try {
        let res = await fetch('/get-profile');
        let data = await res.json();
        if (data.username) username = data.username;
    } catch (e) { console.error(e); }

    document.getElementById("contact-name").innerHTML = "Chat Room";

    // ปุ่ม Back
    const backBtn = document.querySelector(".back-arrow");
    if (backBtn) backBtn.onclick = () => window.location.href = "feed.html";

    // ปุ่ม Send
    const sendBtn = document.getElementById("send-msg-button");
    if (sendBtn) sendBtn.onclick = sendMsg;

    // ปุ่ม Enter
    const input = document.getElementById("message-input-field");
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") { e.preventDefault(); sendMsg(); }
        });
    }

    readLog();
    timer = setInterval(loadLog, 3000);
}

function loadLog() { readLog(); }

function sendMsg() {
    var input = document.getElementById("message-input-field");
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    writeLog(text);
}

async function writeLog(msg) {
    let d = new Date();
    let timeStr = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    
    await fetch("/outmsg", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: timeStr, user: username, message: msg })
    });
    readLog();
}

async function editMessage(id, newMsg) {
    await fetch("/editmsg", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, message: newMsg })
    });
    readLog();
}

async function readLog() {
    try {
        let res = await fetch("/inmsg");
        let data = await res.json();
        postMsg(data);
    } catch (e) { console.error(e); }
}

function postMsg(msg) {
    var x = document.getElementById(CHAT_CONTAINER_ID);
    if (!x) return;

    let messages = Array.isArray(msg) ? msg : Object.values(msg);
    
    // รีเฟรชเฉพาะเมื่อจำนวนข้อความเปลี่ยน หรือเพื่ออัปเดตการแก้ไข
    // (ในที่นี้ล้างใหม่หมดเพื่อให้แสดงผลการแก้ไขทันที)
    x.innerHTML = ""; 

    for (let item of messages) {
        let div = document.createElement("div");
        div.className = "message " + (item.user === username ? "sent" : "received");

        let content = document.createElement("div");
        content.className = "message-content";
        content.innerHTML = item.message;

        // --- Logic คลิกแก้ไข ---
        if (item.user === username) {
            content.style.cursor = "pointer";
            content.title = "Click to edit";
            content.onclick = () => {
                let newText = prompt("Edit your message:", item.message);
                if (newText && newText.trim() !== "" && newText !== item.message) {
                    editMessage(item.id, newText);
                }
            };
        }
        
        let time = document.createElement("span");
        time.className = "timestamp";
        time.innerText = item.time;

        if (item.user === username) {
            div.append(content, time);
        } else {
            let avatar = document.createElement("img");
            avatar.className = "avatar";
            avatar.src = "https://via.placeholder.com/30?text=" + (item.user ? item.user.charAt(0) : "?");
            div.append(avatar, content, time);
        }
        x.appendChild(div);
    }
    // Auto scroll ถ้าอยู่ล่างสุด
    if (x.scrollHeight - x.scrollTop <= x.clientHeight + 100) {
        x.scrollTop = x.scrollHeight;
    }
}