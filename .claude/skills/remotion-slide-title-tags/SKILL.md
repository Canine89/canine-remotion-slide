---
name: remotion-slide-title-tags
description: >-
  Remotion 슬라이드의 title-tags 타입 전용 스킬. 큰 제목과 키워드 태그 묶음을
  중심으로 슬라이드를 설계하거나 수정할 때 사용.
---

# Title Tags Slide

## 언제 쓰나

- 개념을 짧은 키워드로 압축해 보여줄 때
- 기술 스택, 핵심 속성, 비교 축, 요약 인덱스에 적합

## 타입

```typescript
{
  type: "title-tags",
  badge: "카테고리명",
  title: "메인 타이틀",
  subtitle: "보조 설명",  // optional
  tags: [
    { text: "키워드1" },
    { text: "키워드2" },
    { text: "키워드3" },
  ],
  theme: "dark",
}
```

## 마크다운 패턴

```markdown
# [뱃지] 타이틀
보조 설명

> 태그1, *강조태그*, 태그3
```

## 작성 원칙

- 태그는 3~5개가 적절하다
- 각 태그는 짧은 명사구로 쓴다
- `*강조태그*`는 테마 accent 색으로 처리된다
- 태그가 길어지면 tags 대신 bullets 타입으로 바꾼다
