document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const suggestionsList = document.getElementById("suggestions");
    const products = document.querySelectorAll(".product");
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    const productNames = Array.from(products).map(product => product.dataset.name);

    // Product suggestions database
    const productSuggestions = [
        { name: 'Свеча зажигания BOSCH', category: 'Двигатель', id: 'spark-plug' },
        { name: 'Моторное масло 5W-30', category: 'Масла и жидкости', id: 'motor-oil' },
        { name: 'Комплект фильтров', category: 'Фильтры', id: 'filter-set' },
        { name: 'Тормозные колодки', category: 'Тормоза', id: 'brake-pads' },
        { name: 'Масляный фильтр', category: 'Фильтры', id: 'oil-filter' },
        { name: 'Воздушный фильтр', category: 'Фильтры', id: 'air-filter' },
        { name: 'Салонный фильтр', category: 'Фильтры', id: 'cabin-filter' },
        { name: 'Тормозной диск', category: 'Тормоза', id: 'brake-disc' },
        { name: 'Тормозная жидкость', category: 'Тормоза', id: 'brake-fluid' },
        { name: 'Аккумулятор', category: 'Электрика', id: 'battery' },
        { name: 'Генератор', category: 'Электрика', id: 'generator' },
        { name: 'Стартер', category: 'Электрика', id: 'starter' },
        { name: 'Ремень ГРМ', category: 'Двигатель', id: 'timing-belt' },
        { name: 'Ролик натяжителя', category: 'Двигатель', id: 'tensioner' },
        { name: 'Амортизатор', category: 'Подвеска', id: 'shock-absorber' },
        { name: 'Пружина подвески', category: 'Подвеска', id: 'spring' },
        { name: 'Сайлентблок', category: 'Подвеска', id: 'silent-block' },
        { name: 'Шаровая опора', category: 'Подвеска', id: 'ball-joint' },
        { name: 'Рулевая рейка', category: 'Рулевое управление', id: 'steering-rack' },
        { name: 'Рулевой наконечник', category: 'Рулевое управление', id: 'tie-rod' }
    ];

    // Search history management
    const MAX_HISTORY_ITEMS = 5;

    const getSearchHistory = () => {
        const history = localStorage.getItem('searchHistory');
        return history ? JSON.parse(history) : [];
    };

    const saveSearchHistory = (history) => {
        localStorage.setItem('searchHistory', JSON.stringify(history));
    };

    const addToSearchHistory = (query) => {
        if (!query.trim()) return;
        
        let history = getSearchHistory();
        // Remove if already exists
        history = history.filter(item => item !== query);
        // Add to beginning
        history.unshift(query);
        // Keep only last MAX_HISTORY_ITEMS
        history = history.slice(0, MAX_HISTORY_ITEMS);
        saveSearchHistory(history);
    };

    // Create suggestions container
    const createSuggestionsContainer = () => {
        const container = document.createElement('div');
        container.className = 'suggestions-container';
        container.style.display = 'none';
        document.querySelector('.search-container').appendChild(container);
        return container;
    };

    // Show search history
    const showSearchHistory = (container) => {
        const history = getSearchHistory();
        if (history.length === 0) return;

        container.innerHTML = `
            <div class="suggestions-header">
                <span data-translate="recentSearches">Недавние поиски</span>
                <button class="clear-history" data-translate="clearHistory">Очистить</button>
            </div>
            ${history.map(item => `
                <div class="suggestion-item history-item">
                    <i class="fas fa-history"></i>
                    <div class="suggestion-name">${item}</div>
                </div>
            `).join('')}
        `;

        container.style.display = 'block';

        // Add click handler for clear button
        const clearButton = container.querySelector('.clear-history');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                saveSearchHistory([]);
                container.style.display = 'none';
            });
        }

        // Add click handlers for history items
        document.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                const searchInput = document.getElementById('search');
                const query = item.querySelector('.suggestion-name').textContent;
                searchInput.value = query;
                searchInput.dispatchEvent(new Event('input'));
            });
        });
    };

    // Function to scroll to and highlight a product
    const scrollToProduct = (productId) => {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (productCard) {
            // First scroll to the catalog section
            const catalogSection = document.getElementById('catalog');
            catalogSection.scrollIntoView({ behavior: 'smooth' });

            // Add highlight class to the product card
            productCard.classList.add('highlight');

            // Remove highlight after 2 seconds
            setTimeout(() => {
                productCard.classList.remove('highlight');
            }, 2000);

            // Scroll to the specific product with offset for header
            setTimeout(() => {
                const headerHeight = document.querySelector('header').offsetHeight;
                const productPosition = productCard.getBoundingClientRect().top;
                const offsetPosition = productPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 500);
        }
    };

    // Initialize search functionality
    const initSearch = () => {
        const searchInput = document.getElementById('search');
        const suggestionsContainer = createSuggestionsContainer();

        // Show history when input is empty and focused
        searchInput.addEventListener('focus', () => {
            if (!searchInput.value.trim()) {
                showSearchHistory(suggestionsContainer);
            }
        });

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length < 2) {
                suggestionsContainer.style.display = 'none';
                return;
            }

            const matches = productSuggestions.filter(product => 
                product.name.toLowerCase().includes(query) || 
                product.category.toLowerCase().includes(query)
            );

            if (matches.length > 0) {
                suggestionsContainer.innerHTML = matches.map(product => `
                    <div class="suggestion-item" data-product-id="${product.id}">
                        <div class="suggestion-name">${product.name}</div>
                        <div class="suggestion-category">${product.category}</div>
                    </div>
                `).join('');

                suggestionsContainer.style.display = 'block';

                // Add click handlers to suggestions
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const productName = item.querySelector('.suggestion-name').textContent;
                        const productId = item.getAttribute('data-product-id');
                        searchInput.value = productName;
                        addToSearchHistory(productName);
                        suggestionsContainer.style.display = 'none';
                        scrollToProduct(productId);
                    });
                });
            } else {
                suggestionsContainer.style.display = 'none';
            }
        });

        // Handle search submission
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim()) {
                addToSearchHistory(searchInput.value.trim());
            }
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                suggestionsContainer.style.display = 'none';
            }
        });
    };

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-links') && !e.target.closest('.mobile-menu-btn')) {
                navLinks.classList.remove('active');
                body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                body.style.overflow = '';
            });
        });
    }

    // Initialize theme toggle
    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme) {
            document.body.classList.add(savedTheme);
            themeIcon.className = savedTheme === 'dark-theme' ? 'fas fa-sun' : 'fas fa-moon';
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('theme', isDark ? 'dark-theme' : '');
        });
    }

    // Toggle mobile menu
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.mobile-menu-btn') && !event.target.closest('.nav-links')) {
            navLinks.classList.remove('active');
        }
    });

    // Add to cart functionality
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    let cartItems = 0;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            addToCart(button);
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Close mobile menu after clicking a link
                navLinks.classList.remove('active');
            }
        });
    });

    // Initialize language switcher
    const languageSwitcher = document.querySelector('.language-switcher');
    const languageBtn = document.querySelector('.language-btn');
    const languageDropdown = document.querySelector('.language-dropdown');
    const currentLang = document.querySelector('.current-lang');

    if (languageSwitcher && languageBtn && languageDropdown) {
        // Load saved language preference
        const savedLang = localStorage.getItem('language') || 'ru';
        if (currentLang) {
            currentLang.textContent = savedLang.toUpperCase();
        }
        updateContent(savedLang);

        // Handle language button click
        languageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            languageDropdown.style.display = 
                languageDropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Handle language selection
        languageDropdown.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = link.getAttribute('data-lang');
                if (currentLang) {
                    currentLang.textContent = lang.toUpperCase();
                }
                updateContent(lang);
                localStorage.setItem('language', lang);
                languageDropdown.style.display = 'none';
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-switcher')) {
                languageDropdown.style.display = 'none';
            }
        });
    }

    // Function to update content based on selected language
    function updateContent(lang) {
        const translations = {
            ru: {
                home: 'Главная',
                catalog: 'Каталог',
                contact: 'Контакты',
                searchPlaceholder: 'Поиск товаров...',
                recentSearches: 'Недавние поиски',
                clearHistory: 'Очистить',
                addToCart: 'В корзину',
                addedToCart: 'Добавлено в корзину',
                qualityParts: 'Качественные автозапчасти',
                wideRange: 'Широкий ассортимент запчастей для всех марок автомобилей',
                goToCatalog: 'Перейти в каталог',
                productCategories: 'Категории товаров',
                productCatalog: 'Каталог товаров',
                oils: 'Масла и жидкости',
                tools: 'Инструменты',
                carBrands: 'Бренды',
                windshields: 'Лобовые стёкла',
                motorOil: 'Моторное масло 5W-30',
                filterSet: 'Комплект фильтров',
                brakePads: 'Тормозные колодки',
                address: 'Адрес',
                phone: 'Телефон',
                email: 'Email',
                copyright: '© 2025 SJ-MOTORS. All Rights Reserved.',
                selectCarBrand: 'Выберите марку автомобиля',
                selectBrand: 'Выберите бренд для просмотра ассортимента',
                backToBrands: 'Назад к брендам',
                backToCategories: 'Назад к категориям',
                motorOils: 'Моторные масла и смазочные материалы',
                syntheticOil: 'Синтетическое моторное масло',
                instagram: 'Instagram',
                description: 'Лобовое стекло',
                notification: 'Товар добавлен в корзину',
                yourCart: 'Корзина',
                total: 'Итого:',
                checkout: 'Оформить заказ',
                emptyCart: 'Ваша корзина пуста',
                currency: '₽'
            },
            en: {
                home: 'Home',
                catalog: 'Catalog',
                contact: 'Contact',
                searchPlaceholder: 'Search products...',
                recentSearches: 'Recent searches',
                clearHistory: 'Clear',
                addToCart: 'Add to cart',
                addedToCart: 'Added to cart',
                qualityParts: 'Quality Auto Parts',
                wideRange: 'Wide range of parts for all car brands',
                goToCatalog: 'Go to catalog',
                productCategories: 'Product Categories',
                productCatalog: 'Product Catalog',
                oils: 'Oils and Fluids',
                tools: 'Tools',
                carBrands: 'Brands',
                windshields: 'Windshields',
                motorOil: 'Motor Oil 5W-30',
                filterSet: 'Filter Set',
                brakePads: 'Brake Pads',
                address: 'Address',
                phone: 'Phone',
                email: 'Email',
                copyright: '©2025 SJ-MOTORS. All Rights Reserved.',
                selectCarBrand: 'Select Car Brand',
                selectBrand: 'Select brand to view assortment',
                backToBrands: 'Back to brands',
                backToCategories: 'Back to categories',
                motorOils: 'Motor oils and lubricants',
                syntheticOil: 'Synthetic motor oil',
                instagram: 'Instagram',
                description: 'Windshield',
                notification: 'Product added to cart',
                yourCart: 'Your Cart',
                total: 'Total:',
                checkout: 'Checkout',
                emptyCart: 'Your cart is empty',
                currency: '$',
            },
            ka: {
                home: 'მთავარი',
                catalog: 'კატალოგი',
                contact: 'კონტაქტი',
                searchPlaceholder: 'პროდუქტების ძებნა...',
                recentSearches: 'ბოლო ძებნები',
                clearHistory: 'გასუფთავება',
                addToCart: 'კალათაში დამატება',
                addedToCart: 'დაემატა კალათაში',
                qualityParts: 'ხარისხიანი ავტონაწილები',
                wideRange: 'ყველა მარკის მანქანისთვის',
                goToCatalog: 'კატალოგში გადასვლა',
                productCategories: 'პროდუქციის კატეგორიები',
                productCatalog: 'პროდუქციის კატალოგი',
                oils: 'ზეთები და სითხეები',
                tools: 'ინსტრუმენტები',
                carBrands: 'ბრენდები',
                windshields: 'ქარის აბზაცები',
                motorOil: 'ძრავის ზეთი 5W-30',
                filterSet: 'ფილტრების კომპლექტი',
                brakePads: 'სამუხრუჭე ბალიშები',
                address: 'მისამართი',
                phone: 'ტელეფონი',
                email: 'ელ. ფოსტა',
                copyright: '©2025 SJ-MOTORS. All Rights Reserved.',
                selectCarBrand: 'აირჩიეთ მანქანის მარკა',
                selectBrand: 'აირჩიეთ ბრენდი ასორტიმენტის სანახავად',
                backToBrands: 'უკან ბრენდებზე',
                backToCategories: 'უკან კატეგორიებზე',
                motorOils: 'ძრავის ზეთები და საპოხი მასალები',
                syntheticOil: 'სინთეტიკური ძრავის ზეთი',
                instagram: 'Instagram',
                description: 'ქარის აბზაცი',
                notification: 'პროდუქტი დაემატა კალათაში',
                yourCart: 'კალათა',
                total: 'ჯამი:',
                checkout: 'შეკვეთის გაფორმება',
                emptyCart: 'თქვენი კალათა ცარიელია',
                currency: '₾'
            },
            hy: {
                home: 'Գլխավոր',
                catalog: 'Կատալոգ',
                contact: 'Կապ',
                searchPlaceholder: 'Որոնել ապրանքներ...',
                recentSearches: 'Վերջին որոնումները',
                clearHistory: 'Մաքրել',
                addToCart: 'Ավելացնել զամբյուղում',
                addedToCart: 'Ավելացվել է զամբյուղում',
                qualityParts: 'Որակյալ ավտոմոբիլային մասեր',
                wideRange: 'Բոլոր մակնիշների մեքենաների համար',
                goToCatalog: 'Անցնել կատալոգ',
                productCategories: 'Ապրանքների կատեգորիաներ',
                productCatalog: 'Ապրանքների կատալոգ',
                oils: 'Յուղեր և հեղուկներ',
                tools: 'Գործիքներ',
                carBrands: 'Բրենդներ',
                windshields: 'Առջևի ապակիներ',
                motorOil: 'Շարժիչի յուղ 5W-30',
                filterSet: 'Զտիչների հավաքածու',
                brakePads: 'Արգելակի բարձիկներ',
                address: 'Հասցե',
                phone: 'Հեռախոս',
                email: 'Էլ. փոստ',
                copyright: '©2025 SJ-MOTORS. All Rights Reserved.',
                selectCarBrand: 'Ընտրեք մեքենայի մակնիշը',
                selectBrand: 'Ընտրեք մակնիշը տեսականու դիտման համար',
                backToBrands: 'Վերադառնալ մակնիշներին',
                backToCategories: 'Վերադառնալ կատեգորիաներին',
                motorOils: 'Շարժիչի յուղեր և քսուքներ',
                syntheticOil: 'Սինթետիկ շարժիչի յուղ',
                instagram: 'Instagram',
                description: 'Առջևի ապակի',
                notification: 'Ապրանքը ավելացվել է զամբյուղում',
                yourCart: 'Զամբյուղ',
                total: 'Ընդամենը:',
                checkout: 'Պատվիրել',
                emptyCart: 'Ձեր զամբյուղը դատարկ է',
                currency: '֏'
            }
        };

        // Update all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            console.log(`Updating element with key: ${key}, language: ${lang}`);
            if (translations[lang] && translations[lang][key]) {
                console.log(`Found translation: ${translations[lang][key]}`);
                if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                    element.placeholder = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            } else {
                console.log(`No translation found for key: ${key} in language: ${lang}`);
            }
        });

        // Update search placeholder
        const searchInput = document.getElementById('search');
        if (searchInput && translations[lang] && translations[lang].searchPlaceholder) {
            searchInput.placeholder = translations[lang].searchPlaceholder;
        }
    }

    // Cart functionality
    function initializeCart() {
        const cartIcon = document.querySelector('.cart-icon');
        const cartModal = document.getElementById('cartModal');
        const closeCartBtn = document.querySelector('.close-cart');
        
        // Create cart modal if it doesn't exist
        if (!cartModal) {
            const modalHTML = `
                <div id="cartModal" class="modal">
                    <div class="modal-content cart-modal-content">
                        <span class="close-modal close-cart">&times;</span>
                        <h3 data-translate="yourCart">Your Cart</h3>
                        <div class="cart-items"></div>
                        <div class="cart-total">
                            <span data-translate="total">Total:</span>
                            <span class="total-amount">0 <span data-translate="currency">$</span></span>
                        </div>
                        <button class="btn checkout-btn" data-translate="checkout">Checkout</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Show cart modal
        cartIcon.addEventListener('click', () => {
            const cartModal = document.getElementById('cartModal');
            const cartItems = cartModal.querySelector('.cart-items');
            const totalAmount = cartModal.querySelector('.total-amount');
            
            // Get cart items from localStorage
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            if (cart.length === 0) {
                cartItems.innerHTML = '<p class="empty-cart" data-translate="emptyCart">Your cart is empty</p>';
                totalAmount.textContent = '0 <span data-translate="currency">$</span>';
            } else {
                // Display cart items
                cartItems.innerHTML = cart.map(item => `
                    <div class="cart-item" data-product-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p class="cart-item-price">${item.price} <span data-translate="currency">$</span></p>
                        </div>
                        <button class="remove-from-cart" data-product-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('');
                
                // Calculate total
                const total = cart.reduce((sum, item) => sum + item.price, 0);
                totalAmount.textContent = `${total} <span data-translate="currency">$</span>`;
                
                // Add remove button functionality
                cartItems.querySelectorAll('.remove-from-cart').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const productId = e.currentTarget.dataset.productId;
                        removeFromCart(productId);
                        updateCartCount();
                        showCart(); // Refresh cart display
                    });
                });
            }
            
            // Update translations in cart modal
            const lang = localStorage.getItem('language') || 'ru';
            updateContent(lang);
            
            cartModal.classList.add('show');
        });

        // Close cart modal
        document.querySelector('.close-cart').addEventListener('click', () => {
            document.getElementById('cartModal').classList.remove('show');
        });

        // Close cart when clicking outside
        window.addEventListener('click', (e) => {
            const cartModal = document.getElementById('cartModal');
            if (e.target === cartModal) {
                cartModal.classList.remove('show');
            }
        });
    }

    // Remove item from cart
    function removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update button state
        const button = document.querySelector(`[data-product-id="${productId}"] .add-to-cart`);
        if (button) {
            updateButtonState(button, false);
        }
    }

    // Update addToCart function
    function addToCart(button) {
        const productCard = button.closest('.product-card');
        const productId = productCard.dataset.productId;
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = parseInt(productCard.querySelector('.price').textContent.replace(/[^\d]/g, ''));
        const productImage = productCard.querySelector('img').src;

        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product is already in cart
        if (cart.some(item => item.id === productId)) {
            showCartWarningModal();
            return;
        }

        // Add to cart
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage
        });

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        updateButtonState(button, true);
    }

    // Function to show cart warning modal
    function showCartWarningModal() {
        const modal = document.getElementById('cartWarningModal');
        modal.classList.add('show');
        
        // Close modal when clicking the close button
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => {
            modal.classList.remove('show');
        };
        
        // Close modal when clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        };
    }

    // Function to update cart count
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    }

    // Function to update button state
    function updateButtonState(button, inCart) {
        const lang = localStorage.getItem('language') || 'ru';
        const translations = {
            ru: {
                addToCart: 'В корзину',
                inCart: 'В корзине'
            },
            en: {
                addToCart: 'Add to cart',
                inCart: 'In cart'
            },
            ka: {
                addToCart: 'კალათაში დამატება',
                inCart: 'კალათაშია'
            },
            hy: {
                addToCart: 'Ավելացնել զամբյուղում',
                inCart: 'Զամբյուղում է'
            }
        };

        if (inCart) {
            button.classList.add('in-cart');
            button.innerHTML = `<i class="fas fa-shopping-cart"></i> ${translations[lang].inCart}`;
        } else {
            button.classList.remove('in-cart');
            button.innerHTML = `<i class="fas fa-shopping-cart"></i> ${translations[lang].addToCart}`;
        }
    }

    // Initialize everything when DOM is loaded
    document.addEventListener("DOMContentLoaded", () => {
        // Initialize cart functionality
        initializeCart();
        
        // Initialize cart buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                addToCart(button);
            });
        });
        
        // Initialize cart count
        updateCartCount();
        
        // Initialize search
        initSearch();
    });

    // Back to Top Button
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Mobile Menu
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = document.querySelector('.nav-links').outerHTML;
    document.body.appendChild(mobileMenu);

    document.querySelector('.mobile-menu-btn').addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu.classList.contains('active') && 
            !mobileMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Quick View Functionality
    function createQuickViewModal() {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="quick-view-content">
                <button class="close-modal">&times;</button>
                <div class="quick-view-grid">
                    <img class="quick-view-image" src="" alt="">
                    <div class="quick-view-details">
                        <h2></h2>
                        <div class="quick-view-price"></div>
                        <p class="quick-view-description"></p>
                        <button class="add-to-cart">
                            <i class="fas fa-shopping-cart"></i>
                            <span data-translate="addToCart">Add to Cart</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    const quickViewModal = createQuickViewModal();

    // Add quick view buttons to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        const quickViewBtn = document.createElement('button');
        quickViewBtn.className = 'quick-view-btn';
        quickViewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        quickViewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const img = card.querySelector('img').src;
            const title = card.querySelector('h3').textContent;
            const price = card.querySelector('.price').textContent;
            const description = card.dataset.description || '';

            quickViewModal.querySelector('.quick-view-image').src = img;
            quickViewModal.querySelector('h2').textContent = title;
            quickViewModal.querySelector('.quick-view-price').textContent = price;
            quickViewModal.querySelector('.quick-view-description').textContent = description;
            
            quickViewModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
        card.appendChild(quickViewBtn);
    });

    // Close quick view modal
    quickViewModal.querySelector('.close-modal').addEventListener('click', () => {
        quickViewModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    // Close quick view when clicking outside
    quickViewModal.addEventListener('click', (e) => {
        if (e.target === quickViewModal) {
            quickViewModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Loading Skeleton
    function showSkeleton(container, count = 6) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton';
        skeleton.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-price"></div>
        `;
        
        for (let i = 0; i < count; i++) {
            container.appendChild(skeleton.cloneNode(true));
        }
    }

    // Show skeleton while loading products
    document.addEventListener('DOMContentLoaded', () => {
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            showSkeleton(productGrid);
        }
    });

    // Breadcrumb Navigation
    function createBreadcrumb() {
        const path = window.location.pathname.split('/').filter(Boolean);
        const breadcrumb = document.createElement('div');
        breadcrumb.className = 'breadcrumb';
        
        let html = '<a href="/"><i class="fas fa-home"></i></a>';
        let currentPath = '';
        
        path.forEach((segment, index) => {
            currentPath += '/' + segment;
            const isLast = index === path.length - 1;
            const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace('.html', '');
            
            if (isLast) {
                html += `<i class="fas fa-chevron-right"></i><span class="current">${name}</span>`;
            } else {
                html += `<i class="fas fa-chevron-right"></i><a href="${currentPath}">${name}</a>`;
            }
        });
        
        breadcrumb.innerHTML = html;
        document.querySelector('main').insertBefore(breadcrumb, document.querySelector('main').firstChild);
    }

    // Wishlist Functionality
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    function toggleWishlist(productId) {
        const index = wishlist.indexOf(productId);
        if (index === -1) {
            wishlist.push(productId);
        } else {
            wishlist.splice(index, 1);
        }
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        updateWishlistButtons();
    }

    function updateWishlistButtons() {
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const productId = btn.dataset.productId;
            if (wishlist.includes(productId)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Add wishlist buttons to product cards
    document.querySelectorAll('.product-card').forEach(card => {
        const productId = card.dataset.productId;
        const wishlistBtn = document.createElement('button');
        wishlistBtn.className = 'wishlist-btn';
        wishlistBtn.dataset.productId = productId;
        wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
        wishlistBtn.addEventListener('click', () => {
            toggleWishlist(productId);
            wishlistBtn.querySelector('i').classList.toggle('far');
            wishlistBtn.querySelector('i').classList.toggle('fas');
        });
        card.appendChild(wishlistBtn);
    });

    // Recently Viewed Products
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

    function addToRecentlyViewed(product) {
        const index = recentlyViewed.findIndex(p => p.id === product.id);
        if (index !== -1) {
            recentlyViewed.splice(index, 1);
        }
        recentlyViewed.unshift(product);
        if (recentlyViewed.length > 4) {
            recentlyViewed.pop();
        }
        localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
        updateRecentlyViewed();
    }

    function updateRecentlyViewed() {
        const container = document.querySelector('.recently-viewed');
        if (!container || recentlyViewed.length === 0) return;
        
        const grid = document.createElement('div');
        grid.className = 'recently-viewed-grid';
        
        recentlyViewed.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <div class="price">${product.price}</div>
                <button class="add-to-cart" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i>
                    <span data-translate="addToCart">Add to Cart</span>
                </button>
            `;
            grid.appendChild(card);
        });
        
        container.innerHTML = `
            <h2 data-translate="recentlyViewed">Recently Viewed</h2>
            ${grid.outerHTML}
        `;
    }

    // Initialize features
    document.addEventListener('DOMContentLoaded', () => {
        createBreadcrumb();
        updateWishlistButtons();
        updateRecentlyViewed();
    });

    // Search icon click handler
    const searchIcon = document.querySelector('.search-icon');
    const searchContainer = document.querySelector('.search-container');
    
    if (searchIcon && searchContainer) {
        searchIcon.addEventListener('click', () => {
            searchContainer.classList.toggle('active');
            if (searchContainer.classList.contains('active')) {
                searchContainer.querySelector('#search').focus();
            }
        });

        // Close search when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container') && !e.target.closest('.search-icon')) {
                searchContainer.classList.remove('active');
            }
        });

        // Close search on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchContainer.classList.contains('active')) {
                searchContainer.classList.remove('active');
            }
        });
    }
});
