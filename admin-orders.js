// Orders management functions

async function loadOrders() {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        displayOrders(orders || []);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p style="color: #666; text-align: center; font-size: 0.9rem;">Aucune commande</p>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <strong>${order.customer_name || order.customer_email}</strong>
                <span class="order-status ${order.payment_status}">${order.payment_status}</span>
            </div>
            <div class="order-details">
                <div class="order-amount">${order.total_amount}€</div>
                <div class="order-date">${new Date(order.created_at).toLocaleDateString('fr-FR')}</div>
            </div>
            <button class="secondary-btn" onclick="viewOrderDetails(${order.id})" style="width: 100%; margin-top: 10px;">
                Voir détails
            </button>
        </div>
    `).join('');
}

function viewOrderDetails(orderId) {
    // TODO: Show order details in a modal
    alert('Détails de la commande #' + orderId);
}
