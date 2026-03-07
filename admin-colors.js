// Color management functions

async function loadColors() {
    try {
        const { data: colors, error } = await supabase
            .from('colors')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        availableColors = colors || [];
        displayColors(availableColors);
    } catch (error) {
        console.error('Error loading colors:', error);
    }
}

function displayColors(colors) {
    const colorsList = document.getElementById('colorsList');
    
    if (colors.length === 0) {
        colorsList.innerHTML = '<p style="color: #666; text-align: center; font-size: 0.9rem;">Aucune couleur</p>';
        return;
    }

    colorsList.innerHTML = colors.map(color => `
        <div class="color-item">
            <div class="color-item-info">
                <div class="color-item-swatch" style="background: ${color.hex}; ${color.hex === '#FFFFFF' || color.hex === '#ffffff' ? 'border-color: #ccc;' : ''}"></div>
                <span class="color-item-name">${color.name}</span>
            </div>
            <button onclick="deleteColor(${color.id})">×</button>
        </div>
    `).join('');
}

async function createColor() {
    const colorName = document.getElementById('colorName').value;
    const colorHex = document.getElementById('colorHex').value;

    try {
        const { error } = await supabase
            .from('colors')
            .insert([{ name: colorName, hex: colorHex }]);

        if (error) throw error;

        showSuccessMessage('Couleur ajoutée avec succès!');
        document.getElementById('colorForm').reset();
        document.getElementById('colorHex').value = '#000000';
        await loadColors();
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de l\'ajout de la couleur: ' + error.message);
    }
}

async function deleteColor(colorId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette couleur ?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('colors')
            .delete()
            .eq('id', colorId);

        if (error) throw error;

        showSuccessMessage('Couleur supprimée avec succès!');
        await loadColors();
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de la suppression de la couleur: ' + error.message);
    }
}
