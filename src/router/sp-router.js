/**
 * SPRouter
 * Easiest JavaScript router with ajax.
 * 
 * Released under the MIT license
 * 
 * Copyright: SecondPixel
 */

class SPRouter {
    constructor(params = {}) {

        this._body = document.querySelector("body");
        this._currentUrl = window.location.href,
        this._baseUrl = document.querySelector("meta[name='base_url']").content;
        this._routeDelimiter = "#";
        this._segmentSplitter = ":";
        this._slashDelimiter = "/";

        this._routes = params.routes;
        this._content = document.querySelector(params.content)
        this._defaultRoute = (Json.hasProps(params, "defaultRoute") ? params.defaultRoute : "/");
        this._hashtag = (typeof params.hashtag === "undefined" ? true : params.hashtag);

        this._contentLoadHide = true;

        if(params.loader){
            this._loader = {
                _loaderSelector: document.querySelector(params.loader.selector),
                _loaderShow: params.loader.showHideClass ? params.loader.showHideClass : null
            };
            this._contentLoadHide = (typeof params.loader.loadContentHide === "undefined" ? true : params.loader.loadContentHide);
        }

        if(params.lazy){
            this._lazy = {
                _loading: params.lazy.loading,
                _duration: params.lazy.duration ? params.lazy.duration : 500
            };
        }else {
            this._lazy = {
                _loading: false
            };
        }
        
        this._ajax = new Ajax();
        this._element = new Element(this);

        this.initRoute();
        this.initLinks();
    }

    getUrl(){
        return this._currentUrl;
    }

    getBaseUrl(){
        return this._baseUrl;
    }

    initRoute(){
        let currentRoute = this._currentUrl.replace(this._baseUrl, "");
        
        this._routeString = currentRoute != null && currentRoute != "" ? currentRoute : this._defaultRoute;
        this.setRoute(this._routeString, null);
    }

    setRoute(href, elem = null){
        let _router = this,
            cleanHref = _router._slashDelimiter +
                Helpers.characterCheckRemove(
                    Helpers.slashRemove(href),
                    _router._routeDelimiter
                ),
            routeToShow = (_router._hashtag ? _router._routeDelimiter + cleanHref : cleanHref);

        _router._route = _router.extractRoute(cleanHref);

        if(_router._route){
            _router._segmentsStorage = _router.extractSegments(href);

            _router.loader(true);
            this._ajax.getView(_router._route.template, function(res){
                _router._view = res;

                _router._content.innerHTML = _router._view;

                _router._element.scriptInit(_router._route.script);
                _router.initLinks();

                document.title = _router._route.title;
                window.history.pushState(
                    {
                        "html": _router._view,
                        "pageTitle": _router._route.title
                    },
                    "", 
                    _router._baseUrl + (cleanHref == "/" ? "" : routeToShow)
                );

                _router.loader(false);
            });
        }
        
        return false;
    }
    
    extractRoute(href){
        let selectedRoute = null;
            
        if(this._routes.length > 0){
            selectedRoute = this.findRoute(href);
            
            if(!selectedRoute){
                selectedRoute = this.findRoute(this._defaultRoute);
            }
            
            return selectedRoute;
        }else {
            throw new Error("Routes must be defined. Please define some routes.");
        }
    }

    findRoute(currentUrlRoute){
        let currentRouteFragments = this.decodeRoutes(currentUrlRoute);
        
        for(var i = 0; i < this._routes.length; i++){
            let route = this._routes[i],
                routeName = route.route,
                routeNumSegments = Helpers.numCharactes(routeName, this._segmentSplitter),
                routeFragments = this.decodeRoutes(routeName),
                routeNumFragments = routeFragments.length - routeNumSegments,
                defineFragments = this.routeDefiner(routeFragments);
            
            if(routeFragments.length == currentRouteFragments.length){
                let fragmentsPassed = 0;

                routeFragments.map((fragment, index) => {
                    let routeDefinition = defineFragments[index],
                        currentRouteFragment = currentRouteFragments[index];
                       
                    if(!routeDefinition && fragment == currentRouteFragment){
                        fragmentsPassed++;
                    }
                });

                if(routeNumFragments == fragmentsPassed){
                    return route;
                }
            }
        }

        return false;
    }

    decodeRoutes(currentUrlRoute){
        return currentUrlRoute.split("/").slice(1);
    }

    isSegment(string){
        return Helpers.characterCheck(string, this._segmentSplitter);
    }

