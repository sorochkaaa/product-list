const DEFAULT_NUMBER = 10; 
const API_URL = 'https://dummyjson.com/products?limit=0';

const listElement = document.querySelector('.list');
const descriptionElement = document.querySelector('.popup-description');


// Получение массива товаров
const addProducts = (products) => {
    for (let product of products) {
        listElement.innerHTML += `<li draggable="true" data-id="${product.id}" class="list-element">${product.title}</li>`;
    }
}

let allProducts;
(async () => {
    let response = await fetch(API_URL);
    allProducts = (await response.json()).products;
    addProducts(allProducts.slice(0, DEFAULT_NUMBER));
})()


// Логика перетаскивания элеметов списка
listElement.addEventListener('dragstart', (event) => {
    descriptionElement.style.visibility = 'hidden';
    event.target.classList.add('selected');
})

listElement.addEventListener('dragend', (event) => {
    event.target.classList.remove('selected');
});

listElement.addEventListener('dragover', (event) => {
    event.preventDefault();
    const selectedElement = listElement.querySelector('.selected');
    const currentElement = event.target;
    if (selectedElement == currentElement || !currentElement.classList.contains('list-element')) {
        return;
    }
    const nextElement = (currentElement === selectedElement.nextElementSibling) 
        ? currentElement.nextElementSibling 
        : currentElement;
    listElement.insertBefore(selectedElement, nextElement);
});

// Логика отображения всплывающего окна описания
let descriptionTimer = [];
const delay = 500; // Задержка перед появлением

listElement.addEventListener('mouseover', (event) => {
    const target = event.target;
    const elementId = target.dataset.id;
    if (!elementId) return;
    const product = allProducts.find(element => element.id == elementId);
    descriptionTimer.push(setTimeout(() => {
        const descriptionElement = document.querySelector('.popup-description');
        const imgElement = document.querySelector('.elem-img');
        const titleSpan = document.querySelector('.elem-title-span');
        const descriptionSpan = document.querySelector('.elem-description-span');
        const brandSpan = document.querySelector('.elem-brand-span');
        const priceSpan = document.querySelector('.elem-price-span');
        const stockSpan = document.querySelector('.elem-stock-span');

        imgElement.src = product.thumbnail;
        titleSpan.textContent = product.title || '-';
        descriptionSpan.textContent = product.description || '-';
        brandSpan.textContent = product.brand || '-';
        priceSpan.textContent = product.price || '-';
        stockSpan.textContent = product.stock || '-';
        imgElement.onload = () => {

            const targetCoords = target.getBoundingClientRect();
            const descriptionCoords = descriptionElement.getBoundingClientRect();
            const left = targetCoords.left + targetCoords.width;
            const clientHeight = document.documentElement.clientHeight;
            let top;
            descriptionElement.style.left = left + 'px';
            descriptionElement.style.top = targetCoords.top + window.pageYOffset + 'px';
            //Расположение всплывающего окна в зависимости от расположения элемента
            if (targetCoords.top < clientHeight * 1 / 3) {          // Если в верхней трети, то сверху
                top = targetCoords.top + window.pageYOffset;
            } else if (targetCoords.top < clientHeight * 2 / 3 ) {  // Если в центральной трети, то по центру 
                top = targetCoords.bottom + window.pageYOffset - targetCoords.height / 2 - descriptionCoords.height / 2;
            } else {                                                // Если в нижней трети, то снизу
                top = targetCoords.bottom + window.pageYOffset - descriptionCoords.height;
            }
            descriptionElement.style.top = top + 'px';
            descriptionElement.style.visibility = "visible";
        }
    }, delay));
});

listElement.addEventListener('mouseout', (event) => {
    clearInterval(descriptionTimer.pop());
    if (event.relatedTarget != descriptionElement) {
        descriptionElement.style.visibility = "hidden";
    }
});

descriptionElement.addEventListener('mouseleave', function() {
    this.style.visibility = "hidden";
});

// Логика сортировки товаров списка
const priceSortBtn = document.querySelector('.sort-price-btn');
const nameSortBtn = document.querySelector('.sort-name-btn');
const applyBtn = document.querySelector('.apply-btn');

priceSortBtn.addEventListener('click', function() {
    if (this.classList.contains('pressed-button')) {
        this.classList.remove('pressed-button');
        return;
    }
    this.classList.add('pressed-button');
    if (nameSortBtn.classList.contains('pressed-button')) {
        nameSortBtn.classList.remove('pressed-button');
    }
});
nameSortBtn.addEventListener('click', function() {
    if (this.classList.contains('pressed-button')) {
        this.classList.remove('pressed-button');
        return;
    }
    if (priceSortBtn.classList.contains('pressed-button')) {
        priceSortBtn.classList.remove('pressed-button');
    }
    this.classList.add('pressed-button');
})

applyBtn.addEventListener('click', () => {
    const errorDiv = document.querySelector('.products-number-error');
    errorDiv.hidden = true;
    let productNumber = +document.querySelector('.products-number-input').value;
    if (!productNumber) {
        errorDiv.textContent = "Incorrect number";
        errorDiv.hidden = false;
        return;
    }
    if (productNumber > allProducts.length) {
        productNumber = allProducts.length;
        errorDiv.textContent = "Too big number, max: " + allProducts.length;
        errorDiv.hidden = false;
    }

    let displayedProducts = allProducts.slice(0, productNumber);
    if (priceSortBtn.classList.contains('pressed-button')) {
        displayedProducts = numSort(displayedProducts, 'price');
    } else if (nameSortBtn.classList.contains('pressed-button')) {
        displayedProducts = alphabetSort(displayedProducts, 'title');
    }
    listElement.innerHTML = "";
    addProducts(displayedProducts);
});

//Сортировка массива объектов по численному полю
function numSort(objArray, field) {
    return [...objArray].sort((a, b) => +a[field] - +b[field]);
}

//Сортировка массива объектов по строковому полю
function alphabetSort(objArray, field) {
    return [...objArray].sort((a, b) => {
        if (a[field] < b[field]) {
            return -1;
          }
          if (a[field] > b[field]) {
            return 1;
          }
          return 0;
    });
}