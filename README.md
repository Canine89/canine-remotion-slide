# canine-remotion-slide

마크다운 하나로 프레젠터, 슬라이드 영상(16:9), 쇼츠 영상(9:16)을 만드는 Remotion 프로젝트.

## 설치

```bash
git clone https://github.com/Canine89/canine-remotion-slide.git
cd canine-remotion-slide
npm install
```

## 빠른 시작

```bash
# 예제 슬라이드로 프레젠터 실행
npm run slides:present -- markdowns/evolution-flow-demo/evolution-flow-demo.md
```

브라우저에서 `http://localhost:4000`을 열면 클릭/방향키로 슬라이드를 넘길 수 있다.

## 내 슬라이드 만들기

### 1. 폴더 생성

```bash
mkdir -p markdowns/my-topic
```

### 2. 마크다운 작성

`markdowns/my-topic/my-topic.md`:

```markdown
---
theme: dark
---

# [INTRO] 발표 제목

서브텍스트

---

# [CHAPTER] 핵심 메시지

- 설명 항목 1
- 설명 항목 2
- 설명 항목 3

---

# [KEYWORD] 키워드 슬라이드

> 태그1, 태그2, *강조태그*

---

# [DEMO] 스크린샷 설명

![](screenshot.png)

- 이미지와 함께 보여줄 설명
- 불릿이 있으면 split 레이아웃
```

### 3. 실행

```bash
# 프레젠터 (브라우저에서 발표)
npm run slides:present -- markdowns/my-topic/my-topic.md

# Remotion Studio 미리보기
npm run slides:preview -- markdowns/my-topic/my-topic.md

# 영상 렌더
npm run slides:render -- markdowns/my-topic/my-topic.md slides   # 가로형
npm run slides:render -- markdowns/my-topic/my-topic.md shorts   # 세로형
npm run slides:render -- markdowns/my-topic/my-topic.md both     # 둘 다
```

출력 경로: `out/<name>/<name>-slides.mp4`, `out/<name>/<name>-shorts.mp4`

## 슬라이드 타입

마크다운 내용에 따라 타입이 자동 감지된다.

| 조건 | 타입 | 설명 |
|------|------|------|
| 제목만 (+ 선택적 서브텍스트) | `title` | 표지, 섹션 구분 |
| `![](image.png)` | `title-image` | 제목 + 대표 이미지 |
| `- 불릿` | `title-bullets` | 제목 + 설명 나열 |
| `> 태그` | `title-tags` | 제목 + 키워드 묶음 |
| 이미지 + 불릿 | `split` | 좌우 분할 |
| `<<` / `==` / `>>` | `evolution-flow` | before/after 비교 |

### evolution-flow 예시

```markdown
# [CHANGE] 무엇이 바뀌었나

<< [기존]
- 문제점 1
- 문제점 2

==

>> [개선]
- 개선 결과 1
- 개선 결과 2
```

## 테마

frontmatter에서 테마를 지정한다.

```markdown
---
theme: dark
---
```

내장 테마: `dark`, `blue`, `orange`, `yellow`, `black`, `parchment`, `figma`

### 커스텀 테마

마크다운과 같은 폴더에 `DESIGN.md`를 두고 frontmatter를 `theme: DESIGN.md`로 지정하면, 디자인 문서 기반으로 테마가 자동 생성된다.

## Claude Code 연동

이 프로젝트는 Claude Code 스킬이 내장되어 있다. Claude Code에서 자연어로 슬라이드를 생성하고 수정할 수 있다.

```
"AI 트렌드에 대해 5장짜리 슬라이드 만들어줘"
"3번 슬라이드를 evolution-flow로 바꿔줘"
"orange 테마로 바꿔서 보여줘"
```

스킬 목록은 `AGENTS.md`를 참조.

## 프로젝트 구조

```
src/
  slides/          # 16:9 슬라이드 엔진
  shorts/          # 9:16 쇼츠 엔진
  presenter/       # 프레젠터 UI
  scripts/         # CLI 진입점
markdowns/         # 마크다운 원본 + 이미지
assets/            # 공용 에셋
.claude/skills/    # Claude Code 스킬
```

## License

MIT
