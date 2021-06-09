/**
 * @author June Kim
 * CS 101 Spring 2021
 * Date: June 2, 2021
 *
 * This is the contact.js script file for the contact.html page of Sunset Cocktails website.
 * The script sets up an event handler for the Contact Us form to be processed through the API.
 */

(function() {
    "use strict";

    const API_CONTACT_ENDPOINT = "contact/"


    /** This function sets up an event handler for the contact form submit button. */
    function init() {
        id("contact-form").addEventListener("submit", (e) => {
            e.preventDefault();
            submitRequest();
        })
    }

    async function submitRequest() {
        id("submit-response").innerHTML = "";

        let params = new FormData(id("contact-form"));

        try {
            let res = await fetch(API_CONTACT_ENDPOINT, { method: "POST", body : params });
            await checkStatus(res);

            let resText = gen("p");
            resText.textContent = await res.text();
            id("submit-response").appendChild(resText);
        }
        catch (err) {
            displayError(err.message, id("submit-response"));
        }
    }

    init();
})();
