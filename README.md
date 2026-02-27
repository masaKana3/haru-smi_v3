# 🌸 Haru SMI – Prototype / v3.0 (Supabase Edition)

**Haru SMI** は更年期世代の女性に向けた「日々のコンディション記録 × AIアドバイス × コミュニティ」アプリです。
本リポジトリは、**Supabaseをバックエンドに採用し、実運用を見据えたデータ構造を持つ最新プロトタイプ**です。

---

## 📌 主な機能

### 1. 📝 デイリー体調チェック
- **対話型記録**: 体調・気分・疲労・出血量などをチャット形式で直感的に入力可能。
- **生理トラッキング**: `is_active` フラグを用いた、遡り入力や期間自動結合に対応した高度な生理期間管理。
- **気象連動**: Open-Meteo APIより気温・気圧を自動取得。
- **フェーズ判定**: 生理周期データに基づき「月経期」「卵胞期」などを自動判定し、ダッシュボードに反映。

### 2. 🍳 レシピ・アドバイス提案（ロジック駆動）
- **AIアドバイス（準備中）**: 現在はセキュリティ保護のため、内部ロジックによるアドバイスを提供。将来的に **Gemini API** を連携予定。
- **パーソナライズ**: 蓄積されたSMIスコアや周期データに基づいた、個別最適化アドバイスの実装。

### 3. 💬 コミュニティ
- **Supabase連携**: 投稿、コメント、いいね機能をPostgreSQLで永続化。
- **日記機能**: ユーザーによる日記投稿（公開/非公開選択）に対応。

---

## 🛠 技術スタック

| 種類 | 使用技術 |
|------|-----------|
| Frontend | **React + TypeScript + Vite** |
| Styling | **Tailwind CSS** |
| Database | **Supabase (PostgreSQL)** |
| Auth | **Supabase Auth** |
| API | Open-Meteo API |
| Hosting | Vercel |

---

## 📂 ディレクトリ構造（最新版）

src/
├ api/        // 天気・Gemini(Dummy) API
├ components/ // 共通部品（PeriodStatusCard等、再利用性を考慮した設計）
├ hooks/      // useStorage(SupabaseへのCRUDロジックを集約)
├ screens/    // Dashboard, Analysis, Login, DailyCheckDetail 等
├ types/      // daily.ts, period.ts 等の厳密な型定義
└ App.tsx     // 司令塔としてのState管理・Navigation

---

## 🧪 生理周期管理の技術的アプローチ
更年期の不規則な周期を正確に捉えるため、以下のロジックを独自実装しています。

* **`periods` テーブルの活用**: `is_active` カラムにより「現在進行中のフェーズ」を明示的に管理。
* **遡り入力・結合ロジック**: 過去日の記録時に既存レコードとの重複を確認し、`start` / `end` 日付を自動更新。
* **Single Source of Truth**: 生理状態の正解を `periods` テーブルに集約し、各画面の不整合を排除。

---

## 👥 技術相談・アドバイス歓迎
本プロジェクトは個人開発による実証実験フェーズです。以下のテーマについて、技術者の方からのアドバイスをお待ちしています：

* `daily_checks` と `periods` のリレーショナルなDB設計の最適化
* Supabase Edge Functions を用いた Gemini API の安全な呼び出し
* React Native (Expo) への移行戦略と設計レビュー

---

## 📄 ライセンス
実証実験用プロトタイプのため、現時点では非公開運用を前提としています。

---

## 備考
本プロジェクトは、AI駆動開発（Vite + Supabase）を用いて構築されています。