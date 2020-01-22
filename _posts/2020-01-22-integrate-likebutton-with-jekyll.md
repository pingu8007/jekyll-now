---
layout    : post
category  : techshare
title     : 在Jekyll加入LikeButton賺錢錢
tags      : [likecoin, jekyll]
date      : 2020-01-22 11:40 +08
published : true
lang      : zh-TW
---

LikeCoin把文章轉為實質回饋的構想聽起來還不錯，但是官方的LikeButton說明要多不清楚就有多不清楚，對非支援平台也很不友善。  
咱就是孤僻、就是要自己來！這邊來聊聊怎麼把LikeButton整合到WordPress或Medium以外的其他網站。

<!--more-->

說來這篇應該是本blog開張以來第一篇以中文撰寫的文章。畢竟N2也不過是日本的小學生程度，想寫技術文章還是很有難度的。當然也想過要不要乾脆練英文，不過看看LikeCoin至今還沒走出亞州，寫英文大概更沒人看吧。

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
* `referrer={{ "/@ sse_-ts*</" | absolute_url | cgi_escape }}`

第一條沒難度，中間替換成自己的`liker_id`就好。
倒是第二條一堆%2F看著像編碼過的url，decode一下：

* `{{page.url | absolute_url}}`

得到了本文的url。至此，iframe的完整url結構揭曉：

```text
https://button.like.co/in/embed/{{"{{liker_id"}}}}/button?referrer={{"{{encoded_uri"}}}}
```

## 自動插入LikeButton

除非你打算對每一篇文章手動插iframe，不然只有url結構是沒用的。幸好在Jekyll插入iframe到每篇文章很簡單，只需要寫個LikeButton的片段再include到文章的樣板就好。

比較麻煩的地方是產生url。雖然這個url是作為該文章唯一識別符在使用，只要不跟別人重複就不會有事，不過因為LikeButton會從該url抓取標題所以也不太好隨便亂寫(點開會不知道like誰)。

要產生encoded_url用javascript是最方便的方法，不過都用Jekyll製作靜態網站了還回頭拜託javascript，這個靜態網站的意義就打折扣了。

## 寫在最後

[official-doc]: https://github.com/likecoin/LikeButton-integration/tree/master/web#2iframe
