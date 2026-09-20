# Jev チェス観戦

TypeSafe の System One モデル **Jev** 同士でチェスを指させ、ひとつの画面で対局と判断時間を見るアプリです。

左が盤面、右が各手の判断時間です。白も黒も同じ Jev が、その局面の合法手から 1 手選びます。

## GitHub Pages（main / docs）

公開 URL: https://shingohiroki.github.io/jev-test/

`docs/` に出しているのは静的な HTML/JS だけです。Jev のキーはビルド成果物に含まれません。Pages 上の対局はデモエンジンです。

## キーは漏れないか

漏れません。条件は次のとおりです。

- GitHub には **Actions secret** として `TYPESAFE_API_KEY` を置く（`NEXT_PUBLIC_TYPESAFE_API_KEY` にはしない）
- Vercel にもサーバー用の Environment Variable として **`TYPESAFE_API_KEY`** を置く（名前の先頭に `NEXT_PUBLIC_` を付けない）
- `.env.local` はコミットしない

Vercel では `/api/move` だけがキーを使います。ブラウザに渡るのは指し手と所要時間です。

## Vercel Hobby に出す

Hobby は個人・非商用なら無料です。GitHub のシークレットは Vercel には自動では入りません。同じ値を Vercel 側にも入れてください。

1. https://vercel.com/new を開く
2. Import Git Repository で **ShingoHiroki/jev-test** を選ぶ
3. Framework Preset は **Next.js** のまま
4. Root Directory は空（リポジトリのルート）
5. Environment Variables を追加する
   - Name: `TYPESAFE_API_KEY`
   - Value: TypeSafe のキー（GitHub シークレットと同じ値）
   - Environment: Production / Preview / Development すべて
6. **Deploy**

デプロイ後の `https://….vercel.app` が Jev 対局の公開 URL です。エンジンに「Jev」が選べればキーはサーバー側で認識されています。

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

- **対局**: 盤面、手番、直前の手、いま考えている側。白駒は象牙色、黒駒は濃い塗りで見分ける
- **判断時間**: 各手の所要時間の棒グラフ、白/黒の平均、スコアシート
- **Jev の応答**: 選んだ手、候補の確率、API が返した JSON

## スクリプト

```bash
npm test
npm run lint
npm run build
```
