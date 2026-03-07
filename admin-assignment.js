// Color-Image assignment functions

function showColorAssignment() {
    const assignmentDiv = document.getElementById('colorImageAssignment');
    assignmentDiv.innerHTML = '';
    
    if (uploadedFiles.length === 0 || availableColors.length === 0) {
        return;
    }
    
    assignmentDiv.className = 'color-assignment';
    
    availableColors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'color-assignment-item';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'color-assignment-header';
        headerDiv.innerHTML = `
            <div class="color-assignment-swatch" style="background: ${color.hex}; ${color.hex === '#FFFFFF' || color.hex === '#ffffff' ? 'border-color: #ccc;' : ''}"></div>
            <span class="color-assignment-name">${color.name}</span>
        `;
        
        const checkboxesDiv = document.createElement('div');
        checkboxesDiv.className = 'image-checkboxes';
        
        uploadedFiles.forEach((file, index) => {
            const checkboxItem = document.createElement('label');
            checkboxItem.className = 'image-checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.colorName = color.name;
            checkbox.dataset.imageIndex = index;
            checkbox.checked = imageColorMap[color.name]?.includes(index) || false;
            
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    if (!imageColorMap[color.name]) {
                        imageColorMap[color.name] = [];
                    }
                    if (!imageColorMap[color.name].includes(index)) {
                        imageColorMap[color.name].push(index);
                    }
                } else {
                    if (imageColorMap[color.name]) {
                        imageColorMap[color.name] = imageColorMap[color.name].filter(i => i !== index);
                    }
                }
                console.log('Color map:', imageColorMap);
            });
            
            const img = document.createElement('img');
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            checkboxItem.appendChild(checkbox);
            checkboxItem.appendChild(img);
            checkboxesDiv.appendChild(checkboxItem);
        });
        
        colorDiv.appendChild(headerDiv);
        colorDiv.appendChild(checkboxesDiv);
        assignmentDiv.appendChild(colorDiv);
    });
}
