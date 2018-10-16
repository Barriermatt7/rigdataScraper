$(document).ready(function () {
    $(".close").click(function () {
        $(this).parents(".modal").css("display", "none");
    });

    $("#clear-btn").click(function (event) {
        event.preventDefault();
        $.get("/clearall")
            .then(function (data) {
                console.log(data);
                location.reload();
            })
    });
});