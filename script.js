let cartCount = 0;
let allPosts = [];
let colorMap = {};
let cartItems = []; // Store cart items with details
const supabase = window.supabaseClient;

// Initialize
document.addEventListener('DOMContentLoaded', async function() {
    await loadColors();
    loadPostsFromDatabase();
    setupSearch();
});

// Load colors from database
async function loadColors() {
    try {
        const { data: colors, error } = await supabase
            .from('colors')
            .select('*');

        if (error) throw error;

        // Build color map
        colorMap = {};
        colors.forEach(color => {
            colorMap[color.name] = color.hex;
        });
    } catch (error) {
        console.error('Error loading colors:', error);
    }
}

// Load posts from database/localStorage
async function loadPostsFromDatabase() {
    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderPosts(posts || []);
    } catch (error) {
        console.error('Error:', error);
        // Keep default posts if database fails
        allPosts = Array.from(document.querySelectorAll('.post'));
        setupAddToCart();
    }
}

function renderPosts(posts) {
    const feedContainer = document.querySelector('.feed-container');
    
    if (posts.length === 0) {
        // Keep default posts if no custom posts exist
        allPosts = Array.from(document.querySelectorAll('.post'));
        setupAddToCart();
        setupImageScroll();
        return;
    }

    // Clear existing posts
    feedContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'post';
        postElement.setAttribute('data-tags', post.tags);
        postElement.setAttribute('data-stripe-link', post.stripe_payment_link || '');

        const imagesDiv = document.createElement('div');
        imagesDiv.className = post.images.length > 1 ? 'post-images multi' : 'post-images';
        
        post.images.forEach((imgUrl, index) => {
            const img = document.createElement('img');
            img.src = imgUrl;
            img.alt = post.name;
            img.dataset.colorIndex = index;
            imagesDiv.appendChild(img);
        });

        const infoDiv = document.createElement('div');
        infoDiv.className = 'post-info';
        
        // Add color selector if colors are available
        let colorSelectorHTML = '';
        if (post.colors && post.colors.length > 0) {
            const uniqueColors = [...new Set(post.colors)];
            colorSelectorHTML = `
                <div class="color-selector">
                    ${uniqueColors.map((color, index) => {
                        const hex = colorMap[color] || '#000000';
                        return `<div class="color-dot ${index === 0 ? 'active' : ''}" 
                                     data-color="${color}" 
                                     data-color-index="${index}"
                                     style="background: ${hex}; ${hex === '#FFFFFF' ? 'border-color: #ccc;' : ''}"
                                     title="${color}">
                                </div>`;
                    }).join('')}
                </div>
            `;
        }
        
        infoDiv.innerHTML = `
            ${colorSelectorHTML}
            <h2>${post.name}</h2>
            <p class="price">${post.price}€</p>
            <button class="add-to-cart">Ajouter au panier</button>
        `;

        postElement.appendChild(imagesDiv);
        postElement.appendChild(infoDiv);
        feedContainer.appendChild(postElement);
        
        // Add color switching functionality
        if (post.colors && post.colors.length > 0) {
            const colorDots = infoDiv.querySelectorAll('.color-dot');
            colorDots.forEach(dot => {
                dot.addEventListener('click', function() {
                    // Remove active from all
                    colorDots.forEach(d => d.classList.remove('active'));
                    // Add active to clicked
                    this.classList.add('active');
                    
                    // Find and scroll to image with this color
                    const selectedColor = this.dataset.color;
                    const colorIndex = post.colors.indexOf(selectedColor);
                    if (colorIndex !== -1) {
                        const targetImage = imagesDiv.children[colorIndex];
                        if (targetImage) {
                            targetImage.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                        }
                    }
                });
            });
        }
    });

    allPosts = Array.from(document.querySelectorAll('.post'));
    setupAddToCart();
    setupImageScroll();
}

