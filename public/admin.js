/**
 * Name: Xiaoqi Long
 * Date: Jun 8, 2021
 * This is the admin.js file that implements the behavior of admin.html. After populating
 * the page with the current posting submission information, it allows the admin decide
 * whether or not to add the submission to the public list of postings.  
 */

(function() {
  "use strict";
  const SUBS = "/submissions";
  const ADD = "/add";
  const DEL = "/del";

  /**
   * Populates the page with the submissions under review.
   */
  function init() {
    populateSubs();
  }

  /**
   * Populates the main section with all the submissions fetched from the server
   * that is ready for review. Displays an error message if necessary.
   */
  async function populateSubs() {
    let url = SUBS;
    try {
      let res = await fetch(url);
      await checkStatus(res);
      let subs = await res.json();
      populateItems(subs);
    }
    catch (err) {
      handleError(err.message, qs("main"));
    }
  }

  /**
   * Populates the main section with all the submissions, and adds an 'add' and a 
   * 'remove' button to each item that allows the admin to add the submission
   * to the public posting or remove the submission from the page and the server.
   * @param {Array} items -- JSON array of submissions. 
   */
  function populateItems(items) {
    let container = qs("main");
    container.innerHTML = "";
    for (let item of items) {
      let sub = gen("article");
      sub.classList.add("submission");

      let title = gen("h3");
      title.textContent = item.title;
      sub.appendChild(title);
      
      let author = gen("h2");
      author.textContent = item.author;
      sub.appendChild(author);
      
      let price = gen("p");
      price.textContent = `$${item.price}`;
      price.classList.add("price");
      sub.appendChild(price);

      let genre = gen("p");
      genre.textContent = `Genre: ${item.genre}`;
      sub.appendChild(genre);
      
      let publisher = gen("p");
      publisher.textContent = `Publisher: ${item.publisher}`;
      sub.appendChild(publisher);
      
      let description = gen("p");
      description.textContent = `Notes: ${item.descript}`;
      sub.appendChild(description);
      
      let condition = gen("p");
      condition.textContent = `Condition (from 1 oldest to 10 newest): ${item.cond}`;
      sub.appendChild(condition);

      let id = gen("p");
      id.textContent = item.sub_id;
      id.classList.add("hidden");
      sub.appendChild(id);

      let div = gen("div");
      sub.appendChild(div);

      let add = gen("button");
      add.textContent = "Add to Public";
      add.addEventListener("click", addToList);
      div.appendChild(add);

      let remove = gen("button");
      remove.textContent = "Remove";
      remove.addEventListener("click", removeSub);
      div.appendChild(remove);

      container.appendChild(sub);
    }
  }

  /**
   * This function is triggered when the add button is clicked. Adds the
   * submission to the public posting through the POST endpoint /add, and
   * displays a successful message (or an error message, if an error occurs)
   */
  async function addToList() {
    let sub = this.parentNode.parentNode;
    let sub_id = sub.querySelector(".hidden").textContent;
    try {
      let params = new FormData();
      params.append("subid", sub_id);
      let res = await fetch(ADD, { method: "POST", body: params });
      await checkStatus(res);
      let text = gen("p");
      text.textContent = await res.text();
      qs("main").appendChild(text);
      setTimeout(function() {
        qs("main").removeChild(text);
      }, 3000);
      qs("main").removeChild(sub);
    } catch (err) {
      handleError(err.message, qs("main"));
    }
  }

  /**
   * This function is triggered when the remove button is clicked. Deletes the
   * submission from the server through the POST endpoint /del, and deletes the
   * section containing the submission from the DOM. Displays a successful message
   * (or an error message).
   */
  async function removeSub() {
    let sub = this.parentNode.parentNode;
    let sub_id = sub.querySelector(".hidden").textContent;
    try {
      let params = new FormData();
      params.append("subid", sub_id);
      let res = await fetch(DEL, { method: "POST", body: params });
      await checkStatus(res);
      let text = gen("p");
      text.textContent = await res.text();
      qs("main").appendChild(text);
      setTimeout(function() {
        qs("main").removeChild(text);
      }, 3000);
      qs("main").removeChild(sub);
    } catch (err) {
      handleError(err.message, qs("main"));
    }
  }

  init();
})();
