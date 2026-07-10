/**
 * 이승화의 에듀테크 포트폴리오 - 개별 프로젝트 카드 컴포넌트
 */
class EduProjectCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._data = null;
  }

  // 외부에서 프로젝트 데이터를 전달받습니다.
  set projectData(data) {
    this._data = data;
    this.render();
  }

  connectedCallback() {
    if (this._data) {
      this.render();
    }
  }

  render() {
    const { title, summary, tags, image } = this._data;
    
    // 프로젝트 태그를 마크업으로 생성합니다.
    const tagElements = tags
      .map(tag => `<span class="project-tag">#${tag}</span>`)
      .join("");

    this.shadowRoot.innerHTML = `
      <style>
        /* 카드 자체 기본 레이아웃 및 스타일 (design.md 카드 규격 준수) */
        .card {
          background-color: var(--color-bg-card, #ffffff);
          border: 1px solid var(--color-border, #e5e5ea);
          border-radius: var(--radius-lg, 20px);
          overflow: hidden;
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
          display: flex;
          flex-direction: column;
          height: 100%;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* 호버 시 카드가 부드럽게 위로 떠오르는 마이크로 애니메이션 (Lift-up) */
        .card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg, 0 16px 36px rgba(0, 0, 0, 0.08));
          border-color: rgba(255, 159, 10, 0.3); /* 연한 오렌지색 보더 포인트 */
        }

        /* 프로젝트 이미지 영역 */
        .card-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          background-color: #f0f2f5;
          border-bottom: 1px solid var(--color-border, #e5e5ea);
          transition: transform 0.5s ease;
        }

        .card:hover .card-image {
          transform: scale(1.03); /* 호버 시 미세한 줌인 효과 */
        }

        /* 텍스트 콘텐츠 영역 */
        .card-content {
          padding: var(--spacing-md, 24px);
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          gap: 12px;
        }

        /* 태그 리스트 */
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .project-tag {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-secondary-main, #30b0c7); /* 민트/시안 보조색 적용 */
        }

        /* 카드 타이틀 (H3 스케일 준수) */
        h3 {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-primary, #1c1c1e);
          line-height: 1.4;
        }

        /* 요약문 (Body Small/Medium 스케일) */
        p {
          font-size: 14px;
          color: var(--color-text-secondary, #8e8e93);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2; /* 두 줄 말줄임 처리 */
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* 자세히 보기 하단 화살표 링크 버튼 */
        .card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 700;
          color: var(--color-primary-main, #ff9f0a);
        }

        .card-footer svg {
          transition: transform 0.25s ease;
        }

        .card:hover .card-footer svg {
          transform: translateX(4px); /* 호버 시 오른쪽 화살표 이동 효과 */
        }
      </style>

      <div class="card">
        <img class="card-image" src="${image || 'images/placeholder.png'}" alt="${title}">
        <div class="card-content">
          <div class="tag-list">
            ${tagElements}
          </div>
          <h3>${title}</h3>
          <p>${summary}</p>
          <div class="card-footer">
            <span>자세히 보기</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    `;

    // 카드 클릭 시 부모 노드나 메인 애플리케이션으로 이벤트 전파
    this.shadowRoot.querySelector(".card").addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("project-select", {
        detail: this._data,
        bubbles: true,
        composed: true // Shadow DOM 경계를 넘어가도록 설정
      }));
    });
  }
}

customElements.define("edu-project-card", EduProjectCard);
export default EduProjectCard;
