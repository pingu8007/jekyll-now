---
layout    : post
category  : フリートーク
title     : 解讀Apache Httpd的神祕錯誤訊息
tags      : []
date      : 2020-12-18 22:17:30 +8
published : true
image     : /assets/2020/2020-12-18-apache-error-message-thumb.jpg
has_thumb : true
excerpt   : <p>這不是Bitcoin錢包密鑰，也不是寶藏的暗號，而是Apache Httpd的死前訊息，aka加班宣言。</p>
lang      : zh-TW
---

> `\xa7\xe4\xa4\xa3\xa8\xec\xab\xfc\xa9w\xaa\xba\xbc\xd2\xb2\xd5\xa1C`

這不是Bitcoin錢包密鑰，也不是寶藏的暗號，而是Apache Httpd的死前訊息，aka加班宣言。

## 事件經過

事件發生在某個冬天的傍晚，當其他人已在等待下班的時候，我來到客戶現場準備進行升級作業。這本應是10分鐘可以結束的例行性工作。

![console_dump](/assets/2020/2020-12-18-apache-error-message.jpg "Apache Httpd錯誤提示")

```powershell
PS C:\temp\Apache24> .\bin\httpd.exe -v
Server version: Apache/2.4.46 (Win64)
Server built:   Dec  9 2020 10:17:06
PS C:\temp\Apache24> .\bin\httpd.exe
httpd.exe: Syntax error on line 181 of C:/temp/Apache24/conf/httpd.conf: Cannot load modules/mod_ssl.so into server: \xa7\xe4\xa4\xa3\xa8\xec\xab\xfc\xa9w\xaa\xba\xbc\xd2\xb2\xd5\xa1C
```

意外總是來得突然。案發現場十分乾淨，除了一行暗號以外什麼都沒有。這不是個好現象，尤其當你還正在客戶的生產環境作業的時候。

## 解析

解讀錯誤訊息是排除問題的第一步，然而這條錯誤訊息並不屬於任何一種已知語言。從週期出現的`\x`可以推測這訊息應該是某種編碼被錯誤轉換的結果。

由於客戶的系統環境是中文Windows，常見的編碼不外乎Big5、UTF-7/8/16/32、GB2312。先用Big5[解碼][hex-to-ascii]：

> 找不到指帚獐珩�

不錯的開始，但是堅持到一半就走樣了。仔細看看原始亂碼規律的`\x[0-9a-f]{2}`之中夾雜了不規則的字元`w,C`在裡面，參照ASCII table分別對應到`77,43`試試。

> \xa7\xe4\xa4\xa3\xa8\xec\xab\xfc\xa9\x77\xaa\xba\xbc\xd2\xb2\xd5\xa1\x43

然後再以Big5解碼：

> 找不到指定的模組。

Bingo，所以錯誤訊息是找不到模組，拆彈成功。

## 結論

雖然不清楚為什麼Apache Httpd要輸出錯誤訊息的Big5字碼，這大概又是被多位元組字元給坑了一把，錯把應該一起處理的位元組分開輸出，字碼中大多數的位元組又超出ascii範圍只能印出hex數字，只有`77`和`43`落在範圍內被印成ascii字元才造就這種混淆結果。

所以說沒錢就請乖乖用Linux，別打腫臉硬要買Windows Server然後跑一堆免費軟體！人家設想的環境本來就不一樣，浪費工程師的生命換來業績都不會感到良心不安嗎！

## 課後作業

> \xb1\xa1\xa8\xa6\xa9\xb3\xa1A\xa7\xda\xa6b\xb5\xb4\xa1C

請將上列文字還原，原文md5為`207c731aee6d62aefaca7c60cb99fefa`。

[hex-to-ascii]: https://www.rapidtables.com/convert/number/hex-to-ascii.html
