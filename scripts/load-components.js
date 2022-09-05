$(function() {
    $.getScript("/sketches/content/040722/sketch.js")
    $("td.icon").load("/components/icon.html");
    $("td.banner").load("/components/banner.html");
    $("td.left-column").load("/components/left-column.html");
    $("div#footer").load("/components/footer.html");
    $("td.main-column").load("content/index.html", renderMath);
})
