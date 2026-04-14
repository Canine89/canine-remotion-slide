---
name: remotion-themes
description: >-
  Remotion 슬라이드/쇼츠 프로젝트의 컬러 테마 레퍼런스.
  테마 추가·수정·조회 시 참조. "테마", "색상", "theme" 등의 요청에 사용.
---

# Remotion 컬러 테마

## 코드 위치

`src/slides/themes.ts` — 모든 테마 정의와 `getTheme()` 헬퍼 함수가 위치.

## 테마 구조

```typescript
interface ThemeColors {
  bg: string;       // 배경색
  title: string;    // 제목 텍스트 색
  text: string;     // 본문 텍스트 색
  accent: string;   // 강조색
  badge: [BadgeStyle, BadgeStyle];  // 테마당 뱃지 2종
}

interface BadgeStyle {
  bg: string;       // 뱃지 배경색
  text: string;     // 뱃지 텍스트 색
}
```

## 등록된 기본 테마 (5종)

### dark (기본값)

| 속성 | 값 |
|------|-----|
| bg | `#2D2D2D` |
| title | `#FFFFFF` |
| text | `#E0E0E0` |
| accent | `#FFFFFF` |
| badge[0] | bg `#1A1A1A`, text `#FFFFFF` |
| badge[1] | bg `#1A1A1A`, text `#FFFFFF` |

### blue

| 속성 | 값 |
|------|-----|
| bg | `#2196F3` |
| title | `#000000` |
| text | `#1A1A1A` |
| accent | `#FFFFFF` |
| badge[0] | bg `#1A1A1A`, text `#FFFFFF` |
| badge[1] | bg `#1565C0`, text `#FFFFFF` |

### orange

| 속성 | 값 |
|------|-----|
| bg | `#E8734A` |
| title | `#FFFFFF` |
| text | `#FFF5F0` |
| accent | `#FFFFFF` |
| badge[0] | bg `#1A1A1A`, text `#FFFFFF` |
| badge[1] | bg `#C4532A`, text `#FFFFFF` |

### yellow

| 속성 | 값 |
|------|-----|
| bg | `#F5E94B` |
| title | `#111111` |
| text | `#1F1F1F` |
| accent | `#000000` |
| badge[0] | bg `#000000`, text `#FAFF69` |
| badge[1] | bg `#333333`, text `#FFFFFF` |

### black

| 속성 | 값 |
|------|-----|
| bg | `#000000` |
| title | `#FFFFFF` |
| text | `#CCCCCC` |
| accent | `#FAFF69` (네온 옐로) |
| badge[0] | bg `#FAFF69`, text `#000000` |
| badge[1] | bg `#333333`, text `#FFFFFF` |

추가 호환 테마로 `parchment`, `figma`도 사용할 수 있다. 다만 기본 보장 세트는 `dark`, `blue`, `orange`, `yellow`, `black` 5종이다.

## DESIGN.md 우선 규칙

`markdowns/<topic>/DESIGN.md`는 아무 때나 자동 적용되지 않는다. 슬라이드 frontmatter의 `theme:`가 정확히 `DESIGN.md`일 때만 해당 주제의 프레젠터·슬라이드·쇼츠에서 적극적으로 오버라이드한다.

- `theme: DESIGN.md`일 때 merge 순서는 `DESIGN baseTheme(없으면 dark) -> DESIGN.md 공통 override -> DESIGN.md의 baseTheme별 override`
- `theme: orange`, `theme: blue` 같은 일반 테마를 쓰면 `DESIGN.md`가 있어도 무시하고 기본 테마만 사용한다
- 즉 기본 테마 5종은 언제든 독립적으로 그대로 쓸 수 있다
- DESIGN.md가 없는데 `theme: DESIGN.md`를 쓰면 `dark` 기반으로 동작한다
- 중요한 운영 규칙: DESIGN.md를 추가했으면 실제 theme override가 화면에 반영되는 상태까지 같이 만든다. 문서만 추가하고 반영이 안 되는 상태로 두지 않는다
- 자연어 문서만으로 충분히 추출되지 않으면 DESIGN.md 안에 구조화된 override block을 추가하는 것을 기본 해법으로 본다
- 그래도 부족하면 `src/slides/themes.ts` 또는 `src/slides/designTheme.ts`를 같이 수정해 해당 디자인 시스템이 실제로 반영되게 한다
- 변경 후에는 `theme: DESIGN.md`로 프레젠터/프리뷰를 다시 띄워 실제 적용을 확인한다

