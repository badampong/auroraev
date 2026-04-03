/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  Award, 
  ChevronRight, 
  Bus, 
  FileCheck, 
  Settings, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle2,
  Menu,
  X,
  Bolt,
  Download
} from 'lucide-react';

// Extend Window interface for GTM dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Types
type SolutionType = 'consulting' | 'bodywork' | 'safety';

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-1.5 ${className}`} translate="no">
    <div className="relative flex items-center justify-center">
      <span className="text-2xl font-black tracking-tighter text-brand-navy italic">A</span>
      <motion.div 
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute -top-1 -right-1"
      >
        <Bolt className="w-4 h-4 text-brand-blue fill-brand-blue" />
      </motion.div>
    </div>
    <span className="text-2xl font-bold tracking-tighter text-brand-navy">URORAEV</span>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<SolutionType>('consulting');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formLoadCount = useRef(0);

  useEffect(() => {
    if (isDownloadModalOpen) {
      formLoadCount.current = 0;
    }
  }, [isDownloadModalOpen]);

  const handleIframeLoad = () => {
    if (!isDownloadModalOpen) return;
    
    formLoadCount.current += 1;
    // The first load is the form itself, the second load is the "Thank you" page after submission
    if (formLoadCount.current === 2) {
      const link = document.createElement('a');
      link.href = '/assets/brochure.pdf';
      link.download = 'AURORAEV_Brochure.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        alert('브로셔 다운로드가 시작되었습니다. 감사합니다.');
        setIsDownloadModalOpen(false);
      }, 500);
    }
  };
  const solutionsRef = useRef<HTMLElement>(null);
  const partnershipRef = useRef<HTMLElement>(null);
  const stayTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          // Start timer when section is visible
          stayTimers.current[id] = setTimeout(() => {
            window.dataLayer?.push({
              event: 'page_stay_1min',
              section_id: id
            });
            console.log(`Tracked 1 minute stay on ${id}`);
          }, 60000);
        } else {
          // Clear timer if user leaves section before 1 minute
          if (stayTimers.current[id]) {
            clearTimeout(stayTimers.current[id]);
            delete stayTimers.current[id];
          }
        }
      });
    }, { threshold: 0.5 });

    if (solutionsRef.current) observer.observe(solutionsRef.current);
    if (partnershipRef.current) observer.observe(partnershipRef.current);

    return () => observer.disconnect();
  }, []);

  const trackEvent = (eventName: string, params: object = {}) => {
    window.dataLayer?.push({
      event: eventName,
      ...params
    });
  };

  const handleDownloadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    trackEvent('brochure_download_click', {
      company: data.company,
      name: data.name
    });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('회사 소개서 및 브로셔 다운로드가 시작됩니다.');
        setIsDownloadModalOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        trackEvent('contact_form_submit_success', {
          interest: data.interest
        });
        alert('문의가 성공적으로 접수되었습니다. 담당자가 곧 연락드리겠습니다.');
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('문의 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const solutions = {
    consulting: {
      title: "Consulting (전략 컨설팅)",
      subtitle: "환경부 배터리안전보조금 인증 컨설팅",
      description: "구동축전지 안전성 시험 지원부터 보조금 신청 대행까지, 복잡한 인증 절차를 원스톱으로 해결합니다.",
      items: [
        "구동축전지 안전성 시험(KMVSS) 기술 지원",
        "OBDⅡ 데이터 매핑 및 환경부 전송 규격 최적화",
        "환경부 배터리 안전 보조금 신청 대행",
        "사후 관리 및 기술 문서 대응"
      ],
      process: [
        { step: "01", label: "차량 분석", desc: "기술 사양 검토" },
        { step: "02", label: "시험 지원", desc: "안전성 테스트" },
        { step: "03", label: "데이터 매핑", desc: "OBDⅡ 최적화" },
        { step: "04", label: "인증 완료", desc: "보조금 승인" }
      ]
    },
    bodywork: {
      title: "Bodywork (특장 솔루션)",
      subtitle: <span translate="no">AURORAEV</span> + " 맞춤형 어린이 통학 솔루션",
      description: "법적 필수 요건을 완벽하게 충족하는 고품질 특장 시공으로 안전한 통학 환경을 조성합니다.",
      items: [
        "스윙도어 연동 자동 보조발판 (인터록 시스템)",
        "어린이 보호차량 전용 도색 및 랩핑",
        "경광등 및 정지 표지판 일괄 시공",
        "어린이 하차 확인 장치 설치"
      ],
      process: [
        { step: "01", label: "설계 상담", desc: "맞춤형 사양 확정" },
        { step: "02", label: "정밀 시공", desc: "전문 엔지니어 작업" },
        { step: "03", label: "검수 완료", desc: "법적 기준 확인" },
        { step: "04", label: "차량 출고", desc: "현장 인도" }
      ]
    },
    safety: {
      title: "Safety Device (스마트 디바이스)",
      subtitle: "지능형 안전 장치 및 관제 시스템",
      description: "AI 기반 감지 기술과 실시간 데이터 전송 시스템으로 사고를 예방하고 효율적인 관리를 지원합니다.",
      items: [
        "4CH 지능형 AI 블랙박스 (보행자/장행물 감지)",
        "국토부 eTAS 자동 전송 연동 통신형 DTG",
        "실시간 차량 상태 모니터링 시스템",
        "운전자 주의 분산 경고 장치 (DSM)"
      ],
      process: [
        { step: "01", label: "장비 선정", desc: "운행 환경 분석" },
        { step: "02", label: "시스템 연동", desc: "eTAS 서버 연결" },
        { step: "03", label: "현장 설치", desc: "전국 출장 지원" },
        { step: "04", label: "운영 교육", desc: "데이터 활용 안내" }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo />
          
          <div className="hidden md:flex items-center gap-10">
            <a href="#about" className="text-sm font-medium hover:text-brand-blue transition-colors">About Us</a>
            <a href="#solutions" className="text-sm font-medium hover:text-brand-blue transition-colors">Solutions</a>
            <a href="#success" className="text-sm font-medium hover:text-brand-blue transition-colors">Success Story</a>
            <a href="#partnership" className="text-sm font-medium hover:text-brand-blue transition-colors">Partnership</a>
            <button 
              onClick={() => setIsDownloadModalOpen(true)}
              className="flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-brand-navy transition-colors"
            >
              <Download className="w-4 h-4" />
              브로셔 다운로드
            </button>
            <a href="#contact" className="bg-brand-navy text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-blue transition-all">Contact Us</a>
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-4 md:hidden"
            >
              <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">About Us</a>
              <a href="#solutions" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Solutions</a>
              <a href="#success" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Success Story</a>
              <a href="#partnership" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium">Partnership</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-brand-blue">Contact Us</a>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* 
            Video Recognition Tip: 
            For best recognition and performance, place local video files in the 'public/' folder 
            (e.g., public/videos/hero-bg.mp4) and reference them as '/videos/hero-bg.mp4'.
            Alternatively, use a direct CDN link or a high-quality YouTube/Vimeo embed.
          */}
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            preload="auto"
            className="w-full h-full object-cover blur-sm scale-105 brightness-[0.4]"
            poster="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000"
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
            <img 
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000" 
              alt="Electric Mobility Front" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/60 via-transparent to-white"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-blue/20 text-brand-blue text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm border border-brand-blue/30">
              Electric Mobility Safety Leader
            </span>
            <h1 className="text-3xl md:text-6xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              전기모빌리티의 안전 기술 표준화로<br />
              <span className="text-brand-blue">미래 세대의 이동권</span>을 보장합니다.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              <span translate="no">AURORAEV</span>는 혁신적인 안전 기술과 정밀한 인증 솔루션을 통해 <br className="hidden md:block" />
              지속 가능한 대중교통의 새로운 기준을 제시합니다.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <a href="#contact" className="w-full md:w-auto bg-brand-blue text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-brand-navy transition-all shadow-xl shadow-brand-blue/20">
                솔루션 상담하기
              </a>
              <button 
                onClick={() => setIsDownloadModalOpen(true)}
                className="w-full md:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                브로셔 다운로드
              </button>
              <a href="#solutions" className="w-full md:w-auto bg-transparent text-white/60 border border-white/10 px-10 py-4 rounded-full font-bold text-lg hover:text-white transition-all">
                사업 영역 보기
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white/50 rounded-full"></div>
          </div>
        </motion.div>
      </section>

      {/* About Us Section */}
      <section id="about" className="section-padding bg-brand-gray">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-brand-blue tracking-[0.2em] uppercase mb-4">About Us</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-brand-navy"><span translate="no">AURORAEV</span>의 3대 핵심 가치</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Award className="w-10 h-10" />, 
                title: "Expertise", 
                label: "전문성",
                desc: "수년간 축적된 전기모빌리티 인증 데이터와 기술 노하우를 바탕으로 최적의 솔루션을 제공합니다." 
              },
              { 
                icon: <Zap className="w-10 h-10" />, 
                title: "Agility", 
                label: "신속성",
                desc: "급변하는 정부 규제와 시장 환경에 맞춰 가장 빠르고 정확한 대응 프로세스를 구축하고 있습니다." 
              },
              { 
                icon: <ShieldCheck className="w-10 h-10" />, 
                title: "Safety", 
                label: "안전성",
                desc: "모든 솔루션의 중심에는 '안전'이 있습니다. 타협하지 않는 기준으로 미래의 이동을 설계합니다." 
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 transition-all"
              >
                <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-6">
                  {item.icon}
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <h4 className="text-2xl font-bold text-brand-navy">{item.title}</h4>
                  <span className="text-sm text-brand-blue font-medium">{item.label}</span>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" ref={solutionsRef} className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-sm font-bold text-brand-blue tracking-[0.2em] uppercase mb-4">Our Solutions</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-brand-navy">통합 안전 및 인증 솔루션</h3>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {(Object.keys(solutions) as SolutionType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === key 
                      ? 'bg-white text-brand-blue shadow-sm' 
                      : 'text-gray-500 hover:text-brand-navy'
                  }`}
                >
                  {key === 'consulting' ? 'Consulting' : key === 'bodywork' ? 'Bodywork' : 'Safety Device'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <h4 className="text-brand-blue font-bold mb-2">{solutions[activeTab].subtitle}</h4>
                <h5 className="text-3xl font-bold text-brand-navy mb-6">{solutions[activeTab].title}</h5>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  {solutions[activeTab].description}
                </p>
                <ul className="space-y-4 mb-10">
                  {solutions[activeTab].items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-brand-blue shrink-0 mt-1" />
                      <span className="text-brand-navy font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="flex items-center gap-2 bg-brand-gray text-brand-navy px-6 py-3 rounded-xl font-bold hover:bg-brand-blue hover:text-white transition-all"
                >
                  <Download className="w-5 h-5" />
                  {solutions[activeTab].title.split(' ')[0]} 상세 브로셔 받기
                </button>
              </div>
            </motion.div>

            <motion.div
              key={`${activeTab}-visual`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-navy rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 blur-[100px] rounded-full"></div>
              <h6 className="text-xl font-bold mb-10 relative z-10">Process Infographic</h6>
              <div className="grid grid-cols-2 gap-6 relative z-10">
                {solutions[activeTab].process.map((p, idx) => (
                  <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                    <span className="text-brand-blue font-mono text-sm mb-2 block">{p.step}</span>
                    <p className="font-bold text-lg mb-1">{p.label}</p>
                    <p className="text-white/60 text-sm">{p.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <div className="flex items-center gap-4 text-white/30">
                  <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: [-48, 48] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="w-full h-full bg-brand-blue"
                    ></motion.div>
                  </div>
                  <Bus className="w-6 h-6" />
                  <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ x: [-48, 48] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear", delay: 0.75 }}
                      className="w-full h-full bg-brand-blue"
                    ></motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Success Story Section */}
      <section id="success" className="section-padding bg-brand-gray overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl aspect-video">
                <video 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1556122071-e404be74579d?auto=format&fit=crop&q=80&w=1200"
                >
                  <source src="/videos/hero-bg.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-brand-blue text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Case Study</span>
                    <span className="text-white/80 text-xs font-medium">어린이 보호차량 통합 솔루션</span>
                  </div>
                  <p className="text-white font-bold text-xl"><span translate="no">AURORAEV</span> 컨설팅 1호 차량</p>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl"></div>
            </motion.div>

            <div>
              <h2 className="text-sm font-bold text-brand-blue tracking-[0.2em] uppercase mb-4">Success Story</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-brand-navy mb-8">안전한 통학의 시작,<br /><span translate="no">AURORAEV</span>가 함께합니다.</h3>
              
              <div className="space-y-8">
                <p className="text-gray-600 text-lg leading-relaxed">
                  환경부 배터리 안전 보조금 인증부터 어린이 보호차량 전용 특장 시공까지, 
                  <span translate="no">AURORAEV</span>의 통합 솔루션이 적용된 실제 운영 사례입니다. 
                  지능형 안전 장치와 실시간 관제 시스템을 통해 가장 안전한 이동 환경을 구축했습니다.
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-brand-blue shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy mb-1">환경부 인증 완료</p>
                      <p className="text-sm text-gray-500">KMVSS 안전성 시험 및 보조금 승인 지원</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-brand-blue shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy mb-1">스마트 안전 장치</p>
                      <p className="text-sm text-gray-500">자동 보조발판 및 경광등 통합 제어</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-brand-blue shrink-0">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy mb-1">AI 지능형 관제</p>
                      <p className="text-sm text-gray-500">보행자 감지 및 실시간 차량 상태 모니터링</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-brand-blue shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy mb-1">법적 기준 준수</p>
                      <p className="text-sm text-gray-500">어린이 보호차량 필수 요건 100% 충족</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-2xl font-bold text-brand-navy">99.9%</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Safety Rating</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200"></div>
                    <div>
                      <p className="text-2xl font-bold text-brand-navy">1,200+</p>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Daily Safe Trips</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section id="partnership" ref={partnershipRef} className="section-padding bg-brand-navy text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-brand-blue tracking-[0.2em] uppercase mb-4">Partnership</h2>
            <h3 className="text-3xl md:text-4xl font-bold mb-4">제조사 협업 모델</h3>
            <p className="text-white/60 max-w-2xl mx-auto">제조사의 공정 효율을 극대화하고 품질을 보장하는 단계별 파트너십 프로세스입니다.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-6 px-8 text-left text-brand-blue font-bold uppercase tracking-wider text-sm">협업 단계</th>
                  <th className="py-6 px-8 text-left text-white/40 font-bold uppercase tracking-wider text-sm">제조사 (Manufacturer)</th>
                  <th className="py-6 px-8 text-left text-brand-blue font-bold uppercase tracking-wider text-sm" translate="no">AURORAEV</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { 
                    stage: "개발/인증 단계", 
                    mfg: "차량 설계 및 생산 라인 구축", 
                    cereon: "배터리 안전 인증(KMVSS) 및 보조금 컨설팅" 
                  },
                  { 
                    stage: "출고 전 단계", 
                    mfg: "기본 사양 조립 및 PDI 검수", 
                    cereon: "특장 솔루션 및 안전장치 일괄 장착 시공" 
                  },
                  { 
                    stage: "사후 관리 단계", 
                    mfg: "차량 정비 및 부품 공급", 
                    cereon: "안전장치 전문 AS 및 eTAS 데이터 관리 서비스" 
                  }
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-8 px-8 font-bold text-lg">{row.stage}</td>
                    <td className="py-8 px-8 text-white/60 group-hover:text-white transition-colors">{row.mfg}</td>
                    <td className="py-8 px-8 text-brand-blue font-semibold flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" />
                      {row.cereon}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-sm font-bold text-brand-blue tracking-[0.2em] uppercase mb-4">Contact Us</h2>
              <h3 className="text-4xl font-bold text-brand-navy mb-8">비즈니스 파트너십을<br />기다립니다.</h3>
              <p className="text-gray-600 mb-12 text-lg">
                전기모빌리티 도입을 검토 중인 운수업체나 인증 및 특장이 필요한 제조사/수입사 관계자분들의 문의를 환영합니다.
              </p>
              
              <div className="space-y-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-brand-navy">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Call Us</p>
                    <a 
                      href="tel:02-1234-5678" 
                      onClick={() => trackEvent('contact_click', { type: 'phone' })}
                      className="font-bold text-brand-navy hover:text-brand-blue transition-colors"
                    >
                      02-1234-5678
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-brand-navy">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Email Us</p>
                    <a 
                      href="mailto:contact@auroraev.co.kr" 
                      onClick={() => trackEvent('contact_click', { type: 'email' })}
                      className="font-bold text-brand-navy hover:text-brand-blue transition-colors"
                    >
                      contact@auroraev.co.kr
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-brand-navy">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
                    <p className="font-bold text-brand-navy">서울특별시 강남구 테헤란로 123 <span translate="no">AURORAEV</span> 빌딩</p>
                  </div>
                </div>
              </div>

              <div className="bg-brand-blue/5 p-8 rounded-3xl border border-brand-blue/10">
                <h4 className="text-xl font-bold text-brand-navy mb-4 flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-brand-blue" />
                  자료실
                </h4>
                <p className="text-gray-500 text-sm mb-6">
                  <span translate="no">AURORAEV</span>의 최신 회사 소개서와 솔루션 브로셔를 다운로드하실 수 있습니다.
                </p>
                <button 
                  onClick={() => setIsDownloadModalOpen(true)}
                  className="w-full bg-white text-brand-blue border border-brand-blue/20 font-bold py-3 rounded-xl hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  회사소개서 및 브로셔 통합 다운로드
                </button>
              </div>
            </div>

            <div className="bg-brand-gray p-8 md:p-12 rounded-[2.5rem] border border-gray-200">
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-navy ml-1">회사명</label>
                    <input required name="company" type="text" placeholder="회사명을 입력해 주세요" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-navy ml-1">담당자명</label>
                    <input required name="name" type="text" placeholder="성함을 입력해 주세요" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-navy ml-1">연락처</label>
                    <input required name="phone" type="tel" placeholder="010-0000-0000" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-brand-navy ml-1">이메일</label>
                    <input required name="email" type="email" placeholder="example@company.com" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-navy ml-1">관심 분야 선택</label>
                  <select name="interest" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all appearance-none">
                    <option value="consulting">보조금 인증 컨설팅</option>
                    <option value="bodywork">전기모빌리티 특장 솔루션</option>
                    <option value="safety">안전 디바이스 장착</option>
                    <option value="other">기타 문의</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-navy ml-1">상세 문의 내용</label>
                  <textarea required name="message" rows={4} placeholder="문의하실 내용을 상세히 적어주세요" className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all resize-none"></textarea>
                </div>
                <button 
                  disabled={isSubmitting}
                  className="w-full bg-brand-navy text-white font-bold py-4 rounded-xl hover:bg-brand-blue transition-all shadow-lg shadow-brand-navy/10 disabled:opacity-50"
                >
                  {isSubmitting ? '제출 중...' : '문의하기 제출'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo />
          <p className="text-gray-400 text-sm">
            © 2026 <span translate="no">AURORAEV</span> Co., Ltd. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-brand-navy transition-colors"><Settings className="w-5 h-5" /></a>
            <a href="#" className="text-gray-400 hover:text-brand-navy transition-colors"><FileCheck className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>

      {/* Download Modal */}
      <AnimatePresence>
        {isDownloadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDownloadModalOpen(false)}
              className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-bold text-brand-navy mb-1">자료 다운로드 신청</h3>
                  <p className="text-gray-500 text-sm">회사소개서 및 브로셔 다운로드를 위해 아래 양식을 작성해 주세요.</p>
                </div>
                <button 
                  onClick={() => setIsDownloadModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="w-full flex justify-center">
                  <iframe 
                    src="https://docs.google.com/forms/d/e/1FAIpQLSdTGxnCo3CzSBjrVwlBbTrmGI_fEmPgIm63NJbG8jlPCGpiVQ/viewform?embedded=true" 
                    width="100%" 
                    height="1243" 
                    frameBorder="0" 
                    marginHeight={0} 
                    marginWidth={0}
                    onLoad={handleIframeLoad}
                    className="max-w-full rounded-xl shadow-sm bg-white"
                  >
                    로드 중…
                  </iframe>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
