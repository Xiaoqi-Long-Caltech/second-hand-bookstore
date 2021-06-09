/**
 * Name: Xiaoqi Long
 * Date: Jun 8, 2021
 * This file contains various helper functions used in DOM manipulation
 * and API access.
 */


/**
* Checks the status of a fetch Response, returning the Response 
* object back for further processing if successful, otherwise 
* returns an Error that needs to be caught.
* @param {object} response - response with status to check for 
* success/error.
* @returns {object} - The Response object if successful, 
* otherwise an Error that needs to be caught.
*/
function checkStatus(response) {
  if (!response.ok) {
    throw Error("Error in request: " + response.statusText);
  }
  return response;
}


/**
* Handles an error during a fetch call chain (e.g. the request
* returns a non-200 error code, such as when the service is 
* down, or the network request didn't go through in the first 
* place). 
* Displays a user-friendly error message.
*/
function handleError(msg, container) {
  let message = gen("p");
  message.textContent = msg;
  container.appendChild(message);
}

/**
* Returns the element that has the input ID
* @param {string} id - element ID
* @return {object} DOM object associated with id.
*/
function id(id) {
  return document.getElementById(id);
}

/**
* Returns the array of elements that match the given CSS selector.
* @param {string} query - CSS query selector
* @returns {object[]} array of DOM objects matching the query.
*/
function qsa(query) {
  return document.querySelectorAll(query);
}

/**
* Returns the first element that matches the given CSS selector.
* @param {string} query - CSS query selector.
* @returns {object[]} array of DOM objects matching the query.
*/
function qs(query) {
  return document.querySelector(query);
}

/**
* Alias function for returning a DOM element represented by `el`.
* @param {String} el - String representation of DOM element, e.g. "p".
* @returns {DOMElement} - element corresponding to `el`
*/
function gen(el) {
  return document.createElement(el);
}