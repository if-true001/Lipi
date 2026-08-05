/**
 * Lipi Editor - Core Application Logic
 */
class LipiApp {
    constructor() {
        // Feature Detection: Does the browser support the File System Access API?
        this.supportsFileSystemAPI = 'showOpenFilePicker' in window;
        
        this.initDOM();
        this.handleFeatureSupportUI();
        this.bindEvents();
        
        // App State
        this.isDrawerOpen = false;
        this.isDropdownOpen = false;
        this.currentView = 'welcome';
        this.fileCounter = 0;
        
        // Data State
        this.openFiles = []; 
        this.activeFileId = null; 
        this.db = null; 

        // Only initialize DB and Recents if supported
        if (this.supportsFileSystemAPI) {
            this.initDB().then(() => this.renderRecentFiles());
        }
    }

    initDOM() {
        this.elements = {
            menuBtn: document.getElementById('menu-btn'),
            fileNameDisplay: document.getElementById('current-file-name'),
            saveBtn: document.getElementById('save-btn'),
            addBtn: document.getElementById('add-btn'),
            addDropdown: document.getElementById('add-dropdown'),
            dropdownNewFile: document.getElementById('dropdown-new-file'),
            dropdownOpenFile: document.getElementById('dropdown-open-file'),
            sidebar: document.getElementById('sidebar'),
            overlay: document.getElementById('drawer-overlay'),
            openFilesList: document.getElementById('open-files-list'),
            welcomeSidebarItem: document.getElementById('welcome-sidebar-item'),
            welcomeView: document.getElementById('welcome-view'),
            editorView: document.getElementById('editor-view'),
            mainEditor: document.getElementById('main-editor'),
            btnNewFile: document.getElementById('action-new-file'),
            btnOpenFile: document.getElementById('action-open-file'),
            fallbackFileInput: document.getElementById('fallback-file-input'),
            
            // Recent UI elements to potentially hide
            welcomeRecentGroup: document.getElementById('welcome-recent-group'),
            dropdownRecentGroup: document.getElementById('dropdown-recent-group'),
            recentContainer: document.getElementById('recent-files-container'),
            dropdownRecentList: document.getElementById('dropdown-recent-list')
        };
    }

    /**
     * Hides parts of the UI that require the File System Access API
     */
    handleFeatureSupportUI() {
        if (!this.supportsFileSystemAPI) {
            if (this.elements.welcomeRecentGroup) this.elements.welcomeRecentGroup.remove();
            if (this.elements.dropdownRecentGroup) this.elements.dropdownRecentGroup.remove();
            console.log("Lipi: Running in fallback mode (No File System API support).");
        }
    }

