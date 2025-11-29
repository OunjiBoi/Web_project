var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var hostname = 'localhost';
var port = 3001;
var fs = require('fs');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))


// Route สำหรับ Client ที่จะดึงข้อมูลจากไฟล์ log.json
app.get('/inmsg', async (req, res) => {
  try { 
    const messages = await readMsg();
    res.json(messages);
  } catch (err) {
    console.error(err);
    // ถ้าไฟล์ไม่มีอยู่ ให้ส่ง object เปล่ากลับไปแทนการ Error 500
    if (err.code === 'ENOENT') {
         res.json({});
    } else {
         res.status(500).send("Error reading log file.");
    }
  }
})

// app.listen(port, () => {
//   console.log(`Server listening at http://localhost:${port}`);
// })

// Route สำหรับ Client ที่จะส่งข้อความใหม่มาบันทึก
app.post('/outmsg', async (req, res) => {
    try {
        const newMsg = req.body;
        // หากไฟล์ไม่มีอยู่ readMsg จะ throw error และถูก catch
        let data = await readMsg().catch(err => {
            // หากไฟล์ไม่มีอยู่ ให้เริ่มต้นด้วย object เปล่า
            if (err.code === 'ENOENT') return {};
            throw err; 
        }); 
        const updatedData = await updateMsg(newMsg, data);
        await writeMsg(updatedData);
        res.status(200).send("Message saved.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving message.");
    }
})

// ฟังก์ชันอ่านไฟล์ log.json โดยคืนค่าเป็น Promise
const readMsg = () => {
  return new Promise((resolve,reject) => {
      fs.readFile('log.json', 'utf8', (err, data) => {
          if (err) {
              reject(err); // reject เมื่อมี error
          } else {
              resolve(JSON.parse(data));
          }
      });
  })
} 

// ฟังก์ชันสำหรับเพิ่มข้อความใหม่เข้าไปในข้อมูลเดิม
const updateMsg = (new_msg, data) => {
  return new Promise((resolve,reject) => { 
      // สร้าง key ใหม่สำหรับข้อความ
      let newKey = "msg" + (Object.keys(data).length + 1);
      data[newKey] = new_msg;
      resolve(data);
  });
}

// ฟังก์ชันสำหรับเขียนข้อมูลลงไฟล์ log.json
const writeMsg = (data) => {
  return new Promise((resolve,reject) => {
    // ใช้ JSON.stringify(data, null, 2) เพื่อให้ไฟล์ json จัดรูปแบบสวยงาม
    fs.writeFile('log.json', JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
            reject(err);
        } else {
            resolve();
        }
    });
})};

app.listen(port, hostname, () => {
  console.log(`Server running at   http://${hostname}:${port}/`);
});