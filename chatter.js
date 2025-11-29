window.onload = pageLoad;
var username= "";
var timer = null;
const CHAT_CONTAINER_ID = "chat-messages-container"; // ID ใหม่ที่จะใช้ใน HTML

function pageLoad(){
	// ตั้งค่าปุ่มส่งข้อความ
	var x = document.getElementById("send-msg-button");
	if (x) {
        x.onclick = sendMsg;
    }
    
	// ตั้งค่าปุ่มตกลง (สำหรับการตั้งชื่อผู้ใช้ในตัวอย่างที่สมบูรณ์)
	// เนื่องจากไม่มี element 'clickok' และ 'userInput' ใน index.html ปัจจุบัน
	// จึงตัดส่วน setUsername และ element ที่เกี่ยวข้องออกไป และเรียก readLog ทันที
    
    // ตั้งค่าผู้ใช้เริ่มต้นเป็น 'Admin' หรือ 'Me'
    username = "Me"; // ตั้งชื่อผู้ใช้เริ่มต้น
    document.getElementById("contact-name").innerHTML = "Contact Name"; // ชื่อผู้ติดต่อใน Header (หากมี element)
	
	// เริ่มโหลดข้อความอัตโนมัติ
	timer = setInterval (loadLog, 3000); //Reload file every 3000 ms
	readLog();
    
    // ตั้งค่า Enter Key สำหรับช่องพิมพ์ข้อความ
    var inputField = document.getElementById("message-input-field");
    if (inputField) {
        inputField.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMsg();
            }
        });
    }
}

function loadLog(){
	readLog();
}

function sendMsg(){
	//get msg
	var inputField = document.getElementById("message-input-field");
	var text = inputField.value.trim();
    if (text === "") {
        return; // ไม่ส่งข้อความว่างเปล่า
    }
	inputField.value = ""; // เคลียร์ช่องข้อความ
	writeLog(text);
}

//ทำให้สมบูรณ์
const writeLog = (async (msg) => {
	let d = new Date();
	// สร้าง JS object ที่เก็บข้อมูลของข้อความ
	const messageData = {
		time: d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
		user:username,
		message:msg
	};

	// ส่งข้อมูลไปที่ Server ด้วย Fetch API และ Method POST
	try {
		await fetch("/outmsg", {
			method: "POST",
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(messageData)
		});
        // โหลด log ใหม่ทันทีหลังจากส่งข้อความสำเร็จ
        readLog(); 
	} catch (err) {
		console.error("Failed to send message", err);
	}
});

//ทำให้สมบูรณ์
const readLog = (async () => {
	try{
		let response = await fetch("/inmsg");
		let data = await response.json();
		postMsg(data);
	} catch (err){
		console.error("Failed to read log", err);
	}
})

// รับ msg ที่เป็น JS object ที่อ่านมาได้จาก file
function postMsg(msg){
	var x = document.getElementById(CHAT_CONTAINER_ID);
    if (!x) return;
    
	// ใช้ for loop ในการวนลูปเพื่อสร้าง element และแสดงข้อความที่อ่านมา
	let keys = Object.keys(msg);
    // เก็บข้อความเดิมก่อนการแสดงผลใหม่
    const existingMessages = x.children.length;
    
    // ถ้าจำนวนข้อความไม่เท่ากัน แสดงว่ามีข้อความใหม่ (หรือเพิ่งโหลดครั้งแรก)
    if (keys.length !== existingMessages) {
        // ล้างข้อความเดิมทั้งหมด
        while(x.firstChild){
            x.removeChild(x.lastChild);
        }
        
        for (var i of keys){
            var item = msg[i];
            
            // 1. สร้าง div message
            var div_d = document.createElement("div");
            div_d.className = "message";
            
            // ตรวจสอบว่าใครเป็นผู้ส่ง
            const isSent = item.user === username;
            div_d.classList.add(isSent ? "sent" : "received");
            
            // 2. สร้าง bubble/message-content
            var content = document.createElement("div");
            content.className = "message-content";
            
            // ตรวจสอบข้อความพิเศษสำหรับไฮไลท์
            if (isSent && item.message === "Hello mister Black!") {
                 content.classList.add("outgoing-highlight");
            }
            
            content.innerHTML = item.message; // ใส่ข้อความ
            
            // 3. สร้าง timestamp
            var timestamp = document.createElement("span");
            timestamp.className = "timestamp";
            timestamp.textContent = item.time;
            
            // 4. จัดเรียง element ภายใน div_d
            if (isSent) {
                // Sent: [Content] [Timestamp]
                div_d.append(content, timestamp); 
            } else {
                // Received: [Avatar Placeholder] [Content] [Timestamp]
                // ใน styles.css กำหนดให้ avatar ใน message.sent เป็น display: none;
                // แต่ในโค้ดนี้จะใช้การ append เฉพาะด้าน received เท่านั้น
                
                // Avatar Placeholder (เนื่องจาก index.html ไม่มีรูปภาพจริงๆ)
                var avatar = document.createElement("img");
                avatar.className = "avatar";
                // สามารถใส่ src จริงได้หากมี
                avatar.src = "https://via.placeholder.com/30/333333/FFFFFF?text=" + item.user.charAt(0);
                
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
        // ตรวจสอบว่ามีการ Scroll อยู่ที่ด้านล่างแล้วหรือไม่
        var isAtBottom = chatbox.scrollTop + chatbox.clientHeight >= chatbox.scrollHeight - 1; // ใช้ -1 เพื่อเผื่อ floating point error
        
        // ถ้าไม่ถึงด้านล่าง หรือ ถ้ามีการโหลดข้อความใหม่ ให้เลื่อนลงไปด้านล่าง
        if (!isAtBottom) {
            chatbox.scrollTop = chatbox.scrollHeight;
        }
    }
}