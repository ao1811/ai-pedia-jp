# ai-pedia.jp 日次ルーティン（GitHub Actions 代替）
# Windows タスクスケジューラから毎朝実行することで
#  1. Bing/Yandex への IndexNow 通知
#  2. その日の SNS 投稿案3本を生成
# を自動化する。
#
# 使い方（手動実行テスト）:
#   powershell -ExecutionPolicy Bypass -File scripts\daily-routine.ps1
#
# タスクスケジューラでの登録方法は README を参照。

$ErrorActionPreference = 'Continue'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "=== ai-pedia.jp 日次ルーティン開始: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="

# IndexNow キーを環境変数にセット（hardcodeでOK、公開情報）
$env:INDEXNOW_KEY = '7a6fb6c1efcc4d6c96959bf805864055'

Write-Host ""
Write-Host "--- Step 1: サーチエンジンに sitemap 通知 ---"
node scripts/ping-search-engines.mjs

Write-Host ""
Write-Host "--- Step 2: 投稿案を生成（popular/new/random の3本） ---"
node scripts/generate-post-drafts.mjs --mode=popular
node scripts/generate-post-drafts.mjs --mode=new
node scripts/generate-post-drafts.mjs --mode=random

Write-Host ""
Write-Host "=== 完了: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="
Write-Host "投稿案の出力先: $projectRoot\scripts\post-drafts\"
