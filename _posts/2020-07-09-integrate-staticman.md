---
layout    : post
category  : テク
title     : 用Staticman給網站加上評論機制
tags      : [staticman, jekyll]
date      : 2020-07-09 14:00:00 +8
published : true
lang      : zh-TW
---

不能張貼評論的Blog太過落伍？那就加一個上去唄。Staticman讓你的Git-based靜態網站也能寫感想，而且不必和第三方評論外掛妥協！

<!--more-->

早在本Blog開張之際就已經有開設評論區的念頭了，只是受限於靜態網站的先天不足，想實現評論區功能免不了要插一堆外掛，有違當初採用Jekyll建置的初衷而遲遲沒動。剛好最近工作懸缺還沒著落，正好來研究一些有的沒的功能，挑戰看看靜態網站的極限可以到哪邊。

## 方案比較

最常見的做法就是用CMS提供的評論機制，這應該是WordPress和Blogspot用戶最常見的作法。因為不能評論的CMS幾乎不存在，又CMS本身就有基本主機開銷，開啟評論功能的額外成本極低。而且主站和評論存在於同一套系統內，要備份還原要搬家遷移都方便。  
不過本站是採用Jekyll建立的靜態網站，所以CMS這種東西很遺憾是不存在的。

* Disqus

  內建評論以外最多人採用的方案。Disqus把安裝作業簡化到一行script標籤，不是開發者也能照著文件搞定。不過Disqus包山包海的一堆功能，龐大的library和衍生的載入延遲都會對靜態網站帶來顯著影響，這種犧牲體驗換取的功能肯定不能接受的。

* Facebook

  Facebook的追蹤器是有名的多，加上為了套取用戶個資各種不擇手段，連強逼用戶~~賣朋友~~找好友驗身這種事都做得出來，早早就上了我的黑名單。一個連帳號都砍光的東西，回鍋這種事打死都不會考慮。