    bindEvents() {
        this.elements.menuBtn.addEventListener('click', () => this.toggleDrawer(true));
        this.elements.overlay.addEventListener('click', () => this.toggleDrawer(false));
        window.addEventListener('resize', () => { if (window.innerWidth >= 900) this.toggleDrawer(false); });

        this.elements.addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(!this.isDropdownOpen);
        });
        document.addEventListener('click', (e) => {
            if (this.isDropdownOpen && !this.elements.addDropdown.contains(e.target)) {
                this.toggleDropdown(false);
            }
        });

        this.elements.saveBtn.addEventListener('click', () => this.saveCurrentFile());
        this.elements.welcomeSidebarItem.addEventListener('click', () => this.activateWelcomeScreen());

        const handleNewFile = () => {
            this.toggleDropdown(false);
            this.createNewFile();
        };

        const handleOpenFile = () => {
            this.toggleDropdown(false);
            this.openFile();
        };

        this.elements.btnNewFile.addEventListener('click', handleNewFile);
        this.elements.dropdownNewFile.addEventListener('click', handleNewFile);
        this.elements.btnOpenFile.addEventListener('click', handleOpenFile);
        this.elements.dropdownOpenFile.addEventListener('click', handleOpenFile);
        
        this.elements.fallbackFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                this.loadFileIntoEditor(file.name, event.target.result, null);
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        this.elements.mainEditor.addEventListener('input', (e) => {
            if (this.activeFileId) {
                const file = this.openFiles.find(f => f.id === this.activeFileId);
                if (file) file.content = e.target.value;
            }
        });
    }

    // --- IndexedDB ---

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('LipiDB', 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('recents')) {
                    db.createObjectStore('recents', { keyPath: 'name' });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveToRecent(name, handle) {
        if (!this.db || !handle || !this.supportsFileSystemAPI) return; 
        const tx = this.db.transaction('recents', 'readwrite');
        tx.objectStore('recents').put({ name, handle, timestamp: Date.now() });
        this.renderRecentFiles();
    }

    async renderRecentFiles() {
        if (!this.db || !this.supportsFileSystemAPI) return;
        const recents = await new Promise(resolve => {
            const tx = this.db.transaction('recents', 'readonly');
            const req = tx.objectStore('recents').getAll();
            req.onsuccess = () => resolve(req.result.sort((a,b) => b.timestamp - a.timestamp));
        });

        if (!this.elements.recentContainer) return;

        this.elements.recentContainer.innerHTML = '';
        this.elements.dropdownRecentList.innerHTML = '';

        if (recents.length === 0) {
            this.elements.recentContainer.innerHTML = '<span class="empty-state">No recent files</span>';
            this.elements.dropdownRecentList.innerHTML = '<button class="menu-item disabled">No recent files</button>';
            return;
        }

        recents.forEach(fileData => {
            const btn = document.createElement('button');
            btn.className = 'text-btn';
            btn.innerHTML = `<span class="material-symbols-rounded">description</span> ${fileData.name}`;
            btn.onclick = () => this.openRecentFile(fileData);
            this.elements.recentContainer.appendChild(btn);

            const dropBtn = document.createElement('button');
            dropBtn.className = 'menu-item';
            dropBtn.innerHTML = `<span class="material-symbols-rounded">description</span> ${fileData.name}`;
            dropBtn.onclick = () => {
                this.toggleDropdown(false);
                this.openRecentFile(fileData);
            };
            this.elements.dropdownRecentList.appendChild(dropBtn);
        });
    }

    // --- View Logic ---

    toggleDrawer(open) {
        if (window.innerWidth >= 900) return;
        this.isDrawerOpen = open;
        if (this.isDrawerOpen) {
            this.elements.sidebar.classList.add('open');
            this.elements.overlay.classList.add('active');
        } else {
            this.elements.sidebar.classList.remove('open');
            this.elements.overlay.classList.remove('active');
        }
    }

    toggleDropdown(open) {
        this.isDropdownOpen = open;
        if (this.isDropdownOpen) {
            this.elements.addDropdown.classList.remove('hidden');
        } else {
            this.elements.addDropdown.classList.add('hidden');
        }
    }

    switchView(viewName) {
        this.currentView = viewName;
        if (viewName === 'editor') {
            this.elements.welcomeView.classList.replace('active', 'hidden');
            this.elements.editorView.classList.replace('hidden', 'active');
        } else {
            this.elements.editorView.classList.replace('active', 'hidden');
            this.elements.welcomeView.classList.replace('hidden', 'active');
        }
    }

    // --- File Ops ---

    createNewFile() {
        const fileName = this.fileCounter === 0 ? 'Untitled.txt' : `Untitled-${this.fileCounter}.txt`;
        this.fileCounter++;
        this.loadFileIntoEditor(fileName, '', null);
    }

    async openFile() {
        if (this.supportsFileSystemAPI) {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{ description: 'Text Files', accept: {'text/*': ['.txt', '.md', '.html', '.css', '.js', '.json']} }]
                });
                const file = await fileHandle.getFile();
                const content = await file.text();
                this.loadFileIntoEditor(file.name, content, fileHandle);
                this.saveToRecent(file.name, fileHandle);
            } catch (e) {
                console.log('Picker cancelled');
            }
        } else {
            this.elements.fallbackFileInput.click();
        }
    }

    async openRecentFile(recentData) {
        try {
            const handle = recentData.handle;
            const perm = await handle.queryPermission({ mode: 'readwrite' });
            if (perm !== 'granted') {
                const req = await handle.requestPermission({ mode: 'readwrite' });
                if (req !== 'granted') throw new Error('Permission denied');
            }
            const file = await handle.getFile();
            const content = await file.text();
            this.loadFileIntoEditor(file.name, content, handle);
            this.saveToRecent(file.name, handle);
        } catch (e) {
            alert("Could not open recent file.");
        }
    }

    loadFileIntoEditor(fileName, content, fileHandle) {
        const fileId = `file-${Date.now()}`;
        this.openFiles.push({ id: fileId, name: fileName, content: content, handle: fileHandle });
        this.switchToEditor(fileId);
        this.updateSidebar();
        this.toggleDrawer(false);
    }

    switchToEditor(fileId) {
        this.activeFileId = fileId;
        const file = this.openFiles.find(f => f.id === fileId);
        this.switchView('editor');
        this.elements.fileNameDisplay.textContent = file.name;
        this.elements.fileNameDisplay.classList.remove('brand-font');
        this.elements.saveBtn.disabled = false;
        this.elements.mainEditor.value = file.content;
        this.elements.mainEditor.focus();
    }

    closeFile(fileId) {
        const index = this.openFiles.findIndex(f => f.id === fileId);
        if (index > -1) {
            this.openFiles.splice(index, 1);
            if (this.activeFileId === fileId) {
                if (this.openFiles.length > 0) {
                    this.switchToEditor(this.openFiles[Math.max(0, index - 1)].id);
                } else {
                    this.activateWelcomeScreen();
                }
            }
            this.updateSidebar();
        }
    }

    async saveCurrentFile() {
        if (!this.activeFileId) return;
        const file = this.openFiles.find(f => f.id === this.activeFileId);
        
        if (this.supportsFileSystemAPI) {
            try {
                let handle = file.handle;
                if (!handle) {
                    handle = await window.showSaveFilePicker({
                        suggestedName: file.name,
                        types: [{ description: 'Text Files', accept: {'text/plain': ['.txt', '.md', '.html', '.css', '.js', '.json']} }]
                    });
                    file.handle = handle;
                    file.name = handle.name;
                    this.elements.fileNameDisplay.textContent = file.name;
                    this.saveToRecent(file.name, handle);
                    this.updateSidebar();
                }
                const writable = await handle.createWritable();
                await writable.write(file.content);
                await writable.close();
            } catch (e) {
                if (e.name !== 'AbortError') this.fallbackSaveDownload(file);
            }
        } else {
            this.fallbackSaveDownload(file);
        }
    }

    fallbackSaveDownload(file) {
        const blob = new Blob([file.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
    }

    activateWelcomeScreen() {
        this.activeFileId = null;
        this.switchView('welcome');
        this.elements.fileNameDisplay.textContent = 'Lipi';
        this.elements.fileNameDisplay.classList.add('brand-font');
        this.elements.saveBtn.disabled = true;
        this.updateSidebar();
        this.toggleDrawer(false);
    }

    updateSidebar() {
        Array.from(this.elements.openFilesList.children).forEach(child => {
            if (child.id !== 'welcome-sidebar-item') child.remove();
        });

        if (this.openFiles.length > 0) {
            this.elements.welcomeSidebarItem.style.display = 'none';
        } else {
            this.elements.welcomeSidebarItem.style.display = 'flex';
            this.elements.welcomeSidebarItem.classList.add('active');
        }

        this.openFiles.forEach(file => {
            const li = document.createElement('li');
            li.className = `drawer-item ${file.id === this.activeFileId ? 'active' : ''}`;
            li.innerHTML = `
                <div class="file-info">
                    <span class="material-symbols-rounded icon">description</span>
                    <span class="file-name">${file.name}</span>
                </div>
                <button class="close-btn" aria-label="Close file">
                    <span class="material-symbols-rounded">close</span>
                </button>
            `;
            li.addEventListener('click', (e) => {
                if (e.target.closest('.close-btn')) {
                    e.stopPropagation();
                    this.closeFile(file.id);
                } else {
                    this.switchToEditor(file.id);
                    this.updateSidebar();
                    this.toggleDrawer(false);
                }
            });
            this.elements.openFilesList.appendChild(li);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.lipi = new LipiApp();
});