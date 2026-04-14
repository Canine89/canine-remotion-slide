---
name: remotion-slide-pdf
description: >-
  슬라이드를 PDF로 내보내기. 각 슬라이드를 PNG로 렌더한 뒤 pdf-lib으로
  합쳐서 단일 PDF 파일을 생성한다. "PDF로 뽑아줘", "PDF 내보내기" 등의 요청에 사용.
---

# Slide PDF Export

## 언제 쓰나

- 발표 자료를 인쇄용/공유용 PDF로 내보낼 때
- 인터랙티브 프레젠터 없이 정적 자료가 필요할 때
- 이메일/슬랙 등에서 미리보기가 필요할 때

## 명령어

```bash
# 기본 출력 (out/<name>/<name>.pdf)
npm run slides:pdf -- markdowns/<topic>/<topic>.md

# 경로 지정
npm run slides:pdf -- markdowns/<topic>/<topic>.md output/my-slides.pdf
```

## 동작 원리

1. 마크다운을 파싱하여 슬라이드 수를 파악한다
2. 각 슬라이드의 settled frame (애니메이션 완료 시점)을 계산한다
3. `npx remotion still`로 슬라이드마다 1920x1080 PNG를 렌더한다
4. `pdf-lib`으로 PNG들을 16:9 비율의 PDF 페이지로 합친다
5. 임시 PNG를 정리하고 최종 PDF를 출력한다

## 에이전트 사용 시

사용자가 "PDF로 뽑아줘", "PDF 내보내기", "인쇄용으로 만들어줘" 등을 요청하면:

```bash
npm run slides:pdf -- markdowns/<topic>/<topic>.md
```

출력 경로를 사용자에게 알려준다.

## 주의사항

- 슬라이드 수가 많으면 시간이 걸린다 (슬라이드당 약 3-5초)
- 애니메이션은 settled 상태로 캡처되므로 동적 효과(dashed line 흐름 등)는 정지 상태
- 영상 렌더와 달리 트랜지션 효과는 포함되지 않는다
