// Initialize menuItems as empty; we'll fetch from Sheety
let menuItems = [];
let isAdmin = false;

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const menuScreen = document.getElementById('menu-screen');
const cartScreen = document.getElementById('cart-screen');
const confirmationScreen = document.getElementById('confirmation-screen');
const adminScreen = document.getElementById('admin-screen');
const startOrderBtn = document.getElementById('start-order-btn');
const welcomeTableNumberInput = document.getElementById('welcome-table-number');
const currentTableDisplay = document.getElementById('current-table'); // Note: This was undefined in last code, fixed below
const cartBtn = document.getElementById('cart-btn');
const closeBtn = document.getElementById('close-btn');
const closeFooterBtn = document.getElementById('close-footer-btn');
const backBtn = document.getElementById('back-btn');
const payBtn = document.getElementById('pay-btn');
const newOrderBtn = document.getElementById('new-order-btn');
const adminLoginBtn = document.getElementById('admin-login-btn');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const menuContainer = document.querySelector('.menu-container');
const tabButtons = document.querySelectorAll('.tab-btn');
const cartItemsContainer = document.querySelector('.cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const subtotalElement = document.getElementById('subtotal');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const customerNameInput = document.getElementById('customer-name');
const phoneNumberInput = document.getElementById('phone-number');
const tableNumberInput = document.getElementById('table-number');
const orderNumberElement = document.getElementById('order-number');
const confirmationTotalElement = document.getElementById('confirmation-total');
const adminNavButtons = document.querySelectorAll('.nav-btn');
const adminOrdersSection = document.getElementById('admin-orders-section');
const adminMenuSection = document.getElementById('admin-menu-section');
const ordersTableBody = document.querySelector('#orders-table tbody');
const menuTableBody = document.querySelector('#menu-table tbody');
const menuForm = document.querySelector('.menu-form');
const menuIdInput = document.getElementById('menu-id');
const menuNameInput = document.getElementById('menu-name');
const menuDescriptionInput = document.getElementById('menu-description');
const menuPriceInput = document.getElementById('menu-price');
const menuCategoryInput = document.getElementById('menu-category');
const menuImageInput = document.getElementById('menu-image');
const saveMenuBtn = document.getElementById('save-menu-btn');

// Global Variables
let cart = [];
let currentTable = null;

// Admin credentials
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "cafe123";

// Fetch menu items from Sheety
async function fetchMenuItems() {
    const apiUrl = `https://api.sheety.co/1de03d28dfe3764aae23268d7dccc67d/restaurantOrders/menu?t=${Date.now()}`;
    try {
        console.log("Fetching menu items from:", apiUrl);
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Sheety fetch failed: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log("Raw Sheety response:", data);
        menuItems = Array.isArray(data.menu) ? data.menu : [];
        console.log("Parsed menu items:", menuItems);
        return menuItems;
    } catch (error) {
        console.error("Error fetching menu items:", error.message);
        menuItems = [];
        return [];
    }
}

// Fetch orders from Sheety
async function fetchOrders() {
    const apiUrl = "https://api.sheety.co/1de03d28dfe3764aae23268d7dccc67d/restaurantOrders/orders";
    try {
        console.log("Fetching orders...");
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Sheety fetch failed: ${response.status} ${response.statusText}`);
        const data = await response.json();
        console.log("Fetched orders:", data.orders);
        return Array.isArray(data.orders) ? data.orders : [];
    } catch (error) {
        console.error("Error fetching orders:", error.message);
        return [];
    }
}

// Initialize the app
async function init() {
    await fetchMenuItems();
    setupEventListeners();
    // Ensure currentTableDisplay is handled (was undefined due to missing element)
    if (!currentTableDisplay) {
        console.warn("currentTableDisplay not found in DOM, creating placeholder");
        const tempDisplay = document.createElement('span');
        tempDisplay.id = 'current-table';
        document.querySelector('#menu-screen header')?.appendChild(tempDisplay);
    }
}

// Setup event listeners
function setupEventListeners() {
    startOrderBtn.addEventListener('click', startOrder);
    cartBtn.addEventListener('click', showCartScreen);
    closeBtn.addEventListener('click', () => (menuScreen.classList.add('hidden'), welcomeScreen.classList.remove('hidden')));
    closeFooterBtn.addEventListener('click', () => menuScreen.classList.add('hidden'));
    backBtn.addEventListener('click', showMenuScreen);
    payBtn.addEventListener('click', placeOrder);
    newOrderBtn.addEventListener('click', startNewOrder);
    adminLoginBtn.addEventListener('click', handleAdminLogin);
    adminLogoutBtn.addEventListener('click', handleAdminLogout);
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadMenuItems(btn.dataset.category);
        });
    });
    adminNavButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            adminNavButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showAdminSection(btn.dataset.section);
        });
    });
    menuForm.addEventListener('submit', saveMenuItem);
}

// Handle admin login
function handleAdminLogin() {
    const username = prompt("Enter username:");
    const password = prompt("Enter password:");
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        isAdmin = true;
        welcomeScreen.classList.add('hidden');
        menuScreen.classList.add('hidden');
        adminScreen.classList.remove('hidden');
        loadAdminOrders();
        loadAdminMenu();
    } else {
        alert('Invalid username or password');
    }
}

// Handle admin logout
function handleAdminLogout() {
    isAdmin = false;
    adminScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    fetchMenuItems().then(() => loadMenuItems());
}

// Show admin section
function showAdminSection(section) {
    console.log("Showing admin section:", section);
    adminOrdersSection.classList.remove('active');
    adminMenuSection.classList.remove('active');
    const sectionElement = document.getElementById(`admin-${section}-section`);
    if (sectionElement) sectionElement.classList.add('active');
    else console.error("Section element not found:", `admin-${section}-section`);
    if (section === 'orders') loadAdminOrders();
    else if (section === 'menu') loadAdminMenu();
}

// Load admin orders
async function loadAdminOrders() {
    console.log("Loading admin orders...");
    const orders = await fetchOrders();
    ordersTableBody.innerHTML = '';
    if (!orders.length) ordersTableBody.innerHTML = '<tr><td colspan="7">No orders available.</td></tr>';
    else orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.id || 'N/A'}</td>
            <td>${order.tableNumber || 'N/A'}</td>
            <td>${order.customerName || 'N/A'}</td>
            <td>${order.items || 'N/A'}</td>
            <td>₹${order.total ? order.total.toFixed(2) : '0.00'}</td>
            <td>${order.timestamp ? new Date(order.timestamp).toLocaleString() : 'N/A'}</td>
            <td><button class="btn edit-order-btn" data-id="${order.id}"><i class="fas fa-edit"></i></button></td>
        `;
        ordersTableBody.appendChild(row);
    });
    document.querySelectorAll('.edit-order-btn').forEach(btn => btn.addEventListener('click', editOrder));
}

