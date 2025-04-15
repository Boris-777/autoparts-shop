document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const suggestionsList = document.getElementById("suggestions");
    const products = document.querySelectorAll(".product");
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    const productNames = Array.from(products).map(product => product.dataset.name);

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        suggestionsList.innerHTML = "";
        
        if (query) {
            const filteredProducts = productNames.filter(name => name.toLowerCase().includes(query));
            if (filteredProducts.length > 0) {
                suggestionsList.style.display = "block";
                filteredProducts.forEach(product => {
                    const li = document.createElement("li");
                    li.textContent = product;
                    li.addEventListener("click", () => {
                        searchInput.value = product;
                        suggestionsList.innerHTML = "";
                        suggestionsList.style.display = "none";
                    });
                    suggestionsList.appendChild(li);
                });
            } else {
                suggestionsList.style.display = "none";
            }
        } else {
            suggestionsList.style.display = "none";
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target !== searchInput) {
            suggestionsList.style.display = "none";
        }
    });

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
            addToCart: 'В корзину',
            oils: 'Масла и жидкости',
            tools: 'Инструменты',
            copyright: 'Все права защищены.'
        },
        en: {
            home: 'Home',
            catalog: 'Catalog',
            contact: 'Contact',
            search: 'Search products...',
            addToCart: 'Add to Cart',
            oils: 'Oils and Fluids',
            tools: 'Tools',
            copyright: 'All rights reserved.'
        },
        ka: {
            home: 'მთავარი',
            catalog: 'კატალოგი',
            contact: 'კონტაქტი',
            search: 'პროდუქტების ძებნა...',
            addToCart: 'კალათაში',
            oils: 'ზეთები და სითხეები',
            tools: 'ინსტრუმენტები',
            copyright: 'ყველა უფლება დაცულია.'
        },
        hy: {
            home: 'Գլխավոր',
            catalog: 'Կատալոգ',
            contact: 'Կապ',
            search: 'Որոնել ապրանքներ...',
            addToCart: 'Ավելացնել զամբյուղ',
            oils: 'Յուղեր և հեղուկներ',
            tools: 'Գործիքներ',
            copyright: 'Բոլոր իրավունքները պաշտպանված են.'
        }
    };

    // Function to update page content
    function updateContent(lang) {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });

        // Update placeholders
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.placeholder = translations[lang].search;
        }

        // Update buttons
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.textContent = translations[lang].addToCart;
        });

        // Ensure URL and address stay in English
        const urlElements = document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]');
        urlElements.forEach(element => {
            if (element.href.startsWith('mailto:')) {
                element.href = 'mailto:bengibaryan@gmail.com';
            } else if (element.href.startsWith('tel:')) {
                element.href = 'tel:+995568774667';
            }
        });

        // Ensure address stays in English and link works
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
});
