class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.cartPopup = document.querySelector('.cart-popup');
        this.cartOverlay = document.querySelector('.cart-overlay');
        this.cartItems = document.querySelector('.cart-items');
        this.totalAmount = document.querySelector('.total-amount');
        this.cartCount = document.querySelector('.cart-count');
        this.cartIcon = document.querySelector('.cart-icon');
        
        this.init();
    }

    init() {
        // Event Listeners
        if (this.cartIcon) {
            this.cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleCart();
            });
        }
        
        const closeCartBtn = document.querySelector('.close-cart');
        if (closeCartBtn) {
            closeCartBtn.addEventListener('click', () => this.toggleCart());
        }
        
        if (this.cartOverlay) {
            this.cartOverlay.addEventListener('click', () => this.toggleCart());
        }

        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('[data-product-id]');
                if (card) {
                    const product = {
                        id: card.dataset.productId,
                        name: card.querySelector('h3')?.textContent || '',
                        price: parseFloat(card.querySelector('.price')?.textContent?.replace(/[^\d.]/g, '') || '0'),
                        image: card.querySelector('img')?.src || '',
                        quantity: 1
                    };
                    this.addToCart(product);
                }
            });
        });
        
        // Update cart count and total on load
        this.updateCartCount();
        this.updateTotal();
        this.updateAddToCartButtons();
    }

    toggleCart() {
        if (this.cartPopup && this.cartOverlay) {
            this.cartPopup.classList.toggle('active');
            this.cartOverlay.classList.toggle('active');
            if (this.cartPopup.classList.contains('active')) {
                this.renderCart();
            }
        }
    }

    addToCart(product) {
        try {
            const existingItem = this.cart.find(item => item.id === product.id);
            
            if (existingItem) {
                this.showNotification('Товар уже в корзине');
                return;
            }

            this.cart.push(product);
            this.saveCart();
            this.updateCartCount();
            this.updateTotal();
            this.renderCart();
            this.updateAddToCartButtons();

            // Show success message
            this.showNotification('Товар добавлен в корзину');
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Ошибка при добавлении товара в корзину', true);
        }
    }

    removeFromCart(productId) {
        try {
            this.cart = this.cart.filter(item => item.id !== productId);
            this.saveCart();
            this.updateCartCount();
            this.updateTotal();
            this.renderCart();
            this.updateAddToCartButtons();

            // Show success message
            this.showNotification('Товар удален из корзины');
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.showNotification('Ошибка при удалении товара из корзины', true);
        }
    }

    updateQuantity(productId, quantity) {
        try {
            const item = this.cart.find(item => item.id === productId);
            if (item) {
                if (quantity <= 0) {
                    this.removeFromCart(productId);
                } else {
                    item.quantity = quantity;
                    this.saveCart();
                    this.updateCartCount();
                    this.updateTotal();
                    this.renderCart();
                }
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            this.showNotification('Ошибка при обновлении количества', true);
        }
    }

    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart:', error);
            this.showNotification('Ошибка при сохранении корзины', true);
        }
    }

    updateCartCount() {
        try {
            if (this.cartCount) {
                const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
                this.cartCount.textContent = totalItems;
                this.cartCount.style.display = totalItems > 0 ? 'block' : 'none';
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    updateTotal() {
        try {
            if (this.totalAmount) {
                const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                this.totalAmount.textContent = `${total.toLocaleString()} ₽`;
            }
        } catch (error) {
            console.error('Error updating total:', error);
        }
    }

    updateAddToCartButtons() {
        try {
            document.querySelectorAll('.add-to-cart').forEach(button => {
                const card = button.closest('[data-product-id]');
                if (card && card.dataset.productId) {
                    const isInCart = this.cart.some(item => item.id === card.dataset.productId);
                    if (isInCart) {
                        button.textContent = 'Добавлено в корзину';
                        button.classList.add('added-to-cart');
                        button.disabled = true;
                    } else {
                        button.textContent = 'В корзину';
                        button.classList.remove('added-to-cart');
                        button.disabled = false;
                    }
                }
            });
        } catch (error) {
            console.error('Error updating add to cart buttons:', error);
        }
    }

    showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification ${isError ? 'error' : 'success'}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    renderCart() {
        try {
            if (!this.cartItems) return;
            
            this.cartItems.innerHTML = '';
            
            if (this.cart.length === 0) {
                this.cartItems.innerHTML = `
                    <div class="cart-empty">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Корзина пуста</p>
                        <a href="#" class="continue-shopping">Продолжить покупки</a>
                    </div>
                `;
                return;
            }

            this.cart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-id="${item.id}" aria-label="Удалить товар">&times;</button>
                `;
                this.cartItems.appendChild(cartItem);
            });

            // Add event listeners for quantity buttons and remove buttons
            this.cartItems.querySelectorAll('.quantity-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    const input = this.cartItems.querySelector(`.quantity-input[data-id="${id}"]`);
                    const currentValue = parseInt(input.value);
                    
                    if (e.target.classList.contains('plus')) {
                        input.value = currentValue + 1;
                    } else {
                        input.value = currentValue - 1;
                    }
                    
                    this.updateQuantity(id, parseInt(input.value));
                });
            });

            this.cartItems.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const id = e.target.dataset.id;
                    const value = parseInt(e.target.value);
                    if (value > 0) {
                        this.updateQuantity(id, value);
                    } else {
                        e.target.value = 1;
                        this.updateQuantity(id, 1);
                    }
                });
            });

            this.cartItems.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.dataset.id;
                    this.removeFromCart(id);
                });
            });
        } catch (error) {
            console.error('Error rendering cart:', error);
            this.showNotification('Ошибка при загрузке корзины', true);
        }
    }
}

// Initialize cart
const cart = new ShoppingCart(); 