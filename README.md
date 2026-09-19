# Jev チェス観戦

TypeSafe の System One モデル **Jev** 同士でチェスを指させ、ひとつの画面で対局と判断時間を見るアプリです。

左が盤面、右が各手の判断時間です。白も黒も同じ Jev が、その局面の合法手から 1 手選びます。

## 無料で公開できるか

できます。ただし「何が無料か」が分かれます。

| もの | 料金 |
| --- | --- |
| サイトのホスティング | 無料。GitHub Pages（デモのみ）または [Vercel Hobby](https://vercel.com/pricing)（個人・非商用） |
| デモエンジンの対局 | 無料。ブラウザだけで動くので API キー不要 |
| 本物の Jev 対局 | ホスティングは無料。Jev API は従量課金で、だいたい **1局 $0.001〜0.002**（公式は入力 $0.042 / 1M tokens、出力無料） |

Jev に公式の無料枠はありません。公開サイトに自分の API キーを載せると、見ている人は無料で Jev 対局を観られます。払うのは公開している側で、個人で配る分にはほぼ誤差です。悪用されないよう、サーバー側で IP あたりの呼び出し回数を制限しています。

公開 URL（GitHub Pages）:

https://shingohiroki.github.io/jev-test/

初回だけリポジトリの **Settings → Pages** で次を選んでください。

- Source: **Deploy from a branch**
- Branch: **gh-pages** / **/(root)**

GitHub Actions が `gh-pages` ブランチへ静的サイトを出します。この設定のあとに公開 URL が開くようになります。

Vercel に出す場合は GitHub リポジトリを Import するだけで、Hobby プランならホスティングは無料です。本物の Jev にするときだけ `TYPESAFE_API_KEY` を Environment Variable に入れてください。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ShingoHiroki/jev-test)

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

API キーが無いときも **デモエンジン** で画面の動きは確認できます。デモは Jev ではなく、合法手から簡易な優先度で指します。GitHub Pages の公開版もこのデモです。

## 画面

- **対局**: 盤面、手番、直前の手、いま考えている側
- **判断時間**: 各手の所要時間の棒グラフ、白/黒の平均、スコアシート

Jev の判断時間は API 呼び出しにかかった時間です。観戦しやすくするため、手と手のあいだに待ち時間を入れられます。この待ち時間は判断時間には含みません。

## 仕組み

毎手、合法手を集め、Jev の Choice に UCI を渡します。Jev は確率つきで 1 手を返し、それを盤に反映します。Choice は最大 255 手までです。デモ公開では同じ流れをブラウザ内の簡易エンジンで再現します。

## スクリプト

```bash
npm test
npm run lint
npm run build
```
