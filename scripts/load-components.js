$(function() {
    $("div#nav").load("/components/nav.html");
    $("div#content").load("main.html", renderMath);
    $.get("main.md", function(data) {
        if (data.charAt(0) == '#') {
            let endOfTitle = data.indexOf('\n');
            let title = data.slice(2, endOfTitle);
            document.title = title;
        }
    }, 'text');
})
