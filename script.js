// Menu Data (10 items with fresh image URLs)
const menuItems = [
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

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const menuScreen = document.getElementById('menu-screen');
const cartScreen = document.getElementById('cart-screen');
const confirmationScreen = document.getElementById('confirmation-screen');
const startOrderBtn = document.getElementById('start-order-btn');
const welcomeTableNumberInput = document.getElementById('welcome-table-number');
const currentTableDisplay = document.getElementById('current-table');
const cartBtn = document.getElementById('cart-btn');
const backBtn = document.getElementById('back-btn');
const payBtn = document.getElementById('pay-btn');
const newOrderBtn = document.getElementById('new-order-btn');
const menuContainer = document.querySelector('.menu-container');
const tabButtons = document.querySelectorAll('.tab-btn');
const cartItemsContainer = document.querySelector('.cart-items');
const cartCount = document.getElementById('cart-count');
const subtotalElement = document.getElementById('subtotal');
const taxElement = document.getElementById('tax');
const totalElement = document.getElementById('total');
const customerNameInput = document.getElementById('customer-name');
const phoneNumberInput = document.getElementById('phone-number');
const tableNumberInput = document.getElementById('table-number');
const orderNumberElement = document.getElementById('order-number');
const confirmationTotalElement = document.getElementById('confirmation-total');

// Global Variables
let cart = [];
let currentTable = null;

// Initialize the app
function init() {
    setupEventListeners();
}

// Load menu items
function loadMenuItems(category = 'all') {
    menuContainer.innerHTML = '';
    const filteredItems = category === 'all' ? menuItems : menuItems.filter(item => item.category === category);

    filteredItems.forEach(item => {
        const cartItem = cart.find(ci => ci.id === item.id);
        const quantity = cartItem ? cartItem.quantity : 0;

        const menuItemElement = document.createElement('div');
        menuItemElement.className = 'menu-item';
        menuItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-details">
                <h3><i class="fas fa-${item.category === 'beverages' ? 'coffee' : item.category === 'appetizers' ? 'drumstick-bite' : item.category === 'main' ? 'hamburger' : 'ice-cream'}"></i> ${item.name}</h3>
                <p>${item.description}</p>
                <p>₹${item.price}</p>
                <div class="quantity-control" data-id="${item.id}">
                    ${quantity > 0 ? `
                        <button class="quantity-btn decrease"><i class="fas fa-minus"></i></button>
                        <span class="quantity">${quantity}</span>
                        <button class="quantity-btn increase"><i class="fas fa-plus"></i></button>
                    ` : `
                        <button class="quantity-btn add"><i class="fas fa-plus"></i></button>
                    `}
                </div>
            </div>
        `;
        menuContainer.appendChild(menuItemElement);
    });

    document.querySelectorAll('.add').forEach(btn => btn.addEventListener('click', addToCart));
    document.querySelectorAll('.increase').forEach(btn => btn.addEventListener('click', increaseQuantity));
    document.querySelectorAll('.decrease').forEach(btn => btn.addEventListener('click', decreaseQuantity));
}

// Setup event listeners
function setupEventListeners() {
    startOrderBtn.addEventListener('click', startOrder);
    cartBtn.addEventListener('click', showCartScreen);
    backBtn.addEventListener('click', showMenuScreen);
    payBtn.addEventListener('click', placeOrder);
    newOrderBtn.addEventListener('click', startNewOrder);
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadMenuItems(btn.dataset.category);
        });
    });
}

// Start order with table number
function startOrder() {
    const tableNumber = welcomeTableNumberInput.value.trim();
    if (!tableNumber || parseInt(tableNumber) < 1) {
        alert('Please enter a valid table number (1 or higher).');
        return;
    }

    currentTable = tableNumber;
    currentTableDisplay.textContent = tableNumber;
    tableNumberInput.value = tableNumber;

    welcomeScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    loadMenuItems();
}

// Add item to cart
function addToCart(e) {
    const itemId = parseInt(e.currentTarget.closest('.quantity-control').dataset.id);
    const item = menuItems.find(i => i.id === itemId);
    const existingItem = cart.find(ci => ci.id === itemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    updateCartCount();
    loadMenuItems(document.querySelector('.tab-btn.active').dataset.category);
}

// Increase item quantity
function increaseQuantity(e) {
    const itemId = parseInt(e.currentTarget.closest('.quantity-control').dataset.id);
    const item = cart.find(ci => ci.id === itemId);
    item.quantity += 1;
    updateCartCount();
    loadMenuItems(document.querySelector('.tab-btn.active').dataset.category);
    if (cartScreen.classList.contains('hidden')) return;
    showCartScreen();
}

// Decrease item quantity
function decreaseQuantity(e) {
    const itemId = parseInt(e.currentTarget.closest('.quantity-control').dataset.id);
    const itemIndex = cart.findIndex(ci => ci.id === itemId);
    if (cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity -= 1;
    } else {
        cart.splice(itemIndex, 1);
    }
    updateCartCount();
    loadMenuItems(document.querySelector('.tab-btn.active').dataset.category);
    if (cartScreen.classList.contains('hidden')) return;
    showCartScreen();
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Show cart screen
function showCartScreen() {
    cartItemsContainer.innerHTML = '';
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h3>${item.name}</h3>
                <p>₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}</p>
                <div class="quantity-control" data-id="${item.id}">
                    <button class="quantity-btn decrease"><i class="fas fa-minus"></i></button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase"><i class="fas fa-plus"></i></button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    document.querySelectorAll('.increase').forEach(btn => btn.addEventListener('click', increaseQuantity));
    document.querySelectorAll('.decrease').forEach(btn => btn.addEventListener('click', decreaseQuantity));

    updateTotals();
    menuScreen.classList.add('hidden');
    cartScreen.classList.remove('hidden');
}

// Update order totals
function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    taxElement.textContent = `₹${tax.toFixed(2)}`;
    totalElement.textContent = `₹${total.toFixed(2)}`;
}

// Show menu screen
function showMenuScreen() {
    cartScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}

// Place order
function placeOrder() {
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

    console.log(`Redirecting to UPI payment for ₹${order.total.toFixed(2)} to dbdake1@okhdfcbank`);
    alert(`Please complete payment of ₹${order.total.toFixed(2)} via UPI to dbdake1@okhdfcbank`);

    sendOrderToSheety(order);

    console.log(`WhatsApp message to +91${phoneNumber}: Thank you for ordering at Cafe Kathaa! Your order #${Math.floor(1000 + Math.random() * 9000)} is confirmed.`);

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    orderNumberElement.textContent = orderNumber;
    confirmationTotalElement.textContent = `₹${order.total.toFixed(2)}`;
    cartScreen.classList.add('hidden');
    confirmationScreen.classList.remove('hidden');
    cart = [];
    updateCartCount();
}

// Send order to Sheety API
async function sendOrderToSheety(order) {
    const apiUrl = "https://api.sheety.co/1de03d28dfe3764aae23268d7dccc67d/restaurantOrders/orders";
    const formattedOrder = {
        order: {
            tableNumber: order.tableNumber,
            customerName: order.customerName,
            phoneNumber: order.phoneNumber,
            items: order.items || "No items",
            subtotal: order.subtotal,
            tax: order.tax,
            total: order.total,
            paymentMethod: order.paymentMethod,
            timestamp: order.timestamp
        }
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formattedOrder)
        });

        if (response.ok) {
            console.log("Order saved to Sheety:", await response.json());
        } else {
            console.error("Sheety API error:", response.status, await response.text());
        }
    } catch (error) {
        console.error("Error sending order to Sheety:", error);
    }
}

// Start new order
function startNewOrder() {
    confirmationScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    customerNameInput.value = '';
    phoneNumberInput.value = '';
    tableNumberInput.value = '';
    welcomeTableNumberInput.value = '';
    currentTable = null;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);