// Load admin menu
async function loadAdminMenu() {
    console.log("Loading admin menu...");
    const menuItems = await fetchMenuItems();
    console.log("Menu items for admin:", menuItems);
    if (!menuTableBody) {
        console.error("menuTableBody not found");
        return;
    }
    menuTableBody.innerHTML = '';
    if (!menuItems.length) menuTableBody.innerHTML = '<tr><td colspan="5">No menu items available.</td></tr>';
    else menuItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name || 'N/A'}</td>
            <td>${item.description || 'N/A'}</td>
            <td>₹${item.price ? item.price.toFixed(2) : '0.00'}</td>
            <td>${item.category || 'N/A'}</td>
            <td>
                <button class="btn edit-menu-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                <button class="btn delete-menu-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        menuTableBody.appendChild(row);
    });
    document.querySelectorAll('.edit-menu-btn').forEach(btn => btn.addEventListener('click', editMenuItem));
    document.querySelectorAll('.delete-menu-btn').forEach(btn => btn.addEventListener('click', deleteMenuItem));
}

// Save or update menu item
async function saveMenuItem(e) {
    e.preventDefault();
    console.log("Saving menu item...");
    const id = menuIdInput.value || Date.now();
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
    try {
        const response = await fetch(apiUrl, {
            method: menuIdInput.value ? 'PUT' : 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ menu: newItem })
        });
        if (response.ok) {
            console.log("Menu item saved:", await response.json());
            resetMenuForm();
            await loadAdminMenu();
            await fetchMenuItems();
        } else {
            console.error("Error saving:", response.status, await response.text());
            alert("Failed to save menu item.");
        }
    } catch (error) {
        console.error("Error:", error.message);
        alert("Error saving menu item.");
    }
}

