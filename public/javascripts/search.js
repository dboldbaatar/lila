$(function() {

  var $form = $("form.search");
  var $usernames = $form.find(".usernames input");
  var $userRows = $form.find(".user_row");
  var $result = $(".search_result");

  function realtimeResults() {
    $("div.search_status").text("Searching...");
    $result.load(
      $form.attr("action") + "?" + $form.serialize() + " .search_result", function(text, status) {
        if (status == "error") {
          $(".search_status").text("Something is wrong with the search engine!");
        } else {
          $('body').trigger('lichess.content_loaded');
          $result.find("a.permalink").each(function() {
            var $used = $form.find(":input").filter(function(){ return !!this.value; });
            $(this).attr("href", $(this).attr("href") + "?" + $used.serialize());
          });
          $result.find('.search_infinitescroll:has(.pager a)').each(function() {
            var $next = $(this).find(".pager a:last");
            $next.attr("href", $next.attr("href") + "&" + $form.serialize());
            $(this).infinitescroll({
              navSelector: ".pager",
              nextSelector: $next,
              itemSelector: ".search_infinitescroll .paginated_element",
              loading: {
                msgText: "",
                finishedMsg: "---"
              }
            }, function() {
              $("#infscr-loading").remove();
              $('body').trigger('lichess.content_loaded');
            });
          });
        }
      });
  }

  function userChoices(row) {
    var options = ["<option value=''></option>"];
    $usernames.each(function() {
      var user = $.trim($(this).val());
      if (user.length) {
        options.push("<option value='" + user + "'>" + user + "</option>");
      }
    });
    $(row).find('select').html(options.join(""));
    $(row).toggle(options.length > 1);
  }

  $form.find("select, input[type=checkbox]").change(realtimeResults);
  $usernames.bind("keyup", function() {
    $userRows.each(function() {
      userChoices(this);
    });
  }).trigger("keyup");
  $usernames.bindWithDelay("keyup", realtimeResults, 400);

  $form.find(".opponent select").change(function() {
    $form.find(".aiLevel").toggle($(this).val() == 1);
  }).trigger("change");
});

// https://github.com/bgrins/bindWithDelay/blob/master/bindWithDelay.js
$.fn.bindWithDelay = function(type, data, fn, timeout, throttle) {

  if ($.isFunction(data)) {
    throttle = timeout;
    timeout = fn;
    fn = data;
    data = undefined;
  }

  // Allow delayed function to be removed with fn in unbind function
  fn.guid = fn.guid || ($.guid && $.guid++);

  // Bind each separately so that each element has its own delay
  return this.each(function() {

    var wait = null;

    function cb() {
      var e = $.extend(true, {}, arguments[0]);
      var ctx = this;
      var throttler = function() {
        wait = null;
        fn.apply(ctx, [e]);
      };

      if (!throttle) {
        clearTimeout(wait);
        wait = null;
      }
      if (!wait) {
        wait = setTimeout(throttler, timeout);
      }
    }

    cb.guid = fn.guid;

    $(this).bind(type, data, cb);
  });
};
