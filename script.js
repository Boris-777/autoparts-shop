document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const suggestionsList = document.getElementById("suggestions");
    const products = document.querySelectorAll(".product");

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
});
