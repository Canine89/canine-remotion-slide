---
name: remotion-slide-steps
description: >-
  Remotion 슬라이드의 steps 타입 전용 스킬. 번호가 매겨진 순차 프로세스를
  연결선과 함께 보여주는 슬라이드를 설계하거나 수정할 때 사용.
---

# Steps Slide

## 언제 쓰나

- 순서가 있는 프로세스를 보여줄 때
- 워크플로우, 파이프라인, 절차를 설명할 때
- evolution-flow와 달리 3개 이상 단계가 필요할 때

## 타입

```typescript
{
  type: "steps",
  badge: "카테고리명",
  title: "메인 타이틀",
  steps: ["단계 1", "단계 2", "단계 3"],
}
```

## 마크다운 패턴

```markdown
# [프로세스] 배포 파이프라인

1. 코드 커밋
2. CI 테스트 실행
3. 스테이징 배포
4. 프로덕션 릴리즈
```

- `1.` `2.` 같은 번호 리스트로 감지
- 기존 `-` 불릿(title-bullets)과 구분됨

## steps vs title-bullets vs evolution-flow 구분

| 상황 | 타입 |
|------|------|
| 순서가 중요한 단계별 흐름 | `steps` |
| 순서 없는 나열 | `title-bullets` |
| 2개 상태 비교 (before/after) | `evolution-flow` |

## 작성 원칙

- 3~5개 단계가 적당
- 각 단계는 한 줄로 짧게
- 순서가 중요하지 않으면 title-bullets를 쓴다
- 번호 원형 마커 + 연결선이 자동 렌더된다
