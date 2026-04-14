---
name: remotion-presenter
description: >-
  슬라이드 프로젝트의 발표용 프레젠터 생성. 클릭/키보드로 슬라이드를 넘기고,
  하이라이터 마커 기능 포함. "발표용으로 만들어줘", "프레젠터", "presenter",
  "발표 모드" 등의 요청에 사용.
---

# 슬라이드 발표용 프레젠터

## 역할

마크다운 슬라이드를 브라우저에서 클릭/키보드로 넘기며 발표할 수 있는 프레젠터.
Remotion의 `@remotion/player`를 사용하여 모든 애니메이션(뱃지 바운스, 타이틀 fade-in, 불릿 stagger 등)이 그대로 동작한다.

## 실행 방법

```bash
npm run slides:present -- markdowns/<topic>/<topic>.md
```

Vite 서버가 포트 4000에서 시작된다.

### 중요: 테마/마크다운 수정 후 재시작

- 이 프레젠터는 마크다운을 Vite `define`으로 시작 시점에 읽는다.
- 따라서 `theme:` 변경, frontmatter 수정, 이미지 참조 변경 후에는 기존 `slides:present` 프로세스를 종료하고 다시 실행해야 한다.
- 단순 브라우저 새로고침만으로는 이전 마크다운 상태가 남을 수 있다.
- 화면에 테마가 안 바뀌거나 슬라이드 수가 이상하면 먼저 frontmatter 형식과 서버 재시작 여부를 확인한다.

## 파일 위치

```
src/presenter/
├── Presenter.tsx       # Player + 클릭/키보드 제어
├── index.tsx           # React 진입점
├── index.html          # HTML
├── types.d.ts          # 가상 모듈 타입
└── vite.config.ts      # Vite 설정 (port 4000, 가상 마크다운 모듈)
```

## 조작법

| 동작 | 효과 |
|------|------|
| → / 스페이스 / PageDown | 다음 슬라이드 |
| ← / PageUp | 이전 슬라이드 |
| Home | 첫 슬라이드 |
| End | 마지막 슬라이드 |
| F | 풀스크린 토글 |

하단에 Prev / Next 버튼과 슬라이드 번호 표시.

## 동작 원리

1. Vite 가상 모듈 플러그인이 `SLIDE_MARKDOWN_FILE` 환경변수로 마크다운 파일을 읽음
2. 이미지 경로를 `markdowns/<topic>/파일명`으로 자동 치환
3. `parseSlideMarkdown()`으로 파싱하여 `SlideData[]` 생성
4. `@remotion/player`의 `Player` 컴포넌트로 렌더링
5. 슬라이드 이동 시 애니메이션 재생 → settle 후 자동 pause

## Root.tsx 등록 불필요

프레젠터는 Remotion 컴포지션이 아니라 독립 Vite 앱이므로 Root.tsx에 등록하지 않는다.
