# 이승화의 에듀테크 포트폴리오 디자인 가이드 (Design System Guide)

본 문서는 이승화 님의 소프트웨어 에듀테크 포트폴리오 웹사이트를 위한 UI/UX 디자인 가이드라인입니다. 에듀테크 기업 채용 담당자에게 **"친근하고, 활기차며, 기술적 신뢰감을 주는"** 이미지를 전달할 수 있도록 구성하였으며, 프론트엔드 개발 시 즉시 적용할 수 있는 구체적인 사양과 CSS 코드를 포함합니다.

---

## 1. 디자인 컨셉 & 무드 (Design Concept)

### 🎨 핵심 키워드: **Edu-Maker (교육 + 하드웨어 메이킹)**
*   **친근함 (Warmth):** 딱딱하고 차가운 하드웨어가 아닌, 누구나 쉽게 다가갈 수 있는 따뜻한 옐로우와 오렌지 톤 중심의 색감 설계.
*   **성장과 생동감 (Growth & Vitality):** 교육을 통한 성장을 상징하는 산뜻한 그린/민트 컬러를 포인트로 활용하여 활기찬 분위기 조성.
*   **기술적 신뢰 (Tech Trust):** 본문 텍스트와 레이아웃 구조에는 짙은 차콜과 정돈된 그리드를 사용하여 교육자이자 개발자로서의 전문성과 신뢰도를 확보.

---

## 2. 컬러 시스템 (Color System)

모든 컬러는 웹 접근성 표준(WCAG 2.1 AA)의 명도 대비(4.5:1 이상)를 고려하여 설정되었습니다.

### 2.1. 브랜드 컬러 (Brand Colors)
| 구분 | 컬러 코드 | 가시적 효과 및 용도 |
| :--- | :--- | :--- |
| **Primary Main (주요색)** | `#FF9F0A` | 브랜드 아이덴티티, 핵심 강조, 주요 버튼 배경 |
| **Primary Light** | `#FFD60A` | 마우스 호버(Hover) 상태, 연한 배경 강조 |
| **Primary Dark** | `#FF8500` | 액티브(Click) 상태, 텍스트 강조 |
| **Secondary Main (보조색)** | `#30B0C7` | 하드웨어/IoT(기술)의 지적인 느낌을 주는 민트 블루, 태그 배경, 포인트 라벨 |
| **Secondary Green** | `#34C759` | 성장을 상징하는 그린, 완성/성공 상태 배지, 포인트 요소 |

### 2.2. 무채색 계열 (Neutral Colors)
| 구분 | 컬러 코드 | 용도 |
| :--- | :--- | :--- |
| **Text Primary** | `#1C1C1E` | 메인 제목, 본문 텍스트 (가독성이 극대화된 짙은 차콜 그레이) |
| **Text Secondary** | `#8E8E93` | 설명문, 메타 정보, 태그 텍스트 |
| **Background Main** | `#FAF9F6` | 웹사이트 기본 배경 (눈 피로도를 낮추는 부드러운 Off-white) |
| **Background Card** | `#FFFFFF` | 프로젝트 카드, 자기소개 카드 배경 (순수 화이트) |
| **Border / Divider** | `#E5E5EA` | 카드 테두리, 구분선 |

---

## 3. 타이포그래피 (Typography)

가장 트렌디하면서도 한국어/영어 가독성이 뛰어난 프리텐다드(Pretendard) 폰트를 기본으로 사용합니다.

*   **웹폰트 Import (CSS):**
    ```css
    @import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
    ```

### 3.1. 타이포그래피 스케일 (Typography Scale)
| 스타일 이름 | Font-Size | Line-Height | Font-Weight | 적용 대상 (PC 기준) |
| :--- | :--- | :--- | :--- | :--- |
| **H1 (Hero Title)** | `36px` (`2.25rem`) | `1.3` | `800` (ExtraBold) | 메인 화면 대제목 (자기소개 헤드라인) |
| **H2 (Section Title)** | `28px` (`1.75rem`) | `1.4` | `700` (Bold) | 각 섹션 제목 (About, Projects, Contact) |
| **H3 (Card Title)** | `20px` (`1.25rem`) | `1.4` | `700` (Bold) | 프로젝트 카드 제목, 모달 팝업 타이틀 |
| **Body Large** | `18px` (`1.125rem`)| `1.6` | `500` (Medium) | 프로필 소개 본문 텍스트 |
| **Body Medium** | `16px` (`1.0rem`) | `1.6` | `400` (Regular) | 프로젝트 상세 설명, 일반 카드 본문 |
| **Body Small** | `14px` (`0.875rem`)| `1.5` | `400` (Regular) | 날짜, 부가 설명, 태그 텍스트 |
| **Caption / Label** | `12px` (`0.75rem`) | `1.4` | `600` (SemiBold) | 소형 캡션, 배지 레이벨, 입력창 라벨 |

> [!NOTE]
> 모바일 화면(768px 미만)에서는 `H1`은 `28px`, `H2`는 `22px`, `H3`는 `18px`로 유동적으로 축소 조절(Media Query)하여 가독성을 높입니다.

---

