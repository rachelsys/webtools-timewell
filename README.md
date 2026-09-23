# 留時 Timewell

留時是一個打開就能使用的日常倒數與專注工具。它不需要帳號，所有偏好與紀錄都留在使用者的瀏覽器中。

## 功能

- 快速倒數：泡麵、茶、咖啡等預設項目與自訂時間
- 計時控制：開始、暫停、繼續、執行中 ±1 分鐘、重置與恢復初始時間
- 專注模式：目標、分類、完成結果與本機紀錄
- 背景音樂：集中式曲庫、分類、循環、音量、靜音與每種計時器的偏好
- 完成提醒：獨立 Alarm 與瀏覽器通知
- 分享：Web Share API、剪貼簿 fallback 與 Open Graph 預覽

## 技術架構

- Next.js 16 API surface + Vinext + React 19
- Timer 以 `endTime` timestamp 為時間來源，避免背景分頁節流造成漂移
- LocalStorage 保存計時、音樂偏好、專注設定與紀錄
- 無資料庫、無 API route、無 Server Action、無登入依賴
- Cloudflare / ChatGPT Sites 與 Vercel / Nitro 雙部署目標

## 本機開發

需求：Node.js `>=22.13.0`、npm。

```bash
npm ci
npm run dev
```

預設本機網址為 `http://localhost:5173`。

## 品質檢查

```bash
npm test
npm run lint
npm audit --omit=dev
```

測試涵蓋 Timer timestamp 邏輯、暫停／繼續、時間調整、完成、重置、恢復初始時間、LocalStorage migration、Focus records 與分享文字隱私。

## 部署

### Cloudflare / ChatGPT Sites

```bash
npm run build
```

輸出位於 `dist/`。此流程保留 Cloudflare Vite plugin 與 Sites hosting 設定。

### Vercel / Nitro

```bash
npm run build:vercel
```

輸出位於 `.vercel/output/`。Vercel 專案的 Build Command 應設定為 `npm run build:vercel`。

## 音樂庫

音樂檔位於 `public/music/`，集中設定在 `config/music-library.ts`。新增、刪除、更名或分類音樂時，不需修改 Timer 核心。

背景音樂由 Timer 狀態控制：Start 播放、Pause 暫停、Resume 繼續、Reset 歸零、Complete 停止後播放 Alarm。

## 隱私與安全

- 使用者輸入與紀錄不會傳送至伺服器
- 分享完成時間時只包含四捨五入後的分鐘數，不包含自訂名稱或專注內容
- `.env*`、部署輸出與本機工具狀態不進入 Git
- 詳細檢查結果請見 [SECURITY-AUDIT.md](./SECURITY-AUDIT.md)
