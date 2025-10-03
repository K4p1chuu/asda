async function loadSidebarAndUserData(activePage) {
    const token = localStorage.getItem('mdt-token');
    if (!token) {
        window.location.href = 'index.html';
        return null;
    }

    try {
        const response = await fetch('/api/user-data', {
            headers: { 'Authorization': token }
        });

        if (!response.ok) {
            localStorage.removeItem('mdt-token');
            window.location.href = 'index.html';
            throw new Error('Błąd autoryzacji');
        }

        const { userData } = await response.json();
        
        // --- NOWA STRUKTURA MENU Z KATEGORIAMI ---
        const sidebarHTML = `
            <div class="flex items-center mb-6">
                <img src="ocsowsp.png" alt="WSP Logo" class="w-12 h-12 mr-3">
                <div><h1 class="text-xl font-bold text-white">MDT</h1></div>
            </div>
            <nav class="flex-grow space-y-2">
                
                <div>
                    <button data-category="glowne" class="category-btn w-full flex items-center justify-between text-sm font-semibold text-gray-400 hover:text-white p-2 rounded-lg">
                        <span>GŁÓWNE</span>
                        <i data-lucide="chevron-down" class="chevron-icon w-4 h-4 transition-transform"></i>
                    </button>
                    <div id="category-glowne" class="category-content mt-1 space-y-1 pl-4">
                        <a href="dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="layout-dashboard" class="w-5 h-5 mr-3"></i> Panel Główny</a>
                    </div>
                </div>

                <div>
                    <button data-category="bazy" class="category-btn w-full flex items-center justify-between text-sm font-semibold text-gray-400 hover:text-white p-2 rounded-lg">
                        <span>BAZY DANYCH</span>
                        <i data-lucide="chevron-down" class="chevron-icon w-4 h-4 transition-transform"></i>
                    </button>
                    <div id="category-bazy" class="category-content mt-1 space-y-1 pl-4">
                         <a href="database.html" class="sidebar-link ${activePage === 'database' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="database" class="w-5 h-5 mr-3"></i> Baza Obywateli</a>
                         <a href="vehicle-database.html" class="sidebar-link ${activePage === 'vehicle-database' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="car" class="w-5 h-5 mr-3"></i> Baza Pojazdów</a>
                         <a href="parking.html" class="sidebar-link ${activePage === 'parking' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="parking-circle" class="w-5 h-5 mr-3"></i> Parking Policyjny</a>
                         <a href="suspended-licenses.html" class="sidebar-link ${activePage === 'suspended-licenses' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="file-minus-2" class="w-5 h-5 mr-3"></i> Wstrzymane Prawa Jazdy</a>
                    </div>
                </div>

                <div>
                    <button data-category="operacje" class="category-btn w-full flex items-center justify-between text-sm font-semibold text-gray-400 hover:text-white p-2 rounded-lg">
                        <span>OPERACJE</span>
                        <i data-lucide="chevron-down" class="chevron-icon w-4 h-4 transition-transform"></i>
                    </button>
                    <div id="category-operacje" class="category-content mt-1 space-y-1 pl-4">
                        <a href="bolo.html" class="sidebar-link ${activePage === 'bolo' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="search" class="w-5 h-5 mr-3"></i> Poszukiwania</a>
                        <a href="ticket-form.html" class="sidebar-link ${activePage === 'ticket-form' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="file-plus-2" class="w-5 h-5 mr-3"></i> Wystaw Mandat</a>
                        <a href="arrest-form.html" class="sidebar-link ${activePage === 'arrest-form' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="grid-3x3" class="w-5 h-5 mr-3"></i> Wystaw Areszt</a>
                    </div>
                </div>
                
                <div>
                    <button data-category="departament" class="category-btn w-full flex items-center justify-between text-sm font-semibold text-gray-400 hover:text-white p-2 rounded-lg">
                        <span>DEPARTAMENT</span>
                        <i data-lucide="chevron-down" class="chevron-icon w-4 h-4 transition-transform"></i>
                    </button>
                    <div id="category-departament" class="category-content mt-1 space-y-1 pl-4">
                        <a href="odznaki.html" class="sidebar-link ${activePage === 'odznaki' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="shield" class="w-5 h-5 mr-3"></i> Odznaki</a>
                        <a href="dywizje.html" class="sidebar-link ${activePage === 'dywizje' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="users" class="w-5 h-5 mr-3"></i> Dywizje</a>
                        <a href="stroje.html" class="sidebar-link ${activePage === 'stroje' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="shirt" class="w-5 h-5 mr-3"></i> Stroje WSP</a>
                        <a href="urlopy.html" class="sidebar-link ${activePage === 'urlopy' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="calendar-off" class="w-5 h-5 mr-3"></i> Urlopy</a>
                    </div>
                </div>
                
                <div>
                    <button data-category="inne" class="category-btn w-full flex items-center justify-between text-sm font-semibold text-gray-400 hover:text-white p-2 rounded-lg">
                        <span>INNE</span>
                        <i data-lucide="chevron-down" class="chevron-icon w-4 h-4 transition-transform"></i>
                    </button>
                    <div id="category-inne" class="category-content mt-1 space-y-1 pl-4">
                        <a href="formulas.html" class="sidebar-link ${activePage === 'formulas' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="book-marked" class="w-5 h-5 mr-3"></i> Formułki</a>
                        <a href="reports.html" class="sidebar-link ${activePage === 'reports' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="file-text" class="w-5 h-5 mr-3"></i> Raporty</a>
                    </div>
                </div>
                
                ${userData.isAdmin ? `
                <div>
                    <button data-category="admin" class="category-btn w-full flex items-center justify-between text-sm font-semibold text-gray-400 hover:text-white p-2 rounded-lg">
                        <span>ADMINISTRACJA</span>
                        <i data-lucide="chevron-down" class="chevron-icon w-4 h-4 transition-transform"></i>
                    </button>
                    <div id="category-admin" class="category-content mt-1 space-y-1 pl-4">
                         <a href="admin-panel.html" class="sidebar-link ${activePage === 'admin-panel' ? 'active bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'} flex items-center px-3 py-2 rounded-lg text-sm"><i data-lucide="user-cog" class="w-5 h-5 mr-3"></i> Panel Admina</a>
                    </div>
                </div>
                ` : ''}

            </nav>
            <div class="mt-auto">
                <div class="border-t border-gray-700 pt-4">
                    <p id="user-display-name" class="text-sm font-semibold text-white">${userData.username}</p>
                    <p id="user-display-rank" class="text-xs text-gray-400">[${userData.badge}] - ${userData.rank}</p>
                </div>
                <a href="#" id="logout-button" class="sidebar-link flex items-center mt-2 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-800 hover:text-white">
                    <i data-lucide="log-out" class="w-5 h-5 mr-3"></i> Wyloguj się
                </a>
            </div>
        `;
        
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = sidebarHTML;
            document.getElementById('logout-button').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('mdt-token');
                window.location.href = 'index.html';
            });
            
            // --- NOWA LOGIKA DLA ROZWIJANYCH KATEGORII ---
            const openCategories = JSON.parse(sessionStorage.getItem('openCategories')) || [];
            
            document.querySelectorAll('.category-btn').forEach(button => {
                const categoryId = button.dataset.category;
                const content = document.getElementById(`category-${categoryId}`);
                const icon = button.querySelector('.chevron-icon');

                // Otwórz kategorie, które były otwarte poprzednio
                if (openCategories.includes(categoryId) || content.querySelector('.sidebar-link.active')) {
                    content.style.display = 'block';
                    icon.classList.add('rotate-180');
                } else {
                    content.style.display = 'none';
                }

                button.addEventListener('click', () => {
                    const isOpen = content.style.display === 'block';
                    content.style.display = isOpen ? 'none' : 'block';
                    icon.classList.toggle('rotate-180', !isOpen);

                    // Zapisz stan kategorii
                    const currentlyOpen = JSON.parse(sessionStorage.getItem('openCategories')) || [];
                    if (!isOpen) {
                        if (!currentlyOpen.includes(categoryId)) {
                            currentlyOpen.push(categoryId);
                        }
                    } else {
                        const index = currentlyOpen.indexOf(categoryId);
                        if (index > -1) {
                            currentlyOpen.splice(index, 1);
                        }
                    }
                    sessionStorage.setItem('openCategories', JSON.stringify(currentlyOpen));
                });
            });

            lucide.createIcons();
        }

        showTimeNotification();
        return userData;
    } catch (error) {
        console.error("Błąd weryfikacji:", error);
        localStorage.removeItem('mdt-token');
        window.location.href = 'index.html';
        return null;
    }
}

