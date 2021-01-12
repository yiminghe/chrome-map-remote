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

/***/ "./src/panel.js":
/*!**********************!*\
  !*** ./src/panel.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _constants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants */ "./src/constants.js");


function getRemotes(callback) {
  chrome.storage.local.get(['remotes', 'version'], (r) => {
    if (r.version !== _constants__WEBPACK_IMPORTED_MODULE_0__.VERSION) {
      callback([]);
    } else {
      callback(r.remotes || []);
    }
  });
}

function setRedirects(remotes) {
  chrome.storage.local.set({
    remotes,
    version: _constants__WEBPACK_IMPORTED_MODULE_0__.VERSION,
  });
}

function add() {
  var $from = $('#from');
  var $to = $('#to');
  const fromVal = $from.val().trim();
  const toVal = $to.val().trim();
  if (fromVal == '') {
    alert('Enter a from url pattern', 'error');
    return;
  }
  if (toVal == '') {
    alert('Enter a to url pattern', 'error');
    return;
  }
  try {
    new RegExp(fromVal);
  } catch (err) {
    alert('Error: ' + err, 'error');
    return;
  }
  getRemotes((remotes) => {
    remotes.push({ from: fromVal, to: toVal, enable: true });
    setRedirects(remotes);
    $from.val('');
    $to.val('');
    alert('MapRemote added.');
  });

}

function remove() {
  getRemotes((remotes) => {
    if (!remotes) {
      // something odd happened, trigger storage update.
      storageUpdate();
      return;
    }
    remotes.splice(this.value, 1);
    setRedirects(remotes);
    alert('MapRemote removed.');
  });
}

function saveItem(id, v) {
  getRemotes((remotes) => {
    if (!remotes) {
      storageUpdate();
      return;
    }
    id = parseInt(id);
    const r = remotes[id] = remotes[id] || {};
    Object.assign(r, v);
    setRedirects(remotes);
    alert('MapRemote edited.');
  });
}

function editHolder(fromInput, toInput) {
  return function edit() {
    const r = {};
    r.from = fromInput.val().trim();
    r.to = toInput.val().trim();
    saveItem(this.value, r);
  }
}

function alert(msg, type) {
  var $alert = $('#alert');
  var timeout;
  type = type || 'success'
  $alert.find('span.msg').html(msg);
  $alert.attr('class', 'alert fade in alert-' + type);
  $alert.show();
  clearTimeout(timeout);
  timeout = setTimeout(function () {
    $alert.slideUp();
  }, 3000);
}

function storageUpdate(remotes3) {
  let remotes;

  function doit() {
    {
      var $tbody = $('#remotes table tbody');
      $tbody.html('');
      $('#remotes').toggle(remotes.length > 0);
      for (var i = 0; i < remotes.length; i++) {
        addToTable(i, remotes[i]);
      }
    }
  }

  if (remotes3) {
    remotes = remotes3;
    doit();
  } else {
    getRemotes((remotes2) => {
      remotes = remotes2;
      doit();
    });
  }
}

function tmpl(id, context) {
  var tmpl = $('#' + id).html()
  for (var v in context) {
    var pattern = '{{' + v + '}}';
    while (tmpl.match(new RegExp(pattern))) {
      tmpl = tmpl.replace(pattern, context[v]);
    }
  }
  return $(tmpl);
}

function enable(e) {
  const { currentTarget } = e;
  const id = currentTarget.dataset.id;
  const data = {
    enable: currentTarget.checked,
  }
  saveItem(id, data);
}

function addToTable(id, data) {
  var $row = tmpl('table_row_tpl', {
    id,
    ...data,
  });
  $row.find('input.enable')[0].checked = data.enable;
  $row.find('input.enable').on('change', enable);
  $row.find('button.remove').on('click', remove);
  $row.find('button.edit').on('click', editHolder(
    $row.find('input.from'),
    $row.find('input.to'))
  );
  $row.appendTo($('#remotes table tbody'));

}


$(document).ready(function () {
  $('#add').on('click', add);
  $('#alert').alert();


  $('#start').on("click", () => {
    window.postMessage({
      action: 'start',
      source: 'map-remote-debug'
    }, '*');
  });
  $('#stop').on("click", () => {
    window.postMessage({
      action: 'stop',
      source: 'map-remote-debug'
    }, '*');
  });


  chrome.storage.onChanged.addListener((changes) => {
    if (changes.remotes) {
      storageUpdate(changes.remotes.newValue);
    }
  });

  storageUpdate();
});

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
/******/ 	__webpack_require__("./src/panel.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;