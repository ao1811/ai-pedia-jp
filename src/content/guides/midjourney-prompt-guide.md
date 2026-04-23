---
title: "Midjourney v7 プロンプト教科書｜プロ級画像を生成する構文・パラメータ完全網羅"
description: "Midjourney v7 を徹底的に使いこなすためのプロンプトテクニック集。基本構文から Style Reference、Character Reference、パラメータまで、プロのクリエイターが使う全技を公開します。"
publishedAt: 2026-03-30
updatedAt: 2026-04-20
category: howto
heroEmoji: "🎨"
heroGradient: "from-pink-500 via-rose-500 to-red-500"
featured: false
relatedTools: ["midjourney", "chatgpt"]
readTimeMin: 10
tags: ["Midjourney", "プロンプト", "画像生成", "AIデザイン"]
amazonProducts: ["midjourney-basics", "prompt-midjourney-intro"]
tldr: "Midjourneyの基本構文は「被写体＋スタイル＋構図＋ライティング＋雰囲気＋パラメータ」。--ar / --v / --s / --sref / --cref の5大パラメータを押さえれば、プロ級の出力が安定して出せます。"
faq:
  - q: "Midjourney を使うのに Discord は必須？"
    a: "v7以降は Web 版がメイン。Discord は不要になりました。ブラウザから直接生成・管理できます。"
  - q: "Style Reference（--sref）はどう使う？"
    a: "既存画像の雰囲気だけ参照して新しい被写体を生成する機能。ブランド一貫性や連載作品のトーン統一に必須です。--sw 0〜1000 で参照強度を調整できます。"
  - q: "商用利用で気をつける点は？"
    a: "Basic プランは商用利用不可、Standard以上が必要。既存キャラ・実在人物の模倣は肖像権・商標権の侵害リスクがあるため避けてください。"
---

Midjourney v7 は現存する画像生成AIの中で**芸術性と一貫性で頭ひとつ抜けた**存在です。しかし、その真価を引き出すにはプロンプトの作法を知る必要があります。本記事では、プロのクリエイターが実践するテクニックを全公開します。

## プロンプトの基本構文

```
[被写体] + [スタイル] + [構図] + [ライティング] + [雰囲気] + パラメータ
```

### 具体例

```
a young Japanese woman reading a book in a cozy cafe,
watercolor style,
soft morning light,
shallow depth of field,
peaceful atmosphere,
--ar 16:9 --v 7
```

この5つのブロックを意識するだけで、**生成品質が倍増**します。

## 重要パラメータ

### `--ar`（アスペクト比）
- `--ar 1:1` 正方形（Instagram）
- `--ar 16:9` 横長（YouTube サムネ）
- `--ar 9:16` 縦長（TikTok / Reels）
- `--ar 3:4` ポスター風

### `--v`（バージョン）
- `--v 7` 最新（写実・質感重視）
- `--v 6.1` アニメ系は良好
- `--niji 6` アニメ特化

### `--stylize` / `--s`
0〜1000 でアーティスティック度を調整：
- `--s 50` 忠実
- `--s 250`（デフォルト）バランス
- `--s 750` 自由度高

### `--chaos`
0〜100 で生成のバリエーション度：
- `--chaos 0` 安定した4候補
- `--chaos 50` 大胆なバリエーション
- `--chaos 100` カオス

## Style Reference（--sref）

**既存画像のスタイルだけ参照**して新しい被写体を生成：

```
a mountain landscape --sref https://example.com/style.jpg --sw 100
```

`--sw`（Style Weight）は 0〜1000。**1人のクリエイターで複数作品のトーン統一**に必須。

## Character Reference（--cref）

**キャラクターの一貫性**を保つ。シリーズ作品に最適：

```
a young wizard riding a dragon --cref https://example.com/character.jpg --cw 100
```

`--cw`（Character Weight）：
- `--cw 0` 顔だけ参照
- `--cw 100`（デフォルト）顔＋髪
- `--cw 200` 服装まで固定

## プロの構図テクニック

### 1. Rule of Thirds（三分割法）
```
rule of thirds composition, subject on left third
```

### 2. Leading Lines
```
leading lines drawing eye to subject
```

### 3. Symmetry
```
perfectly symmetrical composition, centered
```

### 4. Negative Space
```
generous negative space, minimalist composition
```

## ライティング用語集

プロンプトに入れると差がつく語彙：

- `golden hour lighting`（夕方の黄金光）
- `rim lighting`（輪郭光）
- `cinematic lighting`（映画的）
- `soft diffused lighting`（柔らかい拡散光）
- `dramatic chiaroscuro`（強烈な明暗）
- `studio lighting`（スタジオ照明）
- `neon glow`（ネオン発光）

## スタイル指定

### 写実系
- `photorealistic, 8K, hyperdetailed`
- `shot on Canon R5, 85mm lens, f/1.4`

### イラスト系
- `watercolor painting, wet on wet technique`
- `digital illustration, cel shaded`
- `oil painting, thick impasto texture`

### 日本特有
- `ukiyo-e style, Hokusai inspired`
- `anime style, studio Ghibli inspired`
- `sumi-e ink painting, minimal brush strokes`

## ネガティブプロンプト

`--no` で除外要素を指定：

```
a portrait --no text, watermark, ugly hands, blurry
```

よく使う除外：`text, watermark, logo, ugly, blurry, low quality, disfigured`

## 商用利用の注意点

### Standard プラン以上で商用利用可
Basic プランは商用利用不可。副業・ビジネスで使うなら必ず Standard 以上。

### Public / Private モード
Pro プランの Stealth Mode なら**画像が他ユーザーに公開されない**。競合にアイデアを盗まれない。

### 既存キャラ・実在人物
生成は可能だが、**商用使用は著作権・肖像権侵害リスク**。モチーフ程度に留めるのが安全。

## プロンプトテンプレート集

### 人物ポートレート（SNSアイコン）
```
a confident Japanese businesswoman,
soft studio lighting, shallow depth of field,
professional headshot style,
neutral background --ar 1:1 --s 200
```

### 風景（ブログアイキャッチ）
```
serene mountain landscape at sunrise,
golden hour lighting, mist in valley,
cinematic composition,
award-winning photography --ar 16:9 --s 250
```

### プロダクト
```
sleek minimalist product shot of [item],
clean white background,
soft diffused lighting,
commercial photography style --ar 4:5 --s 100
```

### イラスト（アニメ系）
```
a young girl walking through cherry blossoms,
soft watercolor anime style,
Makoto Shinkai inspired,
vibrant sky --niji 6 --ar 9:16
```

## 上達のコツ

1. **他人の優れた作品のプロンプトを研究**（Midjourney コミュニティで公開）
2. **同じ被写体を違うスタイルで10回生成**して感覚を掴む
3. **自分だけの Style Reference ライブラリを構築**
4. **失敗作のプロンプトも記録**して何を避けるべきかを学ぶ

## まとめ

- 基本構文：被写体＋スタイル＋構図＋ライティング＋雰囲気
- `--ar / --v / --s / --sref / --cref` の5大パラメータを押さえる
- ライティングとスタイルの語彙を増やす
- 商用利用は Standard 以上で

Midjourney を**ツール**から**相棒**に昇格させる、それがプロンプトの熟達です。
