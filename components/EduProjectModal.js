/**
 * 이승화의 에듀테크 포트폴리오 - 프로젝트 상세정보 모달 팝업 컴포넌트
 */
class EduProjectModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.isOpen = false;
  }

  connectedCallback() {
    this.render();
  }

  // 모달을 열고 데이터를 주입하는 함수
  open(projectData) {
    this.isOpen = true;
    this.render(projectData);
    
    // 모달을 열 때 자연스럽게 애니메이션을 트리거하기 위해 클래스를 추가합니다.
    setTimeout(() => {
      const modal = this.shadowRoot.querySelector(".modal-overlay");
      if (modal) modal.classList.add("visible");
    }, 10);

    // 모달을 열면 뒷배경 스크롤을 막습니다.
    document.body.style.overflow = "hidden";
  }

  // 모달을 닫는 함수
  close() {
    const modal = this.shadowRoot.querySelector(".modal-overlay");
    if (modal) {
      modal.classList.remove("visible");
      
      // 트랜지션 완료 후 완전히 닫히도록 타이밍 조절
      setTimeout(() => {
        this.isOpen = false;
        this.render(null);
        document.body.style.overflow = "";
      }, 300);
    }
  }

  render(data = null) {
    if (!this.isOpen || !data) {
      this.shadowRoot.innerHTML = "";
      return;
    }

    const { title, summary, description, tags, image, links } = data;
    const tagElements = tags.map(tag => `<span class="tag">#${tag}</span>`).join("");

    // 깃허브 및 데모 링크가 유효한지 확인하고 버튼을 렌더링합니다.
    const githubBtn = links.github 
      ? `<a href="${links.github}" target="_blank" class="btn btn-github">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub에서 코드 보기
         </a>`
      : "";
      
    const demoBtn = links.demo 
      ? `<a href="${links.demo}" target="_blank" class="btn btn-primary">데모 웹사이트 방문</a>`
      : "";

    this.shadowRoot.innerHTML = `
      <style>
        /* 뒷배경 오버레이 딤드 처리 (Blur 8px 적용) */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: var(--color-overlay, rgba(28, 28, 30, 0.6));
          backdrop-filter: blur(0px);
          -webkit-backdrop-filter: blur(0px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease;
          pointer-events: none;
        }

        .modal-overlay.visible {
          opacity: 1;
          pointer-events: auto;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        /* 모달 본체 박스 (아래에서 위로 올라오는 트랜지션) */
        .modal-body {
          background-color: var(--color-bg-card, #ffffff);
          border-radius: var(--radius-xl, 24px);
          width: 90%;
          max-width: 750px;
          max-height: 85vh;
          overflow-y: auto;
          position: relative;
          box-shadow: var(--shadow-lg, 0 16px 36px rgba(0, 0, 0, 0.08));
          transform: translateY(40px);
          opacity: 0;
          transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.3s ease;
        }

        .modal-overlay.visible .modal-body {
          transform: translateY(0);
          opacity: 1;
        }

        /* 닫기 (X) 버튼 */
        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--color-bg-main, #faf9f6);
          color: var(--color-text-primary, #1c1c1e);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          border: 1px solid var(--color-border, #e5e5ea);
          transition: var(--transition-bounce, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)), background-color 0.2s ease;
        }

        .close-btn:hover {
          transform: scale(1.1) rotate(90deg);
          background-color: var(--color-border, #e5e5ea);
        }

        /* 모달 이미지 메인 */
        .modal-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
          background-color: #f0f2f5;
        }

        /* 정보 기재 구역 */
        .modal-content {
          padding: var(--spacing-lg, 32px);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* 태그 리스트 */
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-secondary-main, #30b0c7);
        }

        /* 제목 */
        h2 {
          font-size: 26px;
          font-weight: 800;
          color: var(--color-text-primary, #1c1c1e);
          line-height: 1.3;
        }

        /* 요약문 */
        .summary-box {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-primary-dark, #ff8500);
          line-height: 1.5;
          padding-left: 12px;
          border-left: 4px solid var(--color-primary-main, #ff9f0a);
        }

        /* 상세 설명 */
        .description-text {
          font-size: 15px;
          line-height: 1.7;
          color: var(--color-text-secondary, #8e8e93);
          white-space: pre-wrap; /* 줄바꿈 허용 */
          word-break: keep-all;
        }

        /* 버튼 및 링크 섹션 */
        .actions {
          margin-top: 16px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          padding: 0 24px;
          font-size: 14px;
          font-weight: 700;
          border-radius: var(--radius-md, 12px);
          text-decoration: none;
          transition: var(--transition-bounce, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)), background-color 0.2s ease;
        }

        /* 메인 오렌지 옐로우 버튼 */
        .btn-primary {
          background-color: var(--color-primary-main, #ff9f0a);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(255, 159, 10, 0.2);
        }

        .btn-primary:hover {
          background-color: var(--color-primary-light, #ffd60a);
          color: var(--color-text-primary, #1c1c1e);
          transform: translateY(-2px);
        }

        /* 보조 깃허브 아웃라인 버튼 */
        .btn-github {
          border: 1px solid var(--color-text-primary, #1c1c1e);
          background-color: #ffffff;
          color: var(--color-text-primary, #1c1c1e);
          gap: 8px;
        }

        .btn-github:hover {
          background-color: var(--color-bg-main, #faf9f6);
          transform: translateY(-2px);
        }

        .btn:active {
          transform: scale(0.97);
        }

        /* 모바일 반응형 처리 */
        @media (max-width: 767px) {
          .modal-body {
            width: 95%;
            max-height: 90vh;
          }
          .modal-image {
            height: 200px;
          }
          .modal-content {
            padding: var(--spacing-md, 24px);
          }
          h2 {
            font-size: 20px;
          }
          .actions {
            flex-direction: column;
          }
          .btn {
            width: 100%;
          }
        }
      </style>

      <div class="modal-overlay">
        <div class="modal-body">
          <button class="close-btn" aria-label="모달 닫기">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <img class="modal-image" src="${image || 'images/placeholder.png'}" alt="${title}">
          <div class="modal-content">
            <div class="tag-list">
              ${tagElements}
            </div>
            <h2>${title}</h2>
            <div class="summary-box">${summary}</div>
            <p class="description-text">${description}</p>
            <div class="actions">
              ${demoBtn}
              ${githubBtn}
            </div>
          </div>
        </div>
      </div>
    `;

    // 닫기 버튼 이벤트 등록
    this.shadowRoot.querySelector(".close-btn").addEventListener("click", () => this.close());
    
    // 오버레이 뒷배경 클릭 시 닫기
    this.shadowRoot.querySelector(".modal-overlay").addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-overlay")) {
        this.close();
      }
    });
  }
}

customElements.define("edu-project-modal", EduProjectModal);
export default EduProjectModal;
