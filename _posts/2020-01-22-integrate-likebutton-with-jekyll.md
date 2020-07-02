---
layout    : post
category  : テク
title     : 給Jekyll加上LikeButton賺錢錢
tags      : [likecoin, jekyll]
date      : 2020-01-22 11:40 +08
published : true
lang      : zh-TW
---

LikeCoin把文章轉為實質回饋的構想聽起來還不錯，但是官方的LikeButton說明要多不清楚就有多不清楚，對非支援平台也很不友善。  
咱就是孤僻、就是要自己來！這邊來聊聊怎麼把LikeButton整合到WordPress或Medium以外的其他網站。

<!--more-->

說來這篇應該是本blog開張以來第一篇以中文撰寫的文章。畢竟N2在日本相當於小學生程度，想寫技術文章頗有難度。當然也想過要不要練英文，不過看看LikeCoin至今還沒走出亞州，估計寫英文更沒人會看。

回歸正題，今天的重點就是在Jekyll加上LikeButton。

## LikeButton怎麼工作的

稍微寫過網站的人大概都能看出，LikeButton的官方實作幾乎全靠iframe達成。簡單，粗暴...**才怪。這麼簡單怎還不直接把iframe的教學放出來。**

這一頁為例，打開DevTools可以完整的看到iframe標籤長這樣

```html
<iframe
  style="width: 100%; max-width: 485px; height: 220px; margin: auto; overflow: hidden; display: block;"
  src="https://button.like.co/in/embed/pingu8007/button?referrer={{ page.url | absolute_url | cgi_escape }}"
></iframe>
```

那堆`style`晚點再討論，先看看關鍵的`src`寫了些什麼

* `https://button.like.co/in/embed/{{site.liker_id}}/button?`
* `referrer={{ page.url | absolute_url | cgi_escape }}`

第一條沒難度，中間替換成自己的`liker_id`就好。
倒是第二條一堆%2F看著像編碼過的url，decode一下：

* `{{page.url | absolute_url}}`

得到了本文的url。至此，iframe的完整url結構揭曉

```text
https://button.like.co/in/embed/liker_id/button?referrer=encoded_uri
```

## 取得文章的專屬網址

除非你打算對每一篇文章手動插iframe，不然只有url結構是沒用的。

Jekyll要對文章插入iframe很簡單，寫個LikeButton的片段再include到文章的樣板就好，麻煩的是如何產生url。這個url作為文章的唯一識別符只要不重複就沒事，不過LikeButton會從該url抓取標題所以也不宜亂寫(點開會不知道剛剛like誰)。

要產生encoded_url用javascript是最方便的方法，不過既然用Jekyll製作網站當然要徹底善用，利用filter自動組合url。文件裡與url相關的filter有這些：

* `relative_url`
* `absolute_url`
* `cgi_escape`
* `uri_escape`
* `url_encode`
* `url_decode`
* `slugify`

`relative_url`、`url_decode`和`slugify`不符需求，`uri_escape`不編碼保留字也不行。
這邊用`absolute_url`和`cgi_escape`將原網址編碼，從`page.url`取得文章路徑經`absolute_url`轉為絕對路徑，再透過`cgi_escape`編碼，最後放進LikeButton的referrer裡頭就是iframe的src了。寫成liquid filter就是

```text
https://button.like.co/in/embed/{{site.liker_id}}/button?referrer={% raw %}{{ page.url | absolute_url | cgi_escape }}{% endraw %}
```

## 從_config.yml設定liker_id

雖然能產生網址了，但是硬編碼的`liker_id`實在難看。既然網站設定都寫在`_config.yml`，就一起宣告在這好了。

先在`_config.yml`加入`liker_id`鍵值，把自己的id填上。目前的LikeButton沒太多東西可以設定，所以設定好後應該會長這樣

```yaml

# Enter your Liker ID to enable LikeButton
liker_id: {{site.liker_id}}

```

宣告在`_config.yml`的變數可以從物件site取得，也就是`{{"{{site.liker_id"}}}}`，用這個tag替換掉寫死的id

```text
{% raw %}https://button.like.co/in/embed/{{site.liker_id}}/button?referrer={{ page.url | absolute_url | cgi_escape }}{% endraw %}
```

## 插入iframe

這是全篇最簡單的部分，先建立LikeButton的HTML片段

```html
{% raw %}{% if site.liker_id %}
<iframe
  src="https://button.like.co/in/embed/{{site.liker_id}}/button?referrer={{ page.url | absolute_url | cgi_escape }}">
</iframe>
{% endif %}{% endraw %}
```

用if檢查liker_id存在免得亂插一通。接著要在post樣板裡加入剛才的片段，找個接近區段結束的地方寫上{% raw %}`{% include likeco.html %}`{% endraw %}

建置一次，文章末端已經可以看到LikeButton了，不過這大小還要調整。LikeButton的元件會自行適應以維持長寬比，其長寬約為485px*240px，而且我要它置中自動縮放並隱藏卷軸

```html
{% raw %}{% if site.liker_id %}
<iframe
  style="width: 100%; max-width: 485px; height: 240px; margin: auto; overflow: hidden; display: block;"
  src="https://button.like.co/in/embed/{{site.liker_id}}/button?referrer={{ page.url | absolute_url | cgi_escape }}">
</iframe>
{% endif %}{% endraw %}
```

畢竟不是靠設計吃飯，這樣的效果已經十分滿意。

## 寫在最後

拉拉雜雜寫了一大堆只為了減少開啟網頁要執行的script數量，其實用javascript根本不需要這麼麻煩，直接取location叫用encodeURIComponent再動態插入iframe就行了。官方還提供[embed.ly的支援][embedly-preview]給已經整合Embedly的網站，只要一條連結直接完成嵌入。更多的文件都在官方的[GitHub][official-doc]裡，想折騰其他平台的自己去吧。

[embedly-preview]: https://embed.ly/code?url=https%3A%2F%2Fbutton.like.co%2Fpingu8007
[official-doc]: https://github.com/likecoin/LikeButton-integration/tree/master/web#2iframe
