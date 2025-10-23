// Gestione upload immagini (Base64 per localStorage)
class ImageUpload {
    constructor() {
        this.maxImages = 5;
        this.maxSizeKB = 500; // 500KB per immagine
    }
    
    async handleFileInput(fileInput, previewContainer, existingImages = []) {
        const files = Array.from(fileInput.files);
        const images = [...existingImages];
        
        if (images.length + files.length > this.maxImages) {
            alert(`Massimo ${this.maxImages} immagini per nota`);
            return images;
        }
        
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                alert('Solo immagini sono ammesse');
                continue;
            }
            
            try {
                const compressed = await this.compressImage(file);
                images.push(compressed);
            } catch (error) {
                console.error('Error processing image:', error);
                alert('Errore nel caricamento dell\'immagine');
            }
        }
        
        this.renderPreview(images, previewContainer);
        return images;
    }
    
    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Ridimensiona se troppo grande
                    const maxDimension = 800;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = (height / width) * maxDimension;
                            width = maxDimension;
                        } else {
                            width = (width / height) * maxDimension;
                            height = maxDimension;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Comprimi
                    let quality = 0.7;
                    let dataUrl = canvas.toDataURL('image/jpeg', quality);
                    
                    // Se ancora troppo grande, riduci qualità
                    while (dataUrl.length > this.maxSizeKB * 1024 && quality > 0.1) {
                        quality -= 0.1;
                        dataUrl = canvas.toDataURL('image/jpeg', quality);
                    }
                    
                    resolve(dataUrl);
                };
                
                img.onerror = reject;
                img.src = e.target.result;
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    renderPreview(images, container) {
        container.innerHTML = images.map((img, index) => `
            <div class="preview-image-container">
                <img src="${img}" class="preview-image" alt="Preview ${index + 1}">
                <button type="button" class="remove-image-btn" data-index="${index}">&times;</button>
            </div>
        `).join('');
        
        // Aggiungi event listeners per rimuovere
        container.querySelectorAll('.remove-image-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                images.splice(index, 1);
                this.renderPreview(images, container);
            });
        });
    }
    
    createLightbox() {
        if (document.getElementById('image-lightbox')) return;
        
        const lightbox = document.createElement('div');
        lightbox.id = 'image-lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close">&times;</button>
            <img src="" alt="Lightbox" class="lightbox-image">
        `;
        
        document.body.appendChild(lightbox);
        
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
            }
        });
    }
    
    openLightbox(imageSrc) {
        this.createLightbox();
        const lightbox = document.getElementById('image-lightbox');
        lightbox.querySelector('.lightbox-image').src = imageSrc;
        lightbox.classList.add('active');
    }
}

window.imageUpload = new ImageUpload();