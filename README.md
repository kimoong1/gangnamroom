# 강남룸 - 프리미엄 가라오케

## 프로젝트 개요
- **이름**: 강남룸
- **목표**: '강남룸' 키워드로 SEO/AEO/GEO 최적화된 프리미엄 가라오케 홍보 웹사이트
- **주요 기능**:
  - ✅ 강남룸 키워드 완벽 최적화 (메타태그, H1/H2, 이미지 alt)
  - ✅ 모핑 텍스트 및 고급 애니메이션 효과
  - ✅ 반응형 디자인 (모바일 최적화)
  - ✅ 블로그형 게시판 (Cloudflare D1 데이터베이스)
  - ✅ 예약 문의 시스템
  - ✅ CTA 버튼 (010-5197-1332, 최익현 실장)

## 현재 구현된 기능

### 1. SEO/AEO/GEO 최적화
- **메타 태그**: 모든 페이지에 '강남룸' 키워드 최적화
- **구조화된 데이터**: Schema.org (NightClub) 마크업
- **Open Graph**: 페이스북, 카카오톡 공유 최적화 (가라오케 이미지)
- **Twitter Card**: 트위터 공유 최적화 (가라오케 이미지)
- **시맨틱 HTML**: H1, H2 태그에 '강남룸' 키워드 포함
- **이미지 최적화**: 모든 이미지에 '강남룸' 키워드 포함된 Alt 태그
- **카테고리별 이미지**: 블로그 각 카테고리에 맞는 가라오케 테마 이미지

### 2. 페이지 구성
- **홈 (/)**: 히어로 섹션, 특징, 갤러리, CTA
- **서비스 (/service)**: 프리미엄 룸, 주류, 비즈니스 접대, 단체 예약
- **시설 안내 (/facilities)**: VIP룸, 프리미엄룸, 부대시설
- **가격 안내 (/pricing)**: 베이직, 프리미엄, VIP 요금제
- **오시는 길 (/location)**: 지도, 교통 정보, 연락처
- **블로그 (/blog)**: 게시판 목록 (D1 데이터베이스)
- **블로그 상세 (/blog/:slug)**: 게시글 상세 페이지
- **예약 문의 (/inquiry)**: 온라인 예약 문의 폼

### 3. API 엔드포인트
- `GET /api/posts` - 블로그 게시글 목록
- `GET /api/posts/:slug` - 블로그 게시글 상세
- `POST /api/inquiries` - 예약 문의 접수

### 4. 고급 효과
- **모핑 텍스트**: 그라데이션 애니메이션
- **플로팅 효과**: 부드러운 떠다니는 애니메이션
- **네온 효과**: 발광 텍스트
- **글로우 버튼**: 호버 시 발광 효과
- **카드 호버**: 3D 변환 효과
- **AOS 애니메이션**: 스크롤 기반 애니메이션

## 데이터 구조

### 데이터 저장: JSON 파일

#### posts.json (블로그 게시글)
```json
{
  "posts": [
    {
      "id": 1,
      "title": "게시글 제목",
      "content": "게시글 내용",
      "excerpt": "요약",
      "author": "최익현",
      "category": "카테고리",
      "slug": "URL 슬러그",
      "views": 조회수,
      "image_url": "이미지 URL",
      "created_at": "날짜"
    }
  ]
}
```

- **위치**: `/public/data/posts.json`
- **총 게시글**: 5개 (강남룸 소식, 가격정보, 이용안내, 위치정보, 시설안내)

## URLs

### 로컬 개발
- **URL**: http://localhost:5173
- **데이터**: /public/data/posts.json

### 프로덕션 (Netlify)
- **URL**: https://gangnamroom.netlify.app (배포 후)
- **커스텀 도메인**: 설정 가능

## 사용 가이드

### 1. 방문자용
1. **홈페이지 접속**: 메인 페이지에서 강남룸 소개 확인
2. **서비스 둘러보기**: 네비게이션으로 각 페이지 이동
3. **블로그 읽기**: 최신 소식 및 정보 확인
4. **예약 문의**: 온라인 폼 또는 전화 (010-5197-1332)
5. **모바일 최적화**: 스마트폰에서도 완벽하게 작동

