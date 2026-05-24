/**
 * ==========================================================================
 * 🎯 VIBE HUB BACKEND SERVER + GEMINI AI PROXY (Express & SQLite & Gemini API)
 * ==========================================================================
 * File này serve Frontend, quản lý SQLite Database cho Kanban, và đóng vai trò 
 * làm Secure Proxy nhận tin nhắn từ Client rồi chuyển tiếp an toàn tới Gemini API.
 */

// Nạp các biến môi trường từ file .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;

// 1. CẤU HÌNH MIDDLEWARES
app.use(cors());
app.use(express.json());

// Đảm bảo thư mục "db" chứa file SQLite tồn tại
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 2. KẾT NỐI CƠ SỞ DỮ LIỆU SQLITE
const dbPath = path.join(dbDir, 'vibe_db.sqlite');
console.log(`📡 Đang kết nối SQLite Database tại: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Lỗi kết nối cơ sở dữ liệu:', err.message);
    } else {
        console.log('✅ Kết nối SQLite Database thành công!');
        createTableTasks();
    }
});

function createTableTasks() {
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'todo',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Lỗi khởi tạo bảng tasks:', err.message);
        } else {
            console.log('📋 Bảng dữ liệu "tasks" đã sẵn sàng!');
        }
    });
}

// 3. KHỞI TẠO GOOGLE GEN AI CLIENT (GEMINI SDK)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE' && GEMINI_API_KEY.trim() !== '') {
    console.log('🔑 Đã phát hiện khóa GEMINI_API_KEY trong file .env. Hệ thống AI sẵn sàng!');
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} else {
    console.warn('\n⚠️ CẢNH BÁO: Khóa GEMINI_API_KEY chưa được thiết lập trong file server/.env.');
    console.warn('👉 Bạn sẽ không thể trò chuyện với AI Trợ lý cho đến khi dán khóa API vào đó.\n');
}

// 4. REST API CHO KANBAN BOARD (SQLITE)

app.get('/api/tasks', (req, res) => {
    db.all('SELECT * FROM tasks ORDER BY id ASC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/tasks', (req, res) => {
    const { title, status } = req.body;
    if (!title || title.trim() === '') {
        return res.status(400).json({ error: 'Tiêu đề nhiệm vụ không được rỗng!' });
    }
    const taskStatus = status || 'todo';
    const sql = 'INSERT INTO tasks (title, status) VALUES (?, ?)';
    db.run(sql, [title.trim(), taskStatus], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({
            id: this.lastID,
            title: title.trim(),
            status: taskStatus
        });
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ error: 'Trạng thái (status) không được rỗng!' });
    }
    const sql = 'UPDATE tasks SET status = ? WHERE id = ?';
    db.run(sql, [status, taskId], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: `Không tìm thấy ID = ${taskId}` });
        }
        res.json({ message: 'Cập nhật thành công!', id: taskId, status });
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.run(sql, taskId, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: `Không tìm thấy ID = ${taskId}` });
        }
        res.json({ message: 'Xóa thành công!', id: taskId });
    });
});

// 5. REST API SECURE PROXY CHO CHATBOT (GEMINI API)

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống!' });
    }

    // Nếu người dùng chưa nạp API Key trong .env
    if (!genAI) {
        return res.status(503).json({ 
            error: 'Khóa GEMINI_API_KEY chưa được cấu hình! Vui lòng làm theo hướng dẫn 30 giây để lấy khóa, mở file .env trong thư mục server/ dán vào đó rồi khởi động lại Server nhé!' 
        });
    }

    try {
        // Chỉ thị Hệ thống (System Instruction) định hình tính cách cho Vibe Mentor
        const systemInstruction = `
            Bạn là 'Vibe Mentor' - một trợ lý AI thông minh, là một lập trình viên lão luyện và cực kỳ vui vẻ, thân thiện, đồng hành cùng người học lập trình.
            Nhiệm vụ của bạn là giải đáp thắc mắc về lập trình, giải thích code lỗi, tóm tắt ghi chú và cổ vũ tinh thần học tập của người dùng.
            Quy tắc trả lời:
            1. Trả lời bằng tiếng Việt một cách ngắn gọn, súc tích (trong khoảng 3-6 câu), tránh dài dòng lan man. Sử dụng các emoji phù hợp (như 🚀, 💻, 🧠, 🎉, 💪) để tạo cảm giác gần gũi và vui vẻ.
            2. Nếu người dùng hỏi hoặc gửi đoạn code lỗi, hãy giải thích lỗi đó trong tối đa 3 dòng ngắn, rồi đưa ra block code sửa đổi chính xác được bọc trong cú pháp markdown (\`\`\`javascript ... \`\`\`).
            3. Luôn luôn khích lệ tinh thần người học kiên trì, nhấn mạnh rằng gặp lỗi lập trình là việc hết sức bình thường của các lập trình viên hàng đầu và là cơ hội tuyệt vời để tiến bộ!
            4. Chỉ tập trung hỗ trợ về học tập, lập trình, quản lý thời gian và sức khỏe tinh thần. Lịch sự từ chối trả lời các chủ đề nhạy cảm, chính trị, tôn giáo hoặc không liên quan.
        `;

        // Lấy model gemini-2.5-flash cập nhật và hoạt động ổn định nhất
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: systemInstruction
        });

        // Ánh xạ lịch sử tin nhắn thành định dạng cấu trúc chat chính thức của Gemini SDK
        // Gemini SDK sử dụng vai trò 'user' và 'model'
        const formattedHistory = (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // Khởi động phiên chat lưu trữ trạng thái lịch sử hội thoại
        const chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            }
        });

        console.log(`💬 AI đang xử lý tin nhắn: "${message}"`);
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const replyText = response.text();

        console.log(`🤖 AI trả lời: "${replyText.substring(0, 50)}..."`);
        res.json({ reply: replyText });

    } catch (error) {
        console.error("❌ Lỗi khi gọi Gemini API:", error.message);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi kết nối với máy chủ AI: ' + error.message });
    }
});

// 6. BIẾN SERVER THÀNH FULL-STACK WEB HOSTING
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// 7. KHỞI CHẠY EXPRESS SERVER
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 SERVER ĐANG CHẠY TẠI ĐỊA CHỈ: http://localhost:${PORT}`);
    console.log(`📂 Frontend Client & Gemini AI Proxy đã sẵn sàng!`);
    console.log(`==================================================\n`);
});
