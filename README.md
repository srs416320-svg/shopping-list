# 買い物リスト（家族リアルタイム共有Webアプリ）

家族間でリアルタイムに同期・操作できるスマートフォン向け買い物リストWebアプリケーションです。

---

## 🚀 GitHub Pages へのデプロイ・複数端末での利用手順

### 1. GitHub リポジトリへプッシュ
AI Studioの「Export to GitHub」または Git コマンドで本プロジェクトを GitHub リポジトリにプッシュします。

### 2. GitHub Pages の設定（自動デプロイ）
1. GitHub リポジトリの **Settings** タブを開きます。
2. 左メニューの **Pages** を選択します。
3. **Build and deployment** > **Source** を **`GitHub Actions`** に変更します。
4. 次回 `main` または `master` ブランチへのプッシュ時に `.github/workflows/deploy.yml` が自動実行され、公開URL（`https://<ユーザー名>.github.io/<リポジトリ名>/`）が発行されます。

---

## 🔐 Firebase Authentication（ログイン）のドメイン許可設定

GitHub Pages の URL から Google ログインできるようにするため、Firebase Console にドメインを登録します。

1. **[Firebase Console](https://console.firebase.google.com/)** を開きます。
2. 本プロジェクトの Firebase プロジェクト（`gen-lang-client-0901283557`）を選択します。
3. 左メニューの **構築 (Build)** > **Authentication** を開きます。
4. **設定 (Settings)** タブ > **承認済みドメイン (Authorized domains)** を選択します。
5. **「ドメインを追加」** をクリックし、GitHub Pages のドメイン（例: `<ユーザー名>.github.io`）を入力して保存します。

> ※ 設定後、数分で GitHub Pages 経由での Google ログインが有効になります。

---

## 📱 家族・複数端末での共有方法

1. **招待URLの送信（最も簡単）**:
   - ヘッダー右上の **「共有」** ボタン（またはグループ名）をタップします。
   - **「LINEやメールで招待リンクを送る」** または **「招待URLをコピー」** を押して家族に送信します。
   - 家族がリンクを開くだけで、同じ共有リストに自動参加できます。

2. **グループコードの手動設定**:
   - 家族共有設定画面で、同じ「家族共有コード」（例: `たなか家`）を入力して保存するだけでも同期できます。

3. **スマホのホーム画面に追加（PWA対応）**:
   - **iPhone (Safari)**: 画面下の共有ボタン > 「ホーム画面に追加」
   - **Android (Chrome)**: メニュー（3点リーダー） > 「ホーム画面に追加」または「アプリをインストール」
   - ホーム画面から1タップでネイティブアプリのように全画面起動できます。

---

## 🛠 技術スタック
- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion
- **Backend & Database**: Firebase Firestore (リアルタイム同期 `onSnapshot`), Firebase Authentication (Google ログイン)
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)
- **Hosting**: GitHub Pages
