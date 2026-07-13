/**
 * 이승화의 에듀테크 포트폴리오 - 연락폼 컴포넌트
 * 이름, 이메일 주소, 메시지를 입력받아 EmailJS SDK를 사용하여 이메일을 전송합니다.
 * design.md의 색상, 타이포그래피, 버튼/인터랙션 스펙을 충족하도록 제작되었습니다.
 */
class EduContactForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    
    // EmailJS 정보 설정
    this.serviceId = "service_pjm88i8";
    this.templateId = "template_o3yiigj";
  }

  connectedCallback() {
    this.render();
    this.setupForm();
  }

  showToast(message, isSuccess = true) {
    const toast = this.shadowRoot.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.style.backgroundColor = isSuccess 
      ? "var(--color-text-primary, #1c1c1e)" 
      : "#FF3B30"; // 성공 시 차콜, 실패 시 레드
    
    toast.classList.add("visible");
    
    setTimeout(() => {
      toast.classList.remove("visible");
    }, 3000);
  }

  setupForm() {
    const form = this.shadowRoot.getElementById("contact-form");
    const submitBtn = this.shadowRoot.getElementById("submit-btn");
    const btnText = this.shadowRoot.getElementById("btn-text");
    const spinner = this.shadowRoot.getElementById("spinner");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = this.shadowRoot.getElementById("input-name").value.trim();
      const email = this.shadowRoot.getElementById("input-email").value.trim();
      const message = this.shadowRoot.getElementById("input-message").value.trim();

      // 간단한 유효성 검증
      if (!name || !email || !message) {
        this.showToast("모든 필드를 입력해 주세요.", false);
        return;
      }

      // 이메일 형식 검증 정규식
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.showToast("올바른 이메일 주소를 입력해 주세요.", false);
        return;
      }

      // 전송 중 상태 표시 (로딩 및 비활성화)
      submitBtn.disabled = true;
      spinner.classList.add("active");
      btnText.textContent = "전송 중...";

      try {
        // 전역 emailjs 객체가 로드되어 있는지 확인
        if (typeof window.emailjs === "undefined") {
          throw new Error("EmailJS SDK가 로드되지 않았습니다.");
        }

        // 사용자가 제공한 전송 코드 형식 준수
        const response = await window.emailjs.send(this.serviceId, this.templateId, {
          from_name: name,
          from_email: email,
          message: message,
        });

        if (response.status === 200) {
          this.showToast("이메일이 성공적으로 전송되었습니다!");
          form.reset();
        } else {
          console.error("EmailJS 전송 오류:", response);
          this.showToast("이메일 전송에 실패했습니다. 다시 시도해 주세요.", false);
        }
      } catch (error) {
        console.error("오류 발생:", error);
        this.showToast("이메일 전송 중 오류가 발생했습니다.", false);
      } finally {
        // 원래 상태로 복구
        submitBtn.disabled = false;
        spinner.classList.remove("active");
        btnText.textContent = "이메일 보내기";
      }
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* 기본 리셋 및 박스 사이징 */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* 폼 컨테이너 (design.md 카드 스펙 기준) */
        .form-card {
          background-color: var(--color-bg-card, #ffffff);
          border: 1px solid var(--color-border, #e5e5ea);
          border-radius: var(--radius-lg, 20px);
          padding: var(--spacing-lg, 32px);
          box-shadow: var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.04));
          max-width: 800px;
          width: 100%;
          margin: var(--spacing-lg, 32px) auto 0 auto;
          text-align: left;
          transition: var(--transition-normal, all 0.25s ease);
        }

        .form-card:hover {
          box-shadow: var(--shadow-lg, 0 16px 36px rgba(0, 0, 0, 0.08));
        }

        .form-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-primary, #1c1c1e);
          margin-bottom: var(--spacing-xs, 8px);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-title::before {
          content: "";
          display: inline-block;
          width: 6px;
          height: 20px;
          background-color: var(--color-primary-main, #ff9f0a);
          border-radius: var(--radius-pill, 9999px);
        }

        .form-desc {
          font-size: 14px;
          color: var(--color-text-secondary, #8e8e93);
          margin-bottom: var(--spacing-md, 24px);
        }

        /* 그리드 및 행 배치 */
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-sm, 16px);
          margin-bottom: var(--spacing-sm, 16px);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        /* 라벨 디자인 */
        label {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-secondary, #8e8e93);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* 인풋 및 텍스트 영역 공통 스타일 */
        input, textarea {
          font-family: inherit;
          font-size: 15px;
          padding: 12px 16px;
          border: 1px solid var(--color-border, #e5e5ea);
          border-radius: var(--radius-md, 12px);
          background-color: #ffffff;
          color: var(--color-text-primary, #1c1c1e);
          outline: none;
          transition: var(--transition-normal, all 0.25s ease);
          width: 100%;
        }

        input:focus, textarea:focus {
          border-color: var(--color-primary-main, #ff9f0a);
          box-shadow: 0 0 0 4px rgba(255, 159, 10, 0.15);
        }

        input::placeholder, textarea::placeholder {
          color: #c7c7cc;
        }

        textarea {
          resize: vertical;
          min-height: 150px;
        }

        /* 제출 버튼 컨테이너 */
        .btn-container {
          display: flex;
          justify-content: flex-end;
          margin-top: var(--spacing-md, 24px);
        }

        /* 보내기 버튼 (design.md Primary Button 스펙) */
        .submit-btn {
          font-family: inherit;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
          background-color: var(--color-primary-main, #ff9f0a);
          padding: 0 32px;
          height: 52px;
          border: none;
          border-radius: var(--radius-md, 12px);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
          transition: var(--transition-bounce, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)), background-color 0.2s ease, box-shadow 0.2s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: var(--color-primary-light, #ffd60a);
          box-shadow: 0 8px 16px rgba(255, 159, 10, 0.2);
          color: var(--color-text-primary, #1c1c1e); /* 노란색 배경 시 글자 가독성 확보 */
        }

        .submit-btn:active:not(:disabled) {
          background-color: var(--color-primary-dark, #ff8500);
          color: #ffffff;
          transform: scale(0.97);
        }

        .submit-btn:disabled {
          background-color: #e5e5ea;
          color: #aeaeae;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* 로딩 스피너 애니메이션 */
        .spinner {
          display: none;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spin 0.8s linear infinite;
        }

        .submit-btn:disabled .spinner {
          border-color: rgba(0, 0, 0, 0.1);
          border-top-color: var(--color-text-secondary, #8e8e93);
        }

        .spinner.active {
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* 토스트 알림 스타일 */
        .toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translate(-50%, 20px);
          background-color: var(--color-text-primary, #1c1c1e);
          color: #ffffff;
          padding: 12px 24px;
          border-radius: var(--radius-md, 12px);
          font-size: 14px;
          font-weight: 600;
          box-shadow: var(--shadow-lg, 0 16px 36px rgba(0, 0, 0, 0.08));
          opacity: 0;
          pointer-events: none;
          z-index: 9999;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .toast.visible {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        /* 반응형 모바일 스타일 */
        @media (max-width: 767px) {
          .form-card {
            padding: var(--spacing-sm, 16px);
            margin-top: var(--spacing-md, 24px);
          }
          .form-grid {
            grid-template-columns: 1fr;
          }
          .form-group.full-width {
            grid-column: span 1;
          }
          .submit-btn {
            width: 100%;
            height: 48px;
          }
        }
      </style>

      <div class="form-card">
        <h3 class="form-title">메시지 보내기</h3>
        <p class="form-desc">궁금한 점이 있거나 제안하실 내용이 있다면 언제든지 직접 메시지를 남겨 주세요.</p>
        
        <form id="contact-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="input-name">이름 *</label>
              <input type="text" id="input-name" placeholder="홍길동" required autocomplete="name">
            </div>
            
            <div class="form-group">
              <label for="input-email">이메일 주소 *</label>
              <input type="email" id="input-email" placeholder="example@domain.com" required autocomplete="email">
            </div>

            <div class="form-group full-width">
              <label for="input-message">메시지 내용 *</label>
              <textarea id="input-message" placeholder="여기에 상세 내용을 작성해 주세요..." required></textarea>
            </div>
          </div>

          <div class="btn-container">
            <button type="submit" id="submit-btn" class="submit-btn">
              <span id="spinner" class="spinner"></span>
              <span id="btn-text">이메일 보내기</span>
            </button>
          </div>
        </form>
      </div>

      <div id="toast" class="toast"></div>
    `;
  }
}

// 브라우저 커스텀 엘리먼트로 등록
customElements.define("edu-contact-form", EduContactForm);
export default EduContactForm;
