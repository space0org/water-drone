# 水中ドローン制御システム

複数の水中ドローンを制御・通信できるWebベースの制御システム。

## 予測コスト

### Free Tier期間中 (最初の12ヶ月)
- ECS Fargate Spot: $0-5/月 (750時間無料)
- Application Load Balancer: $0/月 (750時間無料)
- S3 + CloudFront: $0-1/月 (S3: 5GB無料, CloudFront: 50GB/月無料)
合計: $0-5/月

### Free Tier期間後
- ECS Fargate Spot: $5-10/月 (通常価格から70%削減)
- Application Load Balancer: $15-20/月
- S3 + CloudFront: $1-2/月
合計: $20-30/月

## 機能

- マルチドローン制御
- リアルタイムセンサーデータ表示
- ドローン間の位置情報共有
- WebSocketベースの双方向通信

## 環境構築

### バックエンド (Python/FastAPI)

```bash
cd backend
# Poetry のインストール（未導入の場合）
curl -sSL https://install.python-poetry.org | python3 -

# 依存関係のインストール
poetry install

# 開発サーバーの起動
poetry run fastapi dev app/main.py
```

### フロントエンド (React/TypeScript)

```bash
cd frontend
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 必要要件

- Python 3.12以上
- Node.js 18以上
- Poetry (Pythonパッケージマネージャー)
- npm (Node.jsパッケージマネージャー)

## アーキテクチャ

### バックエンド

- FastAPI: WebSocketとRESTful APIの提供
- Pydantic: データバリデーション
- WebSocket: リアルタイム通信

### フロントエンド

- React: UIフレームワーク
- TypeScript: 型安全な開発
- Tailwind CSS: スタイリング
- shadcn/ui: UIコンポーネント
- Recharts: データ可視化

## デプロイ

本番環境のURLは以下の通りです：

- フロントエンド: https://underwater-drone-app-at8sr4hi.devinapps.com
- バックエンド: wss://app-cygwaklr.fly.dev
