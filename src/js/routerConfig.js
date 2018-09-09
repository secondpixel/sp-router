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
            title: "Installation",
            route: "/installation",
            template: "views/installation/installation.html"
        },
        {
            title: "Usage",
            route: "/usage",
            template: "views/usage/usage.html"
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
        },
        {
            title: "Additional",
            route: "/additional",
            template: "views/additional/additional.html"
        },
        {
            title: "Hashtag Escape",
            route: "/hashtag",
            template: "views/hashtag/hashtag.html"
        },
        {
            title: "Parameters",
            route: "/parameters",
            template: "views/parameters/parameters.html"
        }
    ],
    defaultRoute: "/",
    loader: {
        selector: ".progress",
        showHideClass: "d-none"
    },
    lazy: {
        loading: true,
        duration: 100
    }
});