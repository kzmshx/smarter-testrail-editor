# smarter-testrail-editor

A Google Chrome extension that brings a more comfortable editing experience to TestRail's Markdown editor.

## 注意

このリポジトリは開発中です。入念な動作確認を心がけていますが、予想しないバグが潜伏している可能性があります。 また、提供する動作や機能は今後追加・変更される可能性が大いにあります。 ご了承ください。

## できること・できないこと

- できる
    - 改行バグの解消
    - コードブロックの空白文字関連のバグの解消
    - 多少のエディタライクなキーバインディング
        - Tab でインデント
        - Enter でインデント付きの改行
        - Backspace でインデント単位削除
- できない
    - 挿入した画像のプレビュー
    - テーブルの挿入

## インストール方法

### 1. GitHub からクローン

```shell
git clone https://github.com/ow-hirata/smarter-testrail-editor.git
```

### 2. ビルド

```shell
cd smarter-testrail-editor
npm i
npm run build
```

### 3. Chrome で拡張機能を追加

- Chrome で拡張機能管理ページ（`chrome://extensions`）を開く
- 「デベロッパーモード」をオンにする
- 「パッケージ化されていない拡張機能を読み込む」をクリックする
- smarter-testrail-editor のディレクトリ直下にある `dist/` ディレクトリを読み込む

## 検討中の追加機能

- テーブルを挿入できるようにする
- エディタライクなキーバインディング
- WYSIWYG 的なエディタにする、または、プレビューを表示する
