---
name: remotion-slide-compare
description: >-
  Remotion 슬라이드의 compare 타입 전용 스킬. 2~4개 항목을 나란히
  비교하는 슬라이드를 설계하거나 수정할 때 사용.
---

# Compare Slide

## 언제 쓰나

- 3개 이상 항목을 동시에 비교할 때
- 선택지, 옵션, 대안을 나란히 보여줄 때
- 각 항목의 특징을 불릿으로 설명할 때

## 타입

```typescript
{
  type: "compare",
  badge: "카테고리명",
  title: "메인 타이틀",
  columns: [
    { heading: "React", bullets: ["생태계가 크다", "자유도가 높다"] },
    { heading: "Vue", bullets: ["학습 곡선이 낮다"] },
    { heading: "Svelte", bullets: ["번들 크기가 작다"] },
  ],
}
```

## 마크다운 패턴

```markdown
# [비교] 프레임워크 선택

|| React
- 생태계가 크다
- 자유도가 높다

|| Vue
- 학습 곡선이 낮다
- 공식 도구가 잘 갖춰져 있다

|| Svelte
- 번들 크기가 작다
- 컴파일 타임 최적화
```

- `||` 로 시작하는 줄이 컬럼 제목
- 그 아래 `-` 불릿이 해당 컬럼의 설명

## compare vs evolution-flow 구분

| 상황 | 타입 |
|------|------|
| A에서 B로 변한 흐름 | `evolution-flow` |
| A, B, C를 동시에 비교 | `compare` |

## 작성 원칙

- 2~4개 컬럼이 적당
- 컬럼 제목은 짧게 (1~2 단어)
- 각 컬럼의 불릿 수를 비슷하게 맞추면 균형이 좋다
- 5개 이상 컬럼은 가독성이 떨어지므로 분리
