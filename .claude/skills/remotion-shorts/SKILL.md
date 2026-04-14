---
name: remotion-shorts
description: >-
  Remotion 기반 세로형(9:16) 쇼츠 슬라이드 영상 생성. YouTube Shorts, Instagram
  Reels, TikTok 등 세로 영상용. 사용자가 주제·내용을 제공하면 Paperlogy 폰트, 컬러
  테마, 애니메이션이 적용된 쇼츠 슬라이드를 생성한다. "쇼츠 만들어줘", "shorts",
  "세로 슬라이드", "릴스" 등의 요청에 사용.
---

# Remotion 쇼츠(9:16) 슬라이드 생성기

## 역할

사용자가 주제/내용을 제공하면 **세로형(1080x1920) 슬라이드 영상**을 생성한다.
가로형 슬라이드(`remotion-slides`)와 동일한 디자인 시스템을 사용하되 세로 레이아웃에 최적화.

## 프로젝트 위치

작업 디렉토리: `~/Documents/dev/lab-remotion`

쇼츠 전용 파일은 `src/shorts/` 하위에 위치한다.
공통 컴포넌트(`src/slides/components/`), 타입(`src/slides/types.ts`), 테마(`src/slides/themes.ts`)는 가로형과 공유한다.

## 해상도

- **1080 x 1920** (9:16)
- 30fps

## 디자인 시스템

가로형 스킬(`remotion-slides`)과 동일한 폰트, 뱃지 스타일을 사용한다.
컬러 테마 상세는 `remotion-themes` 스킬 참조. 등록 테마: `dark`(기본), `blue`, `orange`, `yellow`, `black`.
차이점은 레이아웃과 폰트 크기뿐.

### 폰트

| 용도 | 폰트 |
|------|------|
| 제목 | Paperlogy 8 ExtraBold |
| 본문/목록 | Paperlogy 5 Medium |

### 세로형 폰트 크기 (가로형 대비)

세로형은 가로폭이 좁으므로(1080px) 크기를 조절한다:

| 요소 | 가로형(1920px) | 세로형(1080px) |
|------|--------------|--------------|
| 뱃지 | 42px | 36px |
| 타이틀 | 125px | 80px |
| 서브텍스트 | 55px | 40px |
| 불릿 | 55px | 38px |
| 태그 | 47px | 38px |

## 슬라이드 타입

가로형과 동일한 5가지 타입을 지원하되, **세로 레이아웃**으로 재배치:

### 1. `title-image` — 상단 타이틀 + 하단 이미지

세로형에서는 좌우 배치 대신 **위아래 배치**.

### 2. `title-tags` — 중앙 타이틀 + 하단 태그

가로형과 유사하나 세로 공간 활용.

### 3. `title-bullets` — 상단 타이틀 + 하단 불릿

가로형과 유사.

### 4. `split` — 상단 이미지 + 하단 불릿

세로형에서는 좌우 분할 대신 **상하 분할**.

### 5. `abstract-scene` — 프롬프트 기반 추상 장면

가로형과 동일한 씬 레지스트리(`src/slides/scenes/registry.ts`)를 공유.
`VerticalAbstractSceneSlide`가 씬 컴포넌트에 `layout: "vertical"`을 전달하여 세로 레이아웃으로 렌더링.
씬 컴포넌트는 `compact` 모드로 폰트·패딩을 축소한다.
레지스트리에 매칭되는 전용 씬이 없어도, 기본 `abstract-scene` 폴백이 프롬프트 기반으로 자율 레이아웃을 구성해야 한다.
`~ "..."` 프롬프트는 내부 디렉션용이므로 쇼츠 화면 텍스트로 직접 노출하지 않는다.
쇼츠에서도 불릿 카피가 주 메시지이며, 프롬프트는 그 카피를 시각적으로 풀어내는 용도로만 사용한다.

## 애니메이션

가로형과 동일한 규칙:
- 뱃지: drop + bounce
- 타이틀: fade + translateY
- 불릿/태그: 순차 stagger fade + translateY
- 슬라이드 전환: fade only (15프레임)

## 타이밍

```typescript
const FPS = 30;
const SLIDE_DURATION = 120;     // 4초 (쇼츠는 빠른 전환)
const TRANSITION_DURATION = 12; // 0.4초
```

쇼츠는 총 길이 60초 이내 권장. 슬라이드 10~15장 정도.

## 파일 구조

```
src/shorts/
  constants.ts         # 쇼츠 전용 타이밍 상수
  templates/
    VerticalTitleImageSlide.tsx
    VerticalTitleTagsSlide.tsx
    VerticalTitleBulletsSlide.tsx
    VerticalSplitSlide.tsx
    VerticalAbstractSceneSlide.tsx  # 씬 레지스트리 → layout:"vertical"
  ShortSlideRenderer.tsx
  ShortPresentation.tsx
```

공유 파일 (src/slides/ 에서 import):
- `types.ts`, `themes.ts`
- `components/Badge.tsx`, `SlideTitle.tsx`, `BulletList.tsx`, `TagList.tsx`

## 마크다운 입력 포맷

