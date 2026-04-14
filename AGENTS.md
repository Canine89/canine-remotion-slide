# lab-remotion

마크다운을 원본으로 프레젠터·슬라이드 영상(16:9)·쇼츠 영상(9:16)을 만드는 Remotion 프로젝트.

## 원칙

1. 원본은 항상 `markdowns/<topic>/<topic>.md`. 수동으로 `data.ts`를 편집하지 않는다.
2. 주제별 이미지는 마크다운과 같은 폴더에 둔다. 마크다운에서 `![](image.png)`으로 참조.
3. 마크다운 파싱 규칙은 `src/slides/parseMarkdown.ts`가 기준이다.
4. 영상 렌더는 사용자가 명시적으로 요청했을 때만 한다.
5. 새 슬라이드 주제를 추가할 때는 `markdowns/<topic>/` 폴더를 먼저 만든다.
6. `DESIGN.md`를 추가하거나 수정했다면, `theme: DESIGN.md`에서 실제로 반영되도록 에이전트가 `THEME.generated.json`을 생성·수정하거나 관련 테마 파서를 함께 맞춘다. 문서만 추가하고 미반영 상태로 두지 않는다.

## DESIGN.md 체크리스트

`markdowns/<topic>/DESIGN.md`를 새로 만들거나 수정했을 때 에이전트는 아래 순서를 따른다.

1. 원본 마크다운의 frontmatter가 `theme: DESIGN.md`인지 확인한다.
2. `DESIGN.md`를 읽고 주제별 concrete theme artifact인 `markdowns/<topic>/THEME.generated.json`이 있는지 확인한다.
3. artifact가 없거나 문서 의도와 다르면, 현재 실행 중인 에이전트가 `DESIGN.md`를 해석해 `THEME.generated.json`을 생성·수정한다.
4. 그래도 표현이 부족하면 `src/slides/themes.ts` 또는 `src/slides/designTheme.ts`를 수정한다.
5. `slides:present` 또는 `slides:preview`를 다시 실행해 실제 화면 반영을 확인한다.

완료 기준:
- DESIGN.md가 단순 설명 문서가 아니라 에이전트가 생성한 concrete theme의 원본 입력으로 동작한다.
- `THEME.generated.json`이 존재하고 `theme: DESIGN.md`에서 우선 적용된다.
- `theme: DESIGN.md` 상태에서 프레젠터/프리뷰 화면이 문서 의도와 맞다.

## 일반 테마 변경 체크리스트

`theme: blue` 같은 일반 테마 값을 바꿀 때도 에이전트는 아래 순서를 따른다.

1. 마크다운 상단 frontmatter가 정확히 `---` / `theme: <name>` / `---` 형태인지 확인한다. 여는 `---`를 지우거나 슬라이드 구분선과 섞지 않는다.
2. `src/slides/parseMarkdown.ts` 기준으로 frontmatter가 실제 파싱되는지 확인한다. 필요하면 슬라이드 수가 의도대로 유지되는지도 함께 본다.
3. 이미 실행 중인 `slides:present` 서버가 있으면 종료하고 다시 실행한다. 이 프로젝트의 프레젠터는 시작 시점의 마크다운을 Vite define으로 읽으므로, 단순 새로고침만으로는 테마 변경이 반영되지 않을 수 있다.
4. `slides:present` 또는 `slides:preview`로 실제 화면에서 배경색, 텍스트색, 배지색이 바뀌었는지 확인한다.

미완료 상태:
- `theme: blue`를 넣었는데 첫 슬라이드에 `theme: blue` 텍스트가 보이는 상태
- 슬라이드 수가 갑자기 1장 늘거나 줄어든 상태
- 프레젠터를 재시작하지 않아 이전 테마 화면을 보고 있는 상태

## 스킬

디자인 시스템, 애니메이션, 파일 구조 등 상세는 스킬 참조.

- `remotion-slides` — 가로형 슬라이드 생성의 상위 오케스트레이터
- `remotion-slide-title` — title 타입 (제목 + 선택적 서브텍스트만)
- `remotion-slide-title-image` — title-image 타입
- `remotion-slide-title-tags` — title-tags 타입
- `remotion-slide-title-bullets` — title-bullets 타입
- `remotion-slide-split` — split 타입
- `remotion-slide-evolution-flow` — evolution-flow 타입
- `remotion-shorts` — 세로형 쇼츠 생성
- `remotion-presenter` — 발표용 프레젠터
- `remotion-themes` — 컬러 테마 레퍼런스
- `remotion-api` — Remotion 프레임워크 API, 트랜지션, Player, 렌더링, 성능 최적화

## 명령어

```bash
# 프레젠터 (브라우저에서 슬라이드 넘기며 발표)
npm run slides:present -- markdowns/<topic>/<topic>.md

# Remotion Studio 미리보기
npm run slides:preview -- markdowns/<topic>/<topic>.md

# 영상 렌더
npm run slides:render -- markdowns/<topic>/<topic>.md slides   # 가로형만
npm run slides:render -- markdowns/<topic>/<topic>.md shorts   # 세로형만
npm run slides:render -- markdowns/<topic>/<topic>.md both     # 둘 다
```

출력 경로: `out/<name>/<name>-slides.mp4`, `out/<name>/<name>-shorts.mp4`

## 마크다운 포맷 요약

슬라이드는 `---`로 구분한다. 프론트매터에서 테마를 지정한다.

```markdown
---
theme: dark
---

# [뱃지] 타이틀
서브텍스트

---

# [뱃지] 타이틀

- 불릿 항목

---

# [뱃지] 타이틀

> 태그1, *강조태그*, 태그3

---

# [뱃지] 타이틀

![](image.png)
```

### 타입 자동 감지

| `~ "..."` 또는 `[[추상]]` | 이미지 | 불릿 | 태그 | → 타입 |
|---------------------------|--------|------|------|--------|
| O | - | - | - | `abstract-scene` |
| `<<` / `==` / `>>` 블록 | optional | O | - | `evolution-flow` |
| - | O | O | - | `split` |
| - | O | - | - | `title-image` |
| - | - | O | - | `title-bullets` |
| - | - | - | O | `title-tags` |
| - | - | - | - | `title` (제목 + 선택적 서브텍스트) |

각 타입의 마크다운 문법, 작성 원칙, 애니메이션 상세는 해당 스킬(`remotion-slide-*`)을 참조한다.

## 작업 판단

- "보여줘", "확인", "발표용" → `slides:present`
- "타임라인 확인", "Remotion Studio" → `slides:preview`
- "영상 뽑아", "렌더해" → `slides:render`
- 쇼츠를 따로 요청하지 않았으면 쇼츠 렌더를 하지 않는다
