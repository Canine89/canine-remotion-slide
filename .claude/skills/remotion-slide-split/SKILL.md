---
name: remotion-slide-split
description: >-
  Remotion 슬라이드의 split 타입 전용 스킬. 이미지와 불릿 설명을 좌우 또는 상하
  분할로 구성하는 슬라이드를 설계하거나 수정할 때 사용.
---

# Split Slide

## 언제 쓰나

- 스크린샷, 차트, 다이어그램을 설명할 때
- 시각 자료와 해설을 동시에 보여줘야 할 때

## 타입

```typescript
{
  type: "split",
  badge: "카테고리명",
  image: "chart.png",
  bullets: [
    "설명 항목 1",
    "설명 항목 2",
  ],
  theme: "yellow",
}
```

## 마크다운 패턴

```markdown
# [뱃지] 타이틀

![](03-chart.png)

- 설명 항목 1
- 설명 항목 2
```

## 작성 원칙

- 이미지는 읽어야 할 대상이고, 불릿은 해석을 제공해야 한다
- 불릿이 이미지를 반복 설명하지 않도록 쓴다
- 이미지가 없으면 split이 아니라 title-bullets 또는 title-image로 바꾼다
- 가로형은 좌우, 세로형은 상하 분할이 기본이다

## 이미지 플레이스홀더

- `image` prop이 없을 때, 좌측 패널에 `ImagePlaceholder`가 자동으로 렌더된다
- 플레이스홀더는 테마 배경색 밝기에 따라 색상이 자동 전환된다
  - 밝은 배경: 검정 계열 반투명 + accent 포인트
  - 어두운 배경: 흰색 계열 반투명 + accent 포인트
- 컴포넌트: `src/slides/components/ImagePlaceholder.tsx`
