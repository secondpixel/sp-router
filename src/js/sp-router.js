"use strict";

var SPRouter = (function(){
    return {
        _body: document.querySelector("body"),
        _params: {},
        _content: null,
        _routes: [],
        _defaultRoute: null,
        _currentUrl: window.location.href,
        _baseUrl: document.querySelector("meta[name='base_url']").content,
        _routeString: null,
        _route: null,
        _view: null,
        _ls: null,
        _routeDelimiter: "#",
        _segmentSplitter: ":",
        _segmentsStorage: {},
        _loader: {},
        create: function(params = {}){
            var _router = this;

            _router._params = params;
            _router._routes = params.routes;
            _router._content = document.querySelector(params.content)
            _router._defaultRoute = (_router.hasProps(params, "defaultRoute") ? params.defaultRoute : "/");

            if(params.loader){
                _router._loader = {
                    _loaderSelector: document.querySelector(params.loader.selector),
                    _loaderShow: params.loader.showClass ? params.loader.showClass : null
                };
            }
            
            _router.initRoute();
            _router.initLinks();

            return _router;
        },
        getUrl: function(){
            return this._currentUrl;
        },
        getBaseUrl: function(){
            return this._baseUrl;
        },
        initRoute: function(){
            var _router = this,
                currentRoute = _router._currentUrl.replace(_router._baseUrl, "");
            
            _router._routeString = currentRoute != null && currentRoute != "" ? currentRoute : _router._defaultRoute;
            _router.setRoute(_router._routeString);
        },
        setRoute: function(href){
            var _router = this,
                cleanHref = _router.characterCheckRemove(href, _router._routeDelimiter);
                _router._route = _router.extractRoute(cleanHref);

            if(_router._route){
                _router._segmentsStorage = _router.extractSegments(href);

                _router.loader(true);

                _router.getView(_router._route.template, function(res){
                    _router._view = res;

                    _router._content.innerHTML = _router._view;

                    _router.scriptInit(_router._route.script);
                    _router.initLinks();

                    document.title = _router._route.title;
                    window.history.pushState(
                        {
                            "html": _router._view,
                            "pageTitle": _router._route.title
                        },
                        "", 
                        _router._baseUrl + (cleanHref == "/" ? "" : _router._routeDelimiter + cleanHref)
                    );

                    _router.loader(false);
                });
            }
            
            return false;
        },
        getView: function(url, fn){
            var _router = this;
            _router.ajax({
                type: "GET",
                url: url,
                success: function(res){
                    fn(res);
                }
            });
        },
        extractRoute: function(href){
            var _router = this,
                selectedRoute = null;
                
            if(_router._routes.length > 0){
                selectedRoute = _router.findRoute(href);
                
                if(!selectedRoute){
                    selectedRoute = _router.findRoute(_router._defaultRoute);
                }

                return selectedRoute;
            }else {
                throw new Error("Routes must be defined. Please define some routes.");
            }
        },
        ajax: function(params = {}){
            var _router = this,
                xhttp = new XMLHttpRequest(),
                send = null;

            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    params.success(xhttp.responseText);
                }
            };
            xhttp.open(params.type, params.url, (params.async ? params.async : true));

            if(params.type == "POST"){
                send = _router.sObject(params.data);
            }

            xhttp.send(send);
        },
        scriptInit: function(file){
            var _router = this,
                scripts = document.querySelectorAll("script");

            scripts.forEach(function(elem){
                if(elem.getAttribute("src") == _router._ls){
                    elem.parentNode.removeChild(elem);
                }
            });

            _router._body.appendChild(_router.createScript(file));
            _router._ls = file;
        },
        createScript: function(src){
            var script = document.createElement("script");
            script.src = src;
            return script;
        },
        characterCheck: function(string, char){
            if (string.indexOf(char) > -1){
                return true;
            }
            return false;
        },
        numCharactes: function(string, char){
            return ( string.match( RegExp(char,'g') ) || [] ).length;;
        },
        characterCheckRemove: function(string, char){
            var _router = this;
            if(_router.characterCheck(string, char)){
                string = string.replace(char, "");
            }
            return string;
        },
        hasProps: function(obj, prop){
            if(obj[prop] && obj[prop] != ""){
                return true;
            }
            return false;
        },
        sObject: function(obj){
            var concatString = "";
            for (var key in obj) {
                if (concatString != "") {
                    concatString += "&";
                }
                concatString += key + "=" + encodeURIComponent(obj[key]);
            }
            return concatString;
        },
        findRoute: function(currentUrlRoute){
            var _router = this,
                currentRouteFragments = _router.decodeRoutes(currentUrlRoute);
            
            for(var i = 0; i < _router._routes.length; i++){
                var route = _router._routes[i],
                    routeName = route.route,
                    routeNumSegments = _router.numCharactes(routeName, ":"),
                    routeFragments = _router.decodeRoutes(routeName),
                    routeNumFragments = routeFragments.length - routeNumSegments,
                    defineFragments = _router.routeDefiner(routeFragments);
                
                if(routeFragments.length == currentRouteFragments.length){
                    var fragmentsPassed = 0;

                    for(var rf = 0; rf < routeFragments.length; rf++){
                        var routeFragment = routeFragments[rf],
                            routeDefinition = defineFragments[rf],
                            currentRouteFragment = currentRouteFragments[rf];
                           
                        if(!routeDefinition && routeFragment == currentRouteFragment){
                            fragmentsPassed++;
                        }
                    }

                    if(routeNumFragments == fragmentsPassed){
                        return route;
                    }
                }
            }

            return false;
        },
        decodeRoutes: function(currentUrlRoute){
            return currentUrlRoute.split("/").slice(1);
        },
        isSegment: function(string){
            var _router = this;
            return _router.characterCheck(string, _router._segmentSplitter);
        },
        numSegments: function(route){
            var _router = this;
            return _router.numCharactes(route, _router._segmentSplitter);
        },
        routeDefiner: function(routeFragments){
            var _router = this,
                definitions = {};
                
            for(var x = 0; x < routeFragments.length; x++){
                var fragment = routeFragments[x];

                if(_router.isSegment(fragment)){
                    definitions[x] = true;
                }else {
                    definitions[x] = false;
                }
            }
            
            return definitions;
        },
        extractSegments: function(routeString){
            var _router = this,
                _route = _router._route,
                _routeName = _route.route,
                currentRouteFragments = _router.decodeRoutes(routeString),
                routeFragments = _router.decodeRoutes(_routeName),
                internalSegmentsStorage = {};

            if(_router.numSegments(_routeName) > 0){
                for(var s = 0; s < routeFragments.length; s++){
                    var fragment = routeFragments[s],
                        currentRouteFragment = currentRouteFragments[s];

                    if(_router.isSegment(fragment)){
                        var segmentToFragment = fragment.replace(_router._segmentSplitter, "");

                        internalSegmentsStorage['"' + segmentToFragment + '"'] = currentRouteFragment;
                    }
                }
            }

            return internalSegmentsStorage;
        },
        segment: function(name){
            var _router = this;
            return _router._segmentsStorage['"' + name + '"'];
        },
        initLinks: function(){
            var _router = this,
                allLinks = document.querySelectorAll("a");

            if(allLinks.length > 0){
                allLinks.forEach(function(elem){
                    if(!elem.onclick){
                        elem.onclick = function(e){
                            _router.clickEvent(e, this);
                        };
                    }
                });
            }
        },
        clickEvent: function(e, elem){
            var _router = this;

            _router.setRoute(
                elem.getAttribute("href")
            );
     
            e.stopPropagation();
            e.preventDefault();
            return false;
        },
        loader: function(type){
            var _router = this,
                isClassEnabled = false;

            if(_router._loader._loaderShow){
                isClassEnabled = true;
            }
            
            switch(type){
                case true:
                        if(isClassEnabled){
                            _router._loader._loaderSelector.classList.add(_router._loader._loaderShow);
                        }else {
                            _router._loader._loaderSelector.style.display = "block";
                        }

                        _router._content.style.display = "none";
                    break;
                case false:
                        if(isClassEnabled){
                            _router._loader._loaderSelector.classList.remove(_router._loader._loaderShow);
                        }else {
                            _router._loader._loaderSelector.style.display = "none";
                        }

                        _router._content.removeAttribute("style");
                    break;
            }
        }
    };
})();