// Edit menu item
function editMenuItem(e) {
    console.log("Editing menu item...");
    const id = e.currentTarget.dataset.id;
    const item = menuItems.find(i => i.id == id);
    if (!item) {
        console.error("Item not found:", id);
        alert("Menu item not found.");
        return;
    }
    menuIdInput.value = item.id;
    menuNameInput.value = item.name;
    menuDescriptionInput.value = item.description;
    menuPriceInput.value = item.price;
    menuCategoryInput.value = item.category;
    menuImageInput.value = item.image;
}

// Delete menu item
async function deleteMenuItem(e) {
    console.log("Deleting menu item...");
    const id = e.currentTarget.dataset.id;
    const apiUrl = `https://api.sheety.co/1de03d28dfe3764aae23268d7dccc67d/restaurantOrders/menu/${id}`;
    try {
        const response = await fetch(apiUrl, { method: 'DELETE' });
        if (response.ok) {
            console.log("Item deleted:", id);
            await loadAdminMenu();
            await fetchMenuItems();
        } else {
            console.error("Error deleting:", response.status, await response.text());
            alert("Failed to delete menu item.");
        }
    } catch (error) {
        console.error("Error:", error.message);
        alert("Error deleting menu item.");
    }
}

// Edit order
async function editOrder(e) {
    console.log("Editing order...");
    const id = e.currentTarget.dataset.id;
    const newName = prompt("Enter new customer name:");
    if (!newName) return;
    const apiUrl = `https://api.sheety.co/1de03d28dfe3764aae23268d7dccc67d/restaurantOrders/orders/${id}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: { customerName: newName } })
        });
        if (response.ok) {
            console.log("Order updated:", await response.json());
            loadAdminOrders();
        } else {
            console.error("Error updating:", response.status, await response.text());
            alert("Failed to update order.");
        }
    } catch (error) {
        console.error("Error:", error.message);
        alert("Error updating order.");
    }
}

// Reset menu form
function resetMenuForm() {
    console.log("Resetting form");
    menuForm.reset();
    menuIdInput.value = '';
}

// Load menu items
function loadMenuItems(category = 'all') {
    console.log("Loading menu for:", category);
    menuContainer.innerHTML = '';
    const filteredItems = category === 'all' ? menuItems : menuItems.filter(item => item.category === category);
    if (!filteredItems.length) menuContainer.innerHTML = '<p>No items available.</p>';
    else filteredItems.forEach(item => {
        const cartItem = cart.find(ci => ci.id == item.id);
        const quantity = cartItem ? cartItem.quantity : 0;
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/100?text=${item.name}'">
            <div class="menu-item-details">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <span class="price">₹${item.price ? item.price.toFixed(2) : '0.00'}</span>
                <i class="fas fa-heart heart"></i>
            </div>
            <div class="quantity-control" data-id="${item.id}">
                ${quantity > 0 ? `
                    <button class="quantity-btn decrease"><i class="fas fa-minus"></i></button>
                    <span class="quantity">${quantity}</span>
                    <button class="quantity-btn increase"><i class="fas fa-plus"></i></button>
                ` : `
                    <button class="add-btn" data-id="${item.id}"><i class="fas fa-plus"></i></button>
                `}
            </div>
        `;
        menuContainer.appendChild(menuItem);
    });
    document.querySelectorAll('.add-btn').forEach(btn => btn.addEventListener('click', addToCart));
    document.querySelectorAll('.increase').forEach(btn => btn.addEventListener('click', increaseQuantity));
    document.querySelectorAll('.decrease').forEach(btn => btn.addEventListener('click', decreaseQuantity));
    updateCartTotal();
}

// Start order
function startOrder() {
    console.log("Starting order function...");
    const tableNumber = welcomeTableNumberInput.value.trim();
    console.log("Table number input:", tableNumber);
    if (!tableNumber) {
        console.log("No table number entered, showing alert");
        alert('Please enter a table number.');
        return;
    }
    currentTable = tableNumber;
    console.log("Setting currentTable to:", currentTable);
    // Since currentTableDisplay is missing in index.html, we'll skip it for now or add it if needed
    tableNumberInput.value = tableNumber;
    console.log("Transitioning screens...");
    welcomeScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    loadMenuItems();
}

