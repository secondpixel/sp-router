"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * SPRouter
 * Easiest JavaScript router with ajax.
 * 
 * Released under the MIT license
 * 
 * Copyright: SecondPixel
 */

var SPRouter = function () {
    function SPRouter() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, SPRouter);

        this._body = document.querySelector("body");
        this._currentUrl = window.location.href, this._baseUrl = document.querySelector("meta[name='base_url']").content;
        this._routeDelimiter = "#";
        this._segmentSplitter = ":";

        this._params = params;
        this._routes = params.routes;
        this._content = document.querySelector(params.content);
        this._defaultRoute = Json.hasProps(params, "defaultRoute") ? params.defaultRoute : "/";

        if (params.loader) {
            this._loader = {
                _loaderSelector: document.querySelector(params.loader.selector),
                _loaderShow: params.loader.showClass ? params.loader.showClass : null
            };
        }

        if (params.lazy) {
            this._lazy = {
                _loading: params.lazy.loading,
                _duration: params.lazy.duration ? params.lazy.duration : 500
            };
        } else {
            this._lazy = {
                _loading: false
            };
        }

        this._ajax = new Ajax();
        this._element = new Element(this);

        this.initRoute();
        this.initLinks();
    }

    _createClass(SPRouter, [{
        key: "getUrl",
        value: function getUrl() {
            return this._currentUrl;
        }
    }, {
        key: "getBaseUrl",
        value: function getBaseUrl() {
            return this._baseUrl;
        }
    }, {
        key: "initRoute",
        value: function initRoute() {
            var currentRoute = this._currentUrl.replace(this._baseUrl, "");

            this._routeString = currentRoute != null && currentRoute != "" ? currentRoute : this._defaultRoute;
            this.setRoute(this._routeString, null);
        }
    }, {
        key: "setRoute",
        value: function setRoute(href) {
            var elem = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var _router = this,
                cleanHref = Helpers.characterCheckRemove(href, _router._routeDelimiter);
            _router._route = _router.extractRoute(cleanHref);

            if (_router._route) {
                _router._segmentsStorage = _router.extractSegments(href);

                _router.loader(true);
                this._ajax.getView(_router._route.template, function (res) {
                    _router._view = res;

                    _router._content.innerHTML = _router._view;

                    _router._element.scriptInit(_router._route.script);
                    _router.initLinks();

                    document.title = _router._route.title;
                    window.history.pushState({
                        "html": _router._view,
                        "pageTitle": _router._route.title
                    }, "", _router._baseUrl + (cleanHref == "/" ? "" : _router._routeDelimiter + cleanHref));

                    _router.loader(false);
                });
            }

            return false;
        }
    }, {
        key: "extractRoute",
        value: function extractRoute(href) {
            var selectedRoute = null;

            if (this._routes.length > 0) {
                selectedRoute = this.findRoute(href);

                if (!selectedRoute) {
                    selectedRoute = this.findRoute(this._defaultRoute);
                }

                return selectedRoute;
            } else {
                throw new Error("Routes must be defined. Please define some routes.");
            }
        }
    }, {
        key: "findRoute",
        value: function findRoute(currentUrlRoute) {
            var _this = this;

            var currentRouteFragments = this.decodeRoutes(currentUrlRoute);

            var _loop = function _loop() {
                var route = _this._routes[i],
                    routeName = route.route,
                    routeNumSegments = Helpers.numCharactes(routeName, _this._segmentSplitter),
                    routeFragments = _this.decodeRoutes(routeName),
                    routeNumFragments = routeFragments.length - routeNumSegments,
                    defineFragments = _this.routeDefiner(routeFragments);

                if (routeFragments.length == currentRouteFragments.length) {
                    var fragmentsPassed = 0;

                    routeFragments.map(function (fragment, index) {
                        var routeDefinition = defineFragments[index],
                            currentRouteFragment = currentRouteFragments[index];

                        if (!routeDefinition && fragment == currentRouteFragment) {
                            fragmentsPassed++;
                        }
                    });

                    if (routeNumFragments == fragmentsPassed) {
                        return {
                            v: route
                        };
                    }
                }
            };

            for (var i = 0; i < this._routes.length; i++) {
                var _ret = _loop();

                if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
            }

            return false;
        }
    }, {
        key: "decodeRoutes",
        value: function decodeRoutes(currentUrlRoute) {
            return currentUrlRoute.split("/").slice(1);
        }
    }, {
        key: "isSegment",
        value: function isSegment(string) {
            return Helpers.characterCheck(string, this._segmentSplitter);
        }
    }, {
        key: "numSegments",
        value: function numSegments(route) {
            return Helpers.numCharactes(route, this._segmentSplitter);
        }
    }, {
        key: "routeDefiner",
        value: function routeDefiner(routeFragments) {
            var _router = this,
                definitions = {};

            routeFragments.map(function (fragment, index) {
                if (_router.isSegment(fragment)) {
                    definitions[index] = true;
                } else {
                    definitions[index] = false;
                }
            });

            return definitions;
        }
    }, {
        key: "extractSegments",
        value: function extractSegments(routeString) {
            var _router = this,
                _route = _router._route,
                _routeName = _route.route,
                currentRouteFragments = _router.decodeRoutes(routeString),
                routeFragments = _router.decodeRoutes(_routeName),
                internalSegmentsStorage = {};

            if (_router.numSegments(_routeName) > 0) {
                routeFragments.map(function (fragment, index) {
                    var currentRouteFragment = currentRouteFragments[index];

                    if (_router.isSegment(fragment)) {
                        var segmentToFragment = fragment.replace(_router._segmentSplitter, "");

                        internalSegmentsStorage['"' + segmentToFragment + '"'] = currentRouteFragment;
                    }
                });
            }

            return internalSegmentsStorage;
        }
    }, {
        key: "segment",
        value: function segment(name) {
            return this._segmentsStorage['"' + name + '"'];
        }
    }, {
        key: "initLinks",
        value: function initLinks() {
            var _router = this,
                allLinks = document.querySelectorAll("a");

            if (allLinks.length > 0) {
                allLinks.forEach(function (elem) {
                    if (!elem.onclick) {
                        elem.onclick = function (e) {
                            _router.clickEvent(e, this);
                        };
                    }
                });
            }
        }
    }, {
        key: "clickEvent",
        value: function clickEvent(e, elem) {
            this.setRoute(elem.getAttribute("href"), elem);

            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    }, {
        key: "loader",
        value: function loader(type) {
            var _router = this,
                isClassEnabled = _router._loader._loaderShow ? true : false;

            if (!_router._lazy._loading || type) {
                _router.loaderWorker(isClassEnabled, type);
            } else {
                setTimeout(function () {
                    _router.loaderWorker(isClassEnabled, type);
                }, _router._lazy._duration);
            }
        }
    }, {
        key: "loaderWorker",
        value: function loaderWorker(isClassEnabled, type) {
            switch (type) {
                case true:
                    if (isClassEnabled) {
                        this._loader._loaderSelector.classList.remove(this._loader._loaderShow);
                    } else {
                        this._loader._loaderSelector.style.display = "block";
                    }

                    this._content.style.display = "none";
                    break;
                case false:
                    if (isClassEnabled) {
                        this._loader._loaderSelector.classList.add(this._loader._loaderShow);
                    } else {
                        this._loader._loaderSelector.style.display = "none";
                    }

                    this._content.removeAttribute("style");
                    break;
            }
        }
    }]);

    return SPRouter;
}();

