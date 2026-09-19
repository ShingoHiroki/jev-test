# Jev チェス観戦

TypeSafe の System One モデル **Jev** 同士でチェスを指させ、ひとつの画面で対局と判断時間を見るアプリです。

左が盤面、右が各手の判断時間です。白も黒も同じ Jev が、その局面の合法手から 1 手選びます。

## 動かし方

```bash
npm install
cp .env.example .env.local
```

`.env.local` に TypeSafe の API キーを入れてください。

```bash
TYPESAFE_API_KEY=your_key_here
```

キーは [TypeSafe のコンソール](https://console.typesafe.ai/settings/keys) で発行できます。TypeSafe キーが無い場合は `OPENROUTER_API_KEY` でも Jev を呼べます。

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

API キーが無いときも **デモエンジン** で画面の動きは確認できます。デモは Jev ではなく、合法手から簡易な優先度で指します。

## 画面

- **対局**: 盤面、手番、直前の手、いま考えている側
- **判断時間**: 各手の所要時間の棒グラフ、白/黒の平均、スコアシート

Jev の判断時間は API 呼び出しにかかった時間です。観戦しやすくするため、手と手のあいだに待ち時間を入れられます。この待ち時間は判断時間には含みません。

## 仕組み

毎手サーバーが合法手を集め、Jev の Choice に UCI を渡します。Jev は確率つきで 1 手を返し、それを盤に反映します。Choice は最大 255 手までです。

## スクリプト

```bash
npm test
npm run lint
npm run build
```
