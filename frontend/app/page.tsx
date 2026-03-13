import { redirect } from 'next/navigation';

export default function Home() {
  // 온볼딩 완료 여부 확인 로직이 있다면 여기서 처리
  // 현재는 온볼딩으로 리다이렉트
  redirect('/onboarding');
}
