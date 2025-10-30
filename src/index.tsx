import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// 정적 파일 제공
app.use('/static/*', serveStatic({ root: './' }))

// ==================== API 라우트 ====================

// 블로그 게시글 목록 API
app.get('/api/posts', async (c) => {
  const { DB } = c.env
  const { results } = await DB.prepare(`
    SELECT id, title, excerpt, author, category, slug, views, created_at, image_url 
    FROM posts 
    WHERE published = 1 
    ORDER BY created_at DESC 
    LIMIT 20
  `).all()
  
  return c.json({ posts: results })
})

// 블로그 게시글 상세 API
app.get('/api/posts/:slug', async (c) => {
  const { DB } = c.env
  const slug = c.req.param('slug')
  
  // 조회수 증가
  await DB.prepare(`UPDATE posts SET views = views + 1 WHERE slug = ?`).bind(slug).run()
  
  const post = await DB.prepare(`
    SELECT * FROM posts WHERE slug = ? AND published = 1
  `).bind(slug).first()
  
  if (!post) {
    return c.json({ error: 'Post not found' }, 404)
  }
  
  return c.json({ post })
})

// 문의 접수 API
app.post('/api/inquiries', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  const { name, phone, party_size, visit_date, message } = body
  
  const result = await DB.prepare(`
    INSERT INTO inquiries (name, phone, party_size, visit_date, message)
    VALUES (?, ?, ?, ?, ?)
  `).bind(name, phone, party_size, visit_date, message).run()
  
  return c.json({ success: true, id: result.meta.last_row_id })
})

// ==================== 페이지 라우트 ====================

// 메인 페이지
app.get('/', (c) => {
  return c.html(renderMainPage())
})

// 서비스 소개 페이지
app.get('/service', (c) => {
  return c.html(renderServicePage())
})

// 시설 안내 페이지
app.get('/facilities', (c) => {
  return c.html(renderFacilitiesPage())
})

// 가격 안내 페이지
app.get('/pricing', (c) => {
  return c.html(renderPricingPage())
})

// 위치 안내 페이지
app.get('/location', (c) => {
  return c.html(renderLocationPage())
})

// 블로그 목록 페이지
app.get('/blog', (c) => {
  return c.html(renderBlogPage())
})

// 블로그 상세 페이지
app.get('/blog/:slug', (c) => {
  const slug = c.req.param('slug')
  return c.html(renderBlogDetailPage(slug))
})

// 예약 문의 페이지
app.get('/inquiry', (c) => {
  return c.html(renderInquiryPage())
})

// ==================== HTML 렌더링 함수 ====================

