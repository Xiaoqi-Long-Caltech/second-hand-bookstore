/**
 * Name: Xiaoqi Long
 * Date: Jun 8, 2021
 * This is the sell.js file that implements the behavior of sell.html. It allows
 * the user to submit their posting information through the POST endpoint /submission
 */

(function() {
  "use strict";
  const SELL = "/submission";

  /**
   * Adds the event listener to the submit button at the end of the sell-info form.
   * Submits a POST request to the server containing the information of the submission
   * upon clicking submit.
   */
  function init() {
    id("sell-info").addEventListener("submit", (e) => {
      e.preventDefault();
      submitForm();
    })
  }

  /**
   * Submits the information in the form to the POST endpoint.
   * Displays a message on the message section of the html page indicating success
   * or failure of submission.
   */
  async function submitForm() {
    id("message").innerHTML = "";
    let params = new FormData(id("sell-info"));

    try {
        let res = await fetch(SELL, { method: "POST", body: params });
        await checkStatus(res);
        let text = gen("p");
        text.textContent = await res.text();
        id("message").appendChild(text);
    } catch (err) {
        handleError(err.message, id("message"));
    }
  }

  init();
})();
