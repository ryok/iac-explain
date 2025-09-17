# 変更履歴

このファイルでは、iac-explainプロジェクトの注目すべき変更を記録しています。

フォーマットは[Keep a Changelog](https://keepachangelog.com/ja/1.0.0/)に基づいており、このプロジェクトは[セマンティックバージョニング](https://semver.org/lang/ja/)に準拠しています。

## [Unreleased]

### 追加
- 日本語設定ファイル（.iac-explain.yml）
- 日本語化されたGitHub Actionsワークフロー
- 日本語ドキュメント（README.md）
- 日本語変更履歴（このファイル）
- 組織設定とローカライゼーション機能

### 変更
- 設定ファイルのコメントを日本語化
- ワークフローステップ名を日本語化
- エラーメッセージとログ出力を日本語化

## [0.1.0] - 2024-09-16

### 追加
- 初期プロジェクト実装
- Model Context Protocol (MCP) サーバー統合
- Terraformプラン分析機能
- Kubernetesマニフェスト検証機能
- セキュリティルールエンジン
- TypeScript型安全実装

#### MCPツール
- `explainPlan`: Terraformプラン分析とリスク評価
- `validateK8s`: Kubernetesマニフェストセキュリティ検証
- `hardening`: セキュリティ修正生成（フレームワーク）
- `costDelta`: コスト分析（フレームワーク）

#### セキュリティルール
- **Terraform AWS**:
  - `TF_AWS_S3_PUBLIC`: パブリックS3バケット検出
  - `TF_AWS_S3_NO_ENCRYPTION`: S3暗号化欠如
  - `TF_AWS_SG_OPEN_ALL`: 過度なセキュリティグループ許可
  - `TF_AWS_SG_SSH_OPEN`: SSH全世界公開

- **Kubernetes**:
  - `K8S_NO_LIMITS`: リソース制限欠如
  - `K8S_PRIV_ESC`: 特権昇格許可
  - `K8S_RUN_AS_ROOT`: root権限実行
  - `K8S_LATEST_TAG`: :latestタグ使用

#### パッケージ構造
- `@iac-explain/mcp-server`: MCPサーバーとCLI
- `@iac-explain/tf-parser`: Terraformプラン解析
- `@iac-explain/k8s-parser`: Kubernetesマニフェスト解析
- `@iac-explain/analyzers`: セキュリティルールエンジン

#### 開発インフラ
- MonoレポTypeScript設定
- ESLintとVitestによるコード品質管理
- GitHub Actions CI/CDワークフロー
- 包括的なドキュメント

#### 例とテンプレート
- 脆弱なTerraform設定例
- 脆弱なKubernetesマニフェスト例
- 設定ファイルテンプレート
- GitHub Actionsワークフロー例

### セキュリティ
- 入力検証にZodスキーマを使用
- Terraformプランの安全なJSON解析
- Kubernetesマニフェストの安全なYAML処理
- 秘密情報や認証情報のハードコード回避

### ドキュメント
- 包括的なREADME
- API仕様書（CLAUDE.md）
- プルリクエストテンプレート
- コントリビューションガイド

---

## 変更タイプの説明

- **追加**: 新機能の追加
- **変更**: 既存機能の変更
- **非推奨**: 将来削除予定の機能
- **削除**: 削除された機能
- **修正**: バグ修正
- **セキュリティ**: セキュリティ関連の修正