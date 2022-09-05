$(function() {
    $("td.icon").load("/components/icon.html");
    $("td.banner").load("/components/banner.html");
    $("td.left-column").load("/components/left-column.html");
    let r = Math.floor(Math.random() * 127) + 128;
    let g = Math.floor(Math.random() * 127) + 128;
    let b = Math.floor(Math.random() * 127) + 128;
    $("td.left-column").css("background-color", "rgb(" + r + ", " + g + ", " + b + ")");
    $("div#footer").load("/components/footer.html");
    $("td.main-column").load("content/index.html", renderMath);
})
