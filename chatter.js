window.onload = pageLoad;
var username = "George";
var timer = null;
const CHAT_CONTAINER_ID = "chat-messages-container";

async function pageLoad() {
    try {
        let res = await fetch('/get-profile');
        let data = await res.json();
        if (data.username) username = data.username;
    } catch (e) { console.error(e); }

    document.getElementById("contact-name").innerHTML = "Chat Room";
    const backBtn = document.querySelector(".back-arrow");
    if (backBtn) backBtn.onclick = () => window.location.href = "feed.html";
    const sendBtn = document.getElementById("send-msg-button");
    if (sendBtn) sendBtn.onclick = sendMsg;
    const input = document.getElementById("message-input-field");
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") { e.preventDefault(); sendMsg(); }
        });
    }

    const chatImageInput = document.getElementById('chat-image-input');
    if (chatImageInput) {
        chatImageInput.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                const formData = new FormData();
                formData.append('chatImage', e.target.files[0]);
                try {
                    const res = await fetch('/upload-chat-image', { method: 'POST', body: formData });
                    if (res.ok) {
                        const data = await res.json();
                        writeLog(`<img src="${data.imageUrl}" class="chat-uploaded-image">`);
                    }
                } catch (err) { console.error(err); }
                e.target.value = ''; 
            }
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
    x.innerHTML = ""; 
    for (let item of messages) {
        let div = document.createElement("div");
        div.className = "message " + (item.user === username ? "sent" : "received");
        let content = document.createElement("div");
        content.className = "message-content";
        content.innerHTML = item.message;

        if (item.user === username) {
            if (!item.message.includes('<img')) {
                content.style.cursor = "pointer";
                content.title = "Click to edit";
                content.onclick = () => {
                    let newText = prompt("Edit your message:", item.message);
                    if (newText && newText.trim() !== "" && newText !== item.message) {
                        editMessage(item.id, newText);
                    }
                };
            }
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
    if (x.scrollHeight - x.scrollTop <= x.clientHeight + 200) {
        x.scrollTop = x.scrollHeight;
    }
}