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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// ==========================================
// 1. Auth System
// ==========================================
app.post('/register', (req, res) => {
    const { email, fullname, username, password, birthdate, gender } = req.body;
    const sqlUser = "INSERT INTO users (email, fullname, username, password, birthdate, gender) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sqlUser, [email, fullname, username, password, birthdate, gender], (err, result) => {
        if (err) return res.status(500).send("Error: Username might already exist.");

        // สร้าง Profile เริ่มต้นให้ user ใหม่
        const sqlProfile = "INSERT INTO user_profile (username, bio, profile_pic) VALUES (?, 'New member of FaceBUG', 'https://via.placeholder.com/40') ON DUPLICATE KEY UPDATE bio=bio";
        db.query(sqlProfile, [username], (err) => {
            if(err) console.log("Profile creation warning:", err);
        });

        res.status(200).send("Register Success");
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, results) => {
        if (err) return res.status(500).send("Database Error");
        if (results.length > 0) {
            res.status(200).send("Login Success");
        } else {
            res.status(401).send("Invalid Username or Password");
        }
    });
});

// ==========================================
// 2. Profile & Uploads (แก้ไขให้ใช้ username)
// ==========================================
app.get('/get-profile', (req, res) => {
    // รับ username จาก Client มาค้นหา
    const username = req.query.username;
    if (!username) return res.json({ username: 'Guest', bio: '' });

    db.query("SELECT * FROM user_profile WHERE username = ?", [username], (err, result) => {
        if (err) return res.json({});
        // ถ้าไม่เจอ user ให้ส่งค่า Default
        res.json(result[0] || { username: username, bio: '', profile_pic: '' });
    });
});

app.post('/update-profile', (req, res) => {
    const { username, bio } = req.body;
    // อัปเดต Bio โดยอ้างอิงจาก username
    db.query("UPDATE user_profile SET bio = ? WHERE username = ?", [bio, username], (err) => {
        if (err) return res.status(500).send("Error");
        res.status(200).send("Updated");
    });
});

app.post('/upload-profile', upload.single('profilePic'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    
    const fileUrl = '/uploads/' + req.file.filename;
    const username = req.body.username; // รับชื่อมาด้วย

    const sql = "UPDATE user_profile SET profile_pic = ? WHERE username = ?";
    db.query(sql, [fileUrl, username], (err) => {
        if(err) console.error(err);
        res.json({ imageUrl: fileUrl });
    });
});

app.post('/upload-chat-image', upload.single('chatImage'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    res.json({ imageUrl: '/uploads/' + req.file.filename });
});

// ==========================================
// 3. Chat
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
// 4. Posts & Comments
// ==========================================
app.post('/create-post', upload.single('postImage'), (req, res) => {
    const { username, content } = req.body;
    const imagePath = req.file ? '/uploads/' + req.file.filename : '';
    db.query("INSERT INTO posts (username, content, image_path) VALUES (?, ?, ?)", [username, content, imagePath], (err) => {
        if (err) return res.status(500).send("Error");
        res.status(200).send("Success");
    });
});

app.get('/get-posts', (req, res) => {
    const sql = `
        SELECT posts.*, user_profile.profile_pic 
        FROM posts 
        LEFT JOIN user_profile ON posts.username = user_profile.username 
        ORDER BY posts.time_posted DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.json([]);
        res.json(results);
    });
});

app.get('/search-posts', (req, res) => {
    const searchTerm = req.query.q;
    const query = `%${searchTerm}%`;
    const sql = `
        SELECT posts.*, user_profile.profile_pic 
        FROM posts 
        LEFT JOIN user_profile ON posts.username = user_profile.username 
        WHERE posts.content LIKE ? OR posts.username LIKE ? 
        ORDER BY posts.time_posted DESC
    `;
    db.query(sql, [query, query], (err, results) => {
        if (err) return res.json([]);
        res.json(results);
    });
});

app.get('/get-comments/:postId', (req, res) => {
    const postId = req.params.postId;
    db.query("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC", [postId], (err, results) => {
        if (err) return res.json([]);
        res.json(results);
    });
});
app.post('/add-comment', (req, res) => {
    const { postId, username, text } = req.body;
    db.query("INSERT INTO comments (post_id, username, comment_text) VALUES (?, ?, ?)", [postId, username, text], (err) => {
        if (err) return res.status(500).send("Error");
        res.status(200).send("Success");
    });
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});