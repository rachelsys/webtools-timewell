export type MusicCategory = 'cafe' | 'rain' | 'quiet' | 'night' | 'morning';

export type MusicTrack = {
  id: string;
  title: string;
  variant: string;
  category: MusicCategory;
  src: string;
};

const track = (number: number, title: string, variant: string, category: MusicCategory): MusicTrack => ({
  id: `track-${String(number).padStart(2, '0')}`,
  title,
  variant,
  category,
  src: `/music/${number} ${title}.mp3`,
});

export const MUSIC_CATEGORIES: Record<MusicCategory, string> = {
  cafe: '咖啡館',
  rain: '雨天',
  quiet: '安靜',
  night: '深夜',
  morning: '清晨',
};

export const MUSIC_LIBRARY: MusicTrack[] = [
  track(1, 'Window Seat Memory', '版本 1', 'quiet'),
  track(2, 'Window Seat Memory', '版本 2', 'quiet'),
  track(3, 'The Usual Order', '版本 1', 'cafe'),
  track(4, 'The Usual Order', '版本 2', 'cafe'),
  track(5, 'Same Cup Same Table', '版本 1', 'cafe'),
  track(6, 'Same Cup Same Table', '版本 2', 'cafe'),
  track(7, 'Rain on the Awning', '版本 1', 'rain'),
  track(8, 'Rain on the Awning', '版本 2', 'rain'),
  track(9, 'Two Chairs', '版本 1', 'cafe'),
  track(10, 'Two Chairs', '版本 2', 'cafe'),
  track(11, 'Receipt from Tuesday', '原版', 'cafe'),
  track(12, 'Same Coffee Different Year', '原版', 'cafe'),
  track(13, 'Untitled', '原版', 'quiet'),
  track(14, 'Last Table by the Door', '版本 1', 'cafe'),
  track(15, 'Last Table by the Door', '版本 2', 'cafe'),
  track(16, 'Last Table by the Door', '版本 3', 'cafe'),
  track(17, 'Radio at Third Table', '版本 1', 'cafe'),
  track(18, 'Radio at Third Table', '版本 2', 'cafe'),
  track(19, 'After Midnight Glass', '版本 1', 'night'),
  track(20, 'After Midnight Glass', '版本 2', 'night'),
  track(21, 'Unsent Message', '版本 1', 'night'),
  track(22, 'Unsent Message', '版本 2', 'night'),
  track(23, 'Corner Booth', '版本 1', 'cafe'),
  track(24, 'Corner Booth', '版本 2', 'cafe'),
  track(25, 'Cup and Saucer', '版本 1', 'cafe'),
  track(26, 'Cup and Saucer', '版本 2', 'cafe'),
  track(27, 'Familiar Silence', '版本 1', 'quiet'),
  track(28, 'Familiar Silence', '版本 2', 'quiet'),
  track(29, 'First Pale Light', '原版', 'morning'),
  track(30, 'Morning Comes Slowly', '原版', 'morning'),
];

export const DEFAULT_TRACK_ID = MUSIC_LIBRARY[0].id;

