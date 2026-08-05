/**
 * Lipi Editor - Core Application Logic
 */
class LipiApp {
    constructor() {
        this.supportsFileSystemAPI = 'showOpenFilePicker' in window;
        
        this.preserveData = localStorage.getItem('lipi-preserve-data') === 'true';
        this.memoryState = {
            'lipi-theme': 'system',
            'lipi-ui-font': 'default',
            'lipi-ui-font-label': 'Roboto (Default)',
            'lipi-editor-font': 'default',
            'lipi-editor-font-label': 'JetBrains Mono (Default)',
            recents: []
        };
        
        this.initDOM();
        this.initTheme();
        this.initFonts(); 
        
        this.handleFeatureSupportUI();
        this.bindEvents();
        
        this.isDrawerOpen = false;
        this.isAddDropdownOpen = false;
        this.isSaveDropdownOpen = false;
        
        this.isThemeDropdownOpen = false;
        this.isUIFontDropdownOpen = false;
        this.isEditorFontDropdownOpen = false;
        
        this.currentView = 'welcome';
        this.fileCounter = 0;
        
        this.openFiles = []; 
        this.activeFileId = null; 
        this.db = null; 
        this.fileToClose = null; 
        this.contextMenuTargetId = null;

        this.initDB().then(() => {
            if (this.preserveData) {
                this.renderRecentFiles();
            } else {
                this.renderMemoryRecentFiles();
            }
        });
    }

    initDOM() {
        this.elements = {
            menuBtn: document.getElementById('menu-btn'),
            fileNameDisplay: document.getElementById('current-file-name'),
            unsavedIndicator: document.getElementById('unsaved-indicator'),
            topBarActions: document.getElementById('top-bar-actions'),
            
            addBtn: document.getElementById('add-btn'),
            addDropdown: document.getElementById('add-dropdown'),
            dropdownNewFile: document.getElementById('dropdown-new-file'),
            dropdownOpenFile: document.getElementById('dropdown-open-file'),
            
            saveBtn: document.getElementById('save-btn'),
            saveDropdown: document.getElementById('save-dropdown'),
            dropdownActionSave: document.getElementById('dropdown-action-save'),
            dropdownActionSaveAs: document.getElementById('dropdown-action-save-as'),
            mainSaveIcon: document.getElementById('main-save-icon'),
            iconActionSave: document.getElementById('icon-action-save'),
            iconActionSaveAs: document.getElementById('icon-action-save-as'),
            
            modalOverlay: document.getElementById('modal-overlay'),
            saveAsModal: document.getElementById('save-as-modal'),
            saveAsInput: document.getElementById('save-as-input'),
            modalCancelBtn: document.getElementById('modal-cancel-btn'),
            modalSaveBtn: document.getElementById('modal-save-btn'),
            
            unsavedModal: document.getElementById('unsaved-modal'),
            unsavedModalMessage: document.getElementById('unsaved-modal-message'),
            modalUnsavedCancelBtn: document.getElementById('modal-unsaved-cancel-btn'),
            modalUnsavedDiscardBtn: document.getElementById('modal-unsaved-discard-btn'),
            modalUnsavedSaveBtn: document.getElementById('modal-unsaved-save-btn'),
            
            contextMenu: document.getElementById('file-context-menu'),
            ctxOpen: document.getElementById('ctx-open'),
            ctxRename: document.getElementById('ctx-rename'),
            ctxClose: document.getElementById('ctx-close'),
            
            sidebar: document.getElementById('sidebar'),
            overlay: document.getElementById('drawer-overlay'),
            openFilesList: document.getElementById('open-files-list'),
            welcomeSidebarItem: document.getElementById('welcome-sidebar-item'),
            settingsBtn: document.getElementById('settings-btn'), 
            
            welcomeView: document.getElementById('welcome-view'),
            editorView: document.getElementById('editor-view'),
            settingsView: document.getElementById('settings-view'), 
            
            preserveDataToggle: document.getElementById('preserve-data-toggle'), 
            preserveDataDesc: document.getElementById('preserve-data-desc'), // NEW
            
            themeSelectBtn: document.getElementById('theme-select-btn'),
            themeSelectLabel: document.getElementById('theme-select-label'),
            themeDropdown: document.getElementById('theme-dropdown'),
            themeOptions: document.querySelectorAll('.theme-option'),
            
            uiFontBtn: document.getElementById('ui-font-btn'),
            uiFontLabel: document.getElementById('ui-font-label'),
            uiFontDropdown: document.getElementById('ui-font-dropdown'),
            uiFontOptions: document.querySelectorAll('.ui-font-option'),
            
            editorFontBtn: document.getElementById('editor-font-btn'),
            editorFontLabel: document.getElementById('editor-font-label'),
            editorFontDropdown: document.getElementById('editor-font-dropdown'),
            editorFontOptions: document.querySelectorAll('.editor-font-option'),
            
            resetFontsBtn: document.getElementById('reset-fonts-btn'),
            
            mainEditor: document.getElementById('main-editor'),
            btnNewFile: document.getElementById('action-new-file'),
            btnOpenFile: document.getElementById('action-open-file'),
            fallbackFileInput: document.getElementById('fallback-file-input'),
            welcomeRecentGroup: document.getElementById('welcome-recent-group'),
            dropdownRecentGroup: document.getElementById('dropdown-recent-group'),
            recentContainer: document.getElementById('recent-files-container'),
            dropdownRecentList: document.getElementById('dropdown-recent-list')
        };
        
        this.elements.preserveDataToggle.checked = this.preserveData;
    }