// Add to cart functionality
function setupAddToCart() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const postElement = this.closest('.post');
            const productName = postElement.querySelector('h2').textContent;
            const priceText = postElement.querySelector('.price').textContent;
            const price = parseFloat(priceText.replace('€', ''));
            const image = postElement.querySelector('.post-images img').src;
            const stripeLink = postElement.dataset.stripeLink;
            
            // Get selected color if any
            const activeColorDot = postElement.querySelector('.color-dot.active');
            const color = activeColorDot ? activeColorDot.dataset.color : null;
            
            // Add to cart
            cartItems.push({
                id: Date.now(),
                name: productName,
                price: price,
                image: image,
                color: color,
                stripeLink: stripeLink
            });
            
            cartCount++;
            updateCartCount();
            
            // Visual feedback
            this.textContent = 'Ajouté ✓';
            this.style.background = '#4CAF50';
            this.style.color = '#fff';
            
            setTimeout(() => {
                this.textContent = 'Ajouter au panier';
                this.style.background = '#fff';
                this.style.color = '#000';
            }, 1500);
        });
    });
}

function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
        
        // Animate cart icon
        const cartIcon = document.getElementById('cartIcon');
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 300);
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (!searchInput) return;
    
    function performSearch() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query === '') {
            // Show all posts
            allPosts.forEach(post => post.classList.remove('hidden'));
            removeNoResultsMessage();
            return;
        }
        
        let hasResults = false;
        
        allPosts.forEach(post => {
            const title = post.querySelector('h2').textContent.toLowerCase();
            const tags = post.getAttribute('data-tags') || '';
            
            if (title.includes(query) || tags.includes(query)) {
                post.classList.remove('hidden');
                hasResults = true;
            } else {
                post.classList.add('hidden');
            }
        });
        
        if (!hasResults) {
            showNoResultsMessage();
        } else {
            removeNoResultsMessage();
        }
    }
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Real-time search
    searchInput.addEventListener('input', performSearch);
}

function showNoResultsMessage() {
    removeNoResultsMessage();
    const feedContainer = document.querySelector('.feed-container');
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'Aucun résultat trouvé';
    feedContainer.appendChild(noResults);
}

function removeNoResultsMessage() {
    const existing = document.querySelector('.no-results');
    if (existing) {
        existing.remove();
    }
}

// Cart icon click
document.addEventListener('DOMContentLoaded', function() {
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openCheckout();
        });
        
        // Also add touch event for mobile
        cartIcon.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openCheckout();
        });
    }
});

// Checkout modal functions
function openCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.add('active');
    renderCart();
}

function closeCheckout() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('active');
}

document.getElementById('closeCheckout').addEventListener('click', closeCheckout);

// Close modal when clicking outside
document.getElementById('checkoutModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCheckout();
    }
});

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <div class="empty-cart-text">Votre panier est vide</div>
            </div>
        `;
        return;
    }
    
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    
    container.innerHTML = `
        <div class="cart-items">
            ${cartItems.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        ${item.color ? `<div class="cart-item-color">Couleur: ${item.color}</div>` : ''}
                        <div class="cart-item-price">${item.price}€</div>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${item.id})">×</button>
                </div>
            `).join('')}
        </div>
        <div class="cart-total">
            <span class="cart-total-label">Total</span>
            <span class="cart-total-amount">${total.toFixed(2)}€</span>
        </div>
        <button class="checkout-btn" onclick="proceedToCheckout()">Passer la commande</button>
    `;
}

function removeFromCart(itemId) {
    cartItems = cartItems.filter(item => item.id !== itemId);
    cartCount = cartItems.length;
    updateCartCount();
    renderCart();
}

function proceedToCheckout() {
    // If only one item and it has a Stripe link, redirect directly
    if (cartItems.length === 1 && cartItems[0].stripeLink) {
        window.location.href = cartItems[0].stripeLink;
        return;
    }
    
    // For multiple items, use backend API
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Chargement...';
    
    createCheckoutSession();
}

async function createCheckoutSession() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: cartItems.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: 1,
                    image: item.image,
                    color: item.color
                }))
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création de la session');
        }

        const { url } = await response.json();
        
        // Redirect to Stripe Checkout
        window.location.href = url;
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de la création de la session de paiement. Veuillez réessayer.');
        
        const checkoutBtn = document.querySelector('.checkout-btn');
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Passer la commande';
    }
}

// Smooth scroll snap for images
function setupImageScroll() {
    document.querySelectorAll('.post-images').forEach(container => {
        // Mouse drag to scroll
        let isDown = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDown = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mouseup', () => {
            isDown = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });
    });
}

// Initialize on page load
setupImageScroll();
