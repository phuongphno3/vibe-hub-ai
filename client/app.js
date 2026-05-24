/* ==========================================================================
   VIBE HUB DASHBOARD - JAVASCRIPT LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // 1. PHẦN CÂU TRÍCH DẪN (MOTIVATIONAL QUOTES)
    // ==========================================================================
    const quoteText = document.getElementById('web-quote-text');
    const quoteAuthor = document.getElementById('web-quote-author');
    const btnRefreshQuote = document.getElementById('btn-refresh-quote');

    const LOCAL_QUOTES = [
        { q: "Đường dài vạn dặm bắt đầu từ một bước chân.", a: "Lão Tử" },
        { q: "Cách tốt nhất để dự đoán tương lai là tự mình tạo ra nó.", a: "Peter Drucker" },
        { q: "Mọi việc đều có vẻ bất khả thi cho đến khi nó được hoàn thành.", a: "Nelson Mandela" },
        { q: "Hãy hành động như thể những gì bạn làm tạo nên sự khác biệt. Thực sự là như vậy.", a: "William James" },
        { q: "Chất lượng không phải là hành động đơn lẻ, đó là một thói quen.", a: "Aristotle" },
        { q: "Tập trung là chìa khóa mở ra mọi cánh cửa thành công.", a: "Khuyết danh" },
        { q: "Hôm nay là một cơ hội tuyệt vời để làm tốt hơn ngày hôm qua.", a: "Vibe Coder" }
    ];

    async function getQuote() {
        quoteText.textContent = '"Đang kết nối thế giới cảm hứng..."';
        quoteAuthor.textContent = '';
        
        try {
            // Sử dụng một proxy CORS miễn phí hoặc gọi trực tiếp (ZenQuotes cho phép gọi trực tiếp nhưng thỉnh thoảng lỗi CORS trên localhost)
            const response = await fetch('https://zenquotes.io/api/random');
            if (response.ok) {
                const data = await response.json();
                if (data && data[0]) {
                    quoteText.textContent = `"${data[0].q}"`;
                    quoteAuthor.textContent = `— ${data[0].a}`;
                    return;
                }
            }
        } catch (error) {
            console.log("CORS hoặc Lỗi Mạng khi lấy Quote: ", error);
        }

        // Dự phòng (Fallback) khi offline hoặc CORS lỗi
        const randomQuote = LOCAL_QUOTES[Math.floor(Math.random() * LOCAL_QUOTES.length)];
        quoteText.textContent = `"${randomQuote.q}"`;
        quoteAuthor.textContent = `— ${randomQuote.a}`;
    }

    btnRefreshQuote.addEventListener('click', getQuote);
    getQuote(); // Chạy ngay khi tải trang


    // ==========================================================================
    // 2. PHẦN TÂM TRẠNG & KHÔNG GIAN (MOOD JOURNAL & VIBE THEMES)
    // ==========================================================================
    const moodButtons = document.querySelectorAll('.mood-btn');
    const currentVibeDisplay = document.getElementById('current-vibe-display');
    const journalText = document.getElementById('journal-text');
    const btnSaveJournal = document.getElementById('btn-save-journal');
    const journalList = document.getElementById('journal-list');

    // Các thiết lập cấu hình màu sắc CSS Variables theo từng Vibe tâm trạng
    const MOOD_THEMES = {
        focus: {
            bg1: '#0a0518',
            bg2: '#050a14',
            glow1: '#8b5cf6',
            glow2: '#06b6d4',
            accent: '#8b5cf6',
            accentGlow: 'rgba(139, 92, 246, 0.25)',
            textSec: '#a78bfa',
            label: 'Tập trung'
        },
        happy: {
            bg1: '#1a0d02',
            bg2: '#14020a',
            glow1: '#f59e0b',
            glow2: '#ec4899',
            accent: '#f59e0b',
            accentGlow: 'rgba(245, 158, 11, 0.25)',
            textSec: '#fcd34d',
            label: 'Vui vẻ'
        },
        sad: {
            bg1: '#020d1a',
            bg2: '#020214',
            glow1: '#3b82f6',
            glow2: '#10b981',
            accent: '#3b82f6',
            accentGlow: 'rgba(59, 130, 246, 0.25)',
            textSec: '#93c5fd',
            label: 'Yên bình'
        },
        relaxed: {
            bg1: '#02140d',
            bg2: '#080214',
            glow1: '#10b981',
            glow2: '#8b5cf6',
            accent: '#10b981',
            accentGlow: 'rgba(16, 185, 129, 0.25)',
            textSec: '#6ee7b7',
            label: 'Thư giãn'
        }
    };

    let selectedMood = 'focus';
    let journals = JSON.parse(localStorage.getItem('vibe_journals')) || [];

    // Lắng nghe sự kiện đổi tâm trạng để cập nhật giao diện mượt mà
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const mood = btn.dataset.mood;
            selectedMood = mood;
            applyMoodTheme(mood);
        });
    });

    function applyMoodTheme(mood) {
        const theme = MOOD_THEMES[mood];
        const root = document.documentElement;

        // Cập nhật động toàn bộ biến CSS của hệ thống màu sắc
        root.style.setProperty('--bg-gradient-1', theme.bg1);
        root.style.setProperty('--bg-gradient-2', theme.bg2);
        root.style.setProperty('--glow-color-1', theme.glow1);
        root.style.setProperty('--glow-color-2', theme.glow2);
        root.style.setProperty('--accent', theme.accent);
        root.style.setProperty('--accent-glow', theme.accentGlow);
        root.style.setProperty('--text-secondary', theme.textSec);
        root.style.setProperty('--glass-border-focus', `rgba(${hexToRgb(theme.accent)}, 0.4)`);

        currentVibeDisplay.textContent = theme.label;
    }

    // Tiện ích chuyển đổi mã màu hex sang rgb để tạo viền mờ focus
    function hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '139, 92, 246';
    }

    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
    }

    // Tự động gán ID cho bất kỳ ghi chép cũ nào chưa có ID (Defensive Schema Migration)
    let journalsNeedMigration = false;
    journals.forEach(j => {
        if (!j.id) {
            j.id = 'migrated_' + Math.random().toString(36).substr(2, 9);
            journalsNeedMigration = true;
        }
    });
    if (journalsNeedMigration) {
        localStorage.setItem('vibe_journals', JSON.stringify(journals));
    }

    // Khởi động lịch sử Journal với nút Xóa
    function renderJournals() {
        journalList.innerHTML = '';
        if (journals.length === 0) {
            journalList.innerHTML = '<li class="empty-list-msg">Chưa có ghi chép nào hôm nay.</li>';
            return;
        }
        
        journals.slice().reverse().forEach(j => {
            const li = document.createElement('li');
            li.className = 'journal-item';
            const moodEmoji = MOOD_THEMES[j.mood]?.label === 'Tập trung' ? '🎯' : 
                              MOOD_THEMES[j.mood]?.label === 'Vui vẻ' ? '☀️' : 
                              MOOD_THEMES[j.mood]?.label === 'Yên bình' ? '🌧️' : '🍃';
                              
            li.innerHTML = `
                <div class="journal-item-left">
                    <span>${moodEmoji}</span>
                    <span style="font-weight: 500; word-break: break-word;">${escapeHTML(j.text)}</span>
                </div>
                <div class="journal-item-right">
                    <span class="journal-item-time">${j.time}</span>
                    <button class="btn-delete-journal" title="Xóa ghi chép">&times;</button>
                </div>
            `;

            // Lắng nghe sự kiện click nút xóa
            li.querySelector('.btn-delete-journal').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteJournal(j.id);
            });

            journalList.appendChild(li);
        });
    }

    function deleteJournal(id) {
        journals = journals.filter(j => j.id !== id);
        localStorage.setItem('vibe_journals', JSON.stringify(journals));
        renderJournals();
    }

    btnSaveJournal.addEventListener('click', () => {
        const text = journalText.value.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const id = 'journal_' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
        
        journals.push({ id, text, mood: selectedMood, time });
        
        localStorage.setItem('vibe_journals', JSON.stringify(journals));
        journalText.value = '';
        renderJournals();
    });

    renderJournals();


    // ==========================================================================
    // 2.5 LỚP QUẢN LÝ ÂM THANH TRẮNG TỔNG HỢP (SYNTHETIC AMBIENT GENERATOR)
    // ==========================================================================
    class AmbientSoundManager {
        constructor() {
            this.currentSound = 'none';
            this.volume = 0.5;
            this.audioElement = null;
        }
        
        setVolume(value) {
            this.volume = value;
            if (this.audioElement) {
                this.audioElement.volume = this.volume;
            }
        }
        
        stop() {
            if (this.audioElement) {
                this.audioElement.pause();
                this.audioElement = null;
            }
            this.currentSound = 'none';
        }
        
        play(soundType) {
            this.stop();
            
            if (soundType === 'none') return;
            
            this.currentSound = soundType;
            
            // Khởi tạo đối tượng Audio động trỏ vào thư mục sounds/
            this.audioElement = new Audio(`sounds/${soundType}.mp3`);
            this.audioElement.loop = true;
            this.audioElement.volume = this.volume;
            
            // Bắt đầu phát âm thanh và bắt lỗi nếu chưa có file
            this.audioElement.play().catch(error => {
                console.log("Không thể phát file âm thanh: ", error);
                alert(`⚠️ Lỗi: Âm thanh này chưa được thêm vào web, hãy đợi cập nhật nhé`);
            });
        }
    }

    const ambientManager = new AmbientSoundManager();
    const ambientButtons = document.querySelectorAll('.ambient-btn');
    const ambientVolumeInput = document.getElementById('ambient-volume');
    const volumePercentage = document.getElementById('volume-percentage');

    ambientButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            ambientButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const sound = btn.dataset.sound;
            ambientManager.play(sound);
        });
    });

    ambientVolumeInput.addEventListener('input', (e) => {
        const val = e.target.value;
        volumePercentage.textContent = `${val}%`;
        ambientManager.setVolume(val / 100);
    });


    // ==========================================================================
    // 3. BỘ ĐẾM GIỜ POMODORO TIMER VỚI WEB AUDIO CHIME
    // ==========================================================================
    const timerTime = document.getElementById('timer-time');
    const timerStateLabel = document.getElementById('timer-state-label');
    const workDurationInput = document.getElementById('work-duration');
    const breakDurationInput = document.getElementById('break-duration');
    const btnStart = document.getElementById('btn-start');
    const btnPause = document.getElementById('btn-pause');
    const btnReset = document.getElementById('btn-reset');
    const timerRing = document.getElementById('timer-ring');

    let timerInterval = null;
    let isRunning = false;
    let isWorking = true; // true = Đang làm việc, false = Đang nghỉ ngơi
    let timeLeft = 25 * 60; // 25 phút mặc định
    let totalTime = 25 * 60;

    // Chuông điện tử chất lượng cao tạo bằng Web Audio API
    function playBeepSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            // Tạo chuông kép (Double chime sound)
            osc.frequency.setValueAtTime(880, ctx.currentTime); // Nốt A5
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4); // Nốt A4
            
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.6);
        } catch (e) {
            console.log("Web Audio API không được hỗ trợ bởi trình duyệt: ", e);
        }
    }

    function updateTimerDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerTime.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        // Cập nhật vòng tròn SVG tiến trình đếm ngược (Chu vi = 534)
        if (totalTime > 0) {
            const offset = 534 - (timeLeft / totalTime) * 534;
            timerRing.style.strokeDashoffset = offset;
        } else {
            timerRing.style.strokeDashoffset = 534;
        }
    }

    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        btnStart.disabled = true;
        btnPause.disabled = false;
        workDurationInput.disabled = true;
        breakDurationInput.disabled = true;

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                playBeepSound();
                switchTimerMode();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (!isRunning) return;
        
        isRunning = false;
        clearInterval(timerInterval);
        btnStart.disabled = false;
        btnPause.disabled = true;
    }

    function resetTimer() {
        pauseTimer();
        isWorking = true;
        timerStateLabel.textContent = 'LÀM VIỆC';
        timerStateLabel.style.color = 'var(--text-secondary)';
        
        const workMin = parseInt(workDurationInput.value) || 25;
        timeLeft = workMin * 60;
        totalTime = timeLeft;
        
        workDurationInput.disabled = false;
        breakDurationInput.disabled = false;
        btnStart.disabled = false;
        btnPause.disabled = true;
        
        updateTimerDisplay();
    }

    function switchTimerMode() {
        isRunning = false;
        
        if (isWorking) {
            // Hoàn thành hiệp làm việc -> chuyển sang giải lao
            isWorking = false;
            timerStateLabel.textContent = 'NGHỈ NGƠI';
            timerStateLabel.style.color = 'var(--done-color)';
            
            // Đố người dùng lưu tác vụ đã hoàn thành sang Kanban
            const doneTaskText = prompt("🎉 Tuyệt vời! Bạn vừa hoàn thành một hiệp làm việc. Nhập tác vụ đã làm để đưa thẳng vào Kanban cột 'Đã xong':");
            if (doneTaskText && doneTaskText.trim()) {
                addTask(doneTaskText.trim(), 'done');
            }

            const breakMin = parseInt(breakDurationInput.value) || 5;
            timeLeft = breakMin * 60;
            totalTime = timeLeft;
        } else {
            // Hoàn thành giải lao -> quay lại làm việc
            isWorking = true;
            timerStateLabel.textContent = 'LÀM VIỆC';
            timerStateLabel.style.color = 'var(--text-secondary)';
            
            const workMin = parseInt(workDurationInput.value) || 25;
            timeLeft = workMin * 60;
            totalTime = timeLeft;
        }
        
        updateTimerDisplay();
        btnStart.disabled = false;
        btnPause.disabled = true;
    }

    // Đồng bộ thay đổi đầu vào thời gian ngay lập tức
    workDurationInput.addEventListener('change', () => {
        if (!isRunning && isWorking) {
            resetTimer();
        }
    });
    breakDurationInput.addEventListener('change', () => {
        if (!isRunning && !isWorking) {
            const breakMin = parseInt(breakDurationInput.value) || 5;
            timeLeft = breakMin * 60;
            totalTime = timeLeft;
            updateTimerDisplay();
        }
    });

    btnStart.addEventListener('click', startTimer);
    btnPause.addEventListener('click', pauseTimer);
    btnReset.addEventListener('click', resetTimer);
    
    // Cập nhật hiển thị vòng tròn ban đầu
    timerRing.style.strokeDasharray = 534;
    resetTimer();


    // ==========================================================================
    // 4. TRÌNH QUẢN LÝ KÉO THẢ KANBAN BOARD (KẾT NỐI FULL-STACK REST API)
    // ==========================================================================
    const taskForm = document.getElementById('new-task-form');
    const taskInput = document.getElementById('new-task-input');
    const lists = {
        todo: document.getElementById('list-todo'),
        progress: document.getElementById('list-progress'),
        done: document.getElementById('list-done')
    };
    const badges = {
        todo: document.getElementById('count-todo'),
        progress: document.getElementById('count-progress'),
        done: document.getElementById('count-done')
    };

    // Khai báo địa chỉ Server API tương đối (hoạt động hoàn hảo cả trên Localhost và Production thực tế!)
    const API_BASE_URL = '/api';
    let tasks = [];

    // Tải danh sách công việc từ SQLite Server
    async function loadTasksFromServer() {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`);
            if (response.ok) {
                const data = await response.json();
                // Ánh xạ cấu hình dữ liệu từ Server (title -> text) để khớp giao diện cũ
                tasks = data.map(task => ({
                    id: task.id.toString(),
                    text: task.title,
                    status: task.status
                }));
                renderTasks();
            } else {
                console.error("Không thể lấy dữ liệu từ server:", response.statusText);
            }
        } catch (error) {
            console.error("Lỗi kết nối mạng đến server:", error);
            // Dự phòng offline (đọc từ localStorage để app không bị sập)
            tasks = JSON.parse(localStorage.getItem('vibe_tasks')) || [];
            renderTasks();
        }
    }

    // Thêm mới công việc vào SQLite Server
    async function addTaskToServer(text, status = 'todo') {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: text, status })
            });

            if (response.ok) {
                const newTask = await response.json();
                // Ánh xạ dữ liệu vừa thêm thành công
                tasks.push({
                    id: newTask.id.toString(),
                    text: newTask.title,
                    status: newTask.status
                });
                renderTasks();
            } else {
                alert("❌ Lỗi: Server từ chối thêm công việc mới.");
            }
        } catch (error) {
            console.error("Lỗi kết nối khi thêm task:", error);
            // Lưu tạm offline
            const tempTask = { id: Date.now().toString(), text, status };
            tasks.push(tempTask);
            renderTasks();
        }
    }

    // Cập nhật trạng thái kéo thả công việc lên SQLite Server
    async function updateTaskOnServer(id, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                const task = tasks.find(t => t.id === id);
                if (task) task.status = status;
                renderTasks();
            } else {
                console.error("Lỗi cập nhật trên server:", response.statusText);
            }
        } catch (error) {
            console.error("Lỗi kết nối khi cập nhật task:", error);
            const task = tasks.find(t => t.id === id);
            if (task) task.status = status;
            renderTasks();
        }
    }

    // Xóa công việc khỏi SQLite Server
    async function deleteTaskFromServer(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                tasks = tasks.filter(t => t.id !== id);
                renderTasks();
            } else {
                console.error("Lỗi xóa task trên server:", response.statusText);
            }
        } catch (error) {
            console.error("Lỗi kết nối khi xóa task:", error);
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
        }
    }

    // Hiển thị danh sách công việc ra các cột
    function renderTasks() {
        // Xóa sạch danh sách cũ
        Object.keys(lists).forEach(status => {
            lists[status].innerHTML = '';
        });

        // Đếm số lượng tác vụ từng cột
        const counts = { todo: 0, progress: 0, done: 0 };

        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.setAttribute('draggable', 'true');
            card.setAttribute('data-id', task.id);
            
            card.innerHTML = `
                <span class="task-content">${escapeHTML(task.text)}</span>
                <button class="btn-delete-task" title="Xóa tác vụ">&times;</button>
            `;

            // Thêm trình lắng nghe kéo thả cho card
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);

            // Thêm trình xóa tác vụ
            card.querySelector('.btn-delete-task').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTaskFromServer(task.id);
            });

            if (lists[task.status]) {
                lists[task.status].appendChild(card);
                counts[task.status]++;
            }
        });

        // Cập nhật số đếm badge
        Object.keys(badges).forEach(status => {
            badges[status].textContent = counts[status];
        });

        // Lưu bản backup vào localstorage phòng hờ offline
        localStorage.setItem('vibe_tasks', JSON.stringify(tasks));
    }

    // Lập trình thêm mới công việc mới...

    // Lắng nghe sự kiện thêm tác vụ mới
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return;
        
        addTaskToServer(text);
        taskInput.value = '';
    });

    // Xử lý sự kiện kéo thả HTML5 Drag and Drop API
    let draggedCard = null;

    function handleDragStart(e) {
        draggedCard = this;
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', this.dataset.id);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedCard = null;
        
        // Xóa tất cả các hiệu ứng drag-over trên các cột
        document.querySelectorAll('.kanban-column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    // Thiết lập các cột nhận sự kiện thả (Dropzone)
    document.querySelectorAll('.kanban-column').forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault(); // Cần thiết để cho phép thả (Drop)
            column.classList.add('drag-over');
        });

        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            const taskId = e.dataTransfer.getData('text/plain');
            const targetStatus = column.dataset.status;
            
            // Tìm và cập nhật trạng thái tác vụ
            const task = tasks.find(t => t.id === taskId);
            if (task && task.status !== targetStatus) {
                updateTaskOnServer(taskId, targetStatus);
            }
        });
    });

    // Khởi động bảng Kanban bằng cách tải dữ liệu từ Server SQLite
    loadTasksFromServer();

    // ==========================================================================
    // 5. [ĐÃ GỠ BỎ CHẶN CHUỘT PHẢI & F12 ĐỂ BẠN THOẢI MÁI DEBUG HỌC TẬP!]
    // ==========================================================================

    // ==========================================================================
    // 6. GÓC Ý TƯỞNG & GHI CHÚ NHANH (STICKY VIBE NOTES LOGIC)
    // ==========================================================================
    const noteForm = document.getElementById('new-note-form');
    const noteInput = document.getElementById('new-note-input');
    const notesGrid = document.getElementById('notes-grid');
    const colorDots = document.querySelectorAll('.color-dot');
    
    let selectedNoteColor = 'yellow';
    
    // Quản lý việc chọn màu sắc cho Note ghim
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            selectedNoteColor = dot.dataset.color;
        });
    });
    
    // Tải dữ liệu từ localStorage
    let notes = JSON.parse(localStorage.getItem('vibe_notes')) || [
        { id: 'n1', text: 'Ý tưởng: Viết một bài blog ngắn chia sẻ trải nghiệm Vibe Coding ngày hôm nay.', color: 'yellow', date: '24/05' },
        { id: 'n2', text: 'Nhắc nhở: Hít thở sâu 5 phút bằng quả cầu tập thở sau mỗi hiệp Pomodoro.', color: 'purple', date: '24/05' }
    ];
    
    function saveNotes() {
        localStorage.setItem('vibe_notes', JSON.stringify(notes));
    }
    
    function renderNotes() {
        notesGrid.innerHTML = '';
        if (notes.length === 0) {
            notesGrid.innerHTML = '<div class="empty-notes-msg">Chưa có ghi chú nào. Hãy bắt đầu ghi lại những ý tưởng đầu tiên của bạn!</div>';
            return;
        }
        
        notes.forEach(note => {
            const div = document.createElement('div');
            div.className = `note-item note-${note.color}`;
            
            div.innerHTML = `
                <div class="note-text">${escapeHTML(note.text)}</div>
                <div class="note-footer">
                    <span class="note-date">${note.date}</span>
                    <button class="btn-delete-note" title="Xóa ghi chú">&times;</button>
                </div>
            `;
            
            // Xử lý sự kiện nút xóa ghi chú
            div.querySelector('.btn-delete-note').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteNote(note.id);
            });
            
            notesGrid.appendChild(div);
        });
    }
    
    function deleteNote(id) {
        notes = notes.filter(n => n.id !== id);
        saveNotes();
        renderNotes();
    }
    
    // Xử lý thêm ghi chú ghim mới
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = noteInput.value.trim();
        if (!text) return;
        
        const dayMonth = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        const newNote = {
            id: 'note_' + Date.now().toString() + Math.random().toString(36).substr(2, 5),
            text: text,
            color: selectedNoteColor,
            date: dayMonth
        };
        
        notes.push(newNote);
        saveNotes();
        renderNotes();
        
            noteInput.value = '';
    });
    
    // Khởi tạo hiển thị ghi chú ban đầu
    renderNotes();

    // ==========================================================================
    // 7. LOGIC ĐIỀU KHIỂN CHATBOT AI VIBE MENTOR (GEMINI TÍCH HỢP)
    // ==========================================================================
    const aiChatTrigger = document.getElementById('ai-chat-trigger');
    const aiChatDrawer = document.getElementById('ai-chat-drawer');
    const btnCloseChat = document.getElementById('btn-close-chat');
    const chatMessagesContainer = document.getElementById('chat-messages-container');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatUserInput = document.getElementById('chat-user-input');
    const chatTypingIndicator = document.getElementById('chat-typing-indicator');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');

    let chatHistory = []; // Lưu trữ lịch sử chat của phiên hiện tại [{ sender: 'user'/'ai', text: '...' }]
    console.log("🤖 [AI Chat] Hệ thống Chatbot Vibe Mentor đã khởi tạo thành công trên Client!");

    // 1. Mở / Đóng Chat Drawer
    aiChatTrigger.addEventListener('click', () => {
        console.log("🤖 [AI Chat] Nhấn nút mở/đóng khung chat.");
        aiChatDrawer.classList.toggle('open');
        // Tự động focus vào ô nhập tin nhắn khi mở chat
        if (aiChatDrawer.classList.contains('open')) {
            chatUserInput.focus();
            scrollChatToBottom();
        }
    });

    btnCloseChat.addEventListener('click', () => {
        aiChatDrawer.classList.remove('open');
    });

    // Cuộn danh sách chat xuống cuối cùng
    function scrollChatToBottom() {
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }

    // 2. Bộ phân tích Markdown Mini để hiển thị Bold & Code Block tuyệt đẹp
    function formatMessageText(text) {
        // Tránh lỗi hiển thị thẻ HTML thô
        let formatted = escapeHTML(text);
        
        // Cú pháp bọc block code: ```javascript ... ```
        const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
        formatted = formatted.replace(codeBlockRegex, (match, lang, code) => {
            return `<pre><code class="${lang}">${code.trim()}</code></pre>`;
        });

        // Cú pháp inline code: `code`
        formatted = formatted.replace(/`([^`\n]+)`/g, '<code>$1</code>');

        // Cú pháp chữ in đậm: **text**
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Xuống dòng tự động
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    // [Sử dụng escapeHTML toàn cục được khai báo ở đầu file]

    // 3. Render bong bóng tin nhắn lên màn hình chat
    function appendChatMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender === 'user' ? 'msg-user' : 'msg-ai'}`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        const formattedText = sender === 'user' ? escapeHTML(text) : formatMessageText(text);

        msgDiv.innerHTML = `
            <span class="msg-avatar">${avatar}</span>
            <div class="msg-bubble">${formattedText}</div>
        `;

        // Chèn vào TRƯỚC Typing Indicator để Typing luôn nằm ở dưới cùng
        chatMessagesContainer.insertBefore(msgDiv, chatTypingIndicator);
        scrollChatToBottom();
    }

    // 4. Xử lý gửi tin nhắn lên Server và gọi Gemini API
    async function handleSendChatMessage(text) {
        if (!text || text.trim() === '') return;

        // Render tin nhắn của User lên UI
        appendChatMessage(text, 'user');
        
        // Lưu vào lịch sử cục bộ
        chatHistory.push({ sender: 'user', text: text });
        // Khóa lịch sử tối đa 10 tin nhắn gần nhất để tối ưu dung lượng request
        if (chatHistory.length > 15) {
            chatHistory.shift();
        }

        // Hiện Typing Indicator (AI đang suy nghĩ)
        chatTypingIndicator.style.display = 'flex';
        scrollChatToBottom();

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory
                })
            });

            const data = await response.json();

            // Ẩn hiệu ứng suy nghĩ
            chatTypingIndicator.style.display = 'none';

            if (response.ok) {
                // Render tin nhắn AI trả về lên UI
                appendChatMessage(data.reply, 'ai');
                chatHistory.push({ sender: 'ai', text: data.reply });
            } else {
                // Hiển thị thông báo lỗi hệ thống/lỗi khóa API trực tiếp
                appendChatMessage(`⚠️ Lỗi: ${data.error || 'Không thể kết nối đến AI.'}`, 'ai');
            }
        } catch (error) {
            chatTypingIndicator.style.display = 'none';
            console.error("Lỗi kết nối API Chat:", error);
            appendChatMessage("❌ Lỗi kết nối mạng! Vui lòng kiểm tra lại xem Server Node.js của bạn đã được khởi động chưa nhé.", 'ai');
        }
    }

    // Lắng nghe sự kiện Submit Form Chat
    chatInputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatUserInput.value.trim();
        console.log("🤖 [AI Chat] Phát hiện sự kiện submit form chat. Tin nhắn:", text);
        if (!text) return;

        chatUserInput.value = '';
        handleSendChatMessage(text);
    });

    // 5. Lắng nghe click các nút gợi ý chat nhanh (Quick Actions)
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.text;
            if (text) {
                handleSendChatMessage(text);
            }
        });
    });
});
