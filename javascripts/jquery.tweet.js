(function($) {
  $.fn.tweet = function(o){
    var s = {
      username: "seaofclouds",   // [string]   required, unless you want to display our tweets. :)
      count: 1,                  // [integer]  how many tweets to display?
      intro_text: null,          // [string]   do you want text BEFORE your your tweets?
      outro_text: null,          // [string]   do you want text AFTER your tweets?
      join_text:  null           // [string]   the text in between the date stamp and tweet
    };
    
    function relative_time(time_value) {
      var parsed_date = Date.parse(time_value);
      var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
      var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
      if(delta < 60) {
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
    
    if(o) $.extend(s, o);
    return this.each(function(){
      var list = $('<ul class="tweet_list">').appendTo(this);
      var intro = '<p class="tweet_intro">'+s.intro_text+'</p>'
      var join = '<span class="tweet_join">'+s.join_text+'</span>'
      var outro = '<p class="tweet_outro">'+s.outro_text+'</p>'
      var url = 'http://search.twitter.com/search.json?q=from%3A'+s.username+'&rpp='+s.count+'&callback=?'
      
      $.getJSON(url,  function(data){
        if (s.intro_text) list.before(intro);
        $.each(data.results, function(i,item){
          list.append('<li><a href="http://twitter.com/'+s.username+'/statuses/'+item.id+'" title="view tweet on twitter">'+relative_time(item.created_at)+'</a>'+ ((s.join_text) ? join : ' ') + '<span class="tweet_text">' + item.text.replace(/(\w+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+)/gi, '<a href="$1">$1</a>').replace(/[\@]+([A-Za-z0-9-_]+)/gi, '<a href="http://twitter.com/$1">@$1</a>').replace(/[\#]+([A-Za-z0-9-_]+)/gi, '<a href="http://search.twitter.com/search?q=&tag=$1&lang=all&from='+s.username+'">#$1</a>').replace(/[&lt;]+[3]/gi, "<tt class='heart'>&#x2665;</tt>") + '</span></li>');
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