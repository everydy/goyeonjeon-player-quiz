# Design System: Toss Design System (TDS) for 2026 고연전 선수 얼굴 퀴즈

> **Visual Thesis**: 복잡하고 어두운 다크 글래스모피즘을 탈피하여, 대한민국 표준 모바일 UX인 **토스(Toss TDS) 스타일**의 맑은 쿨그레이(`--bg-canvas: #f2f4f6`) 배경, 공중에 부드럽게 떠 있는 순백의 화이트 카드(`--bg-surface: #ffffff`), 깊이감 있는 차콜 타이포그래피(`--text-primary: #191f28`), 그리고 큼직한 풀-너비 액션 버튼으로 극도의 가독성과 손쉬운 터치 경험을 제공한다.

---

## 1. Design Judgment Gate (디자인 판단 게이트)

- **Visual Thesis**: 
  - 어두운 화면에서 눈의 피로를 유발하던 대비 문제를 해결하고, 모바일 금융/생활 앱 수준의 압도적인 시각적 쾌적함을 위해 토스 시그니처 라이트 캔버스를 채택.
  - 고유의 고대(크림슨)와 연대(블루) 아이덴티티는 절제된 소프트 틴트 뱃지와 컬러 바로 세련되게 조화.
- **User Flow**:
  1. `모드 세그먼트 탭`: 상단 캡슐형 탭으로 퀴즈와 명단 도감을 즉각 전환.
  2. `설정 흐름 (Setup Flow)`: 난이도(`보통`/`어려움`) ➔ 종목 ➔ 학교 ➔ 문제 수 순서로 막힘없는 수직 위계 제공.
  3. `퀴즈 진행 (Quiz Flow)`: 큼직한 선수 사진 카드 ➔ 한눈에 들어오는 질문 ➔ 엄지손가락으로 누르기 편한 4개 선택지 또는 1줄 타이핑 폼.
  4. `해설 및 피드백 (Modal)`: 토스 바텀시트 느낌의 라운드 모달로 전력분석 데이터 전달.
  5. `결과 리포트 (Results)`: 토스 소비 리포트 스타일의 대형 스코어 및 뱃지.
- **Hierarchy**:
  - `Level 1 (Dominant)`: 선수 사진, 퀴즈 질문 타이틀, 주 액션 버튼 (`퀴즈 시작하기`, `제출`).
  - `Level 2 (Secondary)`: 선택지 버튼(4지선다), 현재 점수/문항 프로그레스 바.
  - `Level 3 (Tertiary)`: 필터 칩(종목/학교), 등번호 및 포지션 태그.
  - `Level 4 (Muted)`: 힌트 토글, 종료 링크, 저작권 캡션.
- **Avoid List**:
  - ❌ 어두운 저대비 네온/글래스모피즘
  - ❌ 48px 미만의 작은 터치 타깃
  - ❌ 복잡하고 장황한 부가 설명 문구 (간결한 한국어 원칙 준수)
  - ❌ 과도한 검정 테두리선 (면과 부드러운 박스 섀도로 계층 분리)
- **Review Rubric**:
  - 토스 앱을 사용하는 것 같은 경쾌하고 자연스러운 사용성인가?
  - 모바일 한 손 조작 환경에서 엄지손가락 터치가 편리한가?
  - 194명 전체 선수 사진과 정보가 눈에 즉시 꽂히는가?

---

## 2. Foundations & Tokens (디자인 토큰)

### Dual Theme Palette (토스 TDS 라이트 & 다크 모드 규격)

