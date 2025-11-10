 document.addEventListener('DOMContentLoaded', function() {
            // DOM elements
            const ingredientInput = document.getElementById('ingredientInput');
            const placeOrderBtn = document.getElementById('placeOrderBtn');
            const ordersContainer = document.getElementById('ordersContainer');
            const errorMessage = document.getElementById('errorMessage');
            
            // Initialize orders from sessionStorage
            let orders = JSON.parse(sessionStorage.getItem('mealOrders')) || [];
            renderOrders();
            
            // Event listeners
            placeOrderBtn.addEventListener('click', placeOrder);
            
            // Function to place a new order
            async function placeOrder() {
                const ingredient = ingredientInput.value.trim();
                
                if (!ingredient) {
                    showError('Please enter a main ingredient');
                    return;
                }
                
                try {
                    // Fetch meals with the specified ingredient
                    const meals = await fetchMealsByIngredient(ingredient);
                    
                    if (!meals || meals.length === 0) {
                        showError('No meals found with that ingredient. Try another one.');
                        return;
                    }
                    
                    // Randomly select a meal
                    const randomMeal = meals[Math.floor(Math.random() * meals.length)];
                    
                    // Create new order
                    const newOrder = {
                        id: Date.now(), // Use timestamp as unique ID
                        description: randomMeal.strMeal,
                        status: 'incomplete',
                        ingredient: ingredient
                    };
                    
                    // Add to orders array and update storage
                    orders.push(newOrder);
                    sessionStorage.setItem('mealOrders', JSON.stringify(orders));
                    
                    // Render updated orders
                    renderOrders();
                    
                    // Clear input and error
                    ingredientInput.value = '';
                    errorMessage.textContent = '';
                    
                } catch (error) {
                    showError('Failed to fetch meals. Please try again.');
                    console.error('Error:', error);
                }
            }
            
            // Function to fetch meals by ingredient from TheMealDB API
            async function fetchMealsByIngredient(ingredient) {
                const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error('API request failed');
                }
                
                const data = await response.json();
                return data.meals;
            }
            
            // Function to render all orders
            function renderOrders() {
                if (orders.length === 0) {
                    ordersContainer.innerHTML = '<p>No orders yet. Place an order above!</p>';
                    return;
                }
                
                ordersContainer.innerHTML = '';
                
                orders.forEach(order => {
                    const orderCard = document.createElement('div');
                    orderCard.className = `order-card ${order.status === 'completed' ? 'complete' : ''}`;
                    
                    orderCard.innerHTML = `
                        <div class="order-info">
                            <h3>Order #${order.id}</h3>
                            <p><strong>Meal:</strong> ${order.description}</p>
                            <p><strong>Status:</strong> ${order.status}</p>
                            <p><strong>Ingredient:</strong> ${order.ingredient}</p>
                        </div>
                        <div class="order-actions">
                            ${order.status === 'incomplete' ? 
                                `<button class="complete-btn" data-id="${order.id}">Mark Complete</button>` : ''}
                            <button class="delete-btn" data-id="${order.id}">Delete</button>
                        </div>
                    `;
                    
                    ordersContainer.appendChild(orderCard);
                });
                
                // Add event listeners to action buttons
                document.querySelectorAll('.complete-btn').forEach(btn => {
                    btn.addEventListener('click', completeOrder);
                });
                
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', deleteOrder);
                });
            }
            
            // Function to mark an order as complete
            function completeOrder(e) {
                const orderId = parseInt(e.target.getAttribute('data-id'));
                const orderIndex = orders.findIndex(order => order.id === orderId);
                
                if (orderIndex !== -1) {
                    orders[orderIndex].status = 'completed';
                    sessionStorage.setItem('mealOrders', JSON.stringify(orders));
                    renderOrders();
                }
            }
            
            // Function to delete an order
            function deleteOrder(e) {
                const orderId = parseInt(e.target.getAttribute('data-id'));
                orders = orders.filter(order => order.id !== orderId);
                sessionStorage.setItem('mealOrders', JSON.stringify(orders));
                renderOrders();
            }
            
            // Function to show error messages
            function showError(message) {
                errorMessage.textContent = message;
            }
        });