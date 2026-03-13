import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Career PT - AI 취업 준비 코치',
  description: 'AI가 만들어주는 맞춤형 취업 로드맵과 데일리 미션으로 효율적인 취업 준비를 시작하세요',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
