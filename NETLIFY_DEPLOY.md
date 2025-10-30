# Netlify 배포 가이드

## 강남룸 웹사이트 Netlify 배포 방법

### ✅ 완료된 작업
- ✅ Cloudflare Pages → Netlify로 전환 완료
- ✅ Hono 서버 → 정적 HTML로 변환 완료
- ✅ D1 데이터베이스 → JSON 파일로 변환 완료
- ✅ GitHub 저장소 업데이트 완료

### 📦 저장소 정보
- **GitHub**: https://github.com/kimoong1/gangnamroom
- **브랜치**: main

## 🚀 Netlify 배포 방법

### 방법 1: Netlify 웹 인터페이스 (권장)

1. **Netlify 로그인**
   - https://app.netlify.com 접속
   - GitHub 계정으로 로그인

2. **New site from Git 클릭**
   - "Add new site" → "Import an existing project" 선택

3. **GitHub 연동**
   - "GitHub" 선택
   - `kimoong1/gangnamroom` 저장소 선택

4. **빌드 설정**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

5. **Deploy site 클릭**
   - 자동으로 빌드 & 배포 시작
   - 약 1-2분 소요

6. **배포 완료!**
   - URL: `https://random-name.netlify.app`
   - 커스텀 도메인 설정 가능

### 방법 2: Netlify CLI (로컬)

```bash
# Netlify CLI 설치 (이미 설치됨)
npm install -g netlify-cli

# Netlify 로그인
netlify login

# 빌드
npm run build

# 배포
netlify deploy --prod
```

## 📋 배포 후 설정

### 1. 사이트 이름 변경
- Site settings → Site details → Change site name
- 추천: `gangnamroom` 또는 `gangnam-room`

### 2. 커스텀 도메인 연결 (선택사항)
- Domain settings → Add custom domain
- DNS 설정 안내에 따라 설정

### 3. HTTPS 설정
- 자동으로 활성화됨
- Let's Encrypt 무료 인증서

### 4. 자동 배포 설정
- GitHub 푸시 시 자동 배포 활성화됨
- 브랜치: main

## 🔍 배포 확인 사항

### 테스트할 페이지들
```
✅ 메인 페이지: /
✅ 블로그 데이터: /data/posts.json
```

### SEO 확인
- [ ] 메타 태그 정상 작동
- [ ] Open Graph 이미지 표시
- [ ] Schema.org 구조화 데이터
- [ ] robots.txt 설정

### 성능 확인
- [ ] 로딩 속도 (Lighthouse 90+ 목표)
- [ ] 모바일 최적화
- [ ] 이미지 로딩
- [ ] 애니메이션 작동

## 🐛 문제 해결

### 빌드 실패 시
```bash
# 로컬에서 빌드 테스트
npm run build

# dist 폴더 확인
ls -la dist/
```

### 404 오류 시
- `netlify.toml` 설정 확인
- Redirects 설정 확인

### 이미지 로딩 실패 시
- 외부 이미지 URL 확인 (Unsplash)
- CORS 설정 확인

## 📊 배포 정보

### 프로젝트 구조
```
dist/
├── index.html        # 메인 페이지
├── data/
│   └── posts.json   # 블로그 데이터
└── static/          # 정적 파일
```

### 빌드 설정
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"
```

### 환경 변수
현재 환경 변수 없음 (정적 사이트)

## 📞 연락처
- **전화**: 010-5197-1332
- **담당자**: 최익현 실장
- **운영시간**: 24시간 연중무휴

## 🎉 배포 완료 후
1. Google Search Console 등록
2. 네이버 서치어드바이저 등록
3. Google Analytics 설정 (선택)
4. 카카오톡 채널 연동 (선택)
