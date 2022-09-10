$(function() {
    $("#banner").load("/components/banner.html");
    $("#nav").load("/components/nav.html");
    $("#content").load("content/main.html", renderMath);
    $.get("content/main.md", function(data) {
        if (data.charAt(0) == '#') {
            let endOfTitle = data.indexOf('\n');
            let title = data.slice(2, endOfTitle);
            document.title = title;
        }
    }, 'text');
})
