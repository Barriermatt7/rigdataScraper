$(document).ready(function() {
  $(".remove-article-btn").click(function(event) {
    event.preventDefault();
    var id = $(this).data("id");
    console.log(id);
    $.post("/articles/remove/" + id).then(function(data) {
      console.log(data);
      location.reload();
    });
  });

  $(".note-modal-btn").click(function(event) {
    event.preventDefault();
    var thisid = $(this).data("id");
    $("#delete-note-btn").attr("data-id", thisid);
    $("#edit-note-btn").attr("data-id", thisid);
    $("#add-note-btn").attr("data-id", thisid);
    $("#notemodal").css("display", "block");
  });

  $("#add-note-btn").click(function(event) {
    event.preventDefault();
    var noteContent = {
      title: $("#title-input")
        .val()
        .trim(),
      body: $("#body-input")
        .val()
        .trim()
    };
    var id = $(this).data("id");
    console.log(noteContent);
    $.post("/notes/" + id, noteContent).then(function(data) {
      console.log(data);
      $("#title-input").val("");
      $("#body-input").val("");
      $("#notemodal").css("display", "none");
    });
  });

  $("#notes-holder").on("click", ".delete-note-btn", function(event) {
    event.preventDefault();
    var id = $(this).data("id");
    var self = $(this);
    console.log(id);
    $.post("/notes/delete/" + id).then(function(data) {
      console.log(data);
      if (data.message === "Note Deleted") {
        $(self)
          .parent()
          .parent()
          .remove();
      }
    });
  });

  $(".edit-note-btn").click(function(event) {
    event.preventDefault();
    var newNoteContent = {
      title: $("#title-input")
        .val()
        .trim(),
      body: $("#body-input")
        .val()
        .trim()
    };
    var id = $(this).data("id");
    console.log(id);
    $.post("/notes/edit" + id, newNoteContent).then(function(data) {
      console.log(data);
    });
  });

  $(".view-notes-btn").click(function(event) {
    event.preventDefault();
    var articleId = $(this).data("id");
    $.get("/articles/" + articleId).then(function(data) {
      $("#article-name").text(data.title);
      $("#notes-holder").empty();
      if (data.notes.length === 0) {
        var message = $("<p>");
        message.addClass("darker");
        message.text("There are no notes associated with this article.");
        var messageHolder = $("<div>");
        messageHolder.addClass("col-12");
        messageHolder.append(message);
        $("#notes-holder").append(messageHolder);
      } else {
        var notesCol = $("<div>");
        notesCol.addClass("col-12");
        for (let i = 0; i < data.notes.length; i++) {
          var thisNote = data.notes[i];
          console.log(thisNote);
          var noteBar = `<div class="row">
                                <div class = "col-10">
                                <h4 class="darker">${thisNote.title}</h4>
                                <p class="darker">${thisNote.body}</p>
                                </div>
                                <div class = "col-2">
                                <button class = "btn btn-green delete-note-btn" data-id = "${
                                  thisNote._id
                                }">&times;</button>
                                </div>
                            </div>`;
          notesCol.append(noteBar);
        }
        $("#notes-holder").append(notesCol);
      }
      $("#view-notes-modal").css("display", "block");
    });
  });
});
