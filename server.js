// var express = require('express');
// var bodyParser = require('body-parser');
// var app = express();
// var fs = require('fs');
// var path = require('path');
// var mysql = require('mysql2');
// var multer = require('multer');

// var hostname = 'localhost';
// var port = 3001;

// // เชื่อมต่อ MySQL
// const db = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'facebug_db'
// });

// app.use(express.static(__dirname));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

// // เปิดการเข้าถึงโฟลเดอร์ uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // ตั้งค่า Multer สำหรับอัปโหลดรูป
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage: storage });

// // --- API: Upload Profile Picture ---
// app.post('/upload-profile', upload.single('profilePic'), (req, res) => {
//     if (!req.file) return res.status(400).send('No file uploaded');
//     const fileUrl = '/uploads/' + req.file.filename;
//     res.json({ imageUrl: fileUrl });
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

// // --- API: Profile (Settings) ---
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

// เชื่อมต่อ MySQL (ตรวจสอบ user/pass ของ XAMPP ให้ถูกต้อง)
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

// ตั้งค่า Multer สำหรับอัปโหลดรูป (ใช้ร่วมกันทั้ง Profile และ Posts)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์: เวลาปัจจุบัน + นามสกุลเดิม
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// ==========================================
// 1. ส่วนจัดการรูปโปรไฟล์ (Profile Picture)
// ==========================================
app.post('/upload-profile', upload.single('profilePic'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    const fileUrl = '/uploads/' + req.file.filename;
    res.json({ imageUrl: fileUrl });
});

// ==========================================
// 2. ส่วนจัดการแชท (Chat System)
// ==========================================
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

// ==========================================
// 3. ส่วนจัดการโปรไฟล์ (Settings)
// ==========================================
app.get('/get-profile', (req, res) => {
    // ดึงข้อมูล User คนแรก (id=1)
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

// ==========================================
// 4. ส่วนจัดการโพสต์ (Posts) - เพิ่มใหม่!
// ==========================================

// สร้างโพสต์ใหม่ (รับรูปภาพชื่อ 'postImage')
app.post('/create-post', upload.single('postImage'), (req, res) => {
    const { username, content } = req.body;
    
    // เช็คว่ามีการอัปโหลดรูปไหม ถ้ามีก็เก็บ Path ถ้าไม่มีก็ให้เป็นค่าว่าง
    const imagePath = req.file ? '/uploads/' + req.file.filename : '';

    const sql = "INSERT INTO posts (username, content, image_path) VALUES (?, ?, ?)";
    db.query(sql, [username, content, imagePath], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error creating post");
        }
        res.status(200).send("Post created successfully");
    });
});

// ดึงโพสต์ทั้งหมด (เรียงจากใหม่ไปเก่า)
app.get('/get-posts', (req, res) => {
    const sql = "SELECT * FROM posts ORDER BY time_posted DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.json([]);
        }
        res.json(results);
    });
});

// เริ่ม Server
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

