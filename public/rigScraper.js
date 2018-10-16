$(document).ready(function () {

    $("#scrape-btn").click(function (event) {
        event.preventDefault();
        $.get("/scrape")
            .then(function (data) {
                console.log(data);
                location.reload();
            })
    });

    $(".save-article-btn").click(function (event) {
        event.preventDefault();
        var id = $(this).data("id");
        console.log(id);
        $.post("/articles/save/" + id)
            .then(function (data) {
                console.log(data);
                location.reload();
            })
    });

});