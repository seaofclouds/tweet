(function($) {

  $.fn.tweet = function(o){
    var s = $.extend({
      username: null,                           // [string or array] required unless using the 'query' option; one or more twitter screen names
      list: null,                               // [string]   optional name of list belonging to username
      favorites: false,                         // [boolean]  display the user's favorites instead of his tweets
      query: null,                              // [string]   optional search query
      avatar_size: null,                        // [integer]  height and width of avatar if displayed (48px max)
      count: 3,                                 // [integer]  how many tweets to display?
      fetch: null,                              // [integer]  how many tweets to fetch via the API (set this higher than 'count' if using the 'filter' option)
      retweets: true,                           // [boolean]  whether to fetch (official) retweets (not supported in all display modes)
      intro_text: null,                         // [string]   do you want text BEFORE your your tweets?
      outro_text: null,                         // [string]   do you want text AFTER your tweets?
      join_text:  null,                         // [string]   optional text in between date and tweet, try setting to "auto"
      auto_join_text_default: "i said,",        // [string]   auto text for non verb: "i said" bullocks
      auto_join_text_ed: "i",                   // [string]   auto text for past tense: "i" surfed
      auto_join_text_ing: "i am",               // [string]   auto tense for present tense: "i was" surfing
      auto_join_text_reply: "i replied to",     // [string]   auto tense for replies: "i replied to" @someone "with"
      auto_join_text_url: "i was looking at",   // [string]   auto tense for urls: "i was looking at" http:...
      loading_text: null,                       // [string]   optional loading text, displayed while tweets load
      refresh_interval: null ,                  // [integer]  optional number of seconds after which to reload tweets
      twitter_url: "twitter.com",               // [string]   custom twitter url, if any (apigee, etc.)
      twitter_api_url: "api.twitter.com",       // [string]   custom twitter api url, if any (apigee, etc.)
      twitter_search_url: "search.twitter.com", // [string]   custom twitter search url, if any (apigee, etc.)
      template: "{avatar}{time}{join}{text}",   // [string or function] template used to construct each tweet <li> - see code for available vars
      comparator: function(tweet1, tweet2) {    // [function] comparator used to sort tweets (see Array.sort)
        return tweet2["tweet_time"] - tweet1["tweet_time"];
      },
      filter: function(tweet) {                 // [function] whether or not to include a particular tweet (be sure to also set 'fetch')
        return true;
      }
    }, o);

    $.fn.extend({
      linkUrl: function() {
        var returning = [];
        // See http://daringfireball.net/2010/07/improved_regex_for_matching_urls
        var regexp = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
        this.each(function() {
          returning.push(this.replace(regexp,
                                      function(match) {
                                        var url = (/^[a-z]+:/i).test(match) ? match : "http://"+match;
                                        return "<a href=\""+url+"\">"+match+"</a>";
                                      }));
        });
        return $(returning);
      },
      linkUser: function() {
        var returning = [];
        var regexp = /[\@]+(\w+)/gi;
        this.each(function() {
          returning.push(this.replace(regexp,"@<a href=\"http://"+s.twitter_url+"/$1\">$1</a>"));
        });
        return $(returning);
      },
      linkHash: function() {
        var returning = [];
        // Support various latin1 (\u00**) and arabic (\u06**) alphanumeric chars
        var regexp = /(?:^| )[\#]+([\w\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u00ff\u0600-\u06ff]+)/gi;
        var usercond = (s.username && s.username.length == 1) ? '&from='+s.username.join("%2BOR%2B") : '';
        this.each(function() {
          returning.push(this.replace(regexp, ' <a href="http://'+s.twitter_search_url+'/search?q=&tag=$1&lang=all'+usercond+'">#$1</a>'));
        });
        return $(returning);
      },
      capAwesome: function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(/\b(awesome)\b/gi, '<span class="awesome">$1</span>'));
        });
        return $(returning);
      },
      capEpic: function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(/\b(epic)\b/gi, '<span class="epic">$1</span>'));
        });
        return $(returning);
      },
      makeHeart: function() {
        var returning = [];
        this.each(function() {
          returning.push(this.replace(/(&lt;)+[3]/gi, "<tt class='heart'>&#x2665;</tt>"));
        });
        return $(returning);
      }
    });

    function parse_date(date_str) {
      // The non-search twitter APIs return inconsistently-formatted dates, which Date.parse
      // cannot handle in IE. We therefore perform the following transformation:
      // "Wed Apr 29 08:53:31 +0000 2009" => "Wed, Apr 29 2009 08:53:31 +0000"
      return Date.parse(date_str.replace(/^([a-z]{3})( [a-z]{3} \d\d?)(.*)( \d{4})$/i, '$1,$2$4$3'));
    }

    function relative_time(date) {
      var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
      var delta = parseInt((relative_to.getTime() - date) / 1000, 10);
      var r = '';
      if (delta < 60) {
        r = delta + ' seconds ago';
      } else if(delta < 120) {
        r = 'a minute ago';
      } else if(delta < (45*60)) {
        r = (parseInt(delta / 60, 10)).toString() + ' minutes ago';
      } else if(delta < (2*60*60)) {
        r = 'an hour ago';
      } else if(delta < (24*60*60)) {
        r = '' + (parseInt(delta / 3600, 10)).toString() + ' hours ago';
      } else if(delta < (48*60*60)) {
        r = 'a day ago';
      } else {
        r = (parseInt(delta / 86400, 10)).toString() + ' days ago';
      }
      return 'about ' + r;
    }

    function build_url() {
      var proto = ('https:' == document.location.protocol ? 'https:' : 'http:');
      var count = (s.fetch === null) ? s.count : s.fetch;
      if (s.list) {
        return proto+"//"+s.twitter_api_url+"/1/"+s.username[0]+"/lists/"+s.list+"/statuses.json?per_page="+count+"&callback=?";
      } else if (s.favorites) {
        return proto+"//"+s.twitter_api_url+"/favorites/"+s.username[0]+".json?count="+s.count+"&callback=?";
      } else if (s.query === null && s.username.length == 1) {
        return proto+'//'+s.twitter_api_url+'/1/statuses/user_timeline.json?screen_name='+s.username[0]+'&count='+count+(s.retweets ? '&include_rts=1' : '')+'&callback=?';
      } else {
        var query = (s.query || 'from:'+s.username.join(' OR from:'));
        return proto+'//'+s.twitter_search_url+'/search.json?&q='+encodeURIComponent(query)+'&rpp='+count+'&callback=?';
      }
    }

    return this.each(function(i, widget){
      var list = $('<ul class="tweet_list">').appendTo(widget);
      var intro = '<p class="tweet_intro">'+s.intro_text+'</p>';
      var outro = '<p class="tweet_outro">'+s.outro_text+'</p>';
      var loading = $('<p class="loading">'+s.loading_text+'</p>');

      if(s.username && typeof(s.username) == "string"){
        s.username = [s.username];
      }

      var expand_template = function(info) {
        if (typeof s.template === "string") {
          var result = s.template;
          for(var key in info) {
            var val = info[key];
            result = result.replace(new RegExp('{'+key+'}','g'), val === null ? '' : val);
          }
          return result;
        } else return s.template(info);
      };

      if (s.loading_text) $(widget).append(loading);
      $(widget).bind("load", function(){
        $.getJSON(build_url(), function(data){
          if (s.loading_text) loading.remove();
          if (s.intro_text) list.before(intro);
          list.empty();

          var tweets = $.map(data.results || data, function(item){
            var join_text = s.join_text;

            // auto join text based on verb tense and content
            if (s.join_text == "auto") {
              if (item.text.match(/^(@([A-Za-z0-9-_]+)) .*/i)) {
                join_text = s.auto_join_text_reply;
              } else if (item.text.match(/(^\w+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&\?\/.=]+) .*/i)) {
                join_text = s.auto_join_text_url;
              } else if (item.text.match(/^((\w+ed)|just) .*/im)) {
                join_text = s.auto_join_text_ed;
              } else if (item.text.match(/^(\w*ing) .*/i)) {
                join_text = s.auto_join_text_ing;
              } else {
                join_text = s.auto_join_text_default;
              }
            }

            // Basic building blocks for constructing tweet <li> using a template
            var screen_name = item.from_user || item.user.screen_name;
            var source = item.source;
            var user_url = "http://"+s.twitter_url+"/"+screen_name;
            var avatar_size = s.avatar_size;
            var avatar_url = item.profile_image_url || item.user.profile_image_url;
            var tweet_url = "http://"+s.twitter_url+"/"+screen_name+"/status/"+item.id_str;
            var retweet = (typeof(item.retweeted_status) != 'undefined');
            var retweeted_screen_name = retweet ? item.retweeted_status.user.screen_name : null;
            var tweet_time = parse_date(item.created_at);
            var tweet_relative_time = relative_time(tweet_time);
            var tweet_raw_text = retweet ? ('RT @'+retweeted_screen_name+' '+item.retweeted_status.text) : item.text; // avoid '...' in long retweets
            var tweet_text = $([tweet_raw_text]).linkUrl().linkUser().linkHash()[0];

            // Default spans, and pre-formatted blocks for common layouts
            var user = '<a class="tweet_user" href="'+user_url+'">'+screen_name+'</a>';
            var join = ((s.join_text) ? ('<span class="tweet_join"> '+join_text+' </span>') : ' ');
            var avatar = (avatar_size ?
                          ('<a class="tweet_avatar" href="'+user_url+'"><img src="'+avatar_url+
                           '" height="'+avatar_size+'" width="'+avatar_size+
                           '" alt="'+screen_name+'\'s avatar" title="'+screen_name+'\'s avatar" border="0"/></a>') : '');
            var time = '<span class="tweet_time"><a href="'+tweet_url+'" title="view tweet on twitter">'+tweet_relative_time+'</a></span>';
            var text = '<span class="tweet_text">'+$([tweet_text]).makeHeart().capAwesome().capEpic()[0]+ '</span>';

            return { item: item, // For advanced users who want to dig out other info
                     screen_name: screen_name,
                     user_url: user_url,
                     avatar_size: avatar_size,
                     avatar_url: avatar_url,
                     source: source,
                     tweet_url: tweet_url,
                     tweet_time: tweet_time,
                     tweet_relative_time: tweet_relative_time,
                     tweet_raw_text: tweet_raw_text,
                     tweet_text: tweet_text,
                     retweet: retweet,
                     retweeted_screen_name: retweeted_screen_name,
                     user: user,
                     join: join,
                     avatar: avatar,
                     time: time,
                     text: text
                   };
          });

          tweets = $.grep(tweets, s.filter).slice(0, s.count);
          list.append($.map(tweets.sort(s.comparator),
                            function(t) { return "<li>" + expand_template(t) + "</li>"; }).join('')).
              children('li:first').addClass('tweet_first').end().
              children('li:odd').addClass('tweet_even').end().
              children('li:even').addClass('tweet_odd');

          if (s.outro_text) list.after(outro);
          $(widget).trigger("loaded").trigger((tweets.length === 0 ? "empty" : "full"));
          if (s.refresh_interval) {
            window.setTimeout(function() { $(widget).trigger("load"); }, 1000 * s.refresh_interval);
          }
        });
      }).trigger("load");
    });
  };
})(jQuery);
