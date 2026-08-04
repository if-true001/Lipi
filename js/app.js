/**
 * Lipi Editor - Core Application Logic
 */
class LipiApp {
    constructor() {
        this.initDOM();
        this.bindEvents();
        
        // App State
        this.isDrawerOpen = false;
        this.isDropdownOpen = false;
        this.currentView = 'welcome';
        this.fileCounter = 0;
        
        // Data State
        this.openFiles = []; 
        this.activeFileId = null; 
        this.db = null; // IndexedDB instance

        // Initialize Database and Load Recents
        this.initDB().then(() => this.renderRecentFiles());
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
            recentContainer: document.getElementById('recent-files-container'),
            dropdownRecentList: document.getElementById('dropdown-recent-list')
        };
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
        
        // Fallback File Reader Logic
        this.elements.fallbackFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                // Fallback files do not get a 'handle' attached
                this.loadFileIntoEditor(file.name, event.target.result, null);
            };
            reader.readAsText(file);
            e.target.value = ''; // Reset input
        });

        this.elements.mainEditor.addEventListener('input', (e) => {
            if (this.activeFileId) {
                const file = this.openFiles.find(f => f.id === this.activeFileId);
                if (file) file.content = e.target.value;
            }
        });
    }

    // --- IndexedDB for Recent Files ---

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
        if (!this.db || !handle) return; // Cannot save fallback files to recent
        const tx = this.db.transaction('recents', 'readwrite');
        tx.objectStore('recents').put({ name, handle, timestamp: Date.now() });
        this.renderRecentFiles();
    }

    async renderRecentFiles() {
        if (!this.db) return;
        const recents = await new Promise(resolve => {
            const tx = this.db.transaction('recents', 'readonly');
            const req = tx.objectStore('recents').getAll();
            req.onsuccess = () => resolve(req.result.sort((a,b) => b.timestamp - a.timestamp));
        });

        this.elements.recentContainer.innerHTML = '';
        this.elements.dropdownRecentList.innerHTML = '';

        if (recents.length === 0) {
            this.elements.recentContainer.innerHTML = '<span class="empty-state">No recent files</span>';
            this.elements.dropdownRecentList.innerHTML = '<button class="menu-item disabled">No recent files</button>';
            return;
        }

        recents.forEach(fileData => {
            // Add to Welcome Screen
            const btn = document.createElement('button');
            btn.className = 'text-btn';
            btn.innerHTML = `<span class="material-symbols-rounded">description</span> ${fileData.name}`;
            btn.onclick = () => this.openRecentFile(fileData);
            this.elements.recentContainer.appendChild(btn);

            // Add to Top App Bar Dropdown
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

    // --- UI Toggles ---

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

    // --- Core File Management Logic ---

    createNewFile() {
        const fileName = this.fileCounter === 0 ? 'Untitled.txt' : `Untitled-${this.fileCounter}.txt`;
        this.fileCounter++;
        this.loadFileIntoEditor(fileName, '', null);
    }

    async openFile() {
        // Modern Native File Picker
        if (window.showOpenFilePicker) {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    types: [{ description: 'Text Files', accept: {'text/*': ['.txt', '.md', '.html', '.css', '.js', '.json']} }]
                });
                const file = await fileHandle.getFile();
                const content = await file.text();
                
                this.loadFileIntoEditor(file.name, content, fileHandle);
                this.saveToRecent(file.name, fileHandle);
            } catch (e) {
                console.log('File picker cancelled or failed:', e);
            }
        } else {
            // Traditional Fallback
            this.elements.fallbackFileInput.click();
        }
    }

    async openRecentFile(recentData) {
        try {
            const handle = recentData.handle;
            
            // Check browser permission to read this file again
            const perm = await handle.queryPermission({ mode: 'readwrite' });
            if (perm !== 'granted') {
                const req = await handle.requestPermission({ mode: 'readwrite' });
                if (req !== 'granted') throw new Error('Permission denied by user');
            }
            
            const file = await handle.getFile();
            const content = await file.text();
            
            this.loadFileIntoEditor(file.name, content, handle);
            this.saveToRecent(file.name, handle); // Updates timestamp
        } catch (e) {
            console.error('Failed to open recent file:', e);
            alert("Could not open file. It may have been moved, deleted, or permissions were denied.");
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
                    const nextIndex = Math.max(0, index - 1);
                    this.switchToEditor(this.openFiles[nextIndex].id);
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
        
        // Native Disk Overwrite
        if (window.showSaveFilePicker && file.handle) {
            try {
                const writable = await file.handle.createWritable();
                await writable.write(file.content);
                await writable.close();
                console.log('File successfully overwritten to disk!');
            } catch (e) {
                console.error('Save failed, falling back to download:', e);
                this.fallbackSaveDownload(file);
            }
        } else {
            // Blob Download
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