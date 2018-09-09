$(document).ready(function(){

    var navLinksClass = ".nav-link",
        navItemClass = ".nav-item",
        navbarFactory = (function(){
            return {
                init: function(){
                    var _navbar = this,
                        allLinks = $(navLinksClass),
                        getCurrentRouteString = router._routeString,
                        regenerateRouteString = getCurrentRouteString != "/" ? getCurrentRouteString.replace("/", "") : "#/",
                        findCurrentLink = $("a[href='" + regenerateRouteString + "']");

                    allLinks.parent(navItemClass).removeClass("active");
                    findCurrentLink.parent().addClass("active");

                    $(document).on("click", navLinksClass, function () {
                        var $this =  $(this),
                            navItem = $this.parent();

                        allLinks.parent(navItemClass).removeClass("active");
                        navItem.addClass("active");
                    });
                }
            };
        })();

    navbarFactory.init();

});