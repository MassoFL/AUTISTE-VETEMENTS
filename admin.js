// Admin Panel JavaScript
let imageCount = 1;
let editingPostId = null;
let uploadedFiles = [];
let imageColorMap = {}; // { colorName: [imageIndex1, imageIndex2, ...] }
let availableColors = [];
let existingImages = []; // Store existing images when editing
const supabase = window.supabaseClient;

document.addEventListener('DOMContentLoaded', function() {
    // Check if Supabase is initialized
    if (!supabase) {
        alert('Erreur: Supabase non initialisé. Vérifiez votre connexion.');
        return;
    }
    
    loadColors();
    loadPosts();
    setupEventListeners();
});

function setupEventListeners() {
    // Image preview on file select
    document.querySelector('.image-file').addEventListener('change', async function(e) {
        uploadedFiles = Array.from(e.target.files);
        const previewDiv = document.getElementById('imagePreview');
        previewDiv.innerHTML = '';
        imageColorMap = {};
        
        uploadedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.dataset.index = index;
                previewDiv.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
        
        // Load colors and show assignment UI
        if (availableColors.length === 0) {
            await loadColors();
        }
        
        if (availableColors.length === 0) {
            alert('Veuillez d\'abord créer des couleurs dans la section "Gérer les couleurs"');
            this.value = '';
            uploadedFiles = [];
            return;
        }
        
        // Show color assignment UI
        setTimeout(() => showColorAssignment(), 100);
    });

    // Form submission
    document.getElementById('postForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await createPost();
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Êtes-vous sûr de vouloir fermer le panneau admin ?')) {
            window.location.href = 'index.html';
        }
    });
    
    // Color form submission
    document.getElementById('colorForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await createColor();
    });
}

async function uploadImages() {
    const uploadedUrls = [];
    const progressDiv = document.getElementById('uploadProgress');
    
    if (uploadedFiles.length === 0) return [];
    
    progressDiv.style.display = 'block';
    progressDiv.textContent = 'Upload des images...';

    for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${i}.${fileExt}`;
            const filePath = `products/${fileName}`;

            // Upload to Supabase Storage
            const { error } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            uploadedUrls.push(publicUrl);
            progressDiv.textContent = `Uploaded ${i + 1}/${uploadedFiles.length} images...`;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error(`Erreur upload image ${i + 1}: ${error.message}`);
        }
    }

    progressDiv.style.display = 'none';
    return uploadedUrls;
}

async function createPost() {
    const productName = document.getElementById('productName').value;
    const price = document.getElementById('price').value;
    const tags = document.getElementById('tags').value;
    const productType = document.getElementById('productType').value;
    const stripeLink = document.getElementById('stripeLink').value;
    
    try {
        let imageUrls;
        let colorsArray = [];
        
        if (editingPostId) {
            // Mode édition - combine existing and new images
            if (uploadedFiles.length > 0) {
                const newImageUrls = await uploadImages();
                imageUrls = [...existingImages, ...newImageUrls];
            } else {
                imageUrls = [...existingImages];
            }
            
            // Keep existing colors or set default
            if (imageUrls.length > 0) {
                const { data: existingPost } = await supabase
                    .from('posts')
                    .select('colors')
                    .eq('id', editingPostId)
                    .single();
                
                // Adjust colors array to match new images count
                colorsArray = existingPost.colors.slice(0, imageUrls.length);
                while (colorsArray.length < imageUrls.length) {
                    colorsArray.push('Non assigné');
                }
            }
        } else {
            // Mode création
            if (uploadedFiles.length === 0) {
                alert('Veuillez ajouter au moins une image');
                return;
            }

            imageUrls = await uploadImages();
            
            imageUrls.forEach((url, index) => {
                let assignedColor = null;
                for (const [colorName, imageIndices] of Object.entries(imageColorMap)) {
                    if (imageIndices.includes(index)) {
                        assignedColor = colorName;
                        break;
                    }
                }
                colorsArray.push(assignedColor || 'Non assigné');
            });
        }

        const postData = {
            name: productName,
            price: parseFloat(price),
            tags: tags,
            type: productType,
            images: imageUrls,
            colors: colorsArray,
            stripe_payment_link: stripeLink || null
        };

        if (editingPostId) {
            // Update existing post
            const { error } = await supabase
                .from('posts')
                .update(postData)
                .eq('id', editingPostId);

            if (error) throw error;
            showSuccessMessage('Post modifié avec succès!');
            editingPostId = null;
            document.querySelector('.submit-btn').textContent = 'Créer le post';
        } else {
            // Create new post
            const { error } = await supabase
                .from('posts')
                .insert([postData]);

            if (error) throw error;
            showSuccessMessage('Post créé avec succès!');
        }

        document.getElementById('postForm').reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('colorImageAssignment').innerHTML = '';
        uploadedFiles = [];
        existingImages = [];
        imageColorMap = {};
        imageCount = 1;
        loadPosts();
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de la création du post: ' + error.message);
    }
}

async function loadPosts() {
    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayPosts(posts || []);
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors du chargement des posts: ' + error.message);
    }
}

function displayPosts(posts) {
    const postsList = document.getElementById('postsList');
    
    if (posts.length === 0) {
        postsList.innerHTML = '<p style="color: #666; text-align: center;">Aucun post pour le moment</p>';
        return;
    }

    postsList.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-item-header">
                <div>
                    <h3>${post.name}</h3>
                    <p class="price">${post.price}€</p>
                    <p class="tags">${post.tags}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="secondary-btn" onclick="editPost(${post.id})">Modifier</button>
                    <button class="delete-btn" onclick="deletePost(${post.id})">Supprimer</button>
                </div>
            </div>
            <div class="post-item-images">
                ${post.images.map(img => `<img src="${img}" alt="${post.name}">`).join('')}
            </div>
        </div>
    `).join('');
}

