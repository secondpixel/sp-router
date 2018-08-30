(function(){
    var getId = Router.segment("productId"),
        getProductPlaceholder = document.querySelector(".product");

    getProductPlaceholder.innerHTML = getId;
})();