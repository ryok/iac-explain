# iac-explain

Model Context Protocol (MCP) 対応のInfrastructure as Code (IaC) 分析・説明ツール

## 概要

`iac-explain` は、Terraformプランとkubernetesマニフェストを分析し、以下の機能を提供する包括的なツールです：

- 🔍 **セキュリティ分析**: 設定ミスとセキュリティリスクの検出
- 📊 **コスト推定**: インフラストラクチャコストと変更の計算
- 🛠️ **自動修正**: 一般的なセキュリティ問題のパッチ生成
- 📚 **人間が読める説明**: 技術的な変更を自然言語に変換
- 🔄 **ドリフト検出**: 計画された状態と実際の状態の差分を特定

## 機能

### サポート技術

- **Terraform**: HCL分析、plan JSON解析（AWS、GCP、Azure）
- **Kubernetes**: YAMLマニフェスト検証、Helmチャート分析
- **セキュリティルール**: CISベンチマーク、業界のベストプラクティス
- **コスト分析**: Infracostとの統合

### 主要機能

- **MCP統合**: Claudeやその他のMCP互換ツールとシームレスに連携
- **CI/CD統合**: GitHub Actions、GitLab CI、Azure DevOps
- **Policy as Code**: Regoサポートによるカスタマイズ可能なルール
- **自動修復**: 修正提案とパッチの生成

## クイックスタート

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-org/iac-explain.git
cd iac-explain

# 依存関係をインストール
npm install

# プロジェクトをビルド
npm run build
```

### 基本的な使い方

#### Terraformプランの分析

```bash
# Terraformプランを生成して分析
terraform plan -out=tfplan.bin
terraform show -json tfplan.bin > tfplan.json

# 分析を実行
npx iac-explain explain-plan --workspace ./terraform --plan-path tfplan.json
```

#### Kubernetesマニフェストの検証

```bash
# Kubernetes YAMLファイルを分析
npx iac-explain validate-k8s --manifests-dir ./k8s

# Helmチャートを分析
npx iac-explain validate-k8s --helm-chart ./charts/myapp
```

#### コスト分析

```bash
# mainブランチとのコスト比較
npx iac-explain cost-delta --workspace ./terraform --baseline-branch main
```

### MCPサーバーの使用

Claudeやその他のMCPクライアントと統合するためのMCPサーバーを起動：

```bash
# サーバーを起動
npx iac-explain serve

# 利用可能なツールを一覧表示
npx iac-explain list-tools
```

## 設定

リポジトリのルートに `.iac-explain.yml` ファイルを作成：

```yaml
risk:
  critical_rules: [K8S_PRIV_ESC, TF_AWS_SG_OPEN_ALL]
  high_rules: [TF_AWS_S3_PUBLIC, K8S_NO_LIMITS]

review:
  ignore_paths:
    - "**/.terraform/**"
    - "**/examples/**"
  cloud: ["aws", "gcp", "azure"]

fix:
  auto_patch_labels: ["allow-auto-patch"]
  max_patches: 10

cost:
  enable: true
  baseline_branch: "main"

drift:
  enable: true
```

## セキュリティルール

### Terraformルール

#### AWS
- **TF_AWS_S3_PUBLIC**: パブリックS3バケットの検出
- **TF_AWS_S3_NO_ENCRYPTION**: S3暗号化の欠如
- **TF_AWS_SG_OPEN_ALL**: 過度に許可されたセキュリティグループ
- **TF_AWS_SG_SSH_OPEN**: 0.0.0.0/0からのSSHアクセス

#### Azure
- **TF_AZ_STG_TLS12**: 弱いTLS設定
- **TF_AZ_HTTPS_ONLY**: HTTPトラフィックの許可

#### GCP
- **TF_GCP_BUCKET_PUBLIC**: パブリックGCSバケット
- **TF_GCP_FW_OPEN_ALL**: 許可的なファイアウォールルール

### Kubernetesルール

- **K8S_NO_LIMITS**: リソース制限の欠如
- **K8S_PRIV_ESC**: 特権昇格の許可
- **K8S_RUN_AS_ROOT**: rootユーザーとしての実行
- **K8S_LATEST_TAG**: :latestタグの使用

## CI/CD統合

### GitHub Actions

ワークフローファイルを `.github/workflows/iac-explain.yml` に追加：

```yaml
name: IaC セキュリティ分析
on:
  pull_request:
    paths: ["**/*.tf", "**/*.yaml"]

