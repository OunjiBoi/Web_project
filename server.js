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

// --- API: Uploads ---
app.post('/upload-profile', upload.single('profilePic'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    res.json({ imageUrl: '/uploads/' + req.file.filename });
});

// --- API: Chat Image Upload (เพิ่มใหม่) ---
app.post('/upload-chat-image', upload.single('chatImage'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    // ส่ง URL ของรูปกลับไป
    res.json({ imageUrl: '/uploads/' + req.file.filename });
});

// --- API: Chat Messages ---
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

// --- API: Profile ---
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

// --- API: Posts ---
app.post('/create-post', upload.single('postImage'), (req, res) => {
    const { username, content } = req.body;
    const imagePath = req.file ? '/uploads/' + req.file.filename : '';
    db.query("INSERT INTO posts (username, content, image_path) VALUES (?, ?, ?)", [username, content, imagePath], (err) => {
        if (err) return res.status(500).send("Error");
        res.status(200).send("Success");
    });
});
app.get('/get-posts', (req, res) => {
    db.query("SELECT * FROM posts ORDER BY time_posted DESC", (err, results) => {
        if (err) return res.json([]);
        res.json(results);
    });
});
app.get('/search-posts', (req, res) => {
    const searchTerm = req.query.q;
    const sql = "SELECT * FROM posts WHERE content LIKE ? OR username LIKE ? ORDER BY time_posted DESC";
    const query = `%${searchTerm}%`;
    db.query(sql, [query, query], (err, results) => {
        if (err) return res.json([]);
        res.json(results);
    });
});

// --- API: Comments ---
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