var Ajax = function () {
    function Ajax() {
        _classCallCheck(this, Ajax);
    }

    _createClass(Ajax, [{
        key: "ajax",
        value: function ajax() {
            var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var xhttp = new XMLHttpRequest(),
                send = null;

            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    params.success(xhttp.responseText);
                }
            };
            xhttp.open(params.type, params.url, params.async ? params.async : true);

            if (params.type == "POST") {
                send = Json.sObject(params.data);
            }

            xhttp.send(send);
        }
    }, {
        key: "getView",
        value: function getView(url, fn) {
            this.ajax({
                type: "GET",
                url: url,
                success: function success(res) {
                    fn(res);
                }
            });
        }
    }]);

    return Ajax;
}();

var Json = function () {
    function Json() {
        _classCallCheck(this, Json);
    }

    _createClass(Json, null, [{
        key: "sObject",
        value: function sObject(obj) {
            var concatString = "";
            for (var key in obj) {
                if (concatString != "") {
                    concatString += "&";
                }
                concatString += key + "=" + encodeURIComponent(obj[key]);
            }
            return concatString;
        }
    }, {
        key: "hasProps",
        value: function hasProps(obj, prop) {
            if (obj[prop] && obj[prop] != "") {
                return true;
            }
            return false;
        }
    }]);

    return Json;
}();

var Element = function () {
    function Element(router) {
        _classCallCheck(this, Element);

        this._router = router;
    }

    _createClass(Element, [{
        key: "scriptInit",
        value: function scriptInit(file) {
            var _router = this._router,
                scripts = document.querySelectorAll("script");

            scripts.forEach(function (elem) {
                if (elem.getAttribute("src") == _router._ls) {
                    elem.parentNode.removeChild(elem);
                }
            });

            if (typeof file != "undefined") {
                _router._body.appendChild(this.createScript(file));
                _router._ls = file;
            }
        }
    }, {
        key: "createScript",
        value: function createScript(src) {
            var script = document.createElement("script");
            script.src = src;
            return script;
        }
    }]);

    return Element;
}();

var Helpers = function () {
    function Helpers() {
        _classCallCheck(this, Helpers);
    }

    _createClass(Helpers, null, [{
        key: "characterCheck",
        value: function characterCheck(string, char) {
            if (string.indexOf(char) > -1) {
                return true;
            }
            return false;
        }
    }, {
        key: "numCharactes",
        value: function numCharactes(string, char) {
            return (string.match(RegExp(char, 'g')) || []).length;;
        }
    }, {
        key: "characterCheckRemove",
        value: function characterCheckRemove(string, char) {
            if (this.characterCheck(string, char)) {
                string = string.replace(char, "");
            }
            return string;
        }
    }]);

    return Helpers;
}();