// Reszta pliku shared.js pozostaje bez zmian...
function showTimeNotification() {
    if (sessionStorage.getItem('notificationShown')) {
        return;
    }
    if (document.getElementById('time-notification-modal')) {
        return;
    }
    const modalHTML = `
        <div id="time-notification-modal" class="modal-backdrop fixed inset-0 z-50 justify-center items-center">
            <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6 text-center border-2 border-amber-400">
                <h2 class="text-2xl font-bold text-amber-300 mb-4 flex items-center justify-center">
                    <i data-lucide="clock" class="w-6 h-6 mr-3"></i>Powiadomienie
                </h2>
                <p class="text-gray-300 mb-6 text-lg">
                    Pamiętajcie o rozpoczynaniu i zakańczaniu służby na #godziny-pracy (panel w przypiętej wiadomosci)
                </p>
                <button id="close-notification-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Zamknij</button>
            </div>
        </div>
    `;
    const styles = `
        .modal-backdrop { display: none; background-color: rgba(0, 0, 0, 0.7); }
        .modal-backdrop.flex { display: flex; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('time-notification-modal');
    const closeBtn = document.getElementById('close-notification-btn');
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('flex');
    });
    const currentHour = new Date().getHours();
    if (currentHour >= 19 && currentHour < 24) {
        modal.classList.add('flex');
        lucide.createIcons();
        sessionStorage.setItem('notificationShown', 'true');
    }
}

function setupCitizenAutocomplete(inputElement, suggestionsContainer, allCitizens) {
    const showSuggestions = () => {
        const query = inputElement.value.toLowerCase();
        if (query.startsWith('<@') && query.endsWith('>')) {
            suggestionsContainer.classList.add('hidden');
            return;
        }
        if (query.length < 2) {
            suggestionsContainer.classList.add('hidden');
            return;
        }
        const filtered = allCitizens.filter(c => c.name && c.name.toLowerCase().includes(query));
        suggestionsContainer.innerHTML = '';
        if (filtered.length > 0) {
            filtered.slice(0, 5).forEach(citizen => {
                const div = document.createElement('div');
                div.className = 'p-2 hover:bg-gray-500 cursor-pointer text-sm';
                div.textContent = `${citizen.name} (${citizen.discordId})`;
                div.addEventListener('mousedown', (e) => { 
                    e.preventDefault();
                    inputElement.value = `<@${citizen.discordId}>`;
                    suggestionsContainer.classList.add('hidden');
                });
                suggestionsContainer.appendChild(div);
            });
            suggestionsContainer.classList.remove('hidden');
        } else {
            suggestionsContainer.classList.add('hidden');
        }
    };

    const hideSuggestions = () => {
        setTimeout(() => {
            suggestionsContainer.classList.add('hidden');
        }, 150);
    };

    inputElement.addEventListener('input', showSuggestions);
    inputElement.addEventListener('focus', showSuggestions);
    inputElement.addEventListener('blur', hideSuggestions);
}