* [Commento.io](https://commento.io/)

  Commento.io在首頁反覆強調他的隱私性，實際的使用體驗也十分良好，就是要架主機過於麻煩。

* [DiscussBot](https://comments.app/)

  DiscussBot是Telegram提供的評論系統。介面簡潔功能OK，但仰賴Telegram帳號讓我有疑慮，畢竟現在換手機號的成本早就和以前不可同日而語。

* 跳轉到SNS

  這是所有評論機制最意義不明的一個，不論在SEO方面還是網站經營方面都徹底的Out。

* Github Issue

  因為Github Pages/Gitlab Pages自帶支援Jekyll的關係，很多網站都直接搭在上面，發想拿issue系統來發評論也就不奇怪了。不過這涉及到API呼叫和OAuth，而且訪客必須要有帳號才能評論，日後也不好搬家，所以只能算免費方案的次選吧。

* [Staticman](https://staticman.net)

  同樣是以網站搭在Github/Gitlab之上為前提，每有新評論就建立一個data file並發commit/PR合併，讓Jekyll在建置過程把評論嵌到頁面之中。這個方式最大好處是除了commit/PR需要呼叫API以外，其他全部是標準Git流程，日後搬家或是在本地都可以完整重現，Github掛了(拜託不要)都不怕。  
  所有方案裡唯一顯示評論不用依賴外部服務的方案，這麼厲害就決定是你了

## 建立Staticman實例

決定採用Staticman之後就要想辦法整合進來。Staticman的官方文件建議把公開的bot添加為協作者，但是根據issue顯示這個bot因為各種問題早就停止服務了，使用者要自己開設實例才行。還好這個實例不需要太多資源，Heroku的免費方案就可以搞定。

Staticman提供了部屬到Heroku的功能，本文撰寫當下因為還欠幾個PR等待合併所以使用[`dev`分支](https://github.com/eduardoboucas/staticman/tree/dev)。點選部署到Heroku之後輸入App名稱並選擇地區，第一步驟就完成了。把部屬完成的App路徑(`APP_URL`)記下來，後續的參數設定和表單整合都還需要它。
![deploy_to_heroku](/assets/2020/0709-staticman/01.png "找到Deploy to Heroku大力給他按下去")
![app_config_01](/assets/2020/0709-staticman/02.png "挑一個漂亮的門牌開始部署")

## 註冊GitHub App

Staticman和Github連結有幾種方式，一種是`Personal Access Token`直接存取，另一種是註冊為GitHub App取得授權。第一種方式的教學很多請自行Google，這裡只介紹第二種方式。

先去到GitHub的[開發人員設定](https://github.com/settings/apps)，找到`New GitHub App`進去
![app_config_02](/assets/2020/0709-staticman/03.png "有沒有看見新增按鈕?")

必須欄位如下，其他選項自行斟酌：

* Register new GitHub App
  * GitHub App name: 應用程式名稱，這也是該App的Username
* Webhook
  * Active: PR關閉自動刪除分支，不使用可以不勾
  * Webhook URL: `https://APP_URL/v1/webhook`
* Repository permissions
  * Contents: 讀寫
  * Metadata: 只讀
  * Pull requests: 讀寫
* Subscribe to events
  * Pull request: 勾選

填好按`Create GitHub App`，成功跳轉後拉到最底下的Private keys，按`Generate a private key`產生應用程式密鑰。到此GitHub App註冊完成，把App ID和剛剛下載的密鑰備妥進下一步。

### 安裝到Repository

App需要被用戶授予存取權(安裝)之後才能建立Commit/PR，每個Repository要個別安裝。打開剛剛App設定畫面旁邊的`Public page`連結，點`Install`授權即可。

## 產生RSA密鑰

Staticman允許多人共用實例，為避免別人的密鑰暴露，各站台設定檔內的機密參數需要用RSA公鑰加密，為此需要給實例準備一把RSA私鑰。方法不拘，長度不限，格式可以是`pkcs1`(開頭為`'-----BEGIN RSA PRIVATE KEY-----'`)或`pkcs8`(開頭為`'-----BEGIN PRIVATE KEY-----'`)，把產生的密鑰備妥進下一步。

## 設定Staticman

接下來要設定Staticman實例，讓它可以行使前面賦予給GitHub App的職權。回到Heroku打開剛剛建立的App然後找到`Setting`標籤，在下方Config Vars區段點`Reveal Config Vars`打開環境變數設定。
![app_config_03](/assets/2020/0709-staticman/04.png "人家的環境變數不叫環境變數...")

變數名稱和值對應如下，注意別貼錯：

* GITHUB_APP_ID: GitHib App的App ID
* GITHUB_PRIVATE_KEY: 下載回來的GitHib App的密鑰
* RSA_PRIVATE_KEY: 自行產生的RSA密鑰

按Add會自動儲存，三個變數都填好之後打開APP_URL理應會出現歡迎訊息了
![app_config_04](/assets/2020/0709-staticman/05.png "定番的Hello World")

## 建立站台設定檔

Staticman會從Repository根目錄底下的`staticman.yml`讀取設定，完整說明可參考官方的`staticman.sample.yml`，這邊先只講必填欄位：

```yaml
comments: # 設定檔名稱，一個站台可以有多組設定檔
  allowedFields: ["name", "email", "url", "message"] # 可填寫的欄位
  branch: "master" # 通常是master，按實際狀況填寫
  filename: "entry{@timestamp}" # 檔案名
  path: "_data/comments/{options.slug}" # 檔案路徑，配合Jekyll的設定填寫
```

現在可以拿Postman測試API了，如果成功應該會看到Staticman**以GitHub App的名義**建立的PR，這是Personal Access Token所辦不到的(會顯示自己PR給自己)。

## 整合到網站layout

這邊開始就是各顯神通，底下僅羅列常用API和其用途，剩下建議直接看Staticman和別人網站的原始碼。Staticman的架設部分就到這邊為止，感謝收看。

* POST `APP_URL/v2/entry/{USERNAME}/{REPOSITORY}/{BRANCH}/{設定檔名稱}`: 張貼評論
* GET `APP_URL/v2/encrypt/{要RSA加密的資料}`: 工具API，用來加密給`staticman.yml`使用
* GET `APP_URL/v2/connect/{USERNAME}/{REPOSITORY}`: Personal Access Token方案專用，GitHub App**不需要**這個
