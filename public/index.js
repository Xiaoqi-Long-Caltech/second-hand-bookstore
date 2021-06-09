/**
 * Name: Xiaoqi Long
 * Date: Jun 7, 2021
 * This is the index.js file for my second-hand book website. It implements the behavior of
 * the index.html page, which populates the page with all the items in the store MySQL database,
 * allows the users to filter the books by genre, and add them to the cart. It also implements
 * the behavior of the cart view and the single product view.
 */

"use strict";
(function() {
  const POSTING = "/posting";
  const BOOKS = "/book";
  const FILTER = "/filter";
  const PURCHASE = "/purchase";

  /**
   * Populates the page with items from the store database, as well as the filter options.
   * Adds the event listeners for the back buttons and the cart view button.
   */
  function init() {
    populateAll();
    populateFilter();
    let backBtns = qsa(".back");
    for (let i = 0; i < backBtns.length; i++) {
      backBtns[i].addEventListener("click", backToMain);
    }
    id("cart-btn").addEventListener("click", showCart);
  }

  /*-------------------Functions that populate the filters sidebar---------------------- */

  /**
   * Populates the filter sidebar and populates the list of products according
   * to the selected filter
   */
  async function populateFilter() {
    let filters = await getFilters();
    let container = id("filter");

    for (let i = 0; i < filters.length; i++) {
      let choice = gen("div");
      choice.classList.add("filter-choice");

      let check = gen("input");
      check.type = "radio";
      check.name = "genres";
      check.value = filters[i];

      let label = gen("label");
      label.for = filters[i];
      label.textContent = filters[i];

      choice.appendChild(check);
      choice.appendChild(label);
      container.appendChild(choice);
    }
    let radios = qsa("#filter input[type='radio']");
    for (let radio of radios) {
      radio.addEventListener("click", populateAll);
    }
  }

  /**
   * Helper function that fetches a list of filters as JSON objects from the 
   * /book/filter GET endpoint
   * @return {Array} array of JSON objects of filters
   */
  async function getFilters() {
    try {
      let res = await fetch(BOOKS + FILTER);
      checkStatus(res)
      return await res.json();
    }
    catch (err) {
      handleError(err.message, id("filter"));
    }
  }

  /* ----------------Functions that populate the main / single view ----------------- */

  /**
   * Populates the products section with the information of all the products according
   * to the selected filter
   */
  async function populateAll() {
    let selectedGenre = qs("#filter input[type='radio']:checked").value;
    let url;
    if (selectedGenre === "all") {
      url = POSTING + "/all";
    } else {
      url = BOOKS + FILTER + "/" + selectedGenre;
    }
    console.log(url);
    try {
      let res = await fetch(url);
      await checkStatus(res);
      let items = await res.json();
      populateItems(items);
    }
    catch (err) {
      handleError(err.message, id("products"));
    }
  }

  /**
   * Populates the product section with the given items. Adds an event listener 
   * to each item that allows the user to see the single view upon clicking 
   * an item.
   * @param {Array} items -- JSON array of items to put into product section
   */
  function populateItems(items) {
    let container = id("products");
    container.innerHTML = "";
    console.log(items);
    for (let i = 0; i < items.length; i++) {
      let listing = gen("article");
      listing.classList.add("product");
      listing.addEventListener("click", () => { showSingle(items[i]); });

      addImage(items[i], listing);
      addItem(items[i], listing);

      container.appendChild(listing);
    }
  }

  /**
   * Triggered when an item in the main view is clicked. Hides the main view and 
   * displays the single view. Displays the image and other information of the clicked
   * item and adds an event listener to the add-cart button that allows the user
   * to add the selected item to the cart
   * @param {Object} item 
   */
  function showSingle(item) {
    let container = qs("#single-view > div");
    container.innerHTML = "";
    let msg = gen("p");
    try {
      addImage(item, container);
      let div = gen("div");
      container.appendChild(div);
      addItem(item, div);
      addDetails(item, div);
      div.appendChild(msg);
      // Clears the previous event listeners added to the button
      id("add-cart").replaceWith(id("add-cart").cloneNode(true));
      id("add-cart").addEventListener("click", () => { addCart(item.post_id, msg); });
    } catch(err) {
      handleError(err.message, container);
    }
    id("all-view").classList.add("hidden");
    id("single-view").classList.remove("hidden");
  }

  /*-------------------Event Listeners for view-toggling buttons-----------------*/

  /**
   * Triggered when the cart button is clicked. Hides the main view and displays the
   * cart view. 
   */
  function showCart() {
    id("all-view").classList.add("hidden");
    id("single-view").classList.add("hidden");
    id("cart-view").classList.remove("hidden");
  }

  /**
   * Hides the single view and the cart view; displays the main view
   */
  function backToMain() {
    id("all-view").classList.remove("hidden");
    id("single-view").classList.add("hidden");
    id("cart-view").classList.add("hidden");
  }

  /*-------------------Functions that implement cart behavior-------------------*/

  /**
   * Adds an item to the cart. If the item is already in cart, display a message
   * that informs the user and do nothing. If not, add the item to the cart by creating
   * a div container that contains the information. Update the total price of
   * the cart by adding the price of this item to the current total price of the
   * cart. If the current cart is empty, add a purchase button with an event 
   * listener that allows the user to buy the item. Add a remove button to the item in 
   * the cart with an event listener that allows the user to remove the item when clicked.
   * @param {*} itemId -- post id of item
   * @param {*} msgContainer -- container used to display successful / error messages
   */
  async function addCart(itemId, msgContainer) {
    let cart = id("cart");
    let totPrice = id("price-total");
    let totPriceVal = parseFloat(totPrice.textContent);

    try {
      let isInCart = checkItem(itemId, cart);
      if (isInCart) {
        msgContainer.textContent = "This item is already in the cart."
      } else {
        let div = gen("div");
        cart.appendChild(div);
        let item = await fetchItem(itemId);
        addImage(item, div);

        let info = gen("section");
        addItem(item, info);
        div.appendChild(info);

        let remove = gen("button");
        remove.textContent = "Remove From Cart";
        remove.addEventListener("click", removeFromCart);
        info.appendChild(remove);

        let price = parseFloat(item.price);
        let updatedTot = (price + totPriceVal).toFixed(2);
        totPrice.textContent = updatedTot;

        if (!document.body.contains(id("purchase")))  {
          let purchase = gen("button");
          purchase.textContent = "Checkout";
          purchase.id = "purchase";
          purchase.addEventListener("click", checkOut);
          id("order").appendChild(purchase);
        }

        msgContainer.textContent = "Item successfully added to cart!";
      }
    } catch (err) {
      handleError(err.message, msgContainer);
    }
  }

  /**
   * This function is triggered when the check out button is clicked. It uses
   * a POST request to decrement the stock of the purchased item in the server,
   * displays a message if successful, clears the cart, re-populates the main
   * view with the updated product table, resets the total monetary value of the
   * cart to zero, and removes the checkout button.
   * 
   * This function implements the chosen feature OPTION 2, along with the /purchase
   * POST endpoint.
   */
  async function checkOut() {
    let cart = id("cart");
    let ids = cart.querySelectorAll(".hidden");
    try {
      for (let id of ids) {
        let params = new FormData();
        params.append("postid", id.textContent);
        let res = await fetch(PURCHASE, { method: "POST", body: params });
        await checkStatus(res);
      }
      let msg = gen("p");
      msg.textContent = "You have successfully made the purchase!"
      id("order").appendChild(msg);
      clearCart();
      await populateAll();
      setTimeout(function() {
        id("order").removeChild(id("order").lastChild);
      }, 3000);
      let purchaseBtn = id("purchase");
      id("order").removeChild(purchaseBtn);
    } catch (err) {
      handleError(err.message, id("order"));
    }
  }

  /**
   * Helper function: check that the item does not already exist in the cart
   * @param {Integer} itemId -- post id of the item
   * @return {boolean} -- true if already in cart, false if not
   */
  function checkItem(itemId, cart) {
    let ids = cart.querySelectorAll(".hidden");
    for (let id of ids) {
      if (itemId.toString() === id.textContent) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clears the cart by removing all the children from the #cart element.
   * Resets the total price to zero.
   */
  function clearCart() {
    let cart = id("cart");
    let totPrice = id("price-total");
    while (cart.firstChild) {
      cart.removeChild(cart.lastChild);
    }
    totPrice.textContent = "0";
  }

  /**
   * This function is triggered when a remove button is clicked.
   * Updates the total price by subtracting the removed item price from the current
   * total price.
   * Removes the child node containing the item from the #cart element.
   */
  function removeFromCart() {
    let item = this.parentNode;
    let totPrice = id("price-total");
    let totPriceVal = parseFloat(totPrice.textContent);
    let price = item.querySelector(".price").textContent.substring(1);
    let priceVal = parseFloat(price);
    let updatedTot = (totPriceVal - priceVal).toFixed(2);
    totPrice.textContent = updatedTot;
    id("cart").removeChild(item.parentNode);
  }

  /*-----------------Generic Helper Functions---------------*/

  /**
   * Adds the generic information of an item to the DOM, including title, author,
   * price, and a hidden id.
   * @param {Object} item -- the item to be added
   * @param {Object} container -- the container where the info is added
   */
  function addItem(item, container) {
    let title = gen("h3");
    title.textContent = item.title;
    container.appendChild(title);

    let author = gen("h2");
    author.textContent = item.author;
    container.appendChild(author);

    let price = gen("p");
    price.textContent = `$${item.price}`;
    price.classList.add("price");
    container.appendChild(price);

    let id = gen("p");
    id.textContent = item.post_id;
    id.classList.add("hidden");
    container.appendChild(id);
  }

  /**
   * Adds the details of an item to the DOM, including genre, publisher,
   * description, and condition.
   * @param {Object} item -- the item to be added
   * @param {Object} container -- the container where the item is added
   */
  function addDetails(item, container) {
    let genre = gen("p");
    genre.textContent = `Genre: ${item.genre}`;
    container.appendChild(genre);

    let publisher = gen("p");
    publisher.textContent = `Publisher: ${item.publisher}`;
    container.appendChild(publisher);

    let description = gen("p");
    description.textContent = `Notes: ${item.descript}`;
    container.appendChild(description);

    let condition = gen("p");
    condition.textContent = `Condition (from 1 oldest to 10 newest): ${item.cond}`;
    container.appendChild(condition);
  }

  /**
   * Adds the image of an item to the DOM
   * @param {Object} item -- the item whose image is to be added
   * @param {Object} container -- the container where the image is added
   */
  function addImage(item, container) {
    let img = gen("img");
    img.src = item.img_path;
    img.alt = item.title;
    container.appendChild(img);
  }

  /**
   * Fetches the JSON object of an item through the posting/:id GET
   * endpoint.
   * @param {Integer} itemId -- id of the posting
   * @return {Object} -- JSON object of the item
   */
  async function fetchItem(itemId) {
    let url = POSTING + "/" + itemId;
    let res = await fetch(url);
    checkStatus(res);
    res = await res.json();
    let item = res[0];
    return item;
  }

  init();
})();
