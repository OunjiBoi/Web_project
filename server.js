// var express = require('express');
// var bodyParser = require('body-parser');
// var app = express();
// var fs = require('fs');
// var path = require('path');
// var mysql = require('mysql2');  // เพิ่ม mysql
// var multer = require('multer'); // เพิ่ม multer สำหรับอัปโหลด

// var hostname = 'localhost';
// var port = 3001;

// app.use(express.static(__dirname));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

// // เปิดให้คนอื่นเข้าถึงไฟล์ในโฟลเดอร์ uploads ได้ผ่าน URL /uploads/...
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // 1. เชื่อมต่อฐานข้อมูล MySQL
// const db = mysql.createPool({
//     host: 'localhost',
//     user: 'root',      // User ปกติของ XAMPP
//     password: '',      // Password ปกติของ XAMPP (ว่างไว้)
//     database: 'facebug_db'
// });

// // 2. ตั้งค่าการอัปโหลดรูป (Multer)
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // เก็บไฟล์ไว้ในโฟลเดอร์ uploads
//     },
//     filename: (req, file, cb) => {
//         // ตั้งชื่อไฟล์ไม่ให้ซ้ำกัน: เวลาปัจจุบัน + ชื่อไฟล์เดิม
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage: storage });

// // --- ส่วน CHAT (เปลี่ยนมาใช้ Database) ---

// // ดึงข้อความจาก DB
// app.get('/inmsg', (req, res) => {
//     const sql = "SELECT * FROM messages ORDER BY id ASC";
//     db.query(sql, (err, results) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send("Database error");
//         }
//         // ส่งผลลัพธ์เป็น Array กลับไป (chatter.js รองรับ array อยู่แล้ว)
//         res.json(results);
//     });
// });

// // บันทึกข้อความลง DB
// app.post('/outmsg', (req, res) => {
//     const { user, message, time } = req.body;
//     const sql = "INSERT INTO messages (user, message, time) VALUES (?, ?, ?)";
//     db.query(sql, [user, message, time], (err, result) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send("Error saving message");
//         }
//         res.status(200).send("Message saved");
//     });
// });

// // --- ส่วน PROFILE PIC (อัปโหลดรูปลง Server) ---

// app.post('/upload-profile', upload.single('profilePic'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded');
//     }
//     // สร้าง URL ของรูปภาพเพื่อส่งกลับไปให้ Client
//     const fileUrl = '/uploads/' + req.file.filename;
    
//     // *ตรงนี้ถ้ามีระบบ Login จริงๆ คุณควรเอา fileUrl ไป UPDATE ลงตาราง users ด้วย*
    
//     res.json({ imageUrl: fileUrl });
// });

// app.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });


var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var path = require('path');
var mysql = require('mysql2');
var multer = require('multer');

var hostname = 'localhost';
var port = 3001;

// เชื่อมต่อ MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'facebug_db'
});

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// เปิดการเข้าถึงโฟลเดอร์ uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ตั้งค่า Multer สำหรับอัปโหลดรูป
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// --- API: Upload Profile Picture ---
app.post('/upload-profile', upload.single('profilePic'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    const fileUrl = '/uploads/' + req.file.filename;
    res.json({ imageUrl: fileUrl });
});

// --- API: Chat ---
app.get('/inmsg', (req, res) => {
    db.query("SELECT * FROM messages ORDER BY id ASC", (err, results) => {
        if (err) return res.json([]);
        res.json(results);
    });
});

app.post('/outmsg', (req, res) => {
    const { user, message, time } = req.body;
    db.query("INSERT INTO messages (user, message, time) VALUES (?, ?, ?)", [user, message, time], (err) => {
        if (err) return res.status(500).send("Error");
        res.status(200).send("Saved");
    });
});

app.post('/editmsg', (req, res) => {
    const { id, message } = req.body;
    db.query("UPDATE messages SET message = ? WHERE id = ?", [message, id], (err) => {
        if (err) return res.status(500).send("Error");
        res.status(200).send("Updated");
    });
});

// --- API: Profile (Settings) ---
app.get('/get-profile', (req, res) => {
    db.query("SELECT * FROM user_profile WHERE id = 1", (err, result) => {
        if (err) return res.json({});
        res.json(result[0] || { username: 'Guest', bio: '' });
    });
});

app.post('/update-profile', (req, res) => {
    const { username, bio } = req.body;
    db.query("UPDATE user_profile SET username = ?, bio = ? WHERE id = 1", [username, bio], (err) => {
        if (err) return res.status(500).send("Error");
        res.status(200).send("Updated");
    });
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});