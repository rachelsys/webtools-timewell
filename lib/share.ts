export const TIMEWELL_SHARE_TITLE = '留時 Timewell';

export function buildTimewellShareText(completedMinutes?: number): string {
  if (completedMinutes && completedMinutes > 0) {
    return `我剛為自己留了 ${Math.round(completedMinutes)} 分鐘。也為值得的事，留一段剛好的時間吧。`;
  }
  return '我最近在用「留時 Timewell」——不用登入，選一個時間就能開始。';
}