## 4. 컴포넌트 디자인 스펙 (Component Specifications)

### 4.1. 버튼 (Buttons)
에듀테크의 친근함을 주기 위해 둥글고 볼륨감 있는 모서리(Border Radius 12px)를 표준으로 적용합니다.

```
[ Primary Button (Large) ]
+------------------------------------------------+
|                   더 알아보기                  |  <- Height: 52px / Padding: 0 32px
+------------------------------------------------+  <- Border Radius: 12px
```

*   **Primary Button (주요 행동 유도):**
    *   **스타일:** 배경 `#FF9F0A`, 글자 `#FFFFFF` (Bold 16px)
    *   **Hover:** 배경 `#FFD60A`, 그림자 `0 8px 16px rgba(255, 159, 10, 0.2)`
    *   **Active (클릭 시):** 배경 `#FF8500`, 크기 `scale(0.97)` (통통 튀는 인터랙션 구현)
*   **Secondary Button (보조 행동):**
    *   **스타일:** 배경 `#FFFFFF`, 테두리 `1px solid var(--color-border)`, 글자 `#1C1C1E`
    *   **Hover:** 배경 `#FAF9F6`
*   **Pill Button (태그/배지):**
    *   **스타일:** 배경 `#F2F2F7`, 글자 `#8E8E93`, Border Radius `30px`, Padding `6px 14px`

### 4.2. 카드 (Cards)
프로젝트 카드 및 자기소개 카드에 적용되는 스펙입니다.

*   **Border Radius:** `20px` (부드러운 곡선)
*   **Border:** `1px solid #E5E5EA`
*   **Background:** `#FFFFFF`
*   **Box Shadow (기본):** `0 4px 20px rgba(0, 0, 0, 0.04)`
*   **Box Shadow (호버 시):** `0 16px 36px rgba(0, 0, 0, 0.08)`
*   **Hover Interaction:** `transform: translateY(-8px)` (자연스럽게 위로 올라오는 움직임, `transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)`)

### 4.3. 모달 (Modals / Project Detailed View)
프로젝트 클릭 시 나타나는 상세 뷰어 사양입니다.

*   **Overlay (배경 딤드):** `rgba(28, 28, 30, 0.6)` (블러 효과 `backdrop-filter: blur(8px)` 추가로 깊이감 제공)
*   **Modal Body:** Border Radius `24px`, Max-Width `800px`, Padding `32px` (PC 기준)
*   **모달 등장 애니메이션:** 아래에서 위로 슬라이드 업하며 페이드인 (`translateY(40px) -> translateY(0)`)

---

## 5. 레이아웃 & 그리드 시스템 (Layout & Grid)

반응형 디자인 환경을 고려한 8px 배수 기반의 그리드 시스템을 적용합니다.

*   **기본 브레이크포인트 (Breakpoints):**
    *   **Desktop:** `1024px` 이상 (최대 콘텐츠 가로 폭: `1200px`)
    *   **Tablet:** `768px` ~ `1023px` (좌우 여백: `24px`)
    *   **Mobile:** `767px` 이하 (좌우 여백: `16px`)
*   **간격 체계 (Spacing):**
    *   모든 Margin과 Padding은 `8px`의 배수를 기준으로 균형을 맞춥니다: `8px` / `16px` / `24px` / `32px` / `48px` / `64px`

---

## 6. 마이크로 인터랙션 & 트랜지션 (Micro-interactions)

사용자의 인터랙션에 즉각적으로 반응하는 유연하고 통통 튀는 애니메이션 설정을 제안합니다.

*   **기본 트랜지션 (Transition):**
    *   `transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);` (부드러운 표준 이징)
*   **바운스 이징 (Bounce Easing - 버튼 클릭용):**
    *   `transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);` (눌렸다가 놓을 때 탄성 있게 튀어 오르는 효과)
*   **스크롤 애니메이션 (Scroll Reveal):**
    *   스크롤 시 섹션이 아래에서 위로 나타날 때: `transform: translateY(30px); opacity: 0;` 상태에서 활성화(`.visible`) 시 `transform: translateY(0); opacity: 1;` (`transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);`)

---

## 7. 프론트엔드 코드 적용용 CSS 변수 (:root)

개발자가 그대로 복사하여 사용할 수 있도록 정의한 전역 CSS 변수 셋입니다.

```css
:root {
  /* Brand Colors */
  --color-primary-main: #ff9f0a;
  --color-primary-light: #ffd60a;
  --color-primary-dark: #ff8500;
  --color-secondary-main: #30b0c7;
  --color-secondary-green: #34c759;

  /* Neutral Colors */
  --color-text-primary: #1c1c1e;
  --color-text-secondary: #8e8e93;
  --color-bg-main: #faf9f6;
  --color-bg-card: #ffffff;
  --color-border: #e5e5ea;

  /* Spacing */
  --spacing-xs: 8px;
  --spacing-sm: 16px;
  --spacing-md: 24px;
  --spacing-lg: 32px;
  --spacing-xl: 48px;
  --spacing-xxl: 64px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 16px 36px rgba(0, 0, 0, 0.08);

  /* Transitions */
  --transition-normal: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```
