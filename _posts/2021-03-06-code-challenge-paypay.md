---
layout    : post
category  : レコ
title     : PayPay線上coding測驗
tags      : [interview, paypay]
date      : 2021-03-06 14:01:27 +8
published : true
lang      : zh-TW
---

線上登錄的第9天，經歷了第一階段書審日文履歷被拒、緊急生一張英文CV出來，PayPay面試正式來到第二階段：線上coding測驗。網路上沒看到太多關於PayPay面試題的討論，那就加減記錄一下。

<!--more-->

## Question 1 二進位加法

本次面試的題目共兩題。題目一的重點是二進位/十進位運算，因為向來不刷題所以難度不好量化，個人評估是吃基本功的入門等級。

題目要求從逗號分隔字串讀取兩個二進位數字，將其相加並以二進位形式印出來。程式樣板已經做好從stdin讀取字串的操作，所以只管做好字串剖析、轉換、計算和輸出就好。

輸入的字串格式形如`10010,1101001`，每一行是一組用逗號分隔的二進位數字，要做的事就是將`10010`和`1101001`相加並印出`1111011`。

```java
while ((line = in.readLine()) != null) {
  String[] inputs = line.split(",");
  int lvalue = Integer.valueOf(inputs[0], 2);
  int rvalue = Integer.valueOf(inputs[1], 2); 
  System.out.println(Integer.toBinaryString(lvalue+rvalue));
}
```

本題的時間限制是40分鐘。大約花15分鐘完成第一個版本，之後就開始往下挑戰[最少行數](https://ideone.com/b2jCgL)去了。

## Question 2 收銀機找零

題目二比較有意思，你的角色是收銀機，櫃台輸入應付金額和實收金額後，要計算需要找哪些面額給客戶。

這個題目有趣在於它可以很簡單假定所有面額都是無限供應，也可以複雜一點按面額庫存決定找錢方式，或是更深入考慮流通率去尋求零錢庫存可維持最久的找零方式。

| 面額        | 價值   |
| ----------- | ------ |
| PENNY       | .01    |
| NICKEL      | .05    |
| DIME        | .10    |
| QUARTER     | .25    |
| HALF DOLLAR | .50    |
| ONE         | 1.00   |
| TWO         | 2.00   |
| FIVE        | 5.00   |
| TEN         | 10.00  |
| TWENTY      | 20.00  |
| FIFTY       | 50.00  |
| ONE HUNDRED | 100.00 |

感謝PayPay選擇最簡單的題型，不然沒鑽研過演算法的我可要交白卷了。輸入的字串格式是以分號分隔的應收金額和實收金額，按字母排序以逗號分隔印出找給客戶的零錢面額。不找零印`ZERO`，不足額印`ERROR`。

面額名稱對應這種整個題組內不變的東西二話不說先寫到常數建檔，把特殊情況的`ZERO`和`ERROR`排除以後就可以開始算錢了。因為是無限供應，所以從大到小走一遍再印出來就完事了。

```java
while ((line = in.readLine()) != null) {
  double[] inputs = Stream.of(line.split(";")).mapToDouble(Double::valueOf).toArray();

  if (inputs[1] < inputs[0]) {
    System.out.println("ERROR");
    continue;
  } else if (inputs[1] == inputs[0]) {
    System.out.println("ZERO");
    continue;
  }

  Set<String> changes = new HashSet<>();
  double remains = inputs[1] - inputs[0];
  for (Double coin : coins.keySet()) {
    double newRemains = remains % coin;
    if (newRemains != remains) {
      remains = newRemains;
      changes.add(coins.get(coin));
    }
  }
  System.out.println(changes.stream().collect(Collectors.joining(",")));
}
```

大戰略的擬定沒什麼困難，反倒是排序的[實行](https://ideone.com/krBCRv)方面花了點時間。本題時限60分鐘，第一個完整版本大概用了45分鐘。

### 後記

PayPay的面試題其實不難，比較費時的地方反而是他的介面互動和編譯時間。這輪面試我是在星巴克用觸控板開記事本作答，如此湊合的環境都還有餘裕在時限內完成，換到工作環境用IDE下來寫應該只要不到原先時間的一半。

話說測驗說明要求選英文，不過這似乎只限題目內容，UI還是跟隨環境設定，為此我還找好久是哪邊選錯了囧。

看人家面試經驗的下一回合是視訊面試，現在專案趕死線正忙，這時間安排又要傷腦筋了。
