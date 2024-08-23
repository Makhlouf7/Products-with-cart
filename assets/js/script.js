"use strict";
fetch("./data.json")
  .then((response) => response.json())
  .then((data) => {
    launchStore(data);
  })
  .catch((error) => console.error("error fetching data:", error));

function launchStore(data) {
  // add products from JSON to html file
  addProducts(data);
  // makeing an array to include all btns we need to give it eventListner
  let productBtns = document.querySelectorAll(
    ".card-image-add-to-cart, .card-product-decrease-btn, .card-product-increase-btn, .order-btn, .btn-new-order"
  );
  // adding eventListner to needed btns
  for (let i = 0; i < productBtns.length; i++) {
    productBtns[i].addEventListener("click", function () {
      let index = this.getAttribute("data-index"),
        itemQuantity = document.querySelector(
          `.card-product-counter[data-index='${index}']`
        );
      if (this.className === "card-image-add-to-cart") {
        itemQuantity.textContent = 1;
        addTocart(data, index);
      } else if (this.className === "card-product-decrease-btn") {
        decreaseQuantityItem(data, index);
      } else if (this.className === "card-product-increase-btn") {
        increaseQuantityItem(data, index);
      } else if (this.className === "order-btn") {
        orderConfirmed(data);
      } else if (this.className === "btn-new-order") {
        startNewOrder(data);
      }
      // keep tracking cart so we can update it if an item added, deleted, increased/decreased quantity
      trackingCart();
    });
  }
}
// start new order by removeing any eventLisners and reiniate items
function startNewOrder(data) {
  // definning needed elements
  let productsContainer = document.querySelector(".products-container"),
    orderConfirmedProductsContainer = document.querySelector(
      ".order-confirmed-products-container"
    ),
    orderConfirmedContainer = document.querySelector(
      ".order-confirmed-container"
    ),
    btnNewOrder = document.createElement("button"),
    orderBtn = document.createElement("div"),
    orderItems = document.querySelector(".shopping-cart .order-items"),
    cartItems = document.querySelector(".cart-items"),
    storeOrderConfirmed = document.querySelector(".store .order-confirmed");
  // remove receipt with a fading animation using jQuery
  $(storeOrderConfirmed).fadeOut(500);
  // removing and adding products again getting the case that JSON file has been updated
  productsContainer.innerHTML = "";
  orderConfirmedProductsContainer.innerHTML = "";
  cartItems.innerHTML = "";
  // removing buttons and adding them back to reset event listner
  orderConfirmedContainer.removeChild(document.querySelector(".btn-new-order"));
  orderItems.removeChild(document.querySelector(".order-btn"));
  btnNewOrder.className = "btn-new-order";
  btnNewOrder.textContent = "start new order";
  orderBtn.className = "order-btn";
  orderBtn.textContent = "confirm order";
  orderConfirmedContainer.appendChild(btnNewOrder);
  orderItems.appendChild(orderBtn);
  // after removing any eventListners and clearing items we launch the store
  launchStore(data);
}