가로형 슬라이드(`remotion-slides`)와 동일한 마크다운 포맷을 사용한다. 같은 `markdowns/<topic>/<topic>.md`를 공유한다.

### 포맷 규칙

```markdown
---
theme: blue
---

# [뱃지] 타이틀

- 불릿1
- 불릿2

---

# [뱃지] 타이틀

> 태그1, *강조태그*, 태그3
```

### 파싱 규칙

| 마크다운 문법 | 의미 |
|-------------|------|
| `---` (상단) | 프론트매터: `theme` 지정 |
| `---` (중간) | 슬라이드 구분선 |
| `# [뱃지] 타이틀` | 뱃지 + 제목. `{1}` 붙이면 badgeVariant 지정 |
| 제목 다음 일반 텍스트 | 서브텍스트 |
| `- 항목` | 불릿 리스트 |
| `> 태그1, *태그2*, 태그3` | 태그 목록. `*강조*` = accent 색 |
| `![](파일명)` | 이미지 |

### 슬라이드 타입 자동 감지

| `[[추상]]` 또는 `~` | 이미지 | 불릿 | 태그 | → 타입 |
|---------------------|--------|------|------|--------|
| O | - | - | - | `abstract-scene` |
| - | O | O | - | `split` |
| - | O | - | - | `title-image` |
| - | - | O | - | `title-bullets` |
| - | - | - | O | `title-tags` |

`~ "..."` 프롬프트 라인이 있으면 `[[추상]]` 없이도 abstract-scene으로 감지된다.

`badgeVariant`는 슬라이드 순서에 따라 `0`, `1` 자동 교대.

### 예시

```markdown
---
theme: blue
---

# [에이전트 입문] 자동 블로그 만들기

> 커서, *무료 쿠폰*, 30장

---

# [라이브 강의] 배포란?

- "내 사이트 주소로 접속해봐!"
- 인터넷에 내 사이트를 올려서 누구나 접속하게 해주는 것
```

## 주제별 디자인 가이드 (DESIGN.md)

가로형(`remotion-slides`)과 동일. `markdowns/<topic>/DESIGN.md`가 있으면 해당 주제의 디자인에 우선 적용한다.

- DESIGN.md를 추가했다면 실제 쇼츠 화면에 반영 가능한 override까지 같이 만들어야 한다
- 자연어 설명만으로 부족하면 구조화된 theme block을 DESIGN.md에 넣거나 `themes.ts` / `designTheme.ts`를 같이 수정한다
- `theme: DESIGN.md` 사용 시에는 쇼츠 프리뷰/프레젠터에서 실제 반영을 확인한다

### 에이전트 절차

1. `DESIGN.md` 존재 여부를 확인한다.
2. 쇼츠용 원본 마크다운이 `theme: DESIGN.md`인지 확인한다.
3. structured override block이 없으면 템플릿을 복사해 추가한다.
4. block으로 부족한 시각 규칙은 `themes.ts` / `designTheme.ts` 수정으로 보완한다.
5. 쇼츠 프리뷰 또는 프레젠터로 실제 반영을 확인한다.

## 이미지 파일 네이밍

가로형(`remotion-slides`)과 동일. 이미지는 `markdowns/<topic>/`에 저장하고 파일명은 **슬라이드 번호-이미지 설명** 형식:

```
01-product-screenshot.png
03-benchmark-chart.png
```

## 워크플로우

1. 사용자가 마크다운 포맷으로 슬라이드 내용 전달 (또는 자유 텍스트)
2. 마크다운 파일과 이미지를 `markdowns/<topic>/`에 저장
3. `npm run slides:preview` 또는 `slides:present`로 확인
4. 필요시 조정 후 `npm run slides:render`로 최종 렌더

## 슬라이드 내용 작성 규칙

- **한 슬라이드 = 한 메시지** (가로형보다 더 엄격)
- 제목은 **1~2줄**, 최대 10자 내외
- 불릿은 **3개 이내**, 짧게
- 태그는 **2~3개**
- 쇼츠는 빠른 전환이 핵심 — 텍스트를 최소화

### 줄바꿈 규칙 (중요)

- 한 줄에 들어갈 수 있는 텍스트는 **줄바꿈하지 않는다**. 공간이 충분하면 한 줄로 유지.
- 줄바꿈이 불가피한 경우 반드시 **단어 단위**로 끊는다. 글자 중간에서 끊기지 않도록 한다.
- CSS로는 `wordBreak: "keep-all"`이 적용되어 있으므로, 한글 텍스트가 글자 단위로 잘리지 않는다.
- 세로형은 가로폭이 좁으므로 텍스트를 더 짧게 쓰는 것을 우선한다.

## 마스코트

가로형과 동일하게 우하단 고정. `assets/logo-bottom-right.png` 사용.

## 금지 사항

- 개인 사진 파일을 Read 도구로 직접 열지 않는다.
- 과도한 애니메이션 사용하지 않는다.
- 한 슬라이드에 텍스트를 빽빽하게 넣지 않는다.
- 그라데이션, 패턴 배경은 사용하지 않는다 — 단색 배경만.