### 2. 관리자용
- 블로그 게시글 추가: D1 데이터베이스에 직접 추가
- 문의 내역 확인: inquiries 테이블 조회
- 게시글 수정: posts 테이블 업데이트

## 배포

### 플랫폼: Netlify
- **상태**: ✅ Netlify 배포 준비 완료
- **기술 스택**: HTML + JavaScript + TailwindCSS + JSON 데이터
- **최종 업데이트**: 2025-10-30

### Netlify 배포 방법

#### 방법 1: GitHub 연동 (권장)
1. GitHub에 코드 푸시
2. Netlify에서 "New site from Git" 선택
3. gangnamroom 저장소 연결
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy site 클릭

#### 방법 2: Netlify CLI
```bash
# Netlify CLI로 배포
npm run build
netlify deploy --prod
```

#### 배포 후 설정
- 커스텀 도메인 연결
- HTTPS 자동 활성화됨
- 자동 빌드 & 배포 활성화

## 개발 명령어

### 로컬 개발
```bash
# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 데이터 관리
```bash
# 블로그 게시글 데이터
# 파일 위치: /public/data/posts.json
# 직접 JSON 파일 수정하여 게시글 추가/수정 가능
```

### Git
```bash
# 상태 확인
git status

# 커밋
git add .
git commit -m "메시지"

# GitHub 푸시 (setup_github_environment 먼저 실행)
git push origin main
```

## 연락처
- **전화**: 010-5197-1332
- **담당자**: 최익현 실장
- **영업시간**: 24시간 연중무휴
- **위치**: 서울 강남구 (강남역 도보 5분)

## 키워드 최적화
이 웹사이트는 다음 키워드로 검색엔진 최적화되어 있습니다:
- 강남룸 (메인 키워드)
- 강남 가라오케
- 강남 룸
- 프리미엄 가라오케
- 강남역 가라오케
- 비즈니스 접대
- VIP 룸

## 기술 스택
- **프레임워크**: 정적 HTML
- **배포 플랫폼**: Netlify
- **데이터 저장**: JSON 파일
- **빌드 도구**: Vite
- **스타일링**: TailwindCSS (CDN)
- **아이콘**: Font Awesome 6.x
- **애니메이션**: AOS Library
- **언어**: HTML + JavaScript

## 프로젝트 구조
```
webapp/
├── public/
│   ├── index.html         # 메인 페이지
│   └── data/
│       └── posts.json     # 블로그 게시글 데이터
├── dist/                  # 빌드 결과물 (Netlify 배포)
├── netlify.toml           # Netlify 설정
├── vite.config.ts         # Vite 빌드 설정
├── package.json           # 의존성 및 스크립트
└── README.md              # 프로젝트 문서

## 이미지 최적화
- **메인 갤러리**: 6개의 가라오케 테마 이미지 (프리미엄 메인홀, VIP룸, 음향장비, 무드 조명, 프리미엄 주류, 럭셔리 공간)
- **블로그 썸네일**: 카테고리별 맞춤 이미지 (강남룸 소식, 가격정보, 이용안내, 위치정보, 시설안내)
- **시설 페이지**: 실제 가라오케 시설 느낌의 고품질 이미지
- **Open Graph**: 소셜 미디어 공유 시 가라오케 테마 이미지
- **모든 이미지**: Alt 태그에 '강남룸' 키워드 포함

## 다음 단계 (권장)
1. ✅ 로컬 개발 및 테스트 완료
2. ✅ 가라오케 테마 이미지 최적화 완료
3. ✅ Netlify 배포 준비 완료
4. ⏳ GitHub에 푸시
5. ⏳ Netlify에서 GitHub 연동 배포
6. ⏳ 커스텀 도메인 연결 (선택사항)
7. ⏳ Google Search Console 등록
8. ⏳ 네이버 검색 등록
9. ⏳ 실제 매장 이미지로 교체 (선택사항 - 현재는 고품질 가라오케 테마 이미지)

## 라이선스
© 2024 강남룸. All rights reserved.
