/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => {
  // webpackBootstrap
  /******/ 'use strict';
  /******/ var __webpack_modules__ = {
    /***/ './src/client/games.ts':
      /*!*****************************!*\
  !*** ./src/client/games.ts ***!
  \*****************************/
      /***/ () => {
        eval(
          '\ndocument\n    .querySelector("")\n    .addEventListener("submit", (event) => {\n    event.preventDefault();\n    const form = event.target;\n    fetch(form.action, { method: "post" });\n});\nwindow.socket.on("thing", (thing) => {\n    console.log("Thing", thing);\n});\n\n\n//# sourceURL=webpack://uno-project/./src/client/games.ts?',
        );

        /***/
      },

    /******/
  };
  /************************************************************************/
  /******/
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ // This entry module can't be inlined because the eval devtool is used.
  /******/ var __webpack_exports__ = {};
  /******/ __webpack_modules__['./src/client/games.ts']();
  /******/
  /******/
})();
