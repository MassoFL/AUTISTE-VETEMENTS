let cartCount = 0;
let allPosts = [];
let colorMap = {};
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
        
        // Add image indicators if multiple images
        let indicatorHTML = '';
        if (post.images.length > 1) {
            indicatorHTML = `
                <div class="image-indicator">
                    ${post.images.map((_, i) => `<span ${i === 0 ? 'class="active"' : ''}></span>`).join('')}
                </div>
            `;
        }
        
        infoDiv.innerHTML = `
            ${colorSelectorHTML}
            ${indicatorHTML}
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
    const searchBtn = document.getElementById('searchBtn');
    
    if (!searchInput || !searchBtn) return;
    
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
    
    searchBtn.addEventListener('click', performSearch);
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
const cartIcon = document.getElementById('cartIcon');
if (cartIcon) {
    cartIcon.addEventListener('click', function() {
        alert(`Vous avez ${cartCount} article(s) dans votre panier`);
    });
}

// Smooth scroll snap for images
function setupImageScroll() {
    document.querySelectorAll('.post-images').forEach(container => {
        let scrollTimeout;
        const indicators = container.parentElement.querySelectorAll('.image-indicator');
        
        // Update indicators on scroll
        container.addEventListener('scroll', function() {
            // Show indicators when scrolling
            indicators.forEach(ind => ind.classList.add('visible'));
            
            // Clear existing timeout
            clearTimeout(scrollTimeout);
            
            // Hide indicators after 2 seconds of no scrolling
            scrollTimeout = setTimeout(() => {
                indicators.forEach(ind => ind.classList.remove('visible'));
            }, 2000);
            
            // Update active indicator
            const indicatorSpans = this.parentElement.querySelectorAll('.image-indicator span');
            if (indicatorSpans.length === 0) return;
            
            const scrollLeft = this.scrollLeft;
            const imageWidth = this.querySelector('img').offsetWidth + 10; // +10 for gap
            const currentIndex = Math.round(scrollLeft / imageWidth);
            
            indicatorSpans.forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        });
        
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
        
        // Touch support is already handled by -webkit-overflow-scrolling: touch
    });
}

// Initialize on page load
setupImageScroll();
