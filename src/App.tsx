import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Works from './ui/Works'
import LoadingScreen from './ui/LoadingScreen'
import ErrorBoundary from './ui/ErrorBoundary'
import { useStore } from './store'
import { PROFILE } from './data/profile'

function Backdrop() {
  // 点击空白处收起详情
  const setActive = useStore((s) => s.setActive)
  return (
    <mesh position={[0, 0, -40]} onClick={() => setActive(null)}>
      <planeGeometry args={[600, 300]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

type Lang = 'en' | 'zh'

const ABOUT = { title: PROFILE.desk.title, paragraphs: PROFILE.desk.hero }

// a resume in public/ ('resume.pdf') or a full URL; the Resume button shows only when there is one
const RESUME_HREF = PROFILE.links.resume ? (/^https?:/.test(PROFILE.links.resume) ? PROFILE.links.resume : `./${PROFILE.links.resume}`) : ''

const COPY = { en: ABOUT, zh: ABOUT }

function Hero({ lang }: { lang: Lang }) {
  const { title, paragraphs } = COPY[lang]
  const aboutRef = useRef(null)
  // 触发起点提前：about 顶部位于视口 60% 处即开始（offset[0] 进度 0），到达顶部为进度 1
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ['start 0.6', 'start start'],
  })
  // 透明度在 about 顶部升到约 30vh 时归 0：起点 60%→进度 p 时顶部在 0.6×(1−p)，
  // 令 =0.3 解得 p=0.5，故 opacity 区间 [0, 0.5]
  const blur = useTransform(scrollYProgress, [0, 0.5], ['blur(0px)', 'blur(16px)'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  // 视差：标题上升更快、字距随滚动拉开；正文上升慢一点
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -96])
  const bodyY = useTransform(scrollYProgress, [0, 1], [0, -52])
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['0.01em', '0.42em'])
  return (
    <section className="hero">
      <motion.div
        className="about"
        lang={lang}
        ref={aboutRef}
        style={{ filter: blur, opacity }}
      >
        {/* 入场动画放内层，避免其 fill 锁住 opacity 覆盖外层滚动 opacity */}
        <div className="about-intro">
          <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
            {title}
          </motion.h1>
          {paragraphs.map((p, i) => (
            <motion.p key={i} className="about-body" style={{ y: bodyY }}>
              {p}
            </motion.p>
          ))}
          {/* a quiet hint to scroll: a mouse whose wheel slides down, no label */}
          <motion.div className="scroll-mouse" style={{ y: bodyY }} aria-hidden="true">
            <span className="scroll-mouse-wheel" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button className="lang-toggle" onClick={onToggle} aria-label="切换语言 / Switch language">
      {lang === 'en' ? '中文' : 'EN'}
    </button>
  )
}

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const { scrollY } = useScroll()
  // 作品区蒙层：以作品区顶部从视口底进入到视口中部的进度，驱动 3D 渐暗 + 模糊
  const worksRef = useRef(null)
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(
    worksProgress,
    [0, 1],
    ['rgba(8, 11, 18, 0)', 'rgba(8, 11, 18, 0.41)'] // 压暗减半（原 0.82）
  )
  const fogBlur = useTransform(worksProgress, [0, 1], ['blur(0px)', 'blur(10px)'])
  // 滚动渐暗：离开首屏后压暗 3D 场景，保证履历文字可读
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
  // 首屏底部渐变底色：开始滑动后淡出
  const heroGradientOpacity = useTransform(scrollY, [0, 240], [1, 0])
  // 磨砂右轨：进入履历区后淡入（首屏不磨砂）
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const railOpacity = useTransform(scrollY, [vh * 0.5, vh * 1.1], [0, 1])

  // First person at the laptop (store.pov): the page layers fade while the camera is at the screen
  // (html.pov, styles.css), scroll / touch / Esc bring the desk back, and the layers return once
  // the camera is nearly home.
  const pov = useStore((s) => s.pov)
  const setPov = useStore((s) => s.setPov)
  const deskFailed = useStore((s) => s.deskFailed)
  const setDeskFailed = useStore((s) => s.setDeskFailed)
  useEffect(() => {
    const root = document.documentElement
    if (!pov) {
      const t = window.setTimeout(() => root.classList.remove('pov'), 700)
      return () => window.clearTimeout(t)
    }
    root.classList.add('pov')
    const leave = () => setPov(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave()
    }
    window.addEventListener('wheel', leave, { passive: true })
    window.addEventListener('touchmove', leave, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', leave)
      window.removeEventListener('touchmove', leave)
      window.removeEventListener('keydown', onKey)
    }
  }, [pov, setPov])

  return (
    <>
      {/* 加载遮罩：模型全部加载完成前覆盖全屏，完成后淡出 */}
      <LoadingScreen />

      {/* 固定的 3D 背景 */}
      <div className="scene-bg">
        <ErrorBoundary fallback={null} onError={setDeskFailed}>
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 5, 19], fov: 39, near: 0.1, far: 500 }}
          gl={{ antialias: false, stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#0a0e16']} />
          <Suspense fallback={null}>
            <Backdrop />
            <Scene />
          </Suspense>
        </Canvas>
        </ErrorBoundary>
      </div>

      {deskFailed && (
        <div className="desk-failed" role="status">
          <p>The 3D desk did not load in this browser.</p>
          <a className="tb-btn tb-primary" href="./minimal/">
            Open the one-page version
          </a>
        </div>
      )}

      {/* 滚动渐暗蒙层 */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />

      {/* 作品区固定蒙层：仅压暗（减半），模糊先注释掉 */}
      <motion.div
        className="stage-fog"
        style={{ background: fogBg /* , backdropFilter: fogBlur, WebkitBackdropFilter: fogBlur */ }}
        aria-hidden="true"
      />

      {/* 固定磨砂右轨（进入履历区淡入） */}
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      {/* 首屏底部渐变底色，滚动后淡出 —— 暂时注释查看效果 */}
      {/* <motion.div
        className="hero-gradient"
        style={{ opacity: heroGradientOpacity }}
        aria-hidden="true"
      /> */}

      {/* 中英切换暂时隐藏，默认中文 */}
      {/* <LangToggle lang={lang} onToggle={() => setLang((l) => (l === 'en' ? 'zh' : 'en'))} /> */}

      {/* The top bar: who this is, and the fast paths out (the minimalist page, the resume). Above the
          loading screen, so neither waits for the 3D desk to load. The resume shows once
          data/profile.ts has one. */}
      <header className="topbar">
        <div className="tb-name">
          <b>{PROFILE.name}</b>
          <span>{PROFILE.role}</span>
        </div>
        <nav className="tb-links" aria-label="Quick links">
          <a className="tb-btn" href="./minimal/" title="A one-page version of this site">
            Minimalist
          </a>
          {RESUME_HREF && (
            <a className="tb-btn tb-primary" href={RESUME_HREF} target="_blank" rel="noopener noreferrer">
              Resume
            </a>
          )}
        </nav>
      </header>

      {/* first person at the laptop: the way back */}
      <button className="pov-back" type="button" onClick={() => setPov(false)} aria-hidden={!pov} tabIndex={pov ? 0 : -1}>
        ← Back to the desk <small>or press Esc</small>
      </button>

      {/* 全屏胶片噪点蒙层（multiply 混合） */}
      <ErrorBoundary fallback={null}>
        <NoiseOverlay />
      </ErrorBoundary>

      {/* 可滚动内容 */}
      <main className="content">
        <Hero lang={lang} />
        <Resume lang={lang} />
        <Works lang={lang} innerRef={worksRef} />
      </main>
    </>
  )
}
