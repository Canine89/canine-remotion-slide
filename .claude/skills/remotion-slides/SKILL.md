---
name: remotion-slides
description: >-
  Remotion 기반 타이포 중심 발표 슬라이드 생성의 상위 오케스트레이터 스킬.
  슬라이드 주제와 내용을 보고 적절한 개별 타입 스킬(title-image, title-tags,
  title-bullets, split)을 선택해 구성할 때 사용.
---

# Remotion Slides Orchestrator

## 역할

이 스킬은 슬라이드를 직접 한 타입으로 몰아가지 않고, **어떤 슬라이드 타입 스킬을 써야 하는지 결정하는 상위 스킬**이다.

사용자가 주제, 발표 구조, 원고를 주면:
- `markdowns/<topic>/<topic>.md`를 원본으로 작성하고
- 슬라이드별로 적절한 타입을 고르고
- 필요하면 프레젠터/프리뷰로 확인한다

## 타입별 하위 스킬

- `remotion-slide-title`
- `remotion-slide-title-image`
- `remotion-slide-title-tags`
- `remotion-slide-title-bullets`
- `remotion-slide-split`
- `remotion-slide-evolution-flow`

## 선택 기준

- 제목 하나가 메시지의 전부이면 `remotion-slide-title` (표지, 섹션 구분, 마무리)
- 대표 이미지 한 장이 중요하면 `remotion-slide-title-image`
- 키워드 묶음이 중요하면 `remotion-slide-title-tags`
- 메시지 설명 자체가 중요하면 `remotion-slide-title-bullets`
- 이미지와 설명을 함께 보여줘야 하면 `remotion-slide-split`
- 왼쪽 상태가 오른쪽 상태로 어떻게 바뀌는지 흐름이 중요하면 `remotion-slide-evolution-flow`

## 공통 규칙

- 원본은 항상 `markdowns/<topic>/<topic>.md`
- 수동으로 `data.ts`를 편집하지 않는다
- 주제별 이미지는 마크다운과 같은 폴더에 둔다
- 마크다운 파싱 규칙은 `src/slides/parseMarkdown.ts`를 기준으로 본다
- 영상 렌더는 사용자가 명시적으로 요청했을 때만 한다
- 이미지가 없는 슬라이드에는 `ImagePlaceholder` 컴포넌트가 자동 렌더된다. 테마 배경색 밝기에 따라 색상이 자동 전환되므로 별도 처리 불필요 (`src/slides/components/ImagePlaceholder.tsx`)

## 워크플로우

1. 발표 주제와 각 슬라이드 메시지를 정리한다.
2. 슬라이드별로 어떤 타입 스킬이 맞는지 선택한다.
3. `markdowns/<topic>/<topic>.md`로 구조화한다.
4. `npm run slides:preview` 또는 `slides:present`로 확인한다.
5. 필요시 문장 길이, 타입 선택, 이미지 배치를 조정한다.

## 실행 명령

```bash
npm run slides:present -- markdowns/<topic>/<topic>.md
npm run slides:preview -- markdowns/<topic>/<topic>.md
npm run slides:render -- markdowns/<topic>/<topic>.md slides
```
