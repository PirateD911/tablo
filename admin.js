// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const adminUsername = document.getElementById('admin-username');
const adminPassword = document.getElementById('admin-password');
const navButtons = document.querySelectorAll('.nav-btn');
const ordersSection = document.getElementById('orders-section');
const menuSection = document.getElementById('menu-section');
const ordersTable = document.getElementById('orders-table');
const menuTable = document.getElementById('menu-table');
const menuForm = document.querySelector('.menu-form');
const menuIdInput = document.getElementById('menu-id');
const menuNameInput = document.getElementById('menu-name');
const menuDescriptionInput = document.getElementById('menu-description');
const menuPriceInput = document.getElementById('menu-price');
const menuCategoryInput = document.getElementById('menu-category');
const menuImageInput = document.getElementById('menu-image');
const saveMenuBtn = document.getElementById('save-menu-btn');

// Hardcoded credentials (for prototype)
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "cafe123";

// Initialize the app
function init() {
    setupEventListeners();
    // Fetch menu items on load
    fetchMenuItems().then(loadMenuItems);
}

// Setup event listeners
function setupEventListeners() {
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showSection(btn.dataset.section);
        });
    });
    menuForm.addEventListener('submit', saveMenuItem);
}

// Handle login
function handleLogin() {
    const username = adminUsername.value.trim();
    const password = adminPassword.value.trim();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        loginScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
        fetchOrders();
        fetchMenuItems().then(loadMenuItems);
    } else {
        alert('Invalid username or password');
    }
}

// Handle logout
function handleLogout() {
    dashboard.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    adminUsername.value = '';
    adminPassword.value = '';
}

// Show section (orders or menu)
function showSection(section) {
    ordersSection.classList.remove('active');
    menuSection.classList.remove('active');
    document.getElementById(`${section}-section`).classList.add('active');
    if (section === 'menu') {
        fetchMenuItems().then(loadMenuItems); // Refresh menu tab
    }
}

// Fetch orders from Sheety API
async function fetchOrders() {
    const apiUrl = "https://api.sheety.co/1de03d28dfe3764aae23268d7dccc67d/restaurantOrders/orders";
    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const data = await response.json();
            displayOrders(data.orders);
        } else {
            console.error("Sheety API error:", response.status);
            ordersTable.innerHTML = '<tr><td colspan="6">Failed to load orders</td></tr>';
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
        ordersTable.innerHTML = '<tr><td colspan="6">Error loading orders</td></tr>';
    }
}

// Display orders in table
function displayOrders(orders) {
    ordersTable.innerHTML = '';
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id || 'N/A'}</td>
            <td>${order.tableNumber}</td>
            <td>${order.customerName}</td>
            <td>${order.items}</td>
            <td>₹${order.total.toFixed(2)}</td>
            <td>${new Date(order.timestamp).toLocaleString()}</td>
        `;
        ordersTable.appendChild(row);
    });
}

// Fetch menu items from Sheety
async function fetchMenuItems() {
    const apiUrl = "https://api.sheety.co/1de03d28dfe3764aae23268d7dccc67d/restaurantOrders/menu";
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("Fetched menu items:", data.menu); // Debug
        return data.menu || [];
    } catch (error) {
        console.error("Error fetching menu items:", error);
        return [];
    }
}

// Load menu items into table
async function loadMenuItems() {
    const menuItems = await fetchMenuItems();
    menuTable.innerHTML = '';
    if (menuItems.length === 0) {
        menuTable.innerHTML = '<tr><td colspan="5">No menu items available.</td></tr>';
        return;
    }

    menuItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.description}</td>
            <td>₹${item.price}</td>
            <td>${item.category}</td>
            <td>
                <button class="btn edit-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                <button class="btn delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        menuTable.appendChild(row);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', editMenuItem));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', deleteMenuItem));
}

// Save or update menu item
async function saveMenuItem(e) {
    e.preventDefault();
    const id = menuIdInput.value ? parseInt(menuIdInput.value) : Date.now();
    const newItem = {
        id,
        name: menuNameInput.value.trim(),
        description: menuDescriptionInput.value.trim(),
        price: parseFloat(menuPriceInput.value),
        category: menuCategoryInput.value,
        image: menuImageInput.value.trim()
    };

    if (!newItem.name || !newItem.description || !newItem.price || !newItem.category || !newItem.image) {
        alert('Please fill in all fields');
        return;
    }

    const apiUrl = `https://api.sheety.co/1de03d28dfe3764aae23268d7dccc67d/restaurantOrders/menu${menuIdInput.value ? '/' + id : ''}`;
    const method = menuIdInput.value ? 'PUT' : 'POST';
    try {
        const response = await fetch(apiUrl, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ menu: newItem })
        });

        if (response.ok) {
            console.log("Menu item saved:", await response.json());
            resetMenuForm();
            fetchMenuItems().then(loadMenuItems);
        } else {
            console.error("Error saving menu item:", response.status);
            alert("Failed to save menu item.");
        }
    } catch (error) {
        console.error("Error saving menu item:", error);
        alert("Error saving menu item.");
    }
}

// Edit menu item
function editMenuItem(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    fetchMenuItems().then(menuItems => {
        const item = menuItems.find(i => i.id === id);
        if (!item) return;
        menuIdInput.value = item.id;
        menuNameInput.value = item.name;
        menuDescriptionInput.value = item.description;
        menuPriceInput.value = item.price;
        menuCategoryInput.value = item.category;
        menuImageInput.value = item.image;
    });
}

// Delete menu item
async function deleteMenuItem(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const apiUrl = `https://api.sheety.co/1de03d28dfe3764aae23268d7dccc67d/restaurantOrders/menu/${id}`;
    try {
        const response = await fetch(apiUrl, { method: 'DELETE' });
        if (response.ok) {
            console.log("Menu item deleted:", id);
            fetchMenuItems().then(loadMenuItems);
        } else {
            console.error("Error deleting menu item:", response.status);
            alert("Failed to delete menu item.");
        }
    } catch (error) {
        console.error("Error deleting menu item:", error);
        alert("Error deleting menu item.");
    }
}

// Reset menu form
function resetMenuForm() {
    menuForm.reset();
    menuIdInput.value = '';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);