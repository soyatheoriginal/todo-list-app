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
    }

    function setupEventListeners() {
        // Кнопка добавления задачи
        addTaskBtn.addEventListener('click', openAddTaskModal);
        
        // Закрытие модального окна
        closeModal.addEventListener('click', closeTaskModal);
        window.addEventListener('click', (e) => {
            if (e.target === taskModal) closeTaskModal();
        });
        
        // Сохранение задачи
        saveTaskBtn.addEventListener('click', saveTask);
        
        // Группы тегов
        tagGroups.forEach(group => {
            group.addEventListener('click', () => {
                tagGroups.forEach(g => g.classList.remove('active'));
                group.classList.add('active');
                filterTags(group.dataset.group);
            });
        });
        
        // Счетчик символов
        taskTitleInput.addEventListener('input', () => {
            counter.textContent = `${taskTitleInput.value.length}/100`;
        });
    }

    function openAddTaskModal() {
        // Сброс формы
        taskTitleInput.value = '';
        counter.textContent = '0/100';
        selectedTags = [];
        renderSelectedTags();
        modalTitle.textContent = 'Новая задача';
        currentTaskId = null;
        
        // Открытие модального окна
        taskModal.style.display = 'flex';
    }

    function closeTaskModal() {
        taskModal.style.display = 'none';
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
        tasksContainer.innerHTML = '';
        
        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <p>Список дел пуст. Добавьте первую задачу!</p>
                </div>
            `;
            return;
        }
        
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-card ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;
            
            // Получаем полные данные тегов для задачи
            const taskTags = defaultTags.filter(tag => task.tags.includes(tag.id));
            
            // Создаем HTML для тегов
            const tagsHtml = taskTags.map(tag => 
                `<span class="tag-chip" style="background-color: ${tag.color};">${tag.name}</span>`
            ).join('');
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-actions">
                        <input type="checkbox" class="task-complete" ${task.completed ? 'checked' : ''}>
                        <button class="btn danger delete-task">&times;</button>
                    </div>
                </div>
                <div class="task-tags">
                    ${tagsHtml}
                </div>
            `;
            
            // Добавляем обработчики
            const completeCheckbox = taskElement.querySelector('.task-complete');
            completeCheckbox.addEventListener('change', () => {
                toggleTaskCompletion(task.id);
            });
            
            const deleteBtn = taskElement.querySelector('.delete-task');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });
            
            // Для свайпа на мобильных
            setupSwipeToDelete(taskElement, task.id);
            
            tasksContainer.appendChild(taskElement);
        });
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
        tagsSelector.innerHTML = '';
        
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-item';
            tagElement.style.backgroundColor = tag.color;
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

    function toggleTagSelection(tag, element) {
        const index = selectedTags.findIndex(t => t.id === tag.id);
        
        if (index === -1) {
            // Добавляем тег
            selectedTags.push(tag);
            element.classList.add('selected');
        } else {
            // Удаляем тег
            selectedTags.splice(index, 1);
            element.classList.remove('selected');
        }
        
        renderSelectedTags();
    }

    function renderSelectedTags() {
        selectedTagsContainer.innerHTML = '';
        
        if (selectedTags.length === 0) {
            selectedTagsContainer.innerHTML = '<p class="placeholder">Теги не выбраны</p>';
            return;
        }
        
        selectedTags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'selected-tag';
            tagElement.style.backgroundColor = tag.color;
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

    // Добавление первой задачи для примера (если список пуст)
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
});