```css
/* 라이트 모드 (기본) */
:root, [data-theme="light"] {
  --bg-canvas: #f2f4f6;          /* 토스 쿨 그레이 배경 */
  --bg-surface: #ffffff;         /* 순백 카드 서피스 */
  --bg-subtle: #f9fafb;          /* 입력창 및 보조 영역 배경 */
  --bg-track: #e5e8eb;           /* 비활성 칩 및 트랙 배경 */

  --text-primary: #191f28;       /* 토스 블랙 (선명한 딥 차콜) */
  --text-secondary: #4e5968;     /* 부드러운 본문 그레이 */
  --text-tertiary: #8b95a1;      /* 캡션 및 플레이스홀더 */
  --text-disabled: #b0b8c1;      /* 비활성 텍스트 */

  --toss-blue: #3182f6;          /* 토스 블루 (Primary 액션) */
  --toss-blue-hover: #1b64da;    /* 호버 시 딥 블루 */
  --toss-blue-tint: #e8f3ff;     /* 블루 틴트 배경 */
  
  --ku-crimson: #d32f2f;         /* 고려대학교 크림슨 */
  --ku-crimson-tint: #fee2e2;    /* 고대 뱃지 틴트 */
  --yu-blue: #004b97;            /* 연세대학교 로열 블루 */
  --yu-blue-tint: #e0f2fe;       /* 연대 뱃지 틴트 */

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03);
  --shadow-floating: 0 20px 48px rgba(0, 0, 0, 0.14);
}

/* 다크 모드 (TDS Dark) */
[data-theme="dark"] {
  --bg-canvas: #121316;          /* 토스 다크 시그니처 딥 백그라운드 */
  --bg-surface: #1c1d22;         /* 플로팅 다크 카드 서피스 */
  --bg-subtle: #25262e;          /* 칩, 보조 영역, 인풋 배경 */
  --bg-track: #2c2d36;           /* 세그먼트 탭 트랙 */

  --text-primary: #f9fafb;       /* 선명한 화이트 */
  --text-secondary: #b0b8c1;     /* 서브 본문 라이트 그레이 */
  --text-tertiary: #6b7684;      /* 캡션 쿨 그레이 */
  --text-disabled: #4e5968;

  --toss-blue: #3182f6;          /* 선명한 토스 블루 */
  --toss-blue-hover: #4a94fc;
  --toss-blue-tint: rgba(49, 130, 246, 0.18);

  --ku-crimson: #f87171;         /* 다크 모드 가독성을 위한 브라이트 크림슨 */
  --ku-crimson-tint: rgba(239, 68, 68, 0.18);
  --yu-blue: #38bdf8;            /* 다크 모드 가독성을 위한 스카이 블루 */
  --yu-blue-tint: rgba(56, 189, 248, 0.18);

  --shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.35);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.45);
  --shadow-floating: 0 20px 48px rgba(0, 0, 0, 0.7);
}
```

---

## 3. Component Architecture (컴포넌트 설계)

1. **토스 캡슐 세그먼트 탭 (`.main-tabs`)**:
   - 연회색 트랙(`--bg-element-active`) 위에서 흰색 플로팅 알약(`--bg-surface`)이 부드럽게 전환.
2. **토스 플로팅 카드 (`.selection-card`, `.quiz-card`, `.roster-card`)**:
   - 테두리선 대신 부드러운 그림자(`--shadow-md`)와 20px 라운딩으로 콘텐츠의 독립성과 집중도 확보.
3. **토스 칩 버튼 (`.chip`, `.school-chip`)**:
   - 선택 시 묵직한 토스 블랙(`#191f28`)으로 전환되어 현재 설정 상태가 직관적으로 확인됨.
4. **풀-너비 시그니처 CTA (`.primary-btn`)**:
   - 54px 높이, 토스 블루(`#3182f6`), 탭 시 `scale(0.98)`의 쫀득한 클릭감.
5. **선수 퀴즈 선택지 버튼 (`.option-btn`)**:
   - 58px 높이의 큼직한 라운드 카드. 순수 이름만 표시되어 빠른 의사결정 유도. 정답/오답 시 컬러 틴트 변환.
6. **토스형 모달 바텀시트 (`.modal-card`)**:
   - 화면 하단/중앙에서 떠오르는 깔끔한 카드 구조로 전력분석 인사이트 제공.
7. **점수 자랑하기 성적표 카드 (`generateScoreCard`, HTML5 Canvas)**:
   - 800x1000 고해상도(Retina) 캔버스로 인스타그램 스토리/피드 및 카카오톡 공유에 최적화.
   - 현재 활성화된 테마(라이트/다크)에 맞춰 자동으로 캔버스 및 폰트 색상이 조화롭게 렌더링됨.
   - 점수 티어별 엠블럼 뱃지(마스터/준전문가/서포터/루키/입문자), 정답률, 응시 조건, 공식 인증 푸터 포함.
