'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Box, Focus, LockKeyhole, Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FLOORS } from '@/src/game/floors';
import type { PreviewController } from '@/src/game/preview-scene';
import packageInfo from '@/package.json';

export function EngineeringPreview() {
  const mount = useRef<HTMLDivElement>(null);
  const controller = useRef<PreviewController | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false;
    const host = mount.current;
    if (!host) return;
    import('@/src/game/preview-scene').then(({ createPreview }) => {
      if (disposed) return;
      controller.current = createPreview(host, {
        ready: () => { if (!disposed) setStatus('ready'); },
        error: message => { if (!disposed) { setError(message); setStatus('error'); } },
      });
    }).catch(() => { if (!disposed) { setError('场景程序加载失败，请检查连接后重试。'); setStatus('error'); } });
    return () => { disposed = true; controller.current?.dispose(); controller.current = null; };
  }, [attempt]);

  return <main className="preview-shell">
    <header className="masthead">
      <Link href="/" className="brand" aria-label="漫楼首页"><span className="brand-mark">漫</span><span>漫楼 <small>ROAMFOLK</small></span></Link>
      <span className="stage-badge"><span />工程预览 <small>v{packageInfo.version}</small></span>
    </header>
    <div className="workspace">
      <section className="scene-panel" aria-label="三维模型管线样片">
        <div className="scene-caption"><span className="eyebrow">序章 / 一切从这里开始</span><h1>让生活，<br />慢慢长成一栋楼。</h1><p>模型管线样片 · 非正式游戏场景</p></div>
        <figure className="scene-canvas" ref={mount} aria-label="正交斜俯视的微缩建筑样片，可使用下方按钮缩放和复位" />
        <output className="scene-status" aria-live="polite">{status === 'loading' ? '正在加载模型…' : status === 'ready' ? '模型已就绪 · 米制空间' : error}</output>
        {status === 'error' && <div className="retry"><Button onClick={() => { setStatus('loading'); setError(''); setAttempt(value => value + 1); }}><RotateCcw />重新加载</Button></div>}
        <div className="scene-footer"><span><Box size={16} /> BLENDER → GLB → 3D</span><div className="view-controls" aria-label="镜头控制">
          <Button variant="ghost" size="icon-lg" aria-label="缩小" disabled={status !== 'ready'} onClick={() => controller.current?.zoom(-1)}><Minus /></Button>
          <Button variant="ghost" size="icon-lg" aria-label="放大" disabled={status !== 'ready'} onClick={() => controller.current?.zoom(1)}><Plus /></Button>
          <Button variant="ghost" size="icon-lg" aria-label="恢复初始镜头" disabled={status !== 'ready'} onClick={() => controller.current?.reset()}><Focus /></Button>
        </div></div>
      </section>
      <aside className="floor-panel" aria-label="楼层筹备状态">
        <div className="panel-heading"><span className="eyebrow">THE BUILDING</span><h2>未来的每一层</h2><p>九个空间，等待生活入驻。</p></div>
        <ol className="floor-list">{[...FLOORS].reverse().map(floor => <li key={floor.id} className={floor.id === 21 ? 'sample-floor' : ''}>
          <span className="floor-number">{String(floor.id).padStart(2, '0')}<small>F</small></span>
          <span className="floor-copy"><strong>{floor.id === 21 ? '首个样板' : '生活空间'}</strong><small>{floor.id === 21 ? '等待参考图片' : '布局待确认'}</small></span>
          <span className="locked"><LockKeyhole size={13} />待开放</span>
        </li>)}</ol>
        <div className="next-note"><ArrowUpRight size={20} /><p><strong>接下来，搭建大厦入口</strong><span>25 层外观、楼层悬停与选层卡片。</span></p></div>
      </aside>
    </div>
    <footer className="page-footer"><span>漫楼 · 单机生活沙盒</span><span>第一阶段 / 工程准备 <span className="footer-dot">·</span> 正式楼层尚未开放</span></footer>
  </main>;
}