### 에이전트 절차

1. `DESIGN.md`를 읽고 현재 코드가 어느 정도 추출 가능한지 판단한다.
2. 색, 폰트, radius, badge, 타이포 리듬이 핵심이면 structured override block을 먼저 넣는다.
3. 새로운 의미의 필드가 필요하거나 자연어 추출이 반복적으로 실패하면 `themes.ts` / `designTheme.ts`를 수정한다.
4. `theme: DESIGN.md`로 프레젠터/프리뷰를 다시 띄워 실제 적용을 확인한다.
5. 화면이 문서 의도와 다르면 미완료로 간주하고 block 또는 코드 수정으로 다시 맞춘다.


### 권장 포맷

`DESIGN.md` 안에 다음처럼 fenced block을 두면 가장 안정적으로 반영된다.

```json
{
  "baseTheme": "figma",
  "default": {
    "fontHeading": "figmaSans Fallback, 'SF Pro Display', system-ui, sans-serif",
    "fontBody": "figmaSans Fallback, 'SF Pro Display', system-ui, sans-serif",
    "fontLabel": "figmaMono Fallback, 'SF Mono', Menlo, monospace",
    "titleLetterSpacing": "-1.72px",
    "titleLineHeight": 1,
    "badgeRadius": 50,
    "bulletMarker": "—"
  },
  "themes": {
    "blue": {
      "bg": "#2196F3"
    }
  }
}
```

코드펜스 언어는 `theme`, `theme-overrides`, `json`, `yaml`, `yml` 중 아무거나 사용 가능하다.
구조화 블록이 없더라도 `DESIGN.md`의 자연어 설명에서 Figma 스타일, letter-spacing, line-height, font family 같은 힌트를 일부 추출해 반영한다.

## 사용법

### 마크다운에서 지정

```markdown
---
theme: black
---
```

기본 테마 사용:

```markdown
---
theme: orange
---
```

이 경우 `DESIGN.md`가 같은 폴더에 있어도 무시한다.

주제별 DESIGN 사용:

```markdown
---
theme: DESIGN.md
---
```

이 경우에만 `DESIGN.md`를 적극 적용한다. 미지정 시 `dark`.

### 뱃지 색상 변형

각 테마는 뱃지 스타일 2종(`badge[0]`, `badge[1]`)을 가진다. 마크다운에서 `{1}`을 붙이면 두 번째 뱃지 색 사용:

```markdown
# [뱃지 텍스트]{1} 타이틀
```

### 코드에서 사용

```typescript
import { getTheme } from "./themes";

const theme = getTheme("black");  // ThemeColors 반환
const badgeStyle = theme.badge[0]; // BadgeStyle 반환
```

## 테마 추가 규칙

1. `src/slides/themes.ts`의 `THEMES` 객체에 새 테마 추가
2. `src/slides/types.ts`의 `Theme` 타입 유니온에 이름 추가
3. 이 스킬 문서(`remotion-themes/SKILL.md`)에 동기화
4. 배경·텍스트 간 충분한 명도 대비 확보 (WCAG AA 이상 권장)
5. badge[0]은 범용 기본, badge[1]은 테마 특화 색상으로 구성
6. 주제별 개성은 가능하면 새 전역 테마 추가보다 `markdowns/<topic>/DESIGN.md` override로 우선 해결
