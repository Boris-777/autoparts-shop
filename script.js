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
    const cartIcon = document.querySelector('.cart-icon');
    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    let cartItems = 0;

    // Theme toggle functionality
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    // Check for saved theme preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
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
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            cartItems++;
            cartCount.textContent = cartItems;
            
            // Add animation to cart icon
            cartIcon.classList.add('animate');
            setTimeout(() => {
                cartIcon.classList.remove('animate');
            }, 500);

            // Show notification
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = 'Товар добавлен в корзину';
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 2000);
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

    // Language switcher functionality
    const languageSwitcher = document.querySelector('.language-switcher');
    const currentLang = document.querySelector('.current-lang');
    const langLinks = document.querySelectorAll('.language-dropdown a');

    // Load saved language preference
    const savedLang = localStorage.getItem('language') || 'ru';
    currentLang.textContent = savedLang.toUpperCase();

    // Language content
    const translations = {
        ru: {
            home: 'Главная',
            catalog: 'Каталог',
            contact: 'Контакты',
            search: 'Поиск товаров...',
            qualityParts: 'Качественные автозапчасти',
            wideRange: 'Широкий ассортимент запчастей для всех марок автомобилей',
            goToCatalog: 'Перейти в каталог',
            productCategories: 'Категории товаров',
            oils: 'Масла и жидкости',
            tools: 'Инструменты',
            carBrands: 'Автомобили',
            windshields: 'Лобовые стёкла',
            motorOil: 'Моторное масло 5W-30',
            filterSet: 'Комплект фильтров',
            brakePads: 'Тормозные колодки',
            addToCart: 'В корзину',
            address: 'Адрес',
            phone: 'Телефон',
            email: 'Email',
            copyright: 'Все права защищены.'
        },
        en: {
            home: 'Home',
            catalog: 'Catalog',
            contact: 'Contact',
            search: 'Search products...',
            qualityParts: 'Quality Auto Parts',
            wideRange: 'Wide range of parts for all car brands',
            goToCatalog: 'Go to catalog',
            productCategories: 'Product Categories',
            oils: 'Oils and Fluids',
            tools: 'Tools',
            carBrands: 'Cars',
            windshields: 'Windshields',
            motorOil: 'Motor Oil 5W-30',
            filterSet: 'Filter Set',
            brakePads: 'Brake Pads',
            addToCart: 'Add to Cart',
            address: 'Address',
            phone: 'Phone',
            email: 'Email',
            copyright: 'All rights reserved.'
        },
        ka: {
            home: 'მთავარი',
            catalog: 'კატალოგი',
            contact: 'კონტაქტი',
            search: 'პროდუქტების ძებნა...',
            qualityParts: 'ხარისხიანი ავტონაწილები',
            wideRange: 'ყველა მარკის მანქანისთვის',
            goToCatalog: 'კატალოგში გადასვლა',
            productCategories: 'პროდუქციის კატეგორიები',
            oils: 'ზეთები და სითხეები',
            tools: 'ინსტრუმენტები',
            carBrands: 'მანქანები',
            windshields: 'ქარის აბზაცები',
            motorOil: 'ძრავის ზეთი 5W-30',
            filterSet: 'ფილტრების კომპლექტი',
            brakePads: 'სამუხრუჭე ბალიშები',
            addToCart: 'კალათაში დამატება',
            address: 'მისამართი',
            phone: 'ტელეფონი',
            email: 'ელ. ფოსტა',
            copyright: 'ყველა უფლება დაცულია.'
        },
        hy: {
            home: 'Գլխավոր',
            catalog: 'Կատալոգ',
            contact: 'Կապ',
            search: 'Որոնել ապրանքներ...',
            qualityParts: 'Որակյալ ավտոմոբիլային մասեր',
            wideRange: 'Բոլոր մակնիշների մեքենաների համար',
            goToCatalog: 'Անցնել կատալոգ',
            productCategories: 'Ապրանքների կատեգորիաներ',
            oils: 'Յուղեր և հեղուկներ',
            tools: 'Գործիքներ',
            carBrands: 'Մեքենաներ',
            windshields: 'Առջևի ապակիներ',
            motorOil: 'Շարժիչի յուղ 5W-30',
            filterSet: 'Զտիչների հավաքածու',
            brakePads: 'Արգելակի բարձիկներ',
            addToCart: 'Ավելացնել զամբյուղ',
            address: 'Հասցե',
            phone: 'Հեռախոս',
            email: 'Էլ. փոստ',
            copyright: 'Բոլոր իրավունքները պաշտպանված են.'
        }
    };

    // Function to update page content
    function updateContent(lang) {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang][key]) {
                if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                    element.placeholder = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });

        // Keep contact information in English
        const contactInfo = document.querySelectorAll('.contact-item a');
        contactInfo.forEach(info => {
            if (info.href.startsWith('mailto:')) {
                info.href = 'mailto:bengibaryan@gmail.com';
            } else if (info.href.startsWith('tel:')) {
                info.href = 'tel:+995568774667';
            }
        });

        // Keep address in English
        const addressLink = document.querySelector('a.address');
        if (addressLink) {
            addressLink.href = 'https://www.google.com/maps?q=7H7V+RV7, str. Freedom, Ninotsminda';
            addressLink.textContent = '7H7V+RV7, str. Freedom, Ninotsminda';
        }
    }

    // Handle language selection
    langLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            currentLang.textContent = lang.toUpperCase();
            localStorage.setItem('language', lang);
            updateContent(lang);
        });
    });

    // Initial content update
    updateContent(savedLang);

    // Initialize search when DOM is loaded
    initSearch();
});
