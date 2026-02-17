document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskModal = document.getElementById('taskModal');
    const closeModal = document.querySelector('.close');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskTitleInput = document.getElementById('taskTitle');
    const counter = document.querySelector('.counter');
    const tagsSelector = document.getElementById('tagsSelector');
    const tagGroups = document.querySelectorAll('.tag-group');
    const selectedTagsContainer = document.getElementById('selectedTags');
    const tasksContainer = document.getElementById('tasksContainer');
    const modalTitle = document.getElementById('modalTitle');

    // Теги по умолчанию
    const defaultTags = [
        // Готовность
        { id: 1, name: 'Не начата', group: 'готовность', color: '#FF9800' },
        { id: 2, name: 'В процессе', group: 'готовность', color: '#2196F3' },
        { id: 3, name: 'Готова', group: 'готовность', color: '#4CAF50' },
        
        // Важность
        { id: 4, name: 'Низкая', group: 'важность', color: '#9E9E9E' },
        { id: 5, name: 'Средняя', group: 'важность', color: '#FFC107' },
        { id: 6, name: 'Высокая', group: 'важность', color: '#FF9800' },
        { id: 7, name: 'Критическая', group: 'важность', color: '#F44336' },
        
        // Срочность
        { id: 8, name: 'Не срочно', group: 'срочность', color: '#9E9E9E' },
        { id: 9, name: 'Срочно', group: 'срочность', color: '#FF9800' },
        { id: 10, name: 'Горит', group: 'срочность', color: '#F44336' },
        
        // Сфера
        { id: 11, name: 'Работа', group: 'сфера', color: '#2196F3' },
        { id: 12, name: 'Личное', group: 'сфера', color: '#E91E63' },
        { id: 13, name: 'Дом', group: 'сфера', color: '#4CAF50' },
        { id: 14, name: 'Покупки', group: 'сфера', color: '#FFC107' },
        { id: 15, name: 'Здоровье', group: 'сфера', color: '#9C27B0' },
        { id: 16, name: 'Финансы', group: 'сфера', color: '#607D8B' },
        { id: 17, name: 'Обучение', group: 'сфера', color: '#3F51B5' }
    ];

    // Текущая задача для редактирования
    let currentTaskId = null;
    // Выбранные теги
    let selectedTags = [];

    // Инициализация
    init();

    function init() {
        // Загрузка задач из localStorage
        loadTasks();
        
        // Отображение тегов
        renderTags(defaultTags);
        
        // Обработчики событий
        setupEventListeners();
        
        // Создаем космический фон
        setTimeout(createMeteors, 500);
        setTimeout(createStars, 1000);
    }

    function setupEventListeners() {
        // Кнопка добавления задачи
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', openAddTaskModal);
        }
        
        // Закрытие модального окна
        if (closeModal) {
            closeModal.addEventListener('click', closeTaskModal);
        }
        window.addEventListener('click', (e) => {
            if (taskModal && e.target === taskModal) closeTaskModal();
        });
        
        // Сохранение задачи
        if (saveTaskBtn) {
            saveTaskBtn.addEventListener('click', saveTask);
        }
        
        // Группы тегов
        tagGroups.forEach(group => {
            group.addEventListener('click', () => {
                tagGroups.forEach(g => g.classList.remove('active'));
                group.classList.add('active');
                filterTags(group.dataset.group);
            });
        });
        
        // Счетчик символов
        if (taskTitleInput) {
            taskTitleInput.addEventListener('input', () => {
                counter.textContent = `${taskTitleInput.value.length}/100`;
            });
        }
    }

    function openAddTaskModal() {
        // Сброс формы
        if (taskTitleInput) {
            taskTitleInput.value = '';
            counter.textContent = '0/100';
        }
        selectedTags = [];
        renderSelectedTags();
        modalTitle.textContent = 'Новая задача';
        currentTaskId = null;
        
        // Открытие модального окна
        if (taskModal) {
            taskModal.style.display = 'flex';
        }
    }

    function closeTaskModal() {
        if (taskModal) {
            taskModal.style.display = 'none';
        }
    }

    function saveTask() {
        const title = taskTitleInput.value.trim();
        
        if (!title) {
            alert('Введите название задачи');
            return;
        }
        
        if (selectedTags.length === 0) {
            alert('Выберите хотя бы один тег');
            return;
        }
        
        if (currentTaskId) {
            // Редактирование существующей задачи
            updateTask(currentTaskId, title, selectedTags);
        } else {
            // Создание новой задачи
            createTask(title, selectedTags);
        }
        
        closeTaskModal();
    }

    function createTask(title, tags) {
        const tasks = getTasks();
        const newTask = {
            id: Date.now(),
            title: title,
            completed: false,
            tags: tags.map(tag => tag.id)
        };
        
        tasks.push(newTask);
        saveTasks(tasks);
        renderTasks();
    }

    function updateTask(id, title, tags) {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                title: title,
                tags: tags.map(tag => tag.id)
            };
            
            saveTasks(tasks);
            renderTasks();
        }
    }

    function toggleTaskCompletion(id) {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks(tasks);
            renderTasks();
        }
    }

    function deleteTask(id) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            const tasks = getTasks().filter(task => task.id !== id);
            saveTasks(tasks);
            renderTasks();
        }
    }

    function renderTasks() {
        const tasks = getTasks();
        if (tasksContainer) {
            tasksContainer.innerHTML = '';
        }
        
        if (tasks.length === 0) {
            if (tasksContainer) {
                tasksContainer.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 30px; color: var(--text-secondary);">
                        <div style="font-size: 60px; margin-bottom: 15px; opacity: 0.7;">✨</div>
                        <p>Список дел пуст. Добавьте первую задачу!</p>
                    </div>
                `;
            }
            return;
        }
        
        tasks.forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-card ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;
            
            // Получаем полные данные тегов для задачи
            const taskTags = defaultTags.filter(tag => task.tags.includes(tag.id));
            
            // Создаем HTML для тегов
            const tagsHtml = taskTags.map(tag => 
                `<span class="tag-chip" style="background: ${tag.color}22; border-color: ${tag.color}44;">${tag.name}</span>`
            ).join('');
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-actions">
                        <input type="checkbox" class="task-complete" ${task.completed ? 'checked' : ''}>
                        <button class="btn danger delete-task">×</button>
                    </div>
                </div>
                <div class="task-tags">
                    ${tagsHtml}
                </div>
            `;
            
            // Добавляем обработчики
            const completeCheckbox = taskElement.querySelector('.task-complete');
            if (completeCheckbox) {
                completeCheckbox.addEventListener('change', () => {
                    toggleTaskCompletion(task.id);
                });
            }
            
            const deleteBtn = taskElement.querySelector('.delete-task');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                });
            }
            
            // Для свайпа на мобильных
            setupSwipeToDelete(taskElement, task.id);
            
            if (tasksContainer) {
                tasksContainer.appendChild(taskElement);
                animateTask(taskElement, index);
            }
        });
    }

    function animateTask(taskElement, index) {
        taskElement.style.setProperty('--i', index);
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            taskElement.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            taskElement.style.opacity = '1';
            taskElement.style.transform = 'translateY(0)';
        }, 10);
    }

    function setupSwipeToDelete(element, taskId) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        element.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        element.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const diff = touchStartX - touchEndX;
            const swipeThreshold = 50;
            
            if (diff > swipeThreshold) {
                // Свайп влево - удаление
                deleteTask(taskId);
            }
        }
    }

    function renderTags(tags) {
        if (tagsSelector) {
            tagsSelector.innerHTML = '';
            
            tags.forEach(tag => {
                const tagElement = document.createElement('div');
                tagElement.className = 'tag-item';
                tagElement.style.backgroundColor = `${tag.color}15`;
                tagElement.style.color = getContrastColor(tag.color);
                tagElement.textContent = tag.name;
                tagElement.dataset.id = tag.id;
                tagElement.dataset.group = tag.group;
                
                // Проверяем, выбран ли тег
                if (selectedTags.some(t => t.id === tag.id)) {
                    tagElement.classList.add('selected');
                }
                
                tagElement.addEventListener('click', () => {
                    toggleTagSelection(tag, tagElement);
                });
                
                tagsSelector.appendChild(tagElement);
            });
        }
    }

    function toggleTagSelection(tag, element) {
        const index = selectedTags.findIndex(t => t.id === tag.id);
        
        if (index === -1) {
            // Добавляем тег
            selectedTags.push(tag);
            if (element) element.classList.add('selected');
        } else {
            // Удаляем тег
            selectedTags.splice(index, 1);
            if (element) element.classList.remove('selected');
        }
        
        renderSelectedTags();
    }

    function renderSelectedTags() {
        if (selectedTagsContainer) {
            selectedTagsContainer.innerHTML = '';
            
            if (selectedTags.length === 0) {
                selectedTagsContainer.innerHTML = '<p class="placeholder" style="color: var(--text-secondary); padding: 10px;">Теги не выбраны</p>';
                return;
            }
            
            selectedTags.forEach(tag => {
                const tagElement = document.createElement('div');
                tagElement.className = 'selected-tag';
                tagElement.style.backgroundColor = `${tag.color}22`;
                tagElement.style.borderColor = `${tag.color}44`;
                tagElement.style.color = getContrastColor(tag.color);
                tagElement.innerHTML = `
                    ${tag.name}
                    <span class="remove-tag" data-id="${tag.id}">&times;</span>
                `;
                
                tagElement.querySelector('.remove-tag').addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = selectedTags.findIndex(t => t.id === tag.id);
                    if (index !== -1) {
                        selectedTags.splice(index, 1);
                        renderTags(defaultTags);
                        renderSelectedTags();
                    }
                });
                
                selectedTagsContainer.appendChild(tagElement);
            });
        }
    }

    function filterTags(group) {
        if (group === 'all') {
            renderTags(defaultTags);
            return;
        }
        
        const filteredTags = defaultTags.filter(tag => tag.group === group);
        renderTags(filteredTags);
    }

    function getContrastColor(hexColor) {
        // Упрощенная проверка для определения контрастного цвета текста
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    }

    // Работа с localStorage
    function getTasks() {
        const tasks = localStorage.getItem('todoTasks');
        return tasks ? JSON.parse(tasks) : [];
    }

    function saveTasks(tasks) {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        renderTasks();
    }

    // Добавление примеров задач
    if (getTasks().length === 0) {
        const exampleTasks = [
            {
                id: 1,
                title: 'Купить продукты',
                completed: false,
                tags: [11, 14, 6] // Работа, Покупки, Высокая
            },
            {
                id: 2,
                title: 'Подготовить отчет',
                completed: true,
                tags: [11, 9, 7] // Работа, Срочно, Критическая
            }
        ];
        saveTasks(exampleTasks);
        renderTasks();
    }

    // ===== КОСМИЧЕСКИЙ ФОН С МЕТЕОРИТАМИ =====
    
    // Функция для создания анимированных метеоритов
    function createMeteors() {
        const meteorCount = 7; // Количество метеоритов
        
        for (let i = 0; i < meteorCount; i++) {
            const meteor = document.createElement('div');
            meteor.className = 'meteor';
            
            // Случайные параметры для каждого метеорита
            const startX = Math.random() * window.innerWidth;
            const startY = Math.random() * window.innerHeight * 0.5;
            const distance = 200 + Math.random() * 300;
            const duration = 3 + Math.random() * 5;
            const delay = Math.random() * 5;
            
            // Устанавливаем начальное положение
            meteor.style.left = `${startX}px`;
            meteor.style.top = `${startY}px`;
            
            // Создаем анимацию
            meteor.style.setProperty('--tx', `${distance}px`);
            meteor.style.setProperty('--ty', `${distance}px`);
            
            // Стилизуем метеорит
            const size = 2 + Math.random() * 3;
            meteor.style.width = `${size}px`;
            meteor.style.height = `${size}px`;
            
            // Добавляем анимацию
            meteor.style.animation = `meteor ${duration}s linear ${delay}s infinite`;
            
            // Добавляем в body
            document.body.appendChild(meteor);
            
            // Настройка повторной анимации
            setTimeout(() => {
                meteor.style.animation = 'none';
                setTimeout(() => {
                    meteor.style.animation = `meteor ${duration}s linear ${delay}s infinite`;
                }, 10);
            }, (duration + delay) * 1000);
        }
    }

    // Создаем звезды на фоне
    function createStars() {
        const starCount = 100;
        const body = document.querySelector('body');
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.style.position = 'fixed';
            star.style.width = `${0.5 + Math.random() * 1.5}px`;
            star.style.height = star.style.width;
            star.style.backgroundColor = 'white';
            star.style.borderRadius = '50%';
            star.style.top = `${Math.random() * 100}%`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.opacity = `${0.2 + Math.random() * 0.8}`;
            star.style.zIndex = '-1';
            star.style.pointerEvents = 'none';
            
            body.appendChild(star);
        }
    }
    
    // Перезапускаем анимацию метеоритов каждые 30 секунд для разнообразия
    setInterval(() => {
        document.querySelectorAll('.meteor').forEach(meteor => {
            meteor.remove();
        });
        createMeteors();
    }, 30000);
    // Усиливаем анимации метеоритов
setTimeout(() => {
    document.querySelectorAll('.meteor').forEach(meteor => {
        meteor.style.boxShadow = '0 0 20px 5px rgba(255, 255, 255, 0.95)';
        meteor.querySelector(':after').style.background = 
            'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, transparent 100%)';
    });
}, 2000);
});
