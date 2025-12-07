// var express = require('express');
// var bodyParser = require('body-parser');
// var app = express();
// var fs = require('fs');
// var path = require('path');
// var mysql = require('mysql2');
// var multer = require('multer');

// // // เพิ่มส่วนนี้สำหรับ Socket.ioและ HTTP Server
// // var http = require('http'); // ใช้สำหรับรวม Express กับ Socket.io
// // var socketio = require('socket.io');

// // //สร้าง HTTP Server และเชื่อมต่อ Socket.io
// // var server = http.createServer(app);
// // var io = socketio(server);

// var hostname = 'localhost';
// var port = 3001;

// // เชื่อมต่อ MySQL
// const db = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'facebug_db'
// });

// // โค้ดสำหรับ Users จำลอง (ถ้าคุณใช้)
// const users = [
//     { username: 'Account1', password: '444' },
//     { username: 'Account2', password: '555' }
// ];

// app.use(express.static(__dirname));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => { cb(null, 'uploads/'); },
//     filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
// });
// const upload = multer({ storage: storage });

// // API: ส่งข้อความใหม่ (POST /send-message)
// app.post('/send-message', (req, res) => {
//     const { user, contact, message } = req.body;
    
//     if (!user || !contact || !message) {
//         return res.status(400).json({ error: 'Missing message data' });
//     }

//     // สร้าง ID สำหรับคู่สนทนา (เรียงตามตัวอักษร)
//     const chatKey = [user, contact].sort().join('_'); 

//     const newMessage = {
//         id: Date.now(),
//         chatKey: chatKey,
//         user: user,
//         message: message,
//         time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
//     };

//     chatMessages.push(newMessage);
    
//     res.json({ success: true, message: newMessage });
// });

// // API: ดึงประวัติข้อความ (GET /get-messages)
// app.get('/get-messages', (req, res) => {
//     const user1 = req.query.user1;
//     const user2 = req.query.user2;

//     if (!user1 || !user2) {
//         return res.status(400).json({ error: 'Missing user parameters' });
//     }

//     const chatKey = [user1, user2].sort().join('_');

//     // กรองข้อความที่ตรงกับคู่สนทนา
//     const messages = chatMessages.filter(msg => msg.chatKey === chatKey);
    
//     res.json(messages);
// });

// app.post('/login', (req, res) => {
//     const { username, password } = req.body;
//     const user = users.find(u => u.username === username && u.password === password);
    
//     if (user) {
//         res.json({ success: true, user: { username: user.username } });
//     } else {
//         res.json({ success: false, message: 'Invalid credentials' });
//     }
// });

// // ใช้ app.listen() เดิมของคุณ
// app.listen(port, hostname, () => {
//     console.log(`Server running at http://${hostname}:${port}/`);
// })

// // --- API: Upload Profile ---
// app.post('/upload-profile', upload.single('profilePic'), (req, res) => {
//     if (!req.file) return res.status(400).send('No file uploaded');
//     res.json({ imageUrl: '/uploads/' + req.file.filename });
// });

// // --- API: Chat ---
// app.get('/inmsg', (req, res) => {
//     db.query("SELECT * FROM messages ORDER BY id ASC", (err, results) => {
//         if (err) return res.json([]);
//         res.json(results);
//     });
// });

// app.post('/outmsg', (req, res) => {
//     const { user, message, time } = req.body;
//     db.query("INSERT INTO messages (user, message, time) VALUES (?, ?, ?)", [user, message, time], (err) => {
//         if (err) return res.status(500).send("Error");
//         res.status(200).send("Saved");
//     });
// });

// app.post('/editmsg', (req, res) => {
//     const { id, message } = req.body;
//     db.query("UPDATE messages SET message = ? WHERE id = ?", [message, id], (err) => {
//         if (err) return res.status(500).send("Error");
//         res.status(200).send("Updated");
//     });
// });

// // --- API: Profile ---
// app.get('/get-profile', (req, res) => {
//     db.query("SELECT * FROM user_profile WHERE id = 1", (err, result) => {
//         if (err) return res.json({});
//         res.json(result[0] || { username: 'Guest', bio: '' });
//     });
// });

// app.post('/update-profile', (req, res) => {
//     const { username, bio } = req.body;
//     db.query("UPDATE user_profile SET username = ?, bio = ? WHERE id = 1", [username, bio], (err) => {
//         if (err) return res.status(500).send("Error");
//         res.status(200).send("Updated");
//     });
// });

