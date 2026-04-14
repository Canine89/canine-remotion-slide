---
name: remotion-slide-title-image
description: >-
  Remotion 슬라이드의 title-image 타입 전용 스킬. 큰 제목과 단일 이미지를
  조합하는 슬라이드를 설계하거나 수정할 때 사용.
---

# Title Image Slide

## 언제 쓰나

- 큰 제목과 대표 이미지 한 장이 메시지의 중심일 때
- 첫 슬라이드, 제품 소개, 서비스 소개, 스크린샷 소개에 적합

## 타입

```typescript
{
  type: "title-image",
  badge: "카테고리명",
  title: "메인 타이틀",
  subtitle: "보조 설명",  // optional
  image: "image.png",
  theme: "dark",
}
```

## 마크다운 패턴

```markdown
# [뱃지] 타이틀
서브텍스트

![](01-image.png)
```

## 레이아웃

- 세로 중앙 정렬: 뱃지 → 제목 → 서브텍스트 → 이미지 순으로 위에서 아래로 쌓인다
- 모든 요소가 수평 중앙 정렬이다
- 이미지는 제목 아래에 위치하며, 아래에서 위로 올라오는 애니메이션으로 등장한다

## 작성 원칙

- 제목이 주인공이고 이미지는 보조 증거다
- 이미지는 `markdowns/<topic>/` 아래에 두고 `![](파일명)`만 쓴다
- 이미지 파일명은 `01-image-name.png`처럼 슬라이드 번호-설명 형식을 따른다
- 서브텍스트는 1~2줄로 짧게 유지한다
- 이미지가 강하면 제목은 더 짧게, 이미지가 약하면 제목을 더 명확하게 쓴다

## 이미지 플레이스홀더

- 이미지 파일이 아직 없을 때, 컴포넌트가 자동으로 `ImagePlaceholder`를 렌더한다
- 플레이스홀더는 산·해·원 형태의 SVG 일러스트로, 테마 배경색 밝기에 따라 색상이 자동 전환된다
  - 밝은 배경: `rgba(0,0,0,0.08~0.14)` 톤 + accent 25% 포인트
  - 어두운 배경: `rgba(255,255,255,0.08~0.14)` 톤 + accent 25% 포인트
- 마크다운에서 `![](파일명)`을 생략하면 title-image 타입 대신 title-bullets로 감지되므로, 플레이스홀더를 의도적으로 쓰려면 `![](placeholder)`처럼 아무 경로든 적어야 한다
- 컴포넌트: `src/slides/components/ImagePlaceholder.tsx`