async function deletePost(postId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce post ?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) throw error;

        showSuccessMessage('Post supprimé avec succès!');
        loadPosts();
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de la suppression du post: ' + error.message);
    }
}

async function editPost(postId) {
    try {
        const { data: post, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) throw error;

        // Fill form with post data
        document.getElementById('productName').value = post.name;
        document.getElementById('price').value = post.price;
        document.getElementById('tags').value = post.tags;
        document.getElementById('productType').value = post.type;
        document.getElementById('stripeLink').value = post.stripe_payment_link || '';

        // Set editing mode
        editingPostId = postId;
        existingImages = [...post.images]; // Copy existing images
        document.querySelector('.submit-btn').textContent = 'Modifier le post';
        
        // Clear new uploads
        document.querySelector('.image-file').value = '';
        document.getElementById('imagePreview').innerHTML = '';
        uploadedFiles = [];
        
        // Show existing images
        displayExistingImages();
        
        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
        showSuccessMessage('Mode édition - Modifiez les champs. Vous pouvez supprimer des images existantes.');
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors du chargement du post: ' + error.message);
    }
}

function displayExistingImages() {
    const previewDiv = document.getElementById('imagePreview');
    
    if (existingImages.length === 0) return;
    
    const existingDiv = document.createElement('div');
    existingDiv.innerHTML = '<label style="color: #aaa; font-size: 0.9rem; margin-bottom: 10px; display: block;">Images existantes:</label>';
    
    const imagesGrid = document.createElement('div');
    imagesGrid.className = 'existing-images';
    
    existingImages.forEach((imgUrl, index) => {
        const imgItem = document.createElement('div');
        imgItem.className = 'existing-image-item';
        imgItem.innerHTML = `
            <img src="${imgUrl}" alt="Image ${index + 1}">
            <button class="existing-image-remove" onclick="removeExistingImage(${index})" type="button">×</button>
        `;
        imagesGrid.appendChild(imgItem);
    });
    
    existingDiv.appendChild(imagesGrid);
    previewDiv.appendChild(existingDiv);
}

function removeExistingImage(index) {
    existingImages.splice(index, 1);
    displayExistingImages();
    
    // Refresh preview
    const previewDiv = document.getElementById('imagePreview');
    previewDiv.innerHTML = '';
    displayExistingImages();
}

function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    const formSection = document.querySelector('.form-section');
    formSection.insertBefore(messageDiv, formSection.firstChild);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
