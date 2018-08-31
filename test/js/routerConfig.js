var router = new SPRouter({
    content: "#app",
    routes: [
        {
            title: "Home",
            route: "/",
            template: "views/home/home.html",
            script: "views/home/home.js"
        },
        {
            title: "About",
            route: "/about",
            template: "views/about/about.html",
            script: "views/about/about.js"
        },
        {
            title: "Products",
            route: "/products",
            template: "views/products/products.html",
            script: "views/products/products.js"
        },
        {
            title: "Product",
            route: "/products/:productId/view",
            template: "views/products/product.html",
            script: "views/products/product.js"
        }
    ],
    defaultRoute: "/",
    loader: {
        selector: ".progress",
        showClass: "d-none",
    },
    lazy: {
        loading: true,
        duration: 500
    }
});