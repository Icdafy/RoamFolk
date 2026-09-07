import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '漫楼 RoamFolk · 工程预览',
  description: '漫楼的第一阶段工程预览。查看模型样片与楼层筹备状态。',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
