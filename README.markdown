# Tweet!
#### Put twitter on your website with tweet!, an unobtrusive javascript plugin for jquery.

## Demos & examples

See [tweet.seaofclouds.com](http://tweet.seaofclouds.com/), or the bundled `index.html` file.

## Source

[Download tarball](http://github.com/seaofclouds/tweet/tarball/master)

## Features

  * small size and fast download time
  * will not slow down or pause your page while tweets are loading
  * display up to 100 tweets, as permitted by the twitter search api
  * display tweets from a twitter search, or from your own feed
  * optional verb tense matching, for human readable tweets
  * optionally display your avatar
  * optionally display tweets from multiple accounts!
  * automatic linking of @replies to users’ twitter page
  * automatic linking of URLs
  * automatic linking of #hashtags, to a twitter search of all your tags
  * converts <3 to a css styleable ♥ (we ♥ hearts)
  * customize the style with your own stylesheet or with other jquery plugins
  * customize the layout with a user-defined temmplate function

## Usage

1. Get [JQuery](http://jquery.com/). In these examples, we use [Google's AJAX Libraries API](http://code.google.com/apis/ajaxlibs/).


2. include jQuery and jquery.tweet.js files in your template's `<head>`.

        &lt;script language="javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.1/jquery.min.js" type="text/javascript"&gt;&lt;/script&gt;
        &lt;script language="javascript" src="/tweet/jquery.tweet.js" type="text/javascript"&gt;&lt;/script&gt;

3. Also in &lt;head&gt;, Initialize tweet! on page load with your Username and other options

    &lt;script type='text/javascript'&gt;
        $(document).ready(function(){
            $(".tweet").tweet({
                join_text: "auto",
                avatar_size: 32,
                count: 3,
                auto_join_text_default: "we said,",
                auto_join_text_ed: "we",
                auto_join_text_ing: "we were",
                auto_join_text_reply: "we replied to",
                auto_join_text_url: "we were checking out",
                loading_text: "loading tweets..."
            });
        });
    &lt;/script&gt;

4. In &lt;body&gt;, include a placeholder for your tweets. They'll get loaded in via JSON. How fancy!

    &lt;div class="tweet"&gt;&lt;/div&gt;

5. Style with our stylesheet in &lt;head&gt;, or modify as you like!

    &lt;link href="jquery.tweet.css" media="all" rel="stylesheet" type="text/css"/&gt;


### Contribute

Bring your code slinging skills to Github and help us develop new features for tweet!

[Github project page](http://github.com/seaofclouds/tweet/)

    git clone git://github.com/seaofclouds/tweet.git

Report bugs at http://seaofclouds.lighthouseapp.com/projects/14179-tweet/overview

### Licensed under the MIT

[License text](http://www.opensource.org/licenses/mit-license.php)

If you like Tweet, check out Twoot!
Twoot is a miniature Twitter client based on Tweet that allows you to post tweets and see what your friends are up to. Thanks, Peter Krantz!