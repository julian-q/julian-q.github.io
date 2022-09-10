$(function() {
    $("#banner").load("/components/banner.html");
    $("#nav").load("/components/nav.html");
    $("#content").load("content/index.html", renderMath);
})