// Add to cart
function addToCart(e) {
    const itemId = e.currentTarget.dataset.id;
    const item = menuItems.find(i => i.id == itemId);
    if (!item) return;
    console.log("Adding:", item.name);
    const existing = cart.find(ci => ci.id == itemId);
    if (existing) existing.quantity += 1;
    else cart.push({ ...item, quantity: 1 });
    updateCartCount();
    updateCartTotal();
    loadMenuItems(document.querySelector('.tab-btn.active').dataset.category);
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
    cartTotal.textContent = `₹${total}`;
}

// Show cart screen
function showCartScreen() {
    console.log("Showing cart...");
    cartItemsContainer.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/90?text=${item.name}'">
            <div>
                <h3>${item.name}</h3>
                <p>₹${item.price} x ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}</p>
                <div class="quantity-control" data-id="${item.id}">
                    <button class="quantity-btn decrease"><i class="fas fa-minus"></i></button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase"><i class="fas fa-plus"></i></button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
    document.querySelectorAll('.increase').forEach(btn => btn.addEventListener('click', increaseQuantity));
    document.querySelectorAll('.decrease').forEach(btn => btn.addEventListener('click', decreaseQuantity));
    updateTotals();
    menuScreen.classList.add('hidden');
    cartScreen.classList.remove('hidden');
}

// Increase quantity
function increaseQuantity(e) {
    const itemId = e.currentTarget.closest('.quantity-control').dataset.id;
    const item = cart.find(ci => ci.id == itemId);
    if (item) {
        item.quantity += 1;
        updateCartCount();
        updateCartTotal();
        loadMenuItems(document.querySelector('.tab-btn.active').dataset.category);
    }
}

// Decrease quantity
function decreaseQuantity(e) {
    const itemId = e.currentTarget.closest('.quantity-control').dataset.id;
    const itemIndex = cart.findIndex(ci => ci.id == itemId);
    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) cart[itemIndex].quantity -= 1;
        else cart.splice(itemIndex, 1);
        updateCartCount();
        updateCartTotal();
        loadMenuItems(document.querySelector('.tab-btn.active').dataset.category);
    }
}

// Update totals
function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
    confirmationTotalElement.textContent = `₹${total.toFixed(2)}`;
}

// Show menu screen
function showMenuScreen() {
    console.log("Showing menu...");
    cartScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}

// Place order
function placeOrder() {
    console.log("Placing order...");
    const customerName = customerNameInput.value.trim();
    const phoneNumber = phoneNumberInput.value.trim();
    const tableNumber = tableNumberInput.value.trim();
    if (!customerName || !phoneNumber) {
        alert('Please fill in your name and phone number.');
        return;
    }
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
        alert('Please enter a valid 10-digit phone number.');
        return;
    }
    const order = {
        tableNumber,
        customerName,
        phoneNumber,
        items: cart.map(item => `${item.name} (x${item.quantity})`).join(', '),
        subtotal: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        tax: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.05,
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.05,
        paymentMethod: 'online',
        timestamp: new Date().toISOString()
    };
    console.log(`Payment for ₹${order.total.toFixed(2)} to dbdake1@okhdfcbank`);
    alert(`Please complete payment of ₹${order.total.toFixed(2)} via UPI to dbdake1@okhdfcbank`);
    sendOrderToSheety(order);
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    orderNumberElement.textContent = orderNumber;
    cartScreen.classList.add('hidden');
    confirmationScreen.classList.remove('hidden');
    cart = [];
    updateCartCount();
    updateCartTotal();
}

// Send order to Sheety
async function sendOrderToSheety(order) {
    const apiUrl = "https://api.sheety.co/1de03d28dfe3764aae23268d7dccc67d/restaurantOrders/orders";
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order })
        });
        if (response.ok) console.log("Order saved:", await response.json());
        else console.error("Sheety error:", response.status, await response.text());
    } catch (error) {
        console.error("Error sending order:", error.message);
    }
}

// Start new order
function startNewOrder() {
    console.log("Starting new order...");
    confirmationScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    customerNameInput.value = '';
    phoneNumberInput.value = '';
    tableNumberInput.value = '';
    welcomeTableNumberInput.value = '';
    currentTable = null;
    fetchMenuItems().then(() => loadMenuItems());
}

// Initialize
document.addEventListener('DOMContentLoaded', init);