function orderConfirmed(data) {
  // definning needed elementsd
  let cartItem = document.querySelectorAll(".cart-item"),
    orderConfirmedProductsContainer = document.querySelector(
      ".order-confirmed-products-container"
    ),
    orderTotalElement = document.querySelector(".cart-total-price-value"),
    storeOrderConfirmed = document.querySelector(".store .order-confirmed"),
    cartItemIndex = [];
  for (let i = 0; i < cartItem.length; i++) {
    cartItemIndex.push(cartItem[i].getAttribute("data-index"));
  }
  // show receipt with a fading animation using jQuery
  $(storeOrderConfirmed).fadeIn(500);
  // creating the item that will be added to the receipt
  for (let i = 0; i < cartItemIndex.length; i++) {
    // definning needed elements
    let orderConfirmedContainerItemsItem = document.createElement("div"),
      orderConfirmedImage = document.createElement("div"),
      orderProductImg = document.createElement("img"),
      orderProductText = document.createElement("div"),
      orderProductTitle = document.createElement("h3"),
      orderProductP = document.createElement("p"),
      quantityCounter = document.createElement("span"),
      orderProductTotal = document.createElement("div"),
      orderProductTotalPrice = document.createElement("span"),
      index = cartItemIndex[i],
      itemQuantity = document.querySelector(
        `.cart-item .quantity-counter[data-index='${index}']`
      ),
      itemCounter = itemQuantity.getAttribute("data-count");
    // assinning classes
    orderConfirmedContainerItemsItem.className =
      "order-confirmed-container-items-item";
    orderConfirmedImage.className = "order-confirmed-image";
    orderProductImg.className = "order-product-img";
    orderProductText.className = "order-product-text";
    orderProductTitle.className = "order-product-title";
    orderProductP.className = "order-product-p";
    quantityCounter.className = "quantity-counter";
    orderProductTotal.className = "order-product-total";
    orderProductTotalPrice.className = "order-product-total-price";
    // assinning attributes
    orderProductImg.src = data[index]["image"]["thumbnail"];
    // assinning text content
    orderProductTitle.textContent = data[index]["name"];
    quantityCounter.textContent = `${itemCounter}x`;
    orderProductTotalPrice.textContent = `$${(
      data[index]["price"] * itemCounter
    ).toFixed(2)}`;
    // appending childs
    orderConfirmedContainerItemsItem.appendChild(orderConfirmedImage);
    orderConfirmedContainerItemsItem.appendChild(orderProductTotal);
    orderConfirmedImage.appendChild(orderProductImg);
    orderConfirmedImage.appendChild(orderProductText);
    orderProductText.appendChild(orderProductTitle);
    orderProductText.appendChild(orderProductP);
    orderProductP.append(
      quantityCounter,
      `\u00A0\u00A0 @ $${data[index]["price"].toFixed(2)}\u00A0\u00A0`
    );
    orderProductTotal.appendChild(orderProductTotalPrice);
    orderConfirmedProductsContainer.appendChild(
      orderConfirmedContainerItemsItem
    );
  }
  // updating the receipt total price to equal the cart total price
  document.querySelector(".order-confirmed-total-price").textContent =
    orderTotalElement.textContent;
}
// track cart statue if item got added, deleted, updated, etc...
function trackingCart() {
  // definning needed elements
  let quantityCounterArr = document.querySelectorAll(
      ".cart-item .quantity-counter"
    ),
    quantityTotalArr = document.querySelectorAll(".cart-item .quantity-total"),
    cartCounterElement = document.querySelector(
      ".shopping-cart .cart-quantity"
    ),
    cartEmpty = document.querySelectorAll(".cart-empty"),
    orderItems = document.querySelector(".order-items"),
    orderTotalElement = document.querySelector(".cart-total-price-value"),
    orderTotal = 0,
    cartCounter = 0;
  // calculating the total receipt price by adding total price of each element
  for (let i = 0; i < quantityTotalArr.length; i++) {
    let price = quantityTotalArr[i].textContent;
    price = price.slice(1);
    orderTotal += Number(price);
  }
  // getting the quantity of each item to update cart counter
  for (let i = 0; i < quantityCounterArr.length; i++) {
    let quantity = Number(quantityCounterArr[i].getAttribute("data-count"));
    cartCounter += quantity;
  }

  if (cartCounter === 0) {
    // show the cart empty image and text
    for (let i = 0; i < cartEmpty.length; i++) {
      cartEmpty[i].classList.remove("hidden");
    }
    // show the active state of having items (order button, order total, text)
    orderItems.classList.add("hidden");
  } else {
    // remove the cart empty image and text
    for (let i = 0; i < cartEmpty.length; i++) {
      cartEmpty[i].classList.add("hidden");
    }
    // show the active state of having items (order button, order total, text)
    orderItems.classList.remove("hidden");
  }
  // assinning values
  orderTotal = orderTotal.toFixed(2);
  cartCounterElement.textContent = cartCounter;
  orderTotalElement.textContent = orderTotal;
}

// increase the quantity of product
function increaseQuantityItem(data, index) {
  // definning needed elements
  let quantityCounter = document.querySelector(
      `.quantity-counter[data-index='${index}']`
    ),
    counter = Number(quantityCounter.getAttribute("data-count")),
    itemQuantity = document.querySelector(
      `.card-product-counter[data-index='${index}']`
    ),
    quantityTotalPrice = document.querySelector(
      `.quantity-total[data-index='${index}']`
    ),
    price = data[index]["price"];
  counter++;
  // store the counter value in data-count attribute so we track it easily
  quantityCounter.setAttribute("data-count", counter);
  quantityCounter.textContent = `${counter}x`;
  itemQuantity.textContent = counter;
  quantityTotalPrice.textContent = `$${(counter * price).toFixed(2)}`;
}