// // --- API: Posts ---
// app.post('/create-post', upload.single('postImage'), (req, res) => {
//     const { username, content } = req.body;
//     const imagePath = req.file ? '/uploads/' + req.file.filename : '';
//     db.query("INSERT INTO posts (username, content, image_path) VALUES (?, ?, ?)", [username, content, imagePath], (err) => {
//         if (err) return res.status(500).send("Error");
//         res.status(200).send("Success");
//     });
// });

// app.get('/get-posts', (req, res) => {
//     db.query("SELECT * FROM posts ORDER BY time_posted DESC", (err, results) => {
//         if (err) return res.json([]);
//         res.json(results);
//     });
// });

// // --- API: Comments (เพิ่มใหม่) ---
// app.get('/get-comments/:postId', (req, res) => {
//     const postId = req.params.postId; //
//     db.query("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC", [postId], (err, results) => {
//         if (err) return res.json([]);
//         res.json(results);
//     });
// });

// //เมื่อผู้ใช้เพิ่ม Comment
// app.post('/add-comment', (req, res) => {
//     // const { postId, username, text, postOwnerId, sourceUserId } = req.body; // ต้องเพิ่ม postOwnerId, sourceUserId จาก Front-end
//     const { postId, username, text } = req.body;
    
//     // 1. INSERT Comment
//     db.query("INSERT INTO comments (post_id, username, comment_text) VALUES (?, ?, ?)", [postId, username, text], (err) => {
//         // if (err) return res.status(500).send("Error saving comment");
//         if (err) return res.status(500).send("Error");
//         res.status(200).send("Success");
        
//         // 2. INSERT Notification (แจ้งเตือนเจ้าของ Post)
//         const notiType = 'COMMENT';
//         const currentTime = new Date();
//         db.query("INSERT INTO notification (User_ID, Source_User_ID, Noti_Type, Post_ID, Noti_Time, Status) VALUES (?, ?, ?, ?, ?, 'Unread')", 
//             [postOwnerId, sourceUserId, notiType, postId, currentTime], 
//             (notiErr) => {
//                 if (notiErr) console.error("Error creating notification:", notiErr);
//                 // ในชีวิตจริงควรส่ง Real-time Notification ตรงนี้ (ดูข้อ 3)
//                 res.status(200).send("Success");
//             }
//         );
//     });
// });

// // http.listen(port, hostname, () => {
// //     console.log(`Server running at http://${hostname}:${port}/`);
// // });
// app.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);

// app.get('/search-posts', (req, res) => {
//     const searchTerm = req.query.q;
//     const sql = "SELECT * FROM posts WHERE content LIKE ? OR username LIKE ? ORDER BY time_posted DESC";
//     const query = `%${searchTerm}%`;
//     db.query(sql, [query, query], (err, results) => {
//         if (err) return res.json([]);
//         res.json(results);
//     });
// });


// // --- API: Upload Image for Chat ---
// app.post('/upload-chat-image', upload.single('chatImage'), (req, res) => {
//     if (!req.file) return res.status(400).send('No file uploaded');
//     const fileUrl = '/uploads/' + req.file.filename;
//     res.json({ imageUrl: fileUrl });
// });

// // --- API: Likes ---
// app.post('/add-like', (req, res) => {
//     const { postId, sourceUserId, postOwnerId } = req.body; 

//     // 1. INSERT Like (สมมติว่ามีตาราง likes)
//     db.query("INSERT INTO likes (post_id, user_id) VALUES (?, ?)", [postId, sourceUserId], (err) => {
//         if (err) return res.status(500).send("Error liking post");

//         // 2. INSERT Notification (แจ้งเตือนเจ้าของ Post)
//         const notiType = 'LIKE';
//         const currentTime = new Date();
//         db.query("INSERT INTO notification (User_ID, Source_User_ID, Noti_Type, Post_ID, Noti_Time, Status) VALUES (?, ?, ?, ?, ?, 'Unread')", 
//             [postOwnerId, sourceUserId, notiType, postId, currentTime], 
//             (notiErr) => {
//                 if (notiErr) console.error("Error creating notification:", notiErr);
//                 // ในชีวิตจริงควรส่ง Real-time Notification ตรงนี้ (ดูข้อ 3)
//                 res.status(200).send("Like successful and notification created");
//             }
//         );
//     });
// });

// // --- API: Notifications ---
// app.get('/get-notifications/:userId', (req, res) => {
//     const userId = req.params.userId;
//     // ดึง Noti ที่ยังไม่ได้อ่านก่อน 
//     const sql = "SELECT * FROM notification WHERE User_ID = ? ORDER BY Noti_Time DESC";
//     db.query(sql, [userId], (err, results) => {
//         if (err) return res.json([]);
//         res.json(results);
//     });
// });

