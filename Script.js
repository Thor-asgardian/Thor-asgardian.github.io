window.onload = function() {
    // --- Data Model (Simulated In-Memory Data) ---
    let cart = []; 
    let orders = [];
    let currentUser = null; 

    // Sample product data
    const products = [
        {id:1,name:"Banana Fiber Boxes",price:280,description:"Stylish and eco-friendly storage",category:"banana-fiber"},
        {id:2,name:"Banana Fibre Tissue Box",price:600,description:"Eco-friendly tissue organizer",category:"banana-fiber"},
        {id:3,name:"Terracotta Tea Light",price:300,description:"Eco-friendly terracotta candle holder",category:"terracotta"},
        {id:4,name:"Palm Leaf Box",price:300,description:"Eco-friendly storage solution",category:"palm-leaf"},
        {id:5,name:"Handmade Paper Notebook",price:150,description:"Eco-friendly notebook",category:"handmade-paper"},
        {id:6,name:"Ceramic Wooden Vase",price:450,description:"Elegant vase for home decor",category:"ceramic-wooden"}
    ];

    const productsGrid = document.getElementById("productsGrid");

    // --- Core Functions ---
    
    // Display products based on category
    function displayProducts(category="all"){
        productsGrid.innerHTML="";
        const filtered = category==="all" ? products : products.filter(p => p.category===category);
        filtered.forEach(p=>{
            const card = document.createElement("div");
            card.className="product-card";
            card.innerHTML=`
                <div class="product-image" style="background-image: url('placeholder.jpg');"></div>
                <div class="product-info">
                    <h3 class="product-title">${p.name}</h3>
                    <p class="product-description">${p.description}</p>
                    <div class="product-footer">
                        <div class="product-price">₹${p.price}</div>
                        <button class="add-to-cart-btn" onclick="addToCart(${p.id})">Add to Cart</button>
                    </div>
                </div>
            `;
            productsGrid.appendChild(card);
        });
    }

    // Show a page (with authentication check for protected pages)
    window.showPage = function(pageId){
        document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
        const page = document.getElementById(pageId+"Page");
        
        // Check for protected pages
        if (['cart', 'orders'].includes(pageId) && !currentUser) {
             alert("Please log in to view your cart or orders.");
             document.getElementById("loginPage").classList.add("active");
             return;
        }
        
        if(page) page.classList.add("active");
    }

    // Update cart badge
    function updateCartBadge(){
        const badge = document.getElementById("cartBadge");
        if(badge) badge.textContent = cart.reduce((sum,i)=>sum+i.quantity,0);
    }

    // Add product to cart (with authentication check)
    window.addToCart = function(id){
        if (!currentUser) {
            alert("Please log in to add items to your cart.");
            showPage('login');
            return;
        }

        const product = products.find(p=>p.id===id);
        const cartItem = cart.find(c=>c.id===id);
        
        if(cartItem){
            cartItem.quantity++;
        } else {
            if (product) {
                cart.push({...product, quantity:1});
            } else {
                console.error("Product not found for ID:", id);
                return;
            }
        }
        updateCartBadge();
        alert(`${product.name} added to cart!`);
    }

    // Display cart items
    window.showCart = function(){
        const cartItemsDiv = document.getElementById("cartItems");
        const cartSummaryDiv = document.getElementById("cartSummary");
        const emptyCartDiv = document.getElementById("emptyCart");

        if(!cartItemsDiv || !cartSummaryDiv || !emptyCartDiv) return;
        
        cartItemsDiv.innerHTML="";
        if(cart.length===0){
            cartSummaryDiv.style.display="none";
            emptyCartDiv.style.display="block";
            return;
        }
        
        emptyCartDiv.style.display="none";
        cartSummaryDiv.style.display="block";
        
        cart.forEach(item=>{
            const div = document.createElement("div");
            div.className="cart-item";
            div.innerHTML=`
                <div class="item-details">
                    <div class="item-name">${item.name} x ${item.quantity}</div>
                    <div class="item-price">₹${item.price*item.quantity}</div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            `;
            cartItemsDiv.appendChild(div);
        });
        
        // Calculate totals
        const subtotal = cart.reduce((sum,i)=>sum+i.price*i.quantity,0);
        const shipping = 50;
        const tax = Math.round(subtotal*0.05);
        const total = subtotal+shipping+tax;
        
        document.getElementById("subtotal").textContent=subtotal;
        document.getElementById("shipping").textContent=shipping;
        document.getElementById("tax").textContent=tax;
        document.getElementById("total").textContent=total;
    }

    // Remove from cart
    window.removeFromCart = function(id){
        cart = cart.filter(c=>c.id!==id);
        updateCartBadge();
        showCart(); 
    }

    // Checkout and save order
    window.proceedToCheckout = function(){
        if(cart.length===0){ alert("Cart is empty!"); return; }
        
        const subtotal = cart.reduce((sum,item)=>sum+item.price*item.quantity,0);
        const shipping = 50;
        const tax = Math.round(subtotal*0.05);
        const total = subtotal + shipping + tax;

        // Save order with initial status
        orders.push({
            items:[...cart],
            subtotal, shipping, tax, total,
            date: new Date().toLocaleString(),
            status: 'Processed' 
        });

        alert(`Order placed successfully! Total: ₹${total}`);
        cart=[];
        updateCartBadge();
        displayOrders();
        showPage('orders'); 
    }

    // Display orders
    window.displayOrders = function(){
        const ordersList = document.getElementById("ordersList");
        if(!ordersList) return;
        ordersList.innerHTML="";
        
        if(orders.length===0){
            ordersList.innerHTML=`
                <div class="empty-state">
                    <h3>You haven't placed any orders yet.</h3>
                    <p>Start your eco-friendly journey now!</p>
                    <button class="continue-shopping" onclick="showPage('home')">Shop Now</button>
                </div>
            `;
            return;
        }
        
        orders.forEach((order,index)=>{
            const isCancelled = order.status === 'Cancelled';
            const statusClass = isCancelled ? 'status-cancelled' : 'status-processed';
            const statusText = isCancelled ? 'Cancelled' : 'Processed';

            const div = document.createElement("div");
            div.className="order-card";
            div.innerHTML=`
                <div class="order-header">
                    <div class="order-id">Order ID: #M-${1000 + index + 1}</div>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="order-date">${order.date}</div>
                <ul>
                    ${order.items.map(i=>`<li>${i.name} x ${i.quantity}</li>`).join("")}
                </ul>
                <p>Total: <strong class="product-price">₹${order.total}</strong></p>
                ${!isCancelled ? `<button class="cancel-btn" onclick="cancelOrder(${index})">Cancel Order</button>` : ''}
            `;
            ordersList.appendChild(div);
        });
    }

    // Cancel order logic
    window.cancelOrder = function(orderIndex) {
        if (orderIndex >= 0 && orderIndex < orders.length) {
            const order = orders[orderIndex];
            if (order.status !== 'Cancelled' && confirm(`Are you sure you want to cancel Order #${orderIndex + 1}? This action cannot be undone.`)) {
                order.status = 'Cancelled';
                alert(`Order #${orderIndex + 1} has been cancelled.`);
                displayOrders(); 
            }
        }
    }


    // --- Authentication Simulation ---

    window.handleLogin = function(e){
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        
        // Simple mock login check
        if (email.length > 0 && password.length > 0) {
            currentUser = email.split("@")[0]; 
            const userSpan = document.getElementById("userName");
            
            if(userSpan) userSpan.textContent=currentUser;
            
            // Switch navigation to logged-in state
            document.getElementById("loggedInSection").style.display="flex";
            document.getElementById("loggedOutSection").style.display="none";
            
            alert(`Welcome back, ${currentUser}!`);
            showPage('home'); // Redirect to dashboard/home after login
        } else {
            alert("Please enter both email and password.");
        }
    }

    window.handleRegister = function(e){
        e.preventDefault();
        alert("Account created successfully! Please proceed to log in.");
        document.getElementById("registerFullName").value = '';
        document.getElementById("registerEmail").value = '';
        document.getElementById("registerPassword").value = '';
        showPage('login');
    }

    window.logout = function(){
        currentUser=null;
        cart=[]; // Clear cart on logout
        updateCartBadge();
        // Switch navigation to logged-out state
        document.getElementById("loggedInSection").style.display="none";
        document.getElementById("loggedOutSection").style.display="flex";
        alert("You have been logged out.");
        showPage('home'); // Redirect to dashboard/home after logout
    }


    // --- Initialization (Shows Dashboard first, ready for user login) ---
    
    displayProducts();
    updateCartBadge();
    
    // 1. Set the initial state: Logged out
    document.getElementById("loggedInSection").style.display = "none";
    document.getElementById("loggedOutSection").style.display = "flex";
    
    // 2. Show the Home Page (dashboard) initially
    // We explicitly activate 'home' here since the HTML default might be overridden by CSS/other JS.
    document.getElementById('homePage').classList.add('active'); 

    // Category buttons listener
    document.querySelectorAll(".category-btn").forEach(btn=>{
        btn.addEventListener("click", ()=>{
            // The optional chaining operator (?.) prevents an error if no element has the 'active' class initially.
            document.querySelector(".category-btn.active")?.classList.remove("active"); 
            btn.classList.add("active");
            displayProducts(btn.dataset.category);
        });
    });

    // Event listener for the Cart link
    const cartLink = document.getElementById("cartLink");
    if(cartLink){
        cartLink.addEventListener("click",(e)=>{
            e.preventDefault(); 
            // showPage handles the login check and redirects if not logged in
            showPage("cart");
            if (currentUser) {
                showCart(); 
            }
        });
    }
}