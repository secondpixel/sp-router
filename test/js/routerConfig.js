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
        }
    ],
    defaultRoute: "/",
    loader: {
        selector: ".progress",
        showClass: "d-none",
    },
    lazy: {
        loading: true,
        duration: 100
    }
});