// decrese the quantity of product and delete it from the cart if it reach zero
function decreaseQuantityItem(data, index) {
  // definning needed elements
  let quantityCounter = document.querySelector(
      `.quantity-counter[data-index='${index}']`
    ),
    counter = Number(quantityCounter.getAttribute("data-count")),
    itemQuantity = document.querySelector(
      `.card-product-counter[data-index='${index}']`
    ),
    quantityTotalPrice = document.querySelector(
      `.quantity-total[data-index='${index}']`
    ),
    price = data[index]["price"];
  // if user clicked the negative sign till zero item will be deleted otherwise decrease quantity
  if (counter - 1 === 0) {
    deleteCartItem(index);
  } else {
    counter--;
    quantityCounter.setAttribute("data-count", counter);
    quantityCounter.textContent = `${counter}x`;
    itemQuantity.textContent = counter;
    quantityTotalPrice.textContent = `$${(counter * price).toFixed(2)}`;
  }
}

// creating item, adding it to cart, giving it an eventListners to help deleteItem function
function addTocart(data, index) {
  // definning targeted elements
  let clickedAddToCartButton = document.querySelector(
      `.card-image-add-to-cart[data-index='${index}']`
    ),
    productQuantityElement = document.querySelector(
      `.card-product-quantity[data-index='${index}']`
    ),
    cardProductImage = document.querySelector(
      `.card-product-image[data-index='${index}']`
    );
  cardProductImage.classList.add("change-image-border");
  clickedAddToCartButton.classList.add("hidden");
  productQuantityElement.classList.remove("hidden");

  // definning needed elements
  let itemPrice = data[index]["price"],
    cartItem = document.createElement("div"),
    cardText = document.createElement("div"),
    deleteItem = document.createElement("div"),
    cartItemTitle = document.createElement("h3"),
    cartItemP = document.createElement("p"),
    quantityCounter = document.createElement("span"),
    quantityTotal = document.createElement("span"),
    removeIcon = document.createElement("img");
  // assinning classes
  cartItem.className = "cart-item";
  cardText.className = "card-text";
  deleteItem.className = "delete-item";
  cartItemTitle.className = "cart-item-title";
  cartItemP.className = "cart-item-p";
  quantityCounter.className = "quantity-counter";
  quantityTotal.className = "quantity-total";
  // assinning attributes
  removeIcon.src = "./assets/images/icon-remove-item.svg";
  cartItem.setAttribute("data-index", index);
  deleteItem.setAttribute("data-index", index);
  quantityTotal.setAttribute("data-index", index);
  quantityCounter.setAttribute("data-count", "1");
  quantityCounter.setAttribute("data-index", index);
  // assinning text values
  quantityCounter.textContent = "1x";
  cartItemTitle.textContent = data[index]["name"];
  quantityTotal.textContent = `$${itemPrice.toFixed(2)}`;
  // appending childs
  cartItem.appendChild(cardText);
  cartItem.appendChild(deleteItem);
  cardText.appendChild(cartItemTitle);
  cardText.appendChild(cartItemP);
  cartItemP.append(
    quantityCounter,
    `\u00A0\u00A0 @ $${itemPrice.toFixed(2)}\u00A0\u00A0`,
    quantityTotal
  );
  deleteItem.appendChild(removeIcon);
  // adding eventlistner to delete item icon in cart and tracking cart
  deleteItem.addEventListener("click", function () {
    deleteCartItem(this.getAttribute("data-index"));
    trackingCart();
  });

  document.querySelector(".cart-items").appendChild(cartItem);
}

