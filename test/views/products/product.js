(function(){
    var getId = router.segment("productId"),
        getProductPlaceholder = document.querySelector(".product");

    getProductPlaceholder.innerHTML = getId;
})();