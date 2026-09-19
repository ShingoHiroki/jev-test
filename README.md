# Jev チェス観戦

TypeSafe の System One モデル **Jev** 同士でチェスを指させ、ひとつの画面で対局と判断時間を見るアプリです。

左が盤面、右が各手の判断時間です。白も黒も同じ Jev が、その局面の合法手から 1 手選びます。

## GitHub Pages（main を公開）

公開の元ブランチは **main** です。`main` への push で Actions が静的サイトを `docs/` に書き、GitHub Pages がそれを配信します。

初回だけリポジトリの **Settings → Pages** で次を選んでください。

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/docs**

公開 URL:

https://shingohiroki.github.io/jev-test/

`main` のルート（ソースコード）を直接 Pages にすると `.tsx` がそのまま出るので、必ず **/docs** を選んでください。

## Jev の API キーを GitHub シークレットに置く

Settings → Secrets and variables → Actions → **New repository secret**

| Name | 値 |
| --- | --- |
| `TYPESAFE_API_KEY` | TypeSafe で発行したキー |

このキーは **GitHub Pages 上では実行時に使えません。** Pages は HTML/JS を置くだけなので、隠したまま Jev を呼ぶサーバーがありません。キーを `NEXT_PUBLIC_` でフロントに埋め込むと、誰でもブラウザから盗めます。

Jev 対局を公開する手順:

1. GitHub シークレットに `TYPESAFE_API_KEY` を登録する（Actions の疎通確認に使う）
2. 同じリポジトリを [Vercel](https://vercel.com/new) に Import する（Hobby ならホスティング無料）
3. Vercel の Environment Variables にも **同じ名前・同じ値** で `TYPESAFE_API_KEY` を入れる
4. （任意）Pages のサイトから Vercel の API を使うなら、GitHub の Actions variables に `API_BASE=https://your-app.vercel.app` を追加する

1局の Jev API 代はだいたい **$0.001〜0.002** です。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ShingoHiroki/jev-test)

## 動かし方

```bash
npm install
cp .env.example .env.local
```

```bash
TYPESAFE_API_KEY=your_key_here
```

キーは [TypeSafe のコンソール](https://console.typesafe.ai/settings/keys) で発行できます。

```bash
npm run dev
```

http://localhost:3000

キーが無いときはデモエンジンで動きます。Pages の公開版も、Vercel を繋ぐまではデモです。

## 画面

- **対局**: 盤面、手番、直前の手、いま考えている側
- **判断時間**: 各手の所要時間の棒グラフ、白/黒の平均、スコアシート

## スクリプト

```bash
npm test
npm run lint
npm run build
```
