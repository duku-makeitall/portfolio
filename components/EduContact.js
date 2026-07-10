/**
 * 이승화의 에듀테크 포트폴리오 - 연락처 및 소셜 섹션 컴포넌트
 * PRD 요구사항에 부합하는 이메일 복사 기능, GitHub 소셜 링크, 블로그/활동 기록 링크 카드를 렌더링합니다.
 */
class EduContact extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    
    // 기본 메일, 소셜 및 블로그 정보 설정
    this._email = "seunghwa@example.com";
    this._github = "https://github.com/seunghwa-portfolio";
    this._blog = "https://notion.so/seunghwa-maker-activity";
  }

  // 외부로부터 데이터를 받아서 값을 할당하는 setter
  set contactData(data) {
    if (data.email) this._email = data.email;
    if (data.github) this._github = data.github;
    if (data.blog) this._blog = data.blog;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  // 이메일 클립보드 복사 유틸리티
  copyEmailToClipboard(emailStr) {
    navigator.clipboard.writeText(emailStr).then(() => {
      const tooltip = this.shadowRoot.querySelector(".tooltip");
      if (tooltip) {
        tooltip.classList.add("visible");
        setTimeout(() => {
          tooltip.classList.remove("visible");
        }, 1500);
      }
    }).catch(err => {
      console.error("이메일 주소 복사 실패: ", err);
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* 연락처 섹션 전체 레이아웃 */
        section {
          padding: 80px var(--spacing-lg, 32px);
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md, 24px);
        }

        /* 서브 가이드 라벨 */
        .section-tag {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-primary-dark, #ff8500);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          background-color: rgba(255, 159, 10, 0.1);
          padding: 6px 14px;
          border-radius: var(--radius-pill, 9999px);
        }

        /* 메인 제목 (H2 스케일 준수) */
        h2 {
          font-size: 32px;
          font-weight: 800;
          color: var(--color-text-primary, #1c1c1e);
        }

        /* 소개 서브 텍스트 */
        p.subtitle {
          font-size: 16px;
          color: var(--color-text-secondary, #8e8e93);
          max-width: 600px;
          line-height: 1.6;
          word-break: keep-all;
        }

        /* 연락처 3개 카드 그룹 레이아웃 */
        .contact-methods {
          margin-top: var(--spacing-lg, 32px);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 960px;
        }

        /* 개별 연락 카드 스타일 (design.md 카드 스펙 준수) */
        .contact-card {
          background-color: var(--color-bg-card, #ffffff);
          border: 1px solid var(--color-border, #e5e5ea);
          border-radius: var(--radius-lg, 20px);
          padding: 36px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
          position: relative;
          transition: var(--transition-normal, all 0.25s ease);
        }

        .contact-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg, 0 16px 36px rgba(0, 0, 0, 0.08));
          border-color: var(--color-secondary-main, #30b0c7); /* 호버 시 민트색 테두리 포인트 */
        }

        /* 아이콘 서클 배경 */
        .icon-wrapper {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background-color: var(--color-bg-main, #faf9f6);
          color: var(--color-secondary-main, #30b0c7);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        /* 이메일 카드는 테마 오렌지 옐로우 컬러로 아이콘 차별화 */
        .icon-wrapper.primary {
          color: var(--color-primary-main, #ff9f0a);
        }

        /* 깃허브 카드는 짙은 차콜로 아이콘 차별화 */
        .icon-wrapper.dark {
          color: var(--color-text-primary, #1c1c1e);
        }

        /* 카드 텍스트 레이아웃 */
        .card-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-secondary, #8e8e93);
        }

        .card-value {
          font-size: 18px;
          font-weight: 800;
          color: var(--color-text-primary, #1c1c1e);
          word-break: break-all;
        }

        /* 카드 하단 액션 버튼 그룹 */
        .actions-group {
          display: flex;
          gap: 8px;
          width: 100%;
          justify-content: center;
        }

        .card-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 18px;
          background-color: var(--color-bg-main, #faf9f6);
          border: 1px solid var(--color-border, #e5e5ea);
          border-radius: var(--radius-md, 12px);
          color: var(--color-text-primary, #1c1c1e);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: var(--transition-bounce, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)), background-color 0.2s ease;
        }

        .card-action:hover {
          background-color: var(--color-border, #e5e5ea);
        }

        /* 강조 버튼 스타일 */
        .card-action.highlight {
          background-color: var(--color-text-primary, #1c1c1e);
          color: #ffffff;
          border: none;
        }

        .card-action.highlight:hover {
          background-color: #2c2c2e;
        }

        /* 복사 성공 툴팁 */
        .tooltip {
          position: absolute;
          bottom: -15px;
          background-color: var(--color-text-primary, #1c1c1e);
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: var(--radius-sm, 8px);
          opacity: 0;
          pointer-events: none;
          transform: translateY(-10px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          z-index: 10;
        }

        .tooltip.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* 반응형 스타일 - 모바일 대응 */
        @media (max-width: 767px) {
          section {
            padding: 60px var(--spacing-sm, 16px);
          }
          h2 {
            font-size: 26px;
          }
          .contact-methods {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .card-action {
            flex: 1;
          }
        }
      </style>

      <section>
        <span class="section-tag">Let's Connect</span>
        <h2>새로운 기회를 기다립니다</h2>
        <p class="subtitle">협업 제안, 교육콘텐츠 개발 및 기획 관련 문의 등 무엇이든 편하게 연락해 주세요. 확인하는 대로 정성껏 회신하겠습니다.</p>

        <div class="contact-methods">
          <!-- 1. 이메일 문의 카드 -->
          <div class="contact-card">
            <div class="icon-wrapper primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <span class="card-title">이메일 주소</span>
            <span class="card-value">${this._email}</span>
            <div class="actions-group">
              <a href="mailto:${this._email}" class="card-action">메일 쓰기</a>
              <button class="card-action" id="btn-copy-email">주소 복사</button>
            </div>
            <div class="tooltip">이메일 주소가 복사되었습니다!</div>
          </div>

          <!-- 2. 깃허브 카드 -->
          <div class="contact-card">
            <div class="icon-wrapper dark">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
            </div>
            <span class="card-title">GitHub</span>
            <span class="card-value">개발 저장소</span>
            <div class="actions-group">
              <a href="${this._github}" target="_blank" class="card-action highlight">저장소 방문</a>
            </div>
          </div>

          <!-- 3. 블로그 및 활동 기록 카드 (PRD 요구사항 추가) -->
          <div class="contact-card">
            <div class="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <span class="card-title">블로그 / 활동 기록</span>
            <span class="card-value">교육 콘텐츠 기획서</span>
            <div class="actions-group">
              <a href="${this._blog}" target="_blank" class="card-action">기록물 보기</a>
            </div>
          </div>
        </div>
      </section>
    `;

    // 이메일 복사 액션 이벤트 바인딩
    this.shadowRoot.getElementById("btn-copy-email").addEventListener("click", () => {
      this.copyEmailToClipboard(this._email);
    });
  }
}

customElements.define("edu-contact", EduContact);
export default EduContact;
