---
name: remotion-api
description: >-
  Remotion 프레임워크 API 레퍼런스. 핵심 API, 트랜지션, Player, 렌더링, 성능
  최적화 가이드. 컴포넌트 작성·애니메이션·렌더링 시 참조.
---

# Remotion API 레퍼런스

## 핵심 API

### useCurrentFrame / useVideoConfig

```tsx
import { useCurrentFrame, useVideoConfig } from "remotion";

const frame = useCurrentFrame();           // 현재 프레임 (Sequence 기준 로컬)
const { width, height, fps, durationInFrames } = useVideoConfig();
```

### interpolate

프레임 기반 애니메이션의 기본.

```tsx
import { interpolate, Easing } from "remotion";

const opacity = interpolate(frame, [0, 30], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});

const translateY = interpolate(frame, [0, 30], [20, 0], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
  easing: Easing.out(Easing.cubic),
});
```

### spring

물리 기반 0→1 애니메이션. 바운스 효과에 적합.

```tsx
import { spring } from "remotion";

const scale = spring({
  frame: frame - delay,
  fps,
  config: { damping: 12, stiffness: 200 },
});
```

### AbsoluteFill

전체 화면 절대 위치 컨테이너.

```tsx
import { AbsoluteFill } from "remotion";

<AbsoluteFill style={{ backgroundColor: "#000" }}>
  {/* 내용 */}
</AbsoluteFill>
```

### Sequence

장면 배치와 타이밍 제어. `from`으로 시작 프레임, `durationInFrames`로 지속 시간.

```tsx
import { Sequence } from "remotion";

<Sequence from={0} durationInFrames={150}>
  <IntroScene />
</Sequence>
```

`premountFor` prop: 등장 N프레임 전에 미리 렌더링 (무거운 씬에 유용).

### Composition

`Root.tsx`에서 렌더 대상을 등록. `id`가 렌더 명령의 컴포지션 식별자.

```tsx
<Composition
  id="Slides-Markdown"
  component={MyComponent}
  durationInFrames={450}
  fps={30}
  width={1920}
  height={1080}
/>
```

## 트랜지션 (`@remotion/transitions`)

### TransitionSeries

`<Sequence>` 수동 오프셋 계산을 대체. 트랜지션 구간만큼 자동으로 총 길이가 줄어든다.

```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}>
    <SceneA />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={150}>
    <SceneB />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

### 제공 트랜지션

| 트랜지션 | 설명 | 주요 옵션 |
|----------|------|-----------|
| `fade()` | 페이드인/아웃 | `shouldFadeOutExitingScene` |
| `slide({ direction })` | 밀어내기 | `from-left`, `from-right`, `from-top`, `from-bottom` |
| `wipe({ direction })` | 덮어쓰기 | 8방향 지원 |
| `clockWipe({ width, height })` | 시계 방향 원형 | `width`, `height` 필수 |
| `flip({ direction })` | 3D 뒤집기 | `perspective` (기본 1000) |

타이밍: `linearTiming()` 또는 `springTiming()`.

## Player (`@remotion/player`)

브라우저에서 Remotion 컴포지션을 재생. 파일 렌더링 없이 실시간 프리뷰.

```tsx
import { Player } from "@remotion/player";

<Player
  component={MyComponent}
  inputProps={{ slides: data }}
  durationInFrames={450}
  fps={30}
  compositionWidth={1920}
  compositionHeight={1080}
  controls={false}
  autoPlay={false}
  acknowledgeRemotionLicense
/>
```

`PlayerRef`로 `seekTo()`, `play()`, `pause()` 제어 가능.

## 렌더링

### CLI 명령어

```bash
npx remotion studio                              # Studio 프리뷰
npx remotion render src/index.ts CompositionId out/video.mp4
npx remotion still src/index.ts CompositionId out/frame.png --frame=100
npx remotion benchmark                           # 최적 동시성 측정
```

주요 플래그: `--codec` (h264/h265/vp8/vp9/av1), `--concurrency`, `--scale`

### remotion.config.ts

```ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");     // PNG보다 빠름 (투명도 불필요 시)
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [...(config.module?.rules ?? []), { test: /\.md$/, type: "asset/source" }],
  },
}));
```

## 성능 최적화

- `--concurrency`: `npx remotion benchmark`로 최적값 측정
- JPEG > PNG: 투명도 불필요 시 JPEG가 빠름
- `useMemo()`, `useCallback()`으로 비용 큰 계산 캐싱
- `--log=verbose`로 느린 프레임 확인
- `--scale` 옵션으로 테스트 시 해상도 낮추기
- GPU 가속 CSS (`box-shadow`, `filter: blur()`) 주의 — 클라우드 렌더 시 병목

## Easing 레퍼런스

```typescript
import { Easing } from "remotion";

Easing.linear          // 선형
Easing.ease            // CSS ease
Easing.in(Easing.cubic)   // 가속
Easing.out(Easing.cubic)  // 감속 (등장 애니메이션 추천)
Easing.inOut(Easing.cubic) // 가감속
Easing.bezier(x1, y1, x2, y2) // 커스텀 베지어
```
