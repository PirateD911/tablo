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
const ADMIN_USERNAME = "Dipak";
const ADMIN_PASSWORD = "Cafe@123";

// Local menu storage (for prototype; in production, use a backend)
let menuItems = [
    { id: 2, name: "Cappuccino", description: "Frothy espresso delight", price: 120, category: "beverages", image: "https://img.freepik.com/free-photo/cup-coffee-with-heart-drawn-foam_1286-70.jpg?ga=GA1.1.1900931658.1694967687&semt=ais_hybrid&w=740" },
    { id: 1, name: "Masala Chai", description: "Spiced Indian tea", price: 50, category: "beverages", image: "https://img.freepik.com/free-psd/tasty-indian-masala-chai-with-spices-isolated-transparent-background_191095-14265.jpg?ga=GA1.1.1900931658.1694967687&semt=ais_hybrid&w=740" },
    { id: 3, name: "Spring Rolls", description: "Crispy veggie rolls", price: 100, category: "appetizers", image: "https://img.freepik.com/free-photo/fresh-spring-roll-appetizer-with-vegetables-pork-plate-generated-by-ai_188544-55526.jpg?ga=GA1.1.1900931658.1694967687&semt=ais_hybrid&w=740" },
    { id: 4, name: "Butter Chicken", description: "Creamy curry with naan", price: 250, category: "main", image: "https://img.freepik.com/free-photo/curry-with-chicken-onions-indian-food-asian-cuisine_2829-6270.jpg?ga=GA1.1.1900931658.1694967687&semt=ais_hybrid&w=740" },
    { id: 5, name: "Gulab Jamun", description: "Sweet syrupy balls", price: 80, category: "desserts", image: "https://img.freepik.com/free-psd/sweet-gulab-jamun-white-bowl-delicious-indian-dessert_84443-34333.jpg?ga=GA1.1.1900931658.1694967687&semt=ais_hybrid&w=740" },
    { id: 6, name: "Cold Coffee", description: "Chilled coffee bliss", price: 90, category: "beverages", image: "https://img.freepik.com/free-photo/iced-coffee-latte_23-2151961339.jpg?ga=GA1.1.1900931658.1694967687&semt=ais_hybrid&w=740" },
    { id: 7, name: "Paneer Tikka", description: "Spiced grilled paneer", price: 150, category: "appetizers", image: "https://img.freepik.com/free-photo/chicken-skewers-with-slices-sweet-peppers-dill_2829-18813.jpg?ga=GA1.1.1900931658.1694967687&semt=ais_hybrid&w=740" },
    { id: 8, name: "Pasta Alfredo", description: "Creamy pasta perfection", price: 200, category: "main", image: "https://img.freepik.com/free-photo/freshness-healthy-eating-homemade-vegetarian-pasta-generated-by-artificial-intelligence_188544-128803.jpg?ga=GA1.1.1900931658.1694967687&semt=ais_hybrid&w=740" },
    { id: 9, name: "Chocolate Lava Cake", description: "Molten chocolate treat", price: 120, category: "desserts", image: "https://img.freepik.com/free-photo/delicious-volcano-chocolate-cake_23-2151940311.jpg?ga=GA1.1.1900931658.1694967687&semt=ais_hybrid&w=740" },
    { id: 10, name: "Mango Lassi", description: "Sweet mango yogurt drink", price: 70, category: "beverages", image: "https://img.freepik.com/free-photo/delicious-mango-still-life_23-2151542230.jpg?ga=GA1.1.1900931658.1694967687&semt=ais_hybrid&w=740" }
];

// Initialize the app
function init() {
    setupEventListeners();
    loadMenuItems();
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
        loadMenuItems();
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

// Load menu items into table
function loadMenuItems() {
    menuTable.innerHTML = '';
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
function saveMenuItem(e) {
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

    const existingIndex = menuItems.findIndex(item => item.id === id);
    if (existingIndex >= 0) {
        menuItems[existingIndex] = newItem;
    } else {
        menuItems.push(newItem);
    }

    resetMenuForm();
    loadMenuItems();
}

// Edit menu item
function editMenuItem(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    const item = menuItems.find(i => i.id === id);
    menuIdInput.value = item.id;
    menuNameInput.value = item.name;
    menuDescriptionInput.value = item.description;
    menuPriceInput.value = item.price;
    menuCategoryInput.value = item.category;
    menuImageInput.value = item.image;
}

// Delete menu item
function deleteMenuItem(e) {
    const id = parseInt(e.currentTarget.dataset.id);
    menuItems = menuItems.filter(item => item.id !== id);
    resetMenuForm();
    loadMenuItems();
}

// Reset menu form
function resetMenuForm() {
    menuForm.reset();
    menuIdInput.value = '';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);