    getSetting(key) {
        if (this.preserveData) {
            return localStorage.getItem(key) || this.memoryState[key];
        }
        return this.memoryState[key];
    }

    setSetting(key, value) {
        this.memoryState[key] = value; 
        if (this.preserveData) {
            localStorage.setItem(key, value);
        }
    }

    initTheme() {
        const savedTheme = this.getSetting('lipi-theme');
        this.updateThemeLabel(savedTheme);
        this.applyTheme(savedTheme);
    }

    applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    updateThemeLabel(themeValue) {
        if (themeValue === 'system') this.elements.themeSelectLabel.textContent = 'System Default';
        if (themeValue === 'light') this.elements.themeSelectLabel.textContent = 'Light';
        if (themeValue === 'dark') this.elements.themeSelectLabel.textContent = 'Dark';
    }

    initFonts() {
        const savedUIFont = this.getSetting('lipi-ui-font');
        const savedEditorFont = this.getSetting('lipi-editor-font');
        
        const savedUILabel = this.getSetting('lipi-ui-font-label');
        const savedEditorLabel = this.getSetting('lipi-editor-font-label');
        
        this.applyUIFont(savedUIFont, savedUIFont !== 'default' ? savedUILabel : null);
        this.applyEditorFont(savedEditorFont, savedEditorFont !== 'default' ? savedEditorLabel : null);
    }

    applyUIFont(fontValue, labelText = null) {
        if (fontValue === 'default') {
            document.documentElement.style.removeProperty('--md-sys-typescale-display-large-font');
            this.elements.uiFontLabel.textContent = 'Roboto (Default)';
        } else {
            document.documentElement.style.setProperty('--md-sys-typescale-display-large-font', fontValue);
            if (labelText) this.elements.uiFontLabel.textContent = labelText;
        }
    }

    applyEditorFont(fontValue, labelText = null) {
        if (fontValue === 'default') {
            document.documentElement.style.removeProperty('--editor-font-family');
            this.elements.editorFontLabel.textContent = 'JetBrains Mono (Default)';
        } else {
            document.documentElement.style.setProperty('--editor-font-family', fontValue);
            if (labelText) this.elements.editorFontLabel.textContent = labelText;
        }
    }

    closeAllSettingsDropdowns() {
        this.isThemeDropdownOpen = false;
        this.isUIFontDropdownOpen = false;
        this.isEditorFontDropdownOpen = false;
        this.elements.themeDropdown.classList.add('hidden');
        this.elements.uiFontDropdown.classList.add('hidden');
        this.elements.editorFontDropdown.classList.add('hidden');
    }

    toggleThemeDropdown(open) {
        if (open) this.closeAllSettingsDropdowns();
        this.isThemeDropdownOpen = open;
        if (open) this.elements.themeDropdown.classList.remove('hidden');
    }

    toggleUIFontDropdown(open) {
        if (open) this.closeAllSettingsDropdowns();
        this.isUIFontDropdownOpen = open;
        if (open) this.elements.uiFontDropdown.classList.remove('hidden');
    }

    toggleEditorFontDropdown(open) {
        if (open) this.closeAllSettingsDropdowns();
        this.isEditorFontDropdownOpen = open;
        if (open) this.elements.editorFontDropdown.classList.remove('hidden');
    }

    handleFeatureSupportUI() {
        if (!this.supportsFileSystemAPI) {
            if (this.elements.welcomeRecentGroup) this.elements.welcomeRecentGroup.remove();
            if (this.elements.dropdownRecentGroup) this.elements.dropdownRecentGroup.remove();
            
            this.elements.mainSaveIcon.textContent = 'download';
            this.elements.iconActionSave.textContent = 'download';
            this.elements.iconActionSaveAs.textContent = 'sim_card_download';
            
            // NEW: Conditionally hide the recent files mention in the settings toggle description
            if (this.elements.preserveDataDesc) {
                this.elements.preserveDataDesc.textContent = 'Save settings across browser restarts';
            }
        }
    }