    numSegments(route){
        return Helpers.numCharactes(route, this._segmentSplitter);
    }

    routeDefiner(routeFragments){
        let _router = this,
            definitions = {};
        
        routeFragments.map((fragment, index) => {
            if(_router.isSegment(fragment)){
                definitions[index] = true;
            }else {
                definitions[index] = false;
            }
        });
        
        return definitions;
    }

    extractSegments(routeString){
        let _router = this,
            _route = _router._route,
            _routeName = _route.route,
            currentRouteFragments = _router.decodeRoutes(routeString),
            routeFragments = _router.decodeRoutes(_routeName),
            internalSegmentsStorage = {};

        if(_router.numSegments(_routeName) > 0){
            routeFragments.map((fragment, index) => {
                let currentRouteFragment = currentRouteFragments[index];

                if(_router.isSegment(fragment)){
                    let segmentToFragment = fragment.replace(_router._segmentSplitter, "");

                    internalSegmentsStorage['"' + segmentToFragment + '"'] = currentRouteFragment;
                }
            });
        }

        return internalSegmentsStorage;
    }

    segment(name){
        return this._segmentsStorage['"' + name + '"'];
    }

    initLinks(){
        let _router = this,
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
    }

    clickEvent(e, elem){
        e.preventDefault();

        this.setRoute(
            elem.getAttribute("href"),
            elem
        );
    }

    loader(type){
        let _router = this,
            isClassEnabled = _router._loader._loaderShow ? true : false;
        
        if(!_router._lazy._loading || type){
            _router.loaderWorker(isClassEnabled, type);
        }else {
            setTimeout(function(){
                _router.loaderWorker(isClassEnabled, type);
            }, _router._lazy._duration);
        }
    }

    loaderWorker(isClassEnabled, type){
        switch(type){
            case true:
                    if(isClassEnabled){
                        this._loader._loaderSelector.classList.remove(this._loader._loaderShow);
                    }else {
                        if(this._contentLoadHide){
                            this._loader._loaderSelector.style.display = "block";
                        }
                    }

                    if(this._contentLoadHide){
                        this._content.style.display = "none";
                    }
                break;
            case false:
                    if(isClassEnabled){
                        this._loader._loaderSelector.classList.add(this._loader._loaderShow);
                    }else {
                        if(this._contentLoadHide){
                            this._loader._loaderSelector.style.display = "none";
                        }
                    }

                    if(this._contentLoadHide){
                        this._content.removeAttribute("style");
                    }
                break;
        }
    }
}

class Ajax {
    ajax(params = {}){
        let xhttp = new XMLHttpRequest(),
            send = null;

        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                params.success(xhttp.responseText);
            }
        };
        xhttp.open(params.type, params.url, (params.async ? params.async : true));

        if(params.type == "POST"){
            send = Json.sObject(params.data);
        }

        xhttp.send(send);
    }

    getView(url, fn){
        this.ajax({
            type: "GET",
            url: url,
            success: function(res){
                fn(res);
            }
        });
    }
}

class Json {
    static sObject(obj){
        let concatString = "";
        for (let key in obj) {
            if (concatString != "") {
                concatString += "&";
            }
            concatString += key + "=" + encodeURIComponent(obj[key]);
        }
        return concatString;
    }

    static hasProps(obj, prop){
        if(obj[prop] && obj[prop] != ""){
            return true;
        }
        return false;
    }
}

class Element {
    constructor(router){
        this._router = router;
    }

    scriptInit(file){
        let _router = this._router,
            scripts = document.querySelectorAll("script");
            
        scripts.forEach((elem) => {
            if(elem.getAttribute("src") == _router._ls){
                elem.parentNode.removeChild(elem);
            }
        });
        
        if(typeof file != "undefined"){
            _router._body.appendChild(this.createScript(file));
            _router._ls = file;
        }
    }

    createScript(src){
        let script = document.createElement("script");
        script.src = src;
        return script;
    }
}

class Helpers {
    static characterCheck(string, char){
        if (string.indexOf(char) > -1){
            return true;
        }
        return false;
    }

    static numCharactes(string, char){
        return ( string.match( RegExp(char,'g') ) || [] ).length;;
    }

    static characterCheckRemove(string, char){
        if(this.characterCheck(string, char)){
            string = string.replace(char, "");
        }
        return string;
    }

    static slashRemove(string){
        if(this.characterCheck(string, "/")){
            string = string.replace(/\//g, "");
        }
        return string;
    }
}