// 공통 레이아웃
function renderLayout(title: string, content: string, keywords = '강남룸, 강남 가라오케, 강남 룸, 프리미엄 가라오케') {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO 메타 태그 -->
    <title>${title} | 강남룸 - 프리미엄 가라오케</title>
    <meta name="description" content="강남 최고의 프리미엄 가라오케 강남룸. 최신 음향시설과 고급스러운 인테리어로 특별한 시간을 선사합니다. 문의: 010-5197-1332 (최익현 실장)">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="최익현">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://webapp.pages.dev">
    
    <!-- Open Graph (페이스북, 카카오톡) -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title} | 강남룸">
    <meta property="og:description" content="강남 최고의 프리미엄 가라오케 강남룸">
    <meta property="og:image" content="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=630&fit=crop&q=80">
    <meta property="og:url" content="https://webapp.pages.dev">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title} | 강남룸">
    <meta name="twitter:description" content="강남 최고의 프리미엄 가라오케 강남룸">
    <meta name="twitter:image" content="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&h=630&fit=crop&q=80">
    
    <!-- 구조화된 데이터 (Schema.org) -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NightClub",
      "name": "강남룸",
      "description": "강남 최고의 프리미엄 가라오케",
      "url": "https://webapp.pages.dev",
      "telephone": "+82-10-5197-1332",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "서울",
        "addressRegion": "강남구",
        "addressCountry": "KR"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "37.4979",
        "longitude": "127.0276"
      },
      "openingHours": "Mo-Su 00:00-24:00",
      "priceRange": "₩₩₩"
    }
    </script>
    
    <!-- Favicon -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎤</text></svg>">
    
    <!-- TailwindCSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              primary: '#8B5CF6',
              secondary: '#EC4899',
            }
          }
        }
      }
    </script>
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- AOS 애니메이션 라이브러리 -->
    <link rel="stylesheet" href="https://unpkg.com/aos@2.3.1/dist/aos.css">
    
    <!-- 커스텀 CSS -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');
      
      * {
        font-family: 'Noto Sans KR', sans-serif;
      }
      
      /* 그라데이션 배경 */
      .gradient-bg {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      /* 모핑 텍스트 애니메이션 */
      .morphing-text {
        animation: morph 8s ease-in-out infinite;
        background: linear-gradient(90deg, #8B5CF6, #EC4899, #8B5CF6);
        background-size: 200% auto;
        color: transparent;
        background-clip: text;
        -webkit-background-clip: text;
        font-weight: 900;
      }
      
      @keyframes morph {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      
      /* 플로팅 애니메이션 */
      .floating {
        animation: floating 3s ease-in-out infinite;
      }
      
      @keyframes floating {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      
      /* 네온 효과 */
      .neon-text {
        text-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #8B5CF6, 0 0 40px #8B5CF6;
      }
      
      /* 글로우 버튼 */
      .glow-button {
        box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
        transition: all 0.3s ease;
      }
      
      .glow-button:hover {
        box-shadow: 0 0 30px rgba(139, 92, 246, 0.9);
        transform: scale(1.05);
      }
      
      /* 카드 호버 효과 */
      .card-hover {
        transition: all 0.3s ease;
      }
      
      .card-hover:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      }
      
      /* 스크롤 인디케이터 */
      .scroll-indicator {
        animation: scroll-bounce 2s infinite;
      }
      
      @keyframes scroll-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(10px); }
      }
    </style>
</head>
<body class="bg-gray-50">
    <!-- 네비게이션 -->
    <nav class="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="text-2xl font-bold flex items-center">
                    <i class="fas fa-microphone-alt mr-2"></i>
                    <span class="neon-text">강남룸</span>
                </a>
                <div class="hidden md:flex space-x-6">
                    <a href="/" class="hover:text-pink-200 transition">홈</a>
                    <a href="/service" class="hover:text-pink-200 transition">서비스</a>
                    <a href="/facilities" class="hover:text-pink-200 transition">시설안내</a>
                    <a href="/pricing" class="hover:text-pink-200 transition">가격안내</a>
                    <a href="/location" class="hover:text-pink-200 transition">오시는길</a>
                    <a href="/blog" class="hover:text-pink-200 transition">블로그</a>
                    <a href="/inquiry" class="hover:text-pink-200 transition">예약문의</a>
                </div>
                <a href="tel:010-5197-1332" class="bg-white text-purple-600 px-6 py-2 rounded-full font-bold glow-button">
                    <i class="fas fa-phone mr-2"></i>전화하기
                </a>
            </div>
        </div>
    </nav>
    
    ${content}
    
    <!-- 플로팅 CTA 버튼 -->
    <div class="fixed bottom-8 right-8 z-50">
        <a href="tel:010-5197-1332" 
           class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-2xl glow-button flex items-center space-x-2 floating">
            <i class="fas fa-phone-volume text-2xl"></i>
            <div class="text-left">
                <div class="text-xs">지금 바로 문의</div>
                <div class="text-lg font-bold">010-5197-1332</div>
            </div>
        </a>
    </div>
    
    <!-- 푸터 -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="container mx-auto px-4">
            <div class="grid md:grid-cols-3 gap-8">
                <div>
                    <h3 class="text-2xl font-bold mb-4 morphing-text">강남룸</h3>
                    <p class="text-gray-400">강남 최고의 프리미엄 가라오케</p>
                </div>
                <div>
                    <h4 class="text-lg font-bold mb-4">연락처</h4>
                    <p class="text-gray-400 mb-2">
                        <i class="fas fa-phone mr-2"></i>010-5197-1332
                    </p>
                    <p class="text-gray-400 mb-2">
                        <i class="fas fa-user mr-2"></i>최익현 실장
                    </p>
                    <p class="text-gray-400">
                        <i class="fas fa-map-marker-alt mr-2"></i>서울 강남구
                    </p>
                </div>
                <div>
                    <h4 class="text-lg font-bold mb-4">운영시간</h4>
                    <p class="text-gray-400">24시간 연중무휴</p>
                </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 강남룸. All rights reserved.</p>
            </div>
        </div>
    </footer>
    
    <!-- AOS 초기화 -->
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
    <script>
      AOS.init({
        duration: 1000,
        once: false,
      });
    </script>
</body>
</html>`
}

// 메인 페이지
function renderMainPage() {
  return renderLayout('홈', `
    <!-- 히어로 섹션 -->
    <section class="text-white py-32 relative overflow-hidden" style="min-height: 600px;">
        <!-- 배경 이미지 -->
        <div class="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1920&h=1080&fit=crop&q=80" 
                 alt="강남룸 프리미엄 가라오케 서비스"
                 class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-800/85 to-pink-900/90"></div>
        </div>
        <div class="container mx-auto px-4 text-center relative z-10">
            <h1 class="text-6xl md:text-7xl font-black mb-6 morphing-text" data-aos="fade-up">
                강남룸
            </h1>
            <p class="text-2xl md:text-3xl mb-8 font-light" data-aos="fade-up" data-aos-delay="200">
                강남 최고의 프리미엄 가라오케
            </p>
            <p class="text-xl mb-12 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="400">
                최신 음향시설과 고급스러운 인테리어로 특별한 시간을 선사합니다
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center" data-aos="fade-up" data-aos-delay="600">
                <a href="tel:010-5197-1332" class="bg-white text-purple-600 px-10 py-4 rounded-full text-lg font-bold glow-button inline-block">
                    <i class="fas fa-phone mr-2"></i>지금 전화하기
                </a>
                <a href="/inquiry" class="bg-pink-600 text-white px-10 py-4 rounded-full text-lg font-bold glow-button inline-block">
                    <i class="fas fa-calendar-check mr-2"></i>온라인 예약
                </a>
            </div>
        </div>
        <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 scroll-indicator">
            <i class="fas fa-chevron-down text-4xl text-white opacity-70"></i>
        </div>
    </section>
    
    <!-- 특징 섹션 -->
    <section class="py-20 bg-white">
        <div class="container mx-auto px-4">
            <h2 class="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800" data-aos="fade-up">
                <span class="morphing-text">강남룸</span>의 특별함
            </h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="text-center p-8 card-hover bg-gray-50 rounded-xl" data-aos="fade-up" data-aos-delay="0">
                    <div class="text-6xl mb-6">🎤</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">최신 음향 시설</h3>
                    <p class="text-gray-600">프리미엄 음향장비로 완벽한 사운드를 경험하세요</p>
                </div>
                <div class="text-center p-8 card-hover bg-gray-50 rounded-xl" data-aos="fade-up" data-aos-delay="200">
                    <div class="text-6xl mb-6">✨</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">고급스러운 인테리어</h3>
                    <p class="text-gray-600">세련되고 모던한 공간에서 특별한 시간을 보내세요</p>
                </div>
                <div class="text-center p-8 card-hover bg-gray-50 rounded-xl" data-aos="fade-up" data-aos-delay="400">
                    <div class="text-6xl mb-6">🌟</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">프리미엄 서비스</h3>
                    <p class="text-gray-600">최고의 서비스로 만족스러운 경험을 제공합니다</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- 이미지 갤러리 섹션 -->
    <section class="py-20 bg-gray-100">
        <div class="container mx-auto px-4">
            <h2 class="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-800" data-aos="fade-up">
                <span class="morphing-text">강남룸</span> 갤러리
            </h2>
            <div class="grid md:grid-cols-3 gap-6">
                <div class="card-hover relative overflow-hidden rounded-xl" data-aos="zoom-in" data-aos-delay="0">
                    <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&q=80" 
                         alt="강남룸 프리미엄 가라오케 메인홀 고급스러운 인테리어" 
                         class="w-full h-64 object-cover shadow-lg">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p class="text-white font-bold text-lg">프리미엄 메인홀</p>
                    </div>
                </div>
                <div class="card-hover relative overflow-hidden rounded-xl" data-aos="zoom-in" data-aos-delay="200">
                    <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop&q=80" 
                         alt="강남룸 VIP룸 고급 인테리어 마이크와 조명" 
                         class="w-full h-64 object-cover shadow-lg">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p class="text-white font-bold text-lg">VIP 룸</p>
                    </div>
                </div>
                <div class="card-hover relative overflow-hidden rounded-xl" data-aos="zoom-in" data-aos-delay="400">
                    <img src="https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=600&fit=crop&q=80" 
                         alt="강남룸 최신 음향장비 프로페셔널 사운드 시스템" 
                         class="w-full h-64 object-cover shadow-lg">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p class="text-white font-bold text-lg">최신 음향장비</p>
                    </div>
                </div>
                <div class="card-hover relative overflow-hidden rounded-xl" data-aos="zoom-in" data-aos-delay="0">
                    <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&q=80" 
                         alt="강남룸 가라오케 분위기 조명과 무대" 
                         class="w-full h-64 object-cover shadow-lg">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p class="text-white font-bold text-lg">무드 조명</p>
                    </div>
                </div>
                <div class="card-hover relative overflow-hidden rounded-xl" data-aos="zoom-in" data-aos-delay="200">
                    <img src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop&q=80" 
                         alt="강남룸 프리미엄 주류 서비스 와인과 위스키" 
                         class="w-full h-64 object-cover shadow-lg">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p class="text-white font-bold text-lg">프리미엄 주류</p>
                    </div>
                </div>
                <div class="card-hover relative overflow-hidden rounded-xl" data-aos="zoom-in" data-aos-delay="400">
                    <img src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop&q=80" 
                         alt="강남룸 편안한 소파와 테이블 서비스" 
                         class="w-full h-64 object-cover shadow-lg">
                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p class="text-white font-bold text-lg">럭셔리 공간</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <!-- CTA 섹션 -->
    <section class="py-20 gradient-bg text-white">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-4xl md:text-5xl font-bold mb-6" data-aos="fade-up">
                지금 바로 예약하세요
            </h2>
            <p class="text-xl mb-8 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                강남룸에서 특별한 시간을 만들어보세요
            </p>
            <div class="flex flex-col sm:flex-row gap-6 justify-center items-center" data-aos="fade-up" data-aos-delay="400">
                <div class="text-center">
                    <div class="text-5xl font-black mb-2">010-5197-1332</div>
                    <div class="text-lg">최익현 실장</div>
                </div>
                <a href="tel:010-5197-1332" class="bg-white text-purple-600 px-10 py-4 rounded-full text-lg font-bold glow-button">
                    <i class="fas fa-phone-volume mr-2"></i>전화 상담하기
                </a>
            </div>
        </div>
    </section>
  `)
}

// 서비스 페이지
function renderServicePage() {
  return renderLayout('서비스 안내', `
    <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
            <h1 class="text-5xl font-bold text-center mb-8" data-aos="fade-up">
                <span class="morphing-text">강남룸</span> 서비스
            </h1>
            <p class="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                최고의 서비스로 특별한 경험을 제공합니다
            </p>
            
            <div class="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div class="bg-white p-8 rounded-xl shadow-lg card-hover" data-aos="fade-right">
                    <div class="text-5xl mb-4">🎵</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">프리미엄 룸 서비스</h3>
                    <p class="text-gray-600 mb-4">
                        강남룸만의 프리미엄 룸 서비스로 편안하고 럭셔리한 시간을 보내실 수 있습니다. 
                        최신 음향장비와 고급 인테리어가 갖춰진 공간에서 최고의 경험을 선사합니다.
                    </p>
                    <ul class="space-y-2 text-gray-700">
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>최신 노래방 시스템</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>프리미엄 음향장비</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>고급 조명 시스템</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>넓은 룸 공간</li>
                    </ul>
                </div>
                
                <div class="bg-white p-8 rounded-xl shadow-lg card-hover" data-aos="fade-left">
                    <div class="text-5xl mb-4">🍷</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">프리미엄 주류 서비스</h3>
                    <p class="text-gray-600 mb-4">
                        다양한 프리미엄 주류와 안주를 준비하고 있습니다. 
                        고급 위스키부터 와인, 맥주까지 폭넓은 선택지를 제공합니다.
                    </p>
                    <ul class="space-y-2 text-gray-700">
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>프리미엄 위스키</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>수입 와인 & 샴페인</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>다양한 안주 메뉴</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>무제한 소프트드링크</li>
                    </ul>
                </div>
                
                <div class="bg-white p-8 rounded-xl shadow-lg card-hover" data-aos="fade-right">
                    <div class="text-5xl mb-4">👔</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">비즈니스 접대</h3>
                    <p class="text-gray-600 mb-4">
                        중요한 비즈니스 접대에 적합한 프리미엄 서비스를 제공합니다. 
                        VIP 룸에서 격조있는 비즈니스 미팅을 진행하실 수 있습니다.
                    </p>
                    <ul class="space-y-2 text-gray-700">
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>프라이빗 VIP 룸</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>전담 매니저 배정</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>맞춤형 서비스</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>발레파킹 서비스</li>
                    </ul>
                </div>
                
                <div class="bg-white p-8 rounded-xl shadow-lg card-hover" data-aos="fade-left">
                    <div class="text-5xl mb-4">🎉</div>
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">단체 예약 & 이벤트</h3>
                    <p class="text-gray-600 mb-4">
                        각종 모임, 회식, 생일파티, 동창회 등 단체 행사에 최적화된 공간과 서비스를 제공합니다.
                    </p>
                    <ul class="space-y-2 text-gray-700">
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>대형 룸 이용 가능</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>단체 할인 혜택</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>이벤트 데코레이션</li>
                        <li><i class="fas fa-check-circle text-purple-600 mr-2"></i>케이터링 서비스</li>
                    </ul>
                </div>
            </div>
            
            <div class="text-center mt-16" data-aos="fade-up">
                <a href="tel:010-5197-1332" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full text-xl font-bold glow-button inline-block">
                    <i class="fas fa-phone mr-2"></i>010-5197-1332 문의하기
                </a>
            </div>
        </div>
    </section>
  `, '강남룸, 강남 가라오케, 프리미엄 서비스, 비즈니스 접대, 단체 예약')
}

// 시설 안내 페이지
function renderFacilitiesPage() {
  return renderLayout('시설 안내', `
    <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
            <h1 class="text-5xl font-bold text-center mb-8" data-aos="fade-up">
                <span class="morphing-text">강남룸</span> 시설 안내
            </h1>
            <p class="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                최고급 시설로 완벽한 경험을 제공합니다
            </p>
            
            <!-- VIP 룸 -->
            <div class="max-w-6xl mx-auto mb-16" data-aos="fade-up">
                <div class="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div class="grid md:grid-cols-2">
                        <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop&q=80" 
                             alt="강남룸 VIP룸 시설 고급스러운 인테리어와 조명" 
                             class="w-full h-full object-cover">
                        <div class="p-12">
                            <h2 class="text-3xl font-bold mb-6 text-gray-800">VIP 룸</h2>
                            <p class="text-gray-600 mb-6">
                                최고급 인테리어와 최신 음향장비가 완비된 프리미엄 VIP 룸입니다. 
                                넓은 공간과 고급스러운 분위기에서 특별한 시간을 보내실 수 있습니다.
                            </p>
                            <ul class="space-y-3 text-gray-700">
                                <li><i class="fas fa-star text-yellow-500 mr-2"></i>40평형 대형 룸</li>
                                <li><i class="fas fa-star text-yellow-500 mr-2"></i>프리미엄 음향시스템</li>
                                <li><i class="fas fa-star text-yellow-500 mr-2"></i>고급 가죽 소파</li>
                                <li><i class="fas fa-star text-yellow-500 mr-2"></i>무드 조명 시스템</li>
                                <li><i class="fas fa-star text-yellow-500 mr-2"></i>개별 화장실 구비</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 일반 룸 -->
            <div class="max-w-6xl mx-auto mb-16" data-aos="fade-up">
                <div class="bg-white rounded-xl shadow-xl overflow-hidden">
                    <div class="grid md:grid-cols-2">
                        <div class="p-12 order-2 md:order-1">
                            <h2 class="text-3xl font-bold mb-6 text-gray-800">프리미엄 룸</h2>
                            <p class="text-gray-600 mb-6">
                                소규모 모임이나 프라이빗한 자리에 최적화된 프리미엄 룸입니다. 
                                고급스러운 인테리어와 최신 시설로 편안한 시간을 보내실 수 있습니다.
                            </p>
                            <ul class="space-y-3 text-gray-700">
                                <li><i class="fas fa-check text-purple-600 mr-2"></i>20평형 중형 룸</li>
                                <li><i class="fas fa-check text-purple-600 mr-2"></i>최신 노래방 기기</li>
                                <li><i class="fas fa-check text-purple-600 mr-2"></i>LED 조명 시스템</li>
                                <li><i class="fas fa-check text-purple-600 mr-2"></i>편안한 소파</li>
                                <li><i class="fas fa-check text-purple-600 mr-2"></i>테이블 서비스</li>
                            </ul>
                        </div>
                        <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&h=600&fit=crop&q=80" 
                             alt="강남룸 프리미엄룸 시설 마이크와 무대 조명" 
                             class="w-full h-full object-cover order-1 md:order-2">
                    </div>
                </div>
            </div>
            
            <!-- 부대시설 -->
            <div class="max-w-6xl mx-auto" data-aos="fade-up">
                <h2 class="text-3xl font-bold mb-8 text-center text-gray-800">부대시설</h2>
                <div class="grid md:grid-cols-3 gap-8">
                    <div class="bg-white p-8 rounded-xl shadow-lg text-center card-hover">
                        <div class="text-5xl mb-4">🚗</div>
                        <h3 class="text-xl font-bold mb-3 text-gray-800">주차장</h3>
                        <p class="text-gray-600">넓은 주차 공간과 발레파킹 서비스</p>
                    </div>
                    <div class="bg-white p-8 rounded-xl shadow-lg text-center card-hover">
                        <div class="text-5xl mb-4">🚻</div>
                        <h3 class="text-xl font-bold mb-3 text-gray-800">화장실</h3>
                        <p class="text-gray-600">깨끗하고 고급스러운 화장실</p>
                    </div>
                    <div class="bg-white p-8 rounded-xl shadow-lg text-center card-hover">
                        <div class="text-5xl mb-4">🎁</div>
                        <h3 class="text-xl font-bold mb-3 text-gray-800">라운지</h3>
                        <p class="text-gray-600">편안한 대기 공간 및 라운지</p>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-16" data-aos="fade-up">
                <a href="tel:010-5197-1332" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full text-xl font-bold glow-button inline-block">
                    <i class="fas fa-phone mr-2"></i>시설 문의: 010-5197-1332
                </a>
            </div>
        </div>
    </section>
  `, '강남룸, 강남 가라오케 시설, VIP룸, 프리미엄 룸, 고급 인테리어')
}

// 가격 안내 페이지
function renderPricingPage() {
  return renderLayout('가격 안내', `
    <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
            <h1 class="text-5xl font-bold text-center mb-8" data-aos="fade-up">
                <span class="morphing-text">강남룸</span> 가격 안내
            </h1>
            <p class="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                합리적인 가격으로 최고의 서비스를 제공합니다
            </p>
            
            <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                <div class="bg-white p-8 rounded-xl shadow-xl card-hover" data-aos="fade-up" data-aos-delay="0">
                    <div class="text-center mb-6">
                        <div class="text-5xl mb-4">🎵</div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">베이직</h3>
                        <p class="text-gray-600">소규모 모임</p>
                    </div>
                    <div class="text-center mb-6">
                        <div class="text-4xl font-black text-purple-600 mb-2">전화문의</div>
                        <p class="text-gray-500">시간당 기준</p>
                    </div>
                    <ul class="space-y-3 text-gray-700 mb-8">
                        <li><i class="fas fa-check text-purple-600 mr-2"></i>2-4인 이용</li>
                        <li><i class="fas fa-check text-purple-600 mr-2"></i>기본 음향시설</li>
                        <li><i class="fas fa-check text-purple-600 mr-2"></i>소프트드링크 제공</li>
                        <li><i class="fas fa-check text-purple-600 mr-2"></i>기본 안주</li>
                    </ul>
                    <a href="tel:010-5197-1332" class="block text-center bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                        문의하기
                    </a>
                </div>
                
                <div class="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-xl shadow-2xl transform scale-105 text-white" data-aos="fade-up" data-aos-delay="200">
                    <div class="text-center mb-6">
                        <div class="inline-block bg-yellow-400 text-purple-900 px-4 py-1 rounded-full text-sm font-bold mb-4">
                            인기
                        </div>
                        <div class="text-5xl mb-4">⭐</div>
                        <h3 class="text-2xl font-bold mb-2">프리미엄</h3>
                        <p>중규모 모임</p>
                    </div>
                    <div class="text-center mb-6">
                        <div class="text-4xl font-black mb-2">전화문의</div>
                        <p>시간당 기준</p>
                    </div>
                    <ul class="space-y-3 mb-8">
                        <li><i class="fas fa-check mr-2"></i>5-8인 이용</li>
                        <li><i class="fas fa-check mr-2"></i>프리미엄 음향시설</li>
                        <li><i class="fas fa-check mr-2"></i>무제한 음료</li>
                        <li><i class="fas fa-check mr-2"></i>프리미엄 안주</li>
                        <li><i class="fas fa-check mr-2"></i>전담 매니저</li>
                    </ul>
                    <a href="tel:010-5197-1332" class="block text-center bg-white text-purple-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                        문의하기
                    </a>
                </div>
                
                <div class="bg-white p-8 rounded-xl shadow-xl card-hover" data-aos="fade-up" data-aos-delay="400">
                    <div class="text-center mb-6">
                        <div class="text-5xl mb-4">👑</div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">VIP</h3>
                        <p class="text-gray-600">대규모 모임</p>
                    </div>
                    <div class="text-center mb-6">
                        <div class="text-4xl font-black text-purple-600 mb-2">전화문의</div>
                        <p class="text-gray-500">시간당 기준</p>
                    </div>
                    <ul class="space-y-3 text-gray-700 mb-8">
                        <li><i class="fas fa-check text-purple-600 mr-2"></i>10인 이상</li>
                        <li><i class="fas fa-check text-purple-600 mr-2"></i>최고급 음향시설</li>
                        <li><i class="fas fa-check text-purple-600 mr-2"></i>프리미엄 주류</li>
                        <li><i class="fas fa-check text-purple-600 mr-2"></i>고급 안주</li>
                        <li><i class="fas fa-check text-purple-600 mr-2"></i>발레파킹</li>
                    </ul>
                    <a href="tel:010-5197-1332" class="block text-center bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                        문의하기
                    </a>
                </div>
            </div>
            
            <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg" data-aos="fade-up">
                <h3 class="text-2xl font-bold mb-6 text-center text-gray-800">특별 할인 혜택</h3>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="border-l-4 border-purple-600 pl-4">
                        <h4 class="font-bold text-lg mb-2 text-gray-800">단체 예약 할인</h4>
                        <p class="text-gray-600">10인 이상 단체 예약 시 특별 할인 제공</p>
                    </div>
                    <div class="border-l-4 border-pink-600 pl-4">
                        <h4 class="font-bold text-lg mb-2 text-gray-800">평일 할인</h4>
                        <p class="text-gray-600">평일 오후 6시 이전 예약 시 할인 혜택</p>
                    </div>
                    <div class="border-l-4 border-purple-600 pl-4">
                        <h4 class="font-bold text-lg mb-2 text-gray-800">재방문 할인</h4>
                        <p class="text-gray-600">재방문 고객 대상 특별 할인</p>
                    </div>
                    <div class="border-l-4 border-pink-600 pl-4">
                        <h4 class="font-bold text-lg mb-2 text-gray-800">생일 이벤트</h4>
                        <p class="text-gray-600">생일 고객 케이크 & 샴페인 서비스</p>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-16" data-aos="fade-up">
                <p class="text-xl text-gray-600 mb-6">정확한 가격은 전화 문의 바랍니다</p>
                <a href="tel:010-5197-1332" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full text-xl font-bold glow-button inline-block">
                    <i class="fas fa-phone mr-2"></i>010-5197-1332 최익현 실장
                </a>
            </div>
        </div>
    </section>
  `, '강남룸, 강남 가라오케 가격, 강남룸 요금, 가라오케 할인')
}

// 위치 안내 페이지
function renderLocationPage() {
  return renderLayout('오시는 길', `
    <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
            <h1 class="text-5xl font-bold text-center mb-8" data-aos="fade-up">
                <span class="morphing-text">강남룸</span> 오시는 길
            </h1>
            <p class="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                강남역에서 도보 5분, 교통이 편리한 위치입니다
            </p>
            
            <div class="max-w-6xl mx-auto">
                <!-- 지도 -->
                <div class="bg-white rounded-xl shadow-xl overflow-hidden mb-12" data-aos="fade-up">
                    <div class="aspect-video bg-gray-200 flex items-center justify-center">
                        <div class="text-center">
                            <i class="fas fa-map-marked-alt text-6xl text-gray-400 mb-4"></i>
                            <p class="text-gray-600 text-lg">강남구 테헤란로 일대</p>
                            <p class="text-gray-500">강남역 10번 출구 도보 5분</p>
                        </div>
                    </div>
                </div>
                
                <!-- 교통 정보 -->
                <div class="grid md:grid-cols-2 gap-8 mb-12">
                    <div class="bg-white p-8 rounded-xl shadow-lg" data-aos="fade-right">
                        <h3 class="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                            <i class="fas fa-subway text-purple-600 mr-3"></i>
                            지하철 이용 시
                        </h3>
                        <div class="space-y-4">
                            <div class="border-l-4 border-purple-600 pl-4">
                                <h4 class="font-bold text-lg mb-2 text-gray-800">2호선 강남역</h4>
                                <p class="text-gray-600">10번 출구 도보 5분</p>
                            </div>
                            <div class="border-l-4 border-pink-600 pl-4">
                                <h4 class="font-bold text-lg mb-2 text-gray-800">신분당선 강남역</h4>
                                <p class="text-gray-600">10번 출구 도보 5분</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-8 rounded-xl shadow-lg" data-aos="fade-left">
                        <h3 class="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                            <i class="fas fa-car text-purple-600 mr-3"></i>
                            자가용 이용 시
                        </h3>
                        <div class="space-y-4">
                            <div class="border-l-4 border-purple-600 pl-4">
                                <h4 class="font-bold text-lg mb-2 text-gray-800">주차 안내</h4>
                                <p class="text-gray-600">건물 지하 주차장 이용 가능</p>
                            </div>
                            <div class="border-l-4 border-pink-600 pl-4">
                                <h4 class="font-bold text-lg mb-2 text-gray-800">발레파킹</h4>
                                <p class="text-gray-600">VIP 고객 발레파킹 서비스 제공</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 연락처 정보 -->
                <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-12 rounded-xl shadow-2xl" data-aos="fade-up">
                    <div class="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 class="text-3xl font-bold mb-6">연락처</h3>
                            <div class="space-y-4 text-lg">
                                <div class="flex items-center">
                                    <i class="fas fa-phone w-8 text-2xl"></i>
                                    <span>010-5197-1332</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-user w-8 text-2xl"></i>
                                    <span>최익현 실장</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-clock w-8 text-2xl"></i>
                                    <span>24시간 연중무휴</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-map-marker-alt w-8 text-2xl"></i>
                                    <span>서울 강남구</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center justify-center">
                            <a href="tel:010-5197-1332" class="bg-white text-purple-600 px-12 py-6 rounded-full text-2xl font-bold glow-button">
                                <i class="fas fa-phone-volume mr-3"></i>전화하기
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  `, '강남룸, 강남 가라오케 위치, 강남역, 오시는 길')
}

// 블로그 목록 페이지
function renderBlogPage() {
  return renderLayout('블로그', `
    <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
            <h1 class="text-5xl font-bold text-center mb-8" data-aos="fade-up">
                <span class="morphing-text">강남룸</span> 블로그
            </h1>
            <p class="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                강남룸의 최신 소식과 다양한 정보를 확인하세요
            </p>
            
            <div id="blog-posts" class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                    <p class="text-gray-600 mt-4">게시글을 불러오는 중...</p>
                </div>
            </div>
        </div>
    </section>
    
    <script>
      // 블로그 게시글 로드
      async function loadPosts() {
        try {
          const response = await fetch('/api/posts');
          const data = await response.json();
          const container = document.getElementById('blog-posts');
          
          if (data.posts && data.posts.length > 0) {
            container.innerHTML = data.posts.map((post, index) => {
              // DB에 저장된 이미지 URL 사용, 없으면 기본 이미지
              const imageUrl = post.image_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop&q=80';
              return \`
              <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover" data-aos="fade-up" data-aos-delay="\${index * 100}">
                  <div class="h-48 overflow-hidden relative">
                      <img src="\${imageUrl}" 
                           alt="강남룸 \${post.category} - \${post.title}" 
                           class="w-full h-full object-cover">
                      <div class="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                          \${post.category}
                      </div>
                  </div>
                  <div class="p-6">
                      <h3 class="text-xl font-bold mb-3 text-gray-800">\${post.title}</h3>
                      <p class="text-gray-600 mb-4">\${post.excerpt}</p>
                      <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                          <span><i class="fas fa-user mr-1"></i>\${post.author}</span>
                          <span><i class="fas fa-eye mr-1"></i>\${post.views} views</span>
                      </div>
                      <a href="/blog/\${post.slug}" class="block text-center bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
                          자세히 보기
                      </a>
                  </div>
              </div>
            \`;
            }).join('');
          } else {
            container.innerHTML = '<div class="col-span-3 text-center py-12"><p class="text-gray-600">게시글이 없습니다.</p></div>';
          }
        } catch (error) {
          console.error('게시글 로드 실패:', error);
          document.getElementById('blog-posts').innerHTML = '<div class="col-span-3 text-center py-12"><p class="text-red-600">게시글을 불러오는데 실패했습니다.</p></div>';
        }
      }
      
      loadPosts();
    </script>
  `, '강남룸, 강남 가라오케 블로그, 강남룸 소식, 가라오케 정보')
}

// 블로그 상세 페이지
function renderBlogDetailPage(slug: string) {
  return renderLayout('블로그 상세', `
    <section class="py-20 bg-gray-50">
        <div id="post-detail" class="container mx-auto px-4 max-w-4xl">
            <div class="text-center py-12">
                <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                <p class="text-gray-600 mt-4">게시글을 불러오는 중...</p>
            </div>
        </div>
    </section>
    
    <script>
      // 게시글 상세 정보 로드
      async function loadPost() {
        try {
          const response = await fetch('/api/posts/${slug}');
          const data = await response.json();
          const container = document.getElementById('post-detail');
          
          if (data.post) {
            const post = data.post;
            
            // DB에 저장된 이미지 URL 사용, 없으면 기본 이미지
            const imageUrl = post.image_url ? post.image_url.replace('w=600&h=400', 'w=1200&h=600') : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=600&fit=crop&q=80';
            
            container.innerHTML = \`
              <article class="bg-white rounded-xl shadow-xl overflow-hidden" data-aos="fade-up">
                  <div class="h-64 md:h-96 overflow-hidden relative">
                      <img src="\${imageUrl}" 
                           alt="강남룸 \${post.category} - \${post.title}" 
                           class="w-full h-full object-cover">
                      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <div class="p-8 text-white">
                              <div class="inline-block bg-purple-600 px-4 py-2 rounded-full text-sm font-bold mb-4">
                                  \${post.category}
                              </div>
                              <h1 class="text-4xl md:text-5xl font-bold">\${post.title}</h1>
                          </div>
                      </div>
                  </div>
                  <div class="p-12">
                      <div class="flex items-center text-gray-500 mb-8 space-x-6 border-b pb-6">
                          <span><i class="fas fa-user mr-2"></i>\${post.author}</span>
                          <span><i class="fas fa-calendar mr-2"></i>\${new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                          <span><i class="fas fa-eye mr-2"></i>\${post.views} views</span>
                      </div>
                      <div class="prose max-w-none text-gray-700 text-lg leading-relaxed">
                          \${post.content.split('\\n').map(p => \`<p class="mb-4">\${p}</p>\`).join('')}
                      </div>
                      <div class="mt-12 pt-8 border-t border-gray-200">
                          <a href="/blog" class="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                              <i class="fas fa-arrow-left mr-2"></i>목록으로
                          </a>
                      </div>
                  </div>
              </article>
              
              <div class="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 p-8 rounded-xl text-white text-center" data-aos="fade-up">
                  <h3 class="text-2xl font-bold mb-4">문의 및 예약</h3>
                  <p class="text-xl mb-6">강남룸 최익현 실장</p>
                  <a href="tel:010-5197-1332" class="inline-block bg-white text-purple-600 px-10 py-4 rounded-full text-xl font-bold glow-button">
                      <i class="fas fa-phone mr-2"></i>010-5197-1332
                  </a>
              </div>
            \`;
          } else {
            container.innerHTML = '<div class="text-center py-12"><p class="text-red-600">게시글을 찾을 수 없습니다.</p></div>';
          }
        } catch (error) {
          console.error('게시글 로드 실패:', error);
          document.getElementById('post-detail').innerHTML = '<div class="text-center py-12"><p class="text-red-600">게시글을 불러오는데 실패했습니다.</p></div>';
        }
      }
      
      loadPost();
    </script>
  `, '강남룸, 강남 가라오케, 가라오케 정보')
}

// 예약 문의 페이지
function renderInquiryPage() {
  return renderLayout('예약 문의', `
    <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-4">
            <h1 class="text-5xl font-bold text-center mb-8" data-aos="fade-up">
                예약 문의
            </h1>
            <p class="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="200">
                온라인으로 간편하게 예약 문의하세요
            </p>
            
            <div class="max-w-2xl mx-auto">
                <div class="bg-white p-12 rounded-xl shadow-xl" data-aos="fade-up">
                    <form id="inquiry-form" class="space-y-6">
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2">이름 *</label>
                            <input type="text" name="name" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2">연락처 *</label>
                            <input type="tel" name="phone" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                   placeholder="010-0000-0000">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2">인원</label>
                            <input type="number" name="party_size" min="1" 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2">방문 예정일</label>
                            <input type="date" name="visit_date" 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-gray-700 font-semibold mb-2">문의 내용</label>
                            <textarea name="message" rows="4" 
                                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"></textarea>
                        </div>
                        <button type="submit" 
                                class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg text-lg font-bold glow-button">
                            <i class="fas fa-paper-plane mr-2"></i>문의하기
                        </button>
                    </form>
                    
                    <div class="mt-8 pt-8 border-t border-gray-200 text-center">
                        <p class="text-gray-600 mb-4">또는 바로 전화주세요</p>
                        <a href="tel:010-5197-1332" class="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition">
                            <i class="fas fa-phone mr-2"></i>010-5197-1332
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    <script>
      document.getElementById('inquiry-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
          name: formData.get('name'),
          phone: formData.get('phone'),
          party_size: formData.get('party_size'),
          visit_date: formData.get('visit_date'),
          message: formData.get('message')
        };
        
        try {
          const response = await fetch('/api/inquiries', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            alert('문의가 접수되었습니다. 곧 연락드리겠습니다.');
            e.target.reset();
          } else {
            alert('문의 접수에 실패했습니다. 다시 시도해주세요.');
          }
        } catch (error) {
          console.error('문의 접수 실패:', error);
          alert('문의 접수에 실패했습니다. 전화로 문의해주세요: 010-5197-1332');
        }
      });
    </script>
  `, '강남룸, 강남 가라오케 예약, 강남룸 문의, 온라인 예약')
}

export default app
