(function($) {
  $.fn.tweet = function(o){
    var s = {
      username: "seaofclouds",   // [string]   required, unless you want to display our tweets. :)
      count: 1,                  // [integer]  how many tweets to display?
      intro_text: null,          // [string]   do you want text BEFORE your your tweets?
      outro_text: null,          // [string]   do you want text AFTER your tweets?
      join_text:  null,          // [string]   the text in between the date stamp and tweet
      loading:    null
    };
    if(o) $.extend(s, o);
    return this.each(function(){
      var list = $('<ul class="tweet_list">').appendTo(this);
      var url = 'http://twitter.com/status/user_timeline/'+s.username+'.json?count='+s.count+'&callback=?';
      var intro = '<p class="tweet_intro">'+s.intro_text+'</p>'
      var join = '<span class="tweet_join">'+s.join_text+'</span>'
      var outro = '<p class="tweet_outro">'+s.outro_text+'</p>'
      $.getJSON(url, function(data){
        if (s.intro_text) list.before(intro); 
        $.each(data, function(i, item) { 
          list.append('<li><a href="http://twitter.com/'+s.username+'/statuses/'+item.id+'" title="view tweet on twitter">'+relative_time(item.created_at)+'</a>'+ join + '<span class="tweet_text">' + item.text.linkify().linkuser().linktag() + '</span></li>');
        });
        $('.tweet_list li:odd').addClass('tweet_even');
        $('.tweet_list li:even').addClass('tweet_odd');
        $('.tweet_list li:first').addClass('tweet_first');
        $('.tweet_list li:last').addClass('tweet_last');
        if (s.outro_text) list.after(outro); 
      });
    });
  };
})(jQuery);

String.prototype.linkify = function() {
  return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+/, function(m) {
  return m.link(m);
  });
};
String.prototype.linkuser = function() {
  return this.replace(/[@]+[A-Za-z0-9-_]+/, function(u) {
    var username = u.replace("@","")
    return u.link("http://twitter.com/"+username);
  });
};
String.prototype.linktag = function() {
  return this.replace(/[#]+[A-Za-z0-9-_]+/, function(t) {
    var tag = t.replace("#","%23")
    return t.link("http://summize.com/search?q="+tag);
  });
};
function relative_time(time_value) {
  var values = time_value.split(" ");
  time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
  var parsed_date = Date.parse(time_value);
  var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
  var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
  delta = delta + (relative_to.getTimezoneOffset() * 60);
  if (delta < 60) {
    return 'less than a minute ago';
  } else if(delta < 120) {
    return 'about a minute ago';
  } else if(delta < (45*60)) {
    return (parseInt(delta / 60)).toString() + ' minutes ago';
  } else if(delta < (90*60)) {
    return 'about an hour ago';
  } else if(delta < (24*60*60)) {
    return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
  } else if(delta < (48*60*60)) {
    return '1 day ago';
  } else {
    return (parseInt(delta / 86400)).toString() + ' days ago';
  }
}