/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/constants.js":
/*!**************************!*\
  !*** ./src/constants.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VERSION": () => /* binding */ VERSION
/* harmony export */ });
const VERSION=1;

/***/ }),

/***/ "./src/devtools.js":
/*!*************************!*\
  !*** ./src/devtools.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.js");


chrome.devtools.panels.create("MapRemote",
  "",
  "../panel/panel.html",
  (panel) => {
    panel.onShown.addListener(pinTab);
  }
);

function getHeaderString(headers) {
  let responseHeader = '';
  headers.forEach((header, key) => {
    responseHeader += key + ':' + header + '\n';
  })
  return responseHeader;
}

async function fetchResource(url, headers, method, postData, success, error) {
  let finalResponse = {};
  let response = await fetch(url, {
    method,
    mode: 'cors',
    headers,
    redirect: 'follow',
    body: postData
  });
  finalResponse.response = await response.text();
  finalResponse.headers = getHeaderString(response.headers);
  if (response.ok) {
    success(finalResponse);
  } else {
    error(finalResponse);
  }
}

function getRemoteUrl(url, callback) {
  chrome.storage.local.get(['remotes', 'version'], (ret) => {
    if (ret.version !== _constants__WEBPACK_IMPORTED_MODULE_0__.VERSION) {
      return callback();
    }
    var pattern;
    var remotes = ret.remotes || [];
    for (var i = 0; i < remotes.length; i++) {
      const { from, to, enable } = remotes[i];
      if (!enable) {
        continue;
      }
      try {
        pattern = new RegExp(from, 'ig');
      } catch (err) {
        //bad pattern
        continue;
      }
      match = url.match(pattern);
      if (match) {
        return callback(url.replace(pattern, to));
      }
    }

    callback();
  });
}

function setupDebugger(target, panelWindow) {
  const debugee = { tabId: target.id };

  panelWindow.mapRemoteDebugee = debugee;

  chrome.debugger.attach(debugee, "1.0", () => {
    chrome.debugger.sendCommand(debugee, "Fetch.enable", { patterns: [{ urlPattern: '*' }] });
  });

  chrome.debugger.onEvent.addListener((source, method, params) => {
    var request = params.request;
    var continueParams = {
      requestId: params.requestId,
    };
    if (source.tabId === target.id) {
      if (method === "Fetch.requestPaused") {
        getRemoteUrl(request.url, (remoteUrl) => {
          if (remoteUrl) {
            fetchResource(remoteUrl, request.headers, request.method, request.postData, (data) => {
              continueParams.responseCode = 200;
              continueParams.binaryResponseHeaders = btoa(unescape(encodeURIComponent(data.headers.replace(/(?:\r\n|\r|\n)/g, '\0'))));
              continueParams.body = btoa(unescape(encodeURIComponent(data.response)));
              chrome.debugger.sendCommand(debugee, 'Fetch.fulfillRequest', continueParams);
            }, (status) => {
              chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', continueParams);
            });
            return;
          } else {
            chrome.debugger.sendCommand(debugee, 'Fetch.continueRequest', continueParams);
          }
        });
      }
    }
  });
}

function startMapRemote(panelWindow) {
  chrome.tabs.getSelected(null, (tab) => {
    setupDebugger(tab, panelWindow);
  });
}

function pinTab(panelWindow) {
  panelWindow.addEventListener('message', (event) => {
    if (event.source !== panelWindow) {
      return;
    }
    let message = event.data;
    if (message && message.source !== 'map-remote-debug') {
      return;
    }
    switch (message.action) {
      case 'start': {
        startMapRemote(panelWindow);
        break;
      }
      case 'stop': {
        chrome.debugger.detach(panelWindow.mapRemoteDebugee);
      }
    }
  })
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/devtools.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;