//const API_URL = 'http://localhost:8000'  // для локальной разработки
const API_URL = 'https://tasklist-backend-j30i.onrender.com';  //для продакшена

// 
// 2. РЕГИСТРАЦИЯ
// 

const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const message = document.getElementById('message');

        if (!email || !password) {
            message.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Заполните все поля';
            message.style.color = '#ff6b6b';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (message) {
                    message.innerHTML = '<i class="fas fa-check-circle"></i> Регистрация успешна! Перенаправление...';
                    message.style.color = '#51cf66';
                }
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                message.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + (data.detail || 'Ошибка регистрации');
                message.style.color = '#ff6b6b';
            }
        } catch (error) {
            message.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка соединения с сервером';
            message.style.color = '#ff6b6b';
            console.error('Register error:', error);
        }
    });
}

// 
// 3. ЛОГИН
// 

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const message = document.getElementById('message');

        if (!email || !password) {
            message.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Заполните все поля';
            message.style.color = '#ff6b6b';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('user_email', email);
                message.innerHTML = '<i class="fas fa-check-circle"></i> Вход выполнен! Перенаправление...';
                message.style.color = '#51cf66';
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                message.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ' + (data.detail || 'Ошибка входа');
                message.style.color = '#ff6b6b';
            }
        } catch (error) {
            message.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Ошибка соединения с сервером';
            message.style.color = '#ff6b6b';
            console.error('Login error:', error);
        }
    });
}

// 
// 4. DASHBOARD (личный кабинет)
// 

if (window.location.pathname.includes('dashboard.html')) {
    const token = localStorage.getItem('access_token');
    const email = localStorage.getItem('user_email');

    // Проверка авторизации
    if (!token) {
        window.location.href = 'login.html';
    }

    // Приветствие
    const userEmailEl = document.getElementById('userEmail');
    if (userEmailEl) {
        userEmailEl.textContent = email || 'Пользователь';
    }

    //
    // 4.1. ВЫХОД
    // 

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_email');
            window.location.href = 'index.html';
        });
    }

    // 
    // 4.2. ЗАГРУЗКА ЗАДАЧ
    // 

    loadTasks();

    // 
    // 4.3. МОДАЛЬНОЕ ОКНО (создание задачи)
    // 

    const modal = document.getElementById('createTaskModal');
    const openModalBtn = document.getElementById('openCreateTaskBtn');
    const closeModalBtn = document.querySelector('.modal-close');

    if (openModalBtn) {
        openModalBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // Закрытие модалки по клику вне окна
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // ============================================================
    // 4.4. СОЗДАНИЕ ЗАДАЧИ
    // ============================================================

    const createTaskForm = document.getElementById('createTaskForm');
    if (createTaskForm) {
        createTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const titleInput = document.getElementById('taskTitle');
            const title = titleInput.value.trim();

            if (!title) {
                alert('Введите название задачи');
                return;
            }

            try {
                const response = await fetch(`${API_URL}/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, done: false })
                });

                if (response.ok) {
                    titleInput.value = '';
                    modal.classList.add('hidden');
                    loadTasks(); // обновляем список
                } else {
                    const data = await response.json();
                    alert('Ошибка: ' + (data.detail || 'Не удалось создать задачу'));
                }
            } catch (error) {
                alert('Ошибка соединения с сервером');
                console.error('Create task error:', error);
            }
        });
    }
}

// 
// 5. ФУНКЦИЯ ЗАГРУЗКИ ЗАДАЧ
// 

async function loadTasks() {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const taskList = document.getElementById('taskList');
    if (!taskList) return;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_email');
                window.location.href = 'login.html';
            }
            return;
        }

        const tasks = await response.json();

        if (!tasks || tasks.length === 0) {
            taskList.innerHTML = `
                <li class="task-item empty-message">
                    Задач пока нет. Создайте первую! <i class="fas fa-rocket"></i>
                </li>
            `;
            return;
        }

        taskList.innerHTML = tasks.map(task => `
            <li class="task-item" data-id="${task.id}">
                <span class="task-title">${task.title}</span>
                <span class="task-done">${task.done ? '<i class="fas fa-check"></i>Выполнено' : '<i class="fas fa-clock"></i> В процессе'}</span>
                  <div class="task-actions">
                    <button class="task-toggle" data-id="${task.id}" data-done="${task.done}">
                        ${task.done ? '<i class="fas fa-undo"></i> Вернуть' : '<i class="fas fa-check"></i> Выполнить'}
                    </button>
                    <button class="task-delete" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                </div>
            </li>
        `).join('');

        // 
        // 5.1. УДАЛЕНИЕ ЗАДАЧ
        // 

        document.querySelectorAll('.task-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const taskId = btn.dataset.id;
                if (!confirm('Удалить задачу?')) return;

                try {
                    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        loadTasks(); // обновляем список
                    } else {
                        alert('Ошибка при удалении задачи');
                    }
                } catch (error) {
                    alert('Ошибка соединения с сервером');
                    console.error('Delete task error:', error);
                }
            });
        });

    } catch (error) {
        console.error('Load tasks error:', error);
        taskList.innerHTML = `
            <li class="task-item empty-message">
                <i class="fas fa-exclamation-triangle"></i> Ошибка загрузки задач
            </li>
        `;
    }

    // 5.2. Обновление статуса задачи (выполнено/невыполнено)

    document.querySelectorAll('.task-toggle').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                    const taskId = e.target.dataset.id;
                    const currentDone = e.target.dataset.done === 'true'; // true или false
                    const newDone = !currentDone; // инвертируем

                    await toggleTaskStatus(taskId, newDone);
                });
        });
}

        async function toggleTaskStatus(taskId, newDone) {
            const token = localStorage.getItem('access_token');
            if (!token) {
            alert('Вы не авторизованы');
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ done: newDone })
            });

            if (response.ok) {
            // ✅ Успешно обновили — перезагружаем список
             loadTasks();
            } else if (response.status === 401) {
                // ❌ Токен невалидный — разлогиниваем
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_email');
                window.location.href = 'login.html';
            } else {
                // ❌ Другая ошибка
                const data = await response.json();
                alert('Ошибка: ' + (data.detail || 'Не удалось обновить статус'));
            }
        } catch (error) {
            alert('Ошибка соединения с сервером');
            console.error('Toggle task error:', error);
        }
    }
// 


//
// 6. АВТОМАТИЧЕСКИЙ ПЕРЕХОД НА DASHBOARD, ЕСЛИ ТОКЕН ЕСТЬ
//    (на случай, если пользователь открыл index.html или login.html)
// 

if (window.location.pathname.includes('index.html') || 
    window.location.pathname === '/' ||
    window.location.pathname.includes('login.html')) {
    
    const token = localStorage.getItem('access_token');
    if (token) {
        // Проверяем, валидный ли токен (опционально)
        // Можно сделать быстрый запрос к /tasks, чтобы проверить
        window.location.href = 'dashboard.html';
    }
}