// delete item from the cart
function deleteCartItem(index) {
  // definning needed elements
  let quantityCounter = document.querySelector(
      `.quantity-counter[data-index='${index}']`
    ),
    clickedAddToCartButton = document.querySelector(
      `.card-image-add-to-cart[data-index='${index}']`
    ),
    productQuantityElement = document.querySelector(
      `.card-product-quantity[data-index='${index}']`
    ),
    cartItems = document.querySelector(".cart-items"),
    item = document.querySelector(`.cart-item[data-index='${index}']`),
    cardProductImage = document.querySelector(
      `.card-product-image[data-index='${index}']`
    );
  cardProductImage.classList.remove("change-image-border");
  cartItems.removeChild(item);
  // removing the quantity element and getting the add to cart button of item back
  clickedAddToCartButton.classList.remove("hidden");
  productQuantityElement.classList.add("hidden");
  // reset the quantity counter of item
  quantityCounter.setAttribute("data-count", 1);
}

// adding products to the grid container
function addProducts(data) {
  let productsContainer = document.querySelector(".products-container");
  // add data to html products container
  for (let i = 0; i < data.length; i++) {
    // defining needed elements
    let card = document.createElement("div"),
      cardImage = document.createElement("div"),
      cardProductImage = document.createElement("img"),
      decreaseImage = document.createElement("img"),
      increaseImage = document.createElement("img"),
      addToCartImage = document.createElement("img"),
      cardProductQuantity = document.createElement("div"),
      cardProductDecreaseBtn = document.createElement("button"),
      cardProductIncreaseBtn = document.createElement("button"),
      cardImageAddToCart = document.createElement("button"),
      cardProductCounter = document.createElement("p"),
      addToCartP = document.createElement("p"),
      cardTitle = document.createElement("h3"),
      cardP = document.createElement("p"),
      cardPrice = document.createElement("p");
    // assigning class names
    card.className = "card";
    cardImage.className = "card-image";
    cardProductImage.className = "card-product-image";
    cardProductQuantity.className = "card-product-quantity hidden";
    cardProductDecreaseBtn.className = "card-product-decrease-btn";
    cardProductIncreaseBtn.className = "card-product-increase-btn";
    cardProductCounter.className = "card-product-counter";
    cardImageAddToCart.className = "card-image-add-to-cart";
    cardTitle.className = "card-title";
    cardP.className = "card-p";
    cardPrice.className = "card-price";
    // assinning attributes
    console.log(window.innerWidth);
    if (window.innerWidth > 1200) {
      cardProductImage.src = data[i]["image"]["desktop"];
    } else if (window.innerWidth > 580) {
      cardProductImage.src = data[i]["image"]["tablet"];
    } else {
      cardProductImage.src = data[i]["image"]["mobile"];
    }
    cardProductImage.setAttribute("data-index", `${i}`);
    cardProductQuantity.setAttribute("data-index", `${i}`);
    cardProductDecreaseBtn.setAttribute("data-index", `${i}`);
    cardProductIncreaseBtn.setAttribute("data-index", `${i}`);
    cardProductCounter.setAttribute("data-index", `${i}`);
    cardImageAddToCart.setAttribute("data-index", `${i}`);
    addToCartImage.src = "./assets/images/icon-add-to-cart.svg";
    decreaseImage.src = "./assets/images/icon-decrement-quantity.svg";
    increaseImage.src = "./assets/images/icon-increment-quantity.svg";
    // assinning text content
    addToCartP.textContent = "Add to Cart";
    cardTitle.textContent = data[i]["category"];
    cardP.textContent = data[i]["name"];
    cardPrice.textContent = `$${data[i]["price"].toFixed(2)}`;
    // appending childs

    card.appendChild(cardImage);
    cardImage.appendChild(cardProductImage);
    cardImage.appendChild(cardProductQuantity);
    cardProductQuantity.appendChild(cardProductDecreaseBtn);
    cardProductDecreaseBtn.appendChild(decreaseImage);
    cardProductQuantity.appendChild(cardProductCounter);
    cardProductQuantity.appendChild(cardProductIncreaseBtn);
    cardProductIncreaseBtn.appendChild(increaseImage);
    // /cardProductQuantity
    cardImage.appendChild(cardImageAddToCart);
    cardImageAddToCart.appendChild(addToCartImage);
    cardImageAddToCart.appendChild(addToCartP);
    // /cardImage
    card.appendChild(cardTitle);
    card.appendChild(cardP);
    card.appendChild(cardPrice);
    // /card
    productsContainer.appendChild(card);
  }
}