// app.post('/mark-notification-read', (req, res) => {
//     const { notiId } = req.body;
//     // อัปเดตสถานะในตาราง notification ให้เป็น 'Read'
//     db.query("UPDATE notification SET Status = 'Read' WHERE Noti_ID = ?", [notiId], (err) => {
//         if (err) return res.status(500).send("Error marking as read");
//         res.status(200).send("Updated");
//     });
// });
// });

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var path = require('path');
var mysql = require('mysql2'); // ต้องแน่ใจว่าติดตั้ง mysql2 แล้ว
var multer = require('multer');

var hostname = 'localhost';
var port = 3001;

// เชื่อมต่อ MySQL (ใช้ข้อมูลเดิมของคุณ)
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'facebug_db'
});

// ===============================================
// 1. CHAT DATA & USERS
// ===============================================
const chatMessages = []; // In-memory array สำหรับเก็บข้อความแชท P2P
// 🌟 รายชื่อผู้ใช้ที่เราต้องการให้คุยกันได้
const users = [ 
    { username: 'Account1', password: '444' }, 
    { username: 'Account2', password: '555' }
];

// ===============================================
// 2. MIDDLEWARE
// ===============================================
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// ===============================================
// 3. P2P CHAT API ROUTES (ใช้ In-memory Array)
// ===============================================

// 🌟 API: ดึงรายชื่อผู้ติดต่อ (GET /get-contacts)
app.get('/get-contacts', (req, res) => {
    const myUsername = req.query.username;
    
    // กรองเอาผู้ใช้ทั้งหมด ยกเว้นตัวเอง
    const contacts = users
        .filter(user => user.username !== myUsername)
        .map(user => ({ 
            username: user.username,
            profile_pic: null // สามารถเพิ่มรูปโปรไฟล์ได้ในภายหลัง
        })); 
    
    res.json(contacts);
});

// API: ส่งข้อความใหม่ (POST /send-message)
app.post('/send-message', (req, res) => {
    const { user, contact, message } = req.body;
    
    if (!user || !contact || !message) {
        return res.status(400).json({ error: 'Data incomplete' });
    }

    const chatKey = [user, contact].sort().join('_'); 

    const newMessage = {
        id: Date.now(),
        chatKey: chatKey, 
        user: user,
        message: message, // ตรวจสอบว่าส่ง string ออกไป
        time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    chatMessages.push(newMessage);
    res.json({ success: true, message: newMessage });
});

// API: ดึงประวัติข้อความ (GET /get-messages)
app.get('/get-messages', (req, res) => {
    const user1 = req.query.user1; 
    const user2 = req.query.user2; 

    if (!user1 || !user2) {
        // กรณี Chat Room หรือไม่มีการเลือกเพื่อน อาจจะส่งข้อความว่างเปล่ากลับไป
        if (user2 === 'Chat Room') return res.json([]); 
        return res.status(400).json({ error: 'Missing user parameters' });
    }

    // สร้าง Key สำหรับค้นหาข้อความ
    const expectedChatKey = [user1, user2].sort().join('_'); 

    const filteredMessages = chatMessages.filter(msg => msg.chatKey === expectedChatKey);
    
    res.json(filteredMessages);
});

// API: แก้ไขข้อความ (POST /edit-message)
app.post('/edit-message', (req, res) => {
    try {
        const { messageId, newText } = req.body;
        // messageId ที่ส่งมาจะเป็น string หรือ number, ใช้ == ในการเปรียบเทียบ
        const messageIndex = chatMessages.findIndex(msg => msg.id == messageId); 
        
        if (messageIndex !== -1) {
            chatMessages[messageIndex].message = newText;
            return res.json({ success: true });
        }
        res.status(404).json({ success: false, error: "Message not found" });
    } catch (error) {
        console.error("Error in /edit-message:", error); 
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// API: อัปโหลดรูปภาพสำหรับแชท (POST /upload-chat-image)
app.post('/upload-chat-image', upload.single('chatImage'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ success: true, imageUrl: imageUrl });
    } catch (error) {
        console.error("Error in /upload-chat-image:", error);
        res.status(500).json({ error: "Internal Server Error during upload." });
    }
});

// ===============================================
// 4. LOGIN ROUTE และ API อื่นๆ (ใช้ MySQL/DB)
// ===============================================

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, user: { username: user.username } });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// (Routes อื่นๆ ที่คุณมี เช่น /create-post, /get-posts, /inmsg, /outmsg ฯลฯ)
// ...

// ===============================================
// 5. START SERVER
// ===============================================

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});