jobs:
  security-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      # 分析ステップ...
```

### 出力例

```markdown
# インフラストラクチャ分析レポート

## サマリー
- **追加**: 3リソース
- **変更**: 1リソース
- **削除**: 0リソース

## 重大な問題 (2)

### TF_AWS_SG_OPEN_ALL
**リソース**: aws_security_group.web
**説明**: セキュリティグループが0.0.0.0/0からSSHアクセスを許可
**証拠**: Ingressルールが0.0.0.0/0からポート22へのアクセスを許可
**推奨事項**: 特定のIP範囲にSSHアクセスを制限

### K8S_PRIV_ESC
**リソース**: Deployment/vulnerable-app
**説明**: コンテナが特権昇格を許可
**証拠**: sidecarコンテナでallowPrivilegeEscalation: true
**推奨事項**: allowPrivilegeEscalationをfalseに設定

## コスト影響
- **月額差分**: +15,600円/月
- **主要因**: EC2インスタンス（2x t3.medium）
```

## 開発

### プロジェクト構造

```
iac-explain/
├── packages/
│   ├── mcp-server/         # MCPサーバー実装
│   ├── tf-parser/          # Terraformプランパーサー
│   ├── k8s-parser/         # Kubernetesマニフェストパーサー
│   ├── analyzers/          # セキュリティルールエンジン
│   ├── policy-engine/      # ポリシー管理
│   ├── patch-engine/       # 修正生成
│   └── cost-engine/        # コスト分析
├── examples/               # 設定例
├── policies/               # ルール定義
└── .github/workflows/      # CI/CDワークフロー
```

### 新しいルールの追加

1. ルール実装を作成：

```typescript
export const MyCustomRule: SecurityRule = {
  id: 'MY_CUSTOM_RULE',
  title: 'カスタムセキュリティルール',
  severity: 'high',
  category: 'security',
  resourceTypes: ['aws_instance'],

  evaluate(context: RuleContext): RuleFinding | null {
    // ルールロジックをここに記述
    return null;
  }
};
```

2. ルールを登録：

```typescript
import { createDefaultRuleEngine } from '@iac-explain/analyzers';

const engine = createDefaultRuleEngine();
engine.registerRule(MyCustomRule);
```

### テストの実行

```bash
# すべてのテストを実行
npm test

# 特定パッケージのテストを実行
npm test -w packages/tf-parser

# カバレッジ付きで実行
npm run test:coverage
```

## ロードマップ

- [ ] **クラウドサポートの拡張**: Azure、GCPルールの完全カバレッジ
- [ ] **ポリシーエンジン**: カスタムルールのための完全なRego統合
- [ ] **パッチ生成**: 自動修正の適用
- [ ] **Webインターフェース**: ブラウザベースの分析ダッシュボード
- [ ] **IDE拡張**: VS CodeとJetBrainsプラグイン
- [ ] **エンタープライズ機能**: SSO、監査ログ、コンプライアンスレポート

## コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチを作成（`git checkout -b feature/amazing-feature`）
3. 変更をコミット（`git commit -m 'Add amazing feature'`）
4. ブランチにプッシュ（`git push origin feature/amazing-feature`）
5. プルリクエストを作成

### 開発環境のセットアップ

```bash
# 依存関係をインストール
npm install

# 開発モードで実行
npm run dev

# ビルドとテスト
npm run build
npm test

# コードをリント
npm run lint
```

## ライセンス

このプロジェクトはMITライセンスでライセンスされています - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## サポート

- 📚 [ドキュメント](https://docs.iac-explain.com)
- 🐛 [イシュートラッカー](https://github.com/your-org/iac-explain/issues)
- 💬 [ディスカッション](https://github.com/your-org/iac-explain/discussions)
- 📧 [メールサポート](mailto:support@iac-explain.com)

---

**⚡ 本番環境に到達する前にインフラストラクチャを保護しましょう！**