/**
 * 이승화의 에듀테크 포트폴리오 - 히어로 자기소개 섹션 컴포넌트
 * PRD 요구사항에 따라 프로필 헤드라인, 기술 배지, 자기소개 카드(핵심 역량 3줄 요약, 관심 태그)를 렌더링합니다.
 */
class EduHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    
    // 기본 초기 데이터 설정 (비동기 데이터 로드 전 대비용 백업)
    this._title = "하드웨어로 배움의 즐거움을 설계하는 에듀테크 콘텐츠 개발자";
    this._description = "아두이노와 라즈베리파이를 활용한 피지컬 컴퓨팅 교육에 강점이 있습니다. 기술을 재미있고 직관적인 콘텐츠로 풀어내어 학습자에게 창의적인 메이커 경험을 선물합니다.";
    this._skills = ["Arduino", "Raspberry Pi", "Python", "C/C++"];
    this._aboutCard = {
      bullets: [
        "아두이노/라즈베리파이 기반의 피지컬 컴퓨팅 교안 설계 및 시범 강의 경험 다수",
        "초등학생부터 성인까지, 학습자 수준에 맞춘 스토리텔링형 코딩 커리큘럼 제작",
        "하드웨어 회로 설계부터 Flask/Python 웹 시각화 플랫폼까지 직접 구현 가능한 융합형 인재"
      ],
      interests: ["소프트웨어 교육 콘텐츠 개발", "메이커 교육 기획", "피지컬 컴퓨팅"]
    };
  }

  // 외부 JSON 설정 파일 로드 후 데이터 바인딩을 위한 setter
  set profileData(data) {
    if (data.title) this._title = data.title;
    if (data.description) this._description = data.description;
    if (data.skills) this._skills = data.skills;
    if (data.aboutCard) this._aboutCard = data.aboutCard;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // 기술 배지 마크업 생성
    const skillBadges = this._skills
      .map(skill => `<span class="skill-badge">${skill}</span>`)
      .join("");

    // 핵심 역량 리스트 마크업 생성
    const bulletList = this._aboutCard.bullets
      .map(bullet => `<li>${bullet}</li>`)
      .join("");

    // 관심 분야 태그 마크업 생성
    const interestBadges = this._aboutCard.interests
      .map(interest => `<span class="interest-badge">#${interest}</span>`)
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        /* 히어로 섹션 전체 레이아웃 (2컬럼 그리드) */
        section {
          padding: 140px var(--spacing-lg, 32px) 80px var(--spacing-lg, 32px);
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: var(--spacing-xl, 48px);
          align-items: center;
        }

        /* 왼쪽 콘텐츠 블록 */
        .hero-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: var(--spacing-md, 24px);
        }

        /* 웰컴 뱃지 라벨 */
        .welcome-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-secondary-main, #30b0c7);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          background-color: rgba(48, 176, 199, 0.1);
          padding: 6px 14px;
          border-radius: var(--radius-pill, 9999px);
        }

        /* 프로필 메인 헤드라인 */
        h1 {
          font-size: 38px;
          font-weight: 800;
          color: var(--color-text-primary, #1c1c1e);
          line-height: 1.35;
          word-break: keep-all;
        }

        /* 소개 상세 본문 */
        p.description {
          font-size: 17px;
          line-height: 1.7;
          color: var(--color-text-secondary, #8e8e93);
          word-break: keep-all;
        }

        /* 기술 스택 컨테이너 */
        .skills-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .skills-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-primary, #1c1c1e);
        }

        .badges-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        /* 개별 기술 배지 */
        .skill-badge {
          background-color: var(--color-bg-card, #ffffff);
          color: var(--color-text-primary, #1c1c1e);
          border: 1px solid var(--color-border, #e5e5ea);
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: var(--radius-pill, 9999px);
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
          transition: var(--transition-normal, all 0.25s ease);
        }

        .skill-badge:hover {
          background-color: var(--color-primary-light, #ffd60a);
          border-color: var(--color-primary-main, #ff9f0a);
          transform: translateY(-2px);
        }

        /* CTA 버튼 (design.md 규격 준수) */
        .cta-button {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 52px;
          padding: 0 32px;
          background-color: var(--color-primary-main, #ff9f0a);
          color: #ffffff;
          font-size: 16px;
          font-weight: 700;
          border-radius: var(--radius-md, 12px);
          box-shadow: 0 6px 20px rgba(255, 159, 10, 0.2);
          transition: var(--transition-bounce, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)), background-color 0.2s ease;
        }

        .cta-button:hover {
          background-color: var(--color-primary-light, #ffd60a);
          color: var(--color-text-primary, #1c1c1e);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(255, 159, 10, 0.3);
        }

        .cta-button:active {
          transform: scale(0.96);
        }

        /* 오른쪽 자기소개 카드 (design.md 카드 스펙 준수) */
        .profile-card {
          background-color: var(--color-bg-card, #ffffff);
          border: 1px solid var(--color-border, #e5e5ea);
          border-radius: var(--radius-lg, 20px);
          padding: 32px;
          box-shadow: var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.04));
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: var(--transition-normal, all 0.25s ease);
        }

        .profile-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg, 0 16px 36px rgba(0, 0, 0, 0.08));
        }

        .card-header {
          font-size: 18px;
          font-weight: 800;
          color: var(--color-text-primary, #1c1c1e);
          border-bottom: 2px solid var(--color-primary-main, #ff9f0a);
          padding-bottom: 8px;
          display: inline-block;
          align-self: flex-start;
        }

        /* 핵심 역량 3줄 요약 리스트 스타일 */
        .bullets {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bullets li {
          font-size: 14px;
          line-height: 1.6;
          color: var(--color-text-primary, #1c1c1e);
          position: relative;
          padding-left: 20px;
          word-break: keep-all;
        }

        /* 리스트 항목에 에듀테크 오렌지 옐로우 도트 추가 */
        .bullets li::before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          color: var(--color-primary-main, #ff9f0a);
          font-weight: 900;
        }

        /* 관심 분야 태그 컨테이너 및 태그 스타일 */
        .interests-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid var(--color-border, #e5e5ea);
          padding-top: 16px;
        }

        .interests-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text-secondary, #8e8e93);
        }

        .interests-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .interest-badge {
          background-color: var(--color-bg-main, #faf9f6);
          color: var(--color-secondary-main, #30b0c7);
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: var(--radius-pill, 9999px);
        }

        /* 반응형 스타일 - 모바일 대응 */
        @media (max-width: 991px) {
          section {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg, 32px);
          }
        }

        @media (max-width: 767px) {
          section {
            padding: 100px var(--spacing-sm, 16px) 50px var(--spacing-sm, 16px);
          }
          h1 {
            font-size: 28px;
          }
          p.description {
            font-size: 15px;
          }
          .cta-button {
            width: 100%;
            height: 48px;
          }
          .profile-card {
            padding: 24px;
          }
        }
      </style>

      <section>
        <!-- 왼쪽: 텍스트 정보 및 기술 스택 -->
        <div class="hero-info">
          <span class="welcome-label">Maker & Educator</span>
          <h1>${this._title}</h1>
          <p class="description">${this._description}</p>
          
          <div class="skills-container">
            <span class="skills-title">전문 역량 & 핵심 기술</span>
            <div class="badges-list">
              ${skillBadges}
            </div>
          </div>

          <button class="cta-button" id="cta-view-projects">프로젝트 확인하기</button>
        </div>

        <!-- 오른쪽: PRD 명시 사항 - 자기소개 요약 카드 -->
        <div class="profile-card">
          <span class="card-header">이승화의 핵심 역량 요약</span>
          <ul class="bullets">
            ${bulletList}
          </ul>
          <div class="interests-container">
            <span class="interests-title">주요 관심 분야</span>
            <div class="interests-list">
              ${interestBadges}
            </div>
          </div>
        </div>
      </section>
    `;

    // 스크롤 이벤트 바인딩
    this.shadowRoot.getElementById("cta-view-projects").addEventListener("click", () => {
      const targetElement = document.getElementById("projects");
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: "smooth"
        });
      }
    });
  }
}

customElements.define("edu-hero", EduHero);
export default EduHero;