    bindEvents() {
        
        this.elements.preserveDataToggle.addEventListener('change', async (e) => {
            this.preserveData = e.target.checked;
            localStorage.setItem('lipi-preserve-data', this.preserveData);

            if (this.preserveData) {
                localStorage.setItem('lipi-theme', this.memoryState['lipi-theme']);
                localStorage.setItem('lipi-ui-font', this.memoryState['lipi-ui-font']);
                localStorage.setItem('lipi-ui-font-label', this.memoryState['lipi-ui-font-label']);
                localStorage.setItem('lipi-editor-font', this.memoryState['lipi-editor-font']);
                localStorage.setItem('lipi-editor-font-label', this.memoryState['lipi-editor-font-label']);

                if (this.db && this.memoryState.recents.length > 0) {
                    await new Promise(resolve => {
                        const tx = this.db.transaction('recents', 'readwrite');
                        const store = tx.objectStore('recents');
                        this.memoryState.recents.forEach(r => store.put(r));
                        tx.oncomplete = resolve;
                    });
                }
            } else {
                this.memoryState['lipi-theme'] = localStorage.getItem('lipi-theme') || 'system';
                this.memoryState['lipi-ui-font'] = localStorage.getItem('lipi-ui-font') || 'default';
                this.memoryState['lipi-ui-font-label'] = localStorage.getItem('lipi-ui-font-label') || 'Roboto (Default)';
                this.memoryState['lipi-editor-font'] = localStorage.getItem('lipi-editor-font') || 'default';
                this.memoryState['lipi-editor-font-label'] = localStorage.getItem('lipi-editor-font-label') || 'JetBrains Mono (Default)';

                if (this.db) {
                    this.memoryState.recents = await this.getDBRecents();
                    await new Promise(resolve => {
                        const tx = this.db.transaction('recents', 'readwrite');
                        tx.objectStore('recents').clear(); 
                        tx.oncomplete = resolve;
                    });
                }

                localStorage.removeItem('lipi-theme');
                localStorage.removeItem('lipi-ui-font');
                localStorage.removeItem('lipi-ui-font-label');
                localStorage.removeItem('lipi-editor-font');
                localStorage.removeItem('lipi-editor-font-label');
            }
        });

        const setupMenuKeyboardNav = (anchorBtn, menuEl) => {
            anchorBtn.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (menuEl.classList.contains('hidden')) anchorBtn.click(); 
                    
                    setTimeout(() => {
                        const items = Array.from(menuEl.querySelectorAll('.menu-item:not([disabled]):not(.disabled)'));
                        if (items.length > 0) {
                            if (menuEl.id === 'theme-dropdown') {
                                const val = this.getSetting('lipi-theme');
                                const active = items.find(opt => opt.dataset.themeVal === val);
                                if (active) { active.focus(); return; }
                            } else if (menuEl.id === 'ui-font-dropdown') {
                                const val = this.getSetting('lipi-ui-font');
                                const active = items.find(opt => opt.dataset.fontVal === val);
                                if (active) { active.focus(); return; }
                            } else if (menuEl.id === 'editor-font-dropdown') {
                                const val = this.getSetting('lipi-editor-font');
                                const active = items.find(opt => opt.dataset.fontVal === val);
                                if (active) { active.focus(); return; }
                            }
                            items[0].focus(); 
                        }
                    }, 10);
                }
            });

            menuEl.addEventListener('keydown', (e) => {
                const items = Array.from(menuEl.querySelectorAll('.menu-item:not([disabled]):not(.disabled)'));
                const currentIndex = items.indexOf(document.activeElement);

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = items[currentIndex + 1] || items[0];
                    if (next) next.focus();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = items[currentIndex - 1] || items[items.length - 1];
                    if (prev) prev.focus();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    if (!menuEl.classList.contains('hidden')) anchorBtn.click(); 
                    anchorBtn.focus();
                } else if (e.key === 'Tab') {
                    if (!menuEl.classList.contains('hidden')) anchorBtn.click(); 
                }
            });
            
            menuEl.addEventListener('click', (e) => {
                if (e.target.closest('.menu-item:not([disabled]):not(.disabled)')) {
                    setTimeout(() => anchorBtn.focus(), 10);
                }
            });
        };

        setupMenuKeyboardNav(this.elements.addBtn, this.elements.addDropdown);
        setupMenuKeyboardNav(this.elements.saveBtn, this.elements.saveDropdown);
        setupMenuKeyboardNav(this.elements.themeSelectBtn, this.elements.themeDropdown);
        setupMenuKeyboardNav(this.elements.uiFontBtn, this.elements.uiFontDropdown); 
        setupMenuKeyboardNav(this.elements.editorFontBtn, this.elements.editorFontDropdown); 

        this.elements.themeSelectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleThemeDropdown(!this.isThemeDropdownOpen);
        });

        this.elements.themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const newTheme = e.target.dataset.themeVal;
                this.setSetting('lipi-theme', newTheme);
                this.updateThemeLabel(newTheme);
                this.applyTheme(newTheme);
                this.closeAllSettingsDropdowns();
            });
        });

        this.elements.uiFontBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleUIFontDropdown(!this.isUIFontDropdownOpen);
        });

        this.elements.uiFontOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const val = e.target.dataset.fontVal;
                const label = e.target.dataset.label;
                this.setSetting('lipi-ui-font', val);
                this.setSetting('lipi-ui-font-label', label);
                this.applyUIFont(val, label);
                this.closeAllSettingsDropdowns();
            });
        });

        this.elements.editorFontBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleEditorFontDropdown(!this.isEditorFontDropdownOpen);
        });

        this.elements.editorFontOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const val = e.target.dataset.fontVal;
                const label = e.target.dataset.label;
                this.setSetting('lipi-editor-font', val);
                this.setSetting('lipi-editor-font-label', label);
                this.applyEditorFont(val, label);
                this.closeAllSettingsDropdowns();
            });
        });

        this.elements.resetFontsBtn.addEventListener('click', () => {
            this.setSetting('lipi-ui-font', 'default');
            this.setSetting('lipi-ui-font-label', 'Roboto (Default)');
            this.setSetting('lipi-editor-font', 'default');
            this.setSetting('lipi-editor-font-label', 'JetBrains Mono (Default)');
            
            if (this.preserveData) {
                localStorage.removeItem('lipi-ui-font');
                localStorage.removeItem('lipi-ui-font-label');
                localStorage.removeItem('lipi-editor-font');
                localStorage.removeItem('lipi-editor-font-label');
            }
            this.applyUIFont('default');
            this.applyEditorFont('default');
        });

        this.elements.settingsBtn.addEventListener('click', () => this.openSettings());

        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('textarea') || e.target.closest('input') || e.target.closest('[contenteditable="true"]') || e.target.closest('button.m3-select-btn') || e.target.closest('label.m3-switch')) {
                return;
            }
            e.preventDefault(); 
            const drawerItem = e.target.closest('.drawer-item:not(#welcome-sidebar-item):not(#settings-btn)');
            if (drawerItem) {
                const fileId = drawerItem.dataset.id;
                this.showContextMenu(e.clientX, e.clientY, fileId);
            } else {
                this.hideContextMenu();
            }
        });

        document.addEventListener('click', (e) => {
            this.hideContextMenu();
            if (this.isAddDropdownOpen && !this.elements.addDropdown.contains(e.target)) this.toggleAddDropdown(false);
            if (this.isSaveDropdownOpen && !this.elements.saveDropdown.contains(e.target)) this.toggleSaveDropdown(false);
            
            if (this.isThemeDropdownOpen && !this.elements.themeDropdown.contains(e.target) && e.target !== this.elements.themeSelectBtn && !this.elements.themeSelectBtn.contains(e.target)) {
                this.isThemeDropdownOpen = false;
                this.elements.themeDropdown.classList.add('hidden');
            }
            if (this.isUIFontDropdownOpen && !this.elements.uiFontDropdown.contains(e.target) && e.target !== this.elements.uiFontBtn && !this.elements.uiFontBtn.contains(e.target)) {
                this.isUIFontDropdownOpen = false;
                this.elements.uiFontDropdown.classList.add('hidden');
            }
            if (this.isEditorFontDropdownOpen && !this.elements.editorFontDropdown.contains(e.target) && e.target !== this.elements.editorFontBtn && !this.elements.editorFontBtn.contains(e.target)) {
                this.isEditorFontDropdownOpen = false;
                this.elements.editorFontDropdown.classList.add('hidden');
            }
        });

        this.elements.ctxOpen.addEventListener('click', () => {
            if (this.contextMenuTargetId) this.switchToEditor(this.contextMenuTargetId);
            this.hideContextMenu();
            this.toggleDrawer(false);
        });

        this.elements.ctxRename.addEventListener('click', () => {
            if (this.contextMenuTargetId) {
                this.switchToEditor(this.contextMenuTargetId);
                setTimeout(() => this.elements.fileNameDisplay.focus(), 50);
            }
            this.hideContextMenu();
            this.toggleDrawer(false);
        });

        this.elements.ctxClose.addEventListener('click', () => {
            if (this.contextMenuTargetId) this.closeFile(this.contextMenuTargetId);
            this.hideContextMenu();
        });

        this.elements.menuBtn.addEventListener('click', () => this.toggleDrawer(true));
        this.elements.overlay.addEventListener('click', () => this.toggleDrawer(false));
        window.addEventListener('resize', () => { if (window.innerWidth >= 900) this.toggleDrawer(false); });

        this.elements.addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleAddDropdown(!this.isAddDropdownOpen);
            this.toggleSaveDropdown(false); 
        });

        this.elements.saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSaveDropdown(!this.isSaveDropdownOpen);
            this.toggleAddDropdown(false); 
        });

        this.elements.dropdownActionSave.addEventListener('click', () => {
            this.toggleSaveDropdown(false);
            this.saveCurrentFile();
        });
        
        this.elements.dropdownActionSaveAs.addEventListener('click', () => {
            this.toggleSaveDropdown(false);
            this.saveFileAs();
        });

        this.elements.modalCancelBtn.addEventListener('click', () => this.closeSaveAsModal());
        this.elements.modalSaveBtn.addEventListener('click', () => this.confirmSaveAs());
        this.elements.saveAsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.confirmSaveAs();
            if (e.key === 'Escape') this.closeSaveAsModal();
        });

        this.elements.modalUnsavedCancelBtn.addEventListener('click', () => this.closeUnsavedModal());
        this.elements.modalUnsavedDiscardBtn.addEventListener('click', () => this.confirmDiscard());
        this.elements.modalUnsavedSaveBtn.addEventListener('click', () => this.confirmSaveAndClose());

        window.addEventListener('beforeunload', (e) => {
            const hasUnsaved = this.openFiles.some(f => f.isUnsaved);
            if (hasUnsaved) {
                e.preventDefault();
                e.returnValue = ''; 
            }
        });

        this.elements.welcomeSidebarItem.addEventListener('click', () => this.activateWelcomeScreen());

        const handleNewFile = () => { this.toggleAddDropdown(false); this.createNewFile(); };
        const handleOpenFile = () => { this.toggleAddDropdown(false); this.openFile(); };

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

        this.elements.mainEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault(); 
                const start = this.elements.mainEditor.selectionStart;
                const end = this.elements.mainEditor.selectionEnd;
                const val = this.elements.mainEditor.value;
                this.elements.mainEditor.value = val.substring(0, start) + '\t' + val.substring(end);
                this.elements.mainEditor.selectionStart = this.elements.mainEditor.selectionEnd = start + 1;
                this.elements.mainEditor.dispatchEvent(new Event('input'));
            }
        });

        this.elements.mainEditor.addEventListener('input', (e) => {
            if (this.activeFileId) {
                const file = this.openFiles.find(f => f.id === this.activeFileId);
                if (file) {
                    file.content = e.target.value;
                    if (!file.isUnsaved) {
                        file.isUnsaved = true;
                        this.updateUnsavedUI();
                        this.updateSidebar();
                    }
                }
            }
        });

        this.elements.fileNameDisplay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.elements.fileNameDisplay.blur();
            }
        });

        this.elements.fileNameDisplay.addEventListener('blur', () => {
            if (this.elements.fileNameDisplay.classList.contains('editable')) {
                this.renameActiveFile(this.elements.fileNameDisplay.textContent.trim());
            }
        });
    }

    showContextMenu(x, y, fileId) {
        this.contextMenuTargetId = fileId;
        const menuWidth = 180; 
        const menuHeight = 150;
        let adjustedX = x;
        let adjustedY = y;
        
        if (x + menuWidth > window.innerWidth) adjustedX = window.innerWidth - menuWidth - 10;
        if (y + menuHeight > window.innerHeight) adjustedY = window.innerHeight - menuHeight - 10;

        this.elements.contextMenu.style.left = `${adjustedX}px`;
        this.elements.contextMenu.style.top = `${adjustedY}px`;
        this.elements.contextMenu.classList.add('active');
    }

    hideContextMenu() {
        this.contextMenuTargetId = null;
        this.elements.contextMenu.classList.remove('active');
    }

    async getDBRecents() {
        return new Promise(resolve => {
            const tx = this.db.transaction('recents', 'readonly');
            const req = tx.objectStore('recents').getAll();
            req.onsuccess = () => resolve(req.result.sort((a,b) => b.timestamp - a.timestamp));
        });
    }

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
        if (!handle || !this.supportsFileSystemAPI) return; 
        const fileData = { name, handle, timestamp: Date.now() };

        if (this.preserveData) {
            if (!this.db) return;
            await new Promise(resolve => {
                const tx = this.db.transaction('recents', 'readwrite');
                tx.objectStore('recents').put(fileData);
                tx.oncomplete = resolve;
            });

            const recents = await this.getDBRecents();
            if (recents.length > 6) {
                const toDelete = recents.slice(6);
                await new Promise(resolve => {
                    const tx = this.db.transaction('recents', 'readwrite');
                    toDelete.forEach(item => tx.objectStore('recents').delete(item.name));
                    tx.oncomplete = resolve;
                });
            }
            this.renderRecentFiles();
        } else {
            const existingIndex = this.memoryState.recents.findIndex(r => r.name === name);
            if (existingIndex > -1) this.memoryState.recents.splice(existingIndex, 1);
            this.memoryState.recents.unshift(fileData);
            if (this.memoryState.recents.length > 6) this.memoryState.recents.pop();
            this.renderMemoryRecentFiles();
        }
    }

    async removeRecentFile(name) {
        if (!this.supportsFileSystemAPI) return;
        
        if (this.preserveData) {
            if (!this.db) return;
            await new Promise(resolve => {
                const tx = this.db.transaction('recents', 'readwrite');
                tx.objectStore('recents').delete(name);
                tx.oncomplete = resolve;
            });
            this.renderRecentFiles();
        } else {
            const index = this.memoryState.recents.findIndex(r => r.name === name);
            if (index > -1) this.memoryState.recents.splice(index, 1);
            this.renderMemoryRecentFiles();
        }
    }

    async renderRecentFiles() {
        if (!this.db || !this.supportsFileSystemAPI) return;
        const recents = await this.getDBRecents();
        this._buildRecentDOM(recents);
    }

    renderMemoryRecentFiles() {
        if (!this.supportsFileSystemAPI) return;
        this._buildRecentDOM(this.memoryState.recents);
    }

    _buildRecentDOM(recentsList) {
        if (!this.elements.recentContainer) return;

        this.elements.recentContainer.innerHTML = '';
        this.elements.dropdownRecentList.innerHTML = '';

        if (recentsList.length === 0) {
            this.elements.recentContainer.innerHTML = '<span class="empty-state">No recent files</span>';
            this.elements.dropdownRecentList.innerHTML = '<button class="menu-item disabled">No recent files</button>';
            return;
        }

        recentsList.forEach(fileData => {
            const wrapper = document.createElement('div');
            wrapper.className = 'recent-item-wrapper';

            const btn = document.createElement('button');
            btn.className = 'text-btn';
            btn.innerHTML = `<span class="material-symbols-rounded">description</span> <span class="file-name" style="max-width: 200px;">${fileData.name}</span>`;
            btn.onclick = () => this.openRecentFile(fileData);

            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn remove-recent-btn';
            delBtn.innerHTML = `<span class="material-symbols-rounded" style="font-size: 18px;">close</span>`;
            delBtn.setAttribute('aria-label', 'Remove from recents');
            delBtn.onclick = (e) => {
                e.stopPropagation();
                this.removeRecentFile(fileData.name);
            };

            wrapper.appendChild(btn);
            wrapper.appendChild(delBtn);
            this.elements.recentContainer.appendChild(wrapper);

            const dropWrapper = document.createElement('div');
            dropWrapper.className = 'dropdown-recent-item-wrapper';

            const dropBtn = document.createElement('button');
            dropBtn.className = 'menu-item';
            dropBtn.innerHTML = `<span class="material-symbols-rounded">description</span> <span class="file-name" style="max-width: 120px;">${fileData.name}</span>`;
            dropBtn.onclick = () => {
                this.toggleAddDropdown(false);
                this.openRecentFile(fileData);
            };

            const dropDelBtn = document.createElement('button');
            dropDelBtn.className = 'icon-btn remove-recent-btn';
            dropDelBtn.innerHTML = `<span class="material-symbols-rounded" style="font-size: 16px;">close</span>`;
            dropDelBtn.setAttribute('aria-label', 'Remove from recents');
            dropDelBtn.onclick = (e) => {
                e.stopPropagation();
                this.removeRecentFile(fileData.name);
            };

            dropWrapper.appendChild(dropBtn);
            dropWrapper.appendChild(dropDelBtn);
            this.elements.dropdownRecentList.appendChild(dropWrapper);
        });
    }

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

    toggleAddDropdown(open) {
        this.isAddDropdownOpen = open;
        if (this.isAddDropdownOpen) {
            this.elements.addDropdown.classList.remove('hidden');
        } else {
            this.elements.addDropdown.classList.add('hidden');
        }
    }

    toggleSaveDropdown(open) {
        this.isSaveDropdownOpen = open;
        if (this.isSaveDropdownOpen) {
            this.elements.saveDropdown.classList.remove('hidden');
        } else {
            this.elements.saveDropdown.classList.add('hidden');
        }
    }

    openSaveAsModal(fileName) {
        this.elements.saveAsInput.value = fileName;
        this.elements.modalOverlay.classList.add('active');
        this.elements.saveAsModal.classList.add('active');
        this.elements.saveAsInput.focus();
        
        const dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            this.elements.saveAsInput.setSelectionRange(0, dotIndex);
        } else {
            this.elements.saveAsInput.select();
        }
    }

    closeSaveAsModal() {
        this.elements.modalOverlay.classList.remove('active');
        this.elements.saveAsModal.classList.remove('active');
    }

    confirmSaveAs() {
        if (!this.activeFileId) return;
        const file = this.openFiles.find(f => f.id === this.activeFileId);
        
        let newName = this.elements.saveAsInput.value.trim();
        if (!newName) return;

        if (!newName.includes('.')) newName += '.txt';
        
        file.name = newName;
        this.elements.fileNameDisplay.textContent = file.name;
        file.handle = null; 
        
        this.closeSaveAsModal();
        this.fallbackSaveDownload(file);
    }

    openUnsavedModal(fileId) {
        this.fileToClose = fileId;
        const file = this.openFiles.find(f => f.id === fileId);
        
        this.elements.unsavedModalMessage.innerHTML = `Do you want to save the changes you made to <strong>${file.name}</strong>?<br><br>Your changes will be lost if you don't save them.`;
        
        if (!file.handle && this.supportsFileSystemAPI) {
            this.elements.modalUnsavedSaveBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 18px; margin-right: 8px;">save_as</span> Save As...';
        } else {
            this.elements.modalUnsavedSaveBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size: 18px; margin-right: 8px;">save</span> Save';
        }

        this.elements.modalOverlay.classList.add('active');
        this.elements.unsavedModal.classList.add('active');
    }

    closeUnsavedModal() {
        this.fileToClose = null;
        this.elements.modalOverlay.classList.remove('active');
        this.elements.unsavedModal.classList.remove('active');
    }

    confirmDiscard() {
        const fileId = this.fileToClose;
        this.closeUnsavedModal();
        this.performCloseFile(fileId); 
    }

    async confirmSaveAndClose() {
        const fileId = this.fileToClose;
        const file = this.openFiles.find(f => f.id === fileId);
        
        if (this.activeFileId !== fileId) {
            this.switchToEditor(fileId);
        }

        this.closeUnsavedModal();

        if (!file.handle && this.supportsFileSystemAPI) {
            await this.saveFileAs();
        } else {
            await this.saveCurrentFile();
        }

        if (!file.isUnsaved) {
            this.performCloseFile(fileId);
        }
    }

    switchView(viewName) {
        this.currentView = viewName;
        
        this.elements.welcomeView.classList.replace('active', 'hidden') || this.elements.welcomeView.classList.add('hidden');
        this.elements.editorView.classList.replace('active', 'hidden') || this.elements.editorView.classList.add('hidden');
        this.elements.settingsView.classList.replace('active', 'hidden') || this.elements.settingsView.classList.add('hidden');
        
        if (viewName === 'editor') {
            this.elements.editorView.classList.replace('hidden', 'active');
        } else if (viewName === 'settings') {
            this.elements.settingsView.classList.replace('hidden', 'active');
        } else {
            this.elements.welcomeView.classList.replace('hidden', 'active');
        }
    }

    openSettings() {
        this.switchView('settings');
        
        this.elements.fileNameDisplay.textContent = 'Settings';
        this.elements.fileNameDisplay.classList.remove('brand-font', 'editable');
        this.elements.fileNameDisplay.contentEditable = "false";
        
        this.elements.unsavedIndicator.style.display = 'none';
        this.elements.topBarActions.style.display = 'none'; 
        
        Array.from(this.elements.openFilesList.children).forEach(li => li.classList.remove('active'));
        this.elements.welcomeSidebarItem.classList.remove('active');
        this.elements.settingsBtn.classList.add('active');
        
        this.toggleAddDropdown(false);
        this.toggleSaveDropdown(false);
        this.closeAllSettingsDropdowns();
        this.toggleDrawer(false);
    }

    updateUnsavedUI() {
        if (!this.activeFileId) {
            this.elements.unsavedIndicator.style.display = 'none';
            this.elements.saveBtn.disabled = true; 
            return;
        }
        
        this.elements.saveBtn.disabled = false;
        
        const file = this.openFiles.find(f => f.id === this.activeFileId);
        if (file && file.isUnsaved) {
            this.elements.unsavedIndicator.style.display = 'inline-block';
            this.elements.dropdownActionSave.disabled = false;
        } else {
            this.elements.unsavedIndicator.style.display = 'none';
            this.elements.dropdownActionSave.disabled = true;
        }
    }

    renameActiveFile(newName) {
        if (!this.activeFileId) return;
        const file = this.openFiles.find(f => f.id === this.activeFileId);
        
        if (!newName || newName === file.name) {
            this.elements.fileNameDisplay.textContent = file.name;
            return;
        }

        file.name = newName;
        file.handle = null;
        file.isUnsaved = true;
        
        this.updateUnsavedUI();
        this.updateSidebar();
    }

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
        this.openFiles.push({ id: fileId, name: fileName, content: content, handle: fileHandle, isUnsaved: false });
        this.switchToEditor(fileId);
        this.updateSidebar();
        this.toggleDrawer(false);
    }

    switchToEditor(fileId) {
        this.activeFileId = fileId;
        const file = this.openFiles.find(f => f.id === fileId);
        
        this.switchView('editor');
        
        this.elements.topBarActions.style.display = 'flex'; 
        
        this.elements.fileNameDisplay.textContent = file.name;
        this.elements.fileNameDisplay.classList.remove('brand-font');
        this.elements.fileNameDisplay.classList.add('editable');
        this.elements.fileNameDisplay.contentEditable = "true";
        
        this.elements.settingsBtn.classList.remove('active');
        
        this.elements.mainEditor.value = file.content;
        this.updateUnsavedUI(); 
        this.elements.mainEditor.focus();
    }

    closeFile(fileId) {
        const file = this.openFiles.find(f => f.id === fileId);
        if (!file) return;

        if (file.isUnsaved) {
            this.openUnsavedModal(fileId);
            return; 
        }

        this.performCloseFile(fileId);
    }

    performCloseFile(fileId) {
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
                }
                const writable = await handle.createWritable();
                await writable.write(file.content);
                await writable.close();
                
                this.markAsSaved(file);
            } catch (e) {
                if (e.name !== 'AbortError') this.fallbackSaveDownload(file);
            }
        } else {
            this.fallbackSaveDownload(file);
        }
    }

    async saveFileAs() {
        if (!this.activeFileId) return;
        const file = this.openFiles.find(f => f.id === this.activeFileId);
        
        this.toggleSaveDropdown(false);

        if (this.supportsFileSystemAPI) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: file.name,
                    types: [{ description: 'Text Files', accept: {'text/plain': ['.txt', '.md', '.html', '.css', '.js', '.json']} }]
                });
                
                file.handle = handle;
                file.name = handle.name;
                this.elements.fileNameDisplay.textContent = file.name;
                
                const writable = await handle.createWritable();
                await writable.write(file.content);
                await writable.close();
                
                this.saveToRecent(file.name, handle);
                this.markAsSaved(file);
            } catch (e) {
                // User cancelled
            }
        } else {
            this.openSaveAsModal(file.name);
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
        
        this.markAsSaved(file);
    }
    
    markAsSaved(file) {
        file.isUnsaved = false;
        this.updateUnsavedUI();
        this.updateSidebar();
    }

    activateWelcomeScreen() {
        this.activeFileId = null;
        this.switchView('welcome');
        
        this.elements.topBarActions.style.display = 'flex';
        
        this.elements.fileNameDisplay.textContent = 'Lipi';
        this.elements.fileNameDisplay.classList.add('brand-font');
        this.elements.fileNameDisplay.classList.remove('editable');
        this.elements.fileNameDisplay.contentEditable = "false";
        
        this.elements.settingsBtn.classList.remove('active');
        
        this.elements.unsavedIndicator.style.display = 'none';
        this.elements.saveBtn.disabled = true; 
        this.updateSidebar();
        
        this.toggleAddDropdown(false);
        this.toggleSaveDropdown(false);
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
            if (this.currentView === 'welcome') {
                this.elements.welcomeSidebarItem.classList.add('active');
            }
        }

        this.openFiles.forEach(file => {
            const li = document.createElement('li');
            li.className = `drawer-item ${file.id === this.activeFileId ? 'active' : ''}`;
            li.dataset.id = file.id;
            
            const unsavedDot = file.isUnsaved ? `<span style="color: var(--md-sys-color-primary); font-size: 14px;">●</span>` : '';
            
            li.innerHTML = `
                <div class="file-info">
                    <span class="material-symbols-rounded icon">description</span>
                    <span class="file-name">${file.name}</span>
                    ${unsavedDot}
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