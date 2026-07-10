/**
 * 이승화의 에듀테크 포트폴리오 - 상단 헤더 및 네비게이션 바 컴포넌트
 */
class EduHeader extends HTMLElement {
  constructor() {
    super();
    // Shadow DOM을 생성하여 스타일과 마크업을 캡슐화합니다.
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.setupNavigation();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        /* Shadow DOM 리셋 */
        * {
          box-sizing: border-box;
        }

        /* 상단 헤더 컨테이너 스타일 */
        header {
          box-sizing: border-box;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 70px;
          background-color: rgba(250, 249, 246, 0.85); /* 웜톤 배경 및 블러 효과 */
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--color-border, #e5e5ea);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 var(--spacing-lg, 32px);
          z-index: 1000;
          transition: var(--transition-normal, all 0.25s ease);
        }

        /* 개인 로고 BI 스타일 */
        .logo {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-text-primary, #1c1c1e);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* 에듀테크 감성을 담은 포인트 도트 심볼 */
        .logo::after {
          content: "";
          display: inline-block;
          width: 8px;
          height: 8px;
          background-color: var(--color-primary-main, #ff9f0a);
          border-radius: 50%;
        }

        /* 네비게이션 메뉴 리스트 */
        nav ul {
          display: flex;
          list-style: none;
          gap: var(--spacing-md, 24px);
          margin: 0;
          padding: 0;
        }

        /* 네비게이션 링크 항목 */
        nav a {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text-secondary, #8e8e93);
          text-decoration: none;
          position: relative;
          padding: 6px 0;
          transition: var(--transition-normal, all 0.25s ease);
        }

        nav a:hover, nav a.active {
          color: var(--color-primary-dark, #ff8500);
        }

        /* 호버 및 활성화 상태에서의 하단 오렌지 옐로우 바 장식 */
        nav a::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 3px;
          background-color: var(--color-primary-main, #ff9f0a);
          border-radius: var(--radius-pill, 9999px);
          transition: var(--transition-normal, all 0.25s ease);
        }

         nav a:hover::after, nav a.active::after {
          width: 100%;
        }

        /* 관리자 로그인 버튼 스타일 */
        nav a.admin-login-btn {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-primary-main, #ff9f0a);
          padding: 6px 12px;
          border: 1px solid var(--color-primary-main, #ff9f0a);
          border-radius: var(--radius-md, 12px);
          display: flex;
          align-items: center;
          gap: 4px;
          transition: var(--transition-bounce, all 0.2s ease);
        }

        nav a.admin-login-btn::after {
          display: none; /* 하단 언더라인 바 제거 */
        }

        nav a.admin-login-btn:hover {
          background-color: var(--color-primary-main, #ff9f0a);
          color: white;
          border-color: var(--color-primary-main, #ff9f0a);
          transform: translateY(-2px);
        }

        /* 반응형 스타일 모바일 대응 */
        @media (max-width: 767px) {
          header {
            padding: 0 var(--spacing-sm, 16px);
            height: 60px;
          }
          .logo {
            font-size: 18px;
          }
          nav ul {
            gap: 12px;
            align-items: center;
          }
          nav a {
            font-size: 13px;
          }
          nav a.admin-login-btn {
            padding: 4px 8px;
            font-size: 11px;
          }
        }
      </style>

      <header>
        <a href="#home" class="logo">SEUNG HWA</a>
        <nav>
          <ul>
            <li><a href="#home" class="nav-link active">소개</a></li>
            <li><a href="#projects" class="nav-link">프로젝트</a></li>
            <li><a href="#contact" class="nav-link">연락처</a></li>
            <li><a href="login.html" class="admin-login-btn" title="관리자 로그인">⚙ 로그인</a></li>
          </ul>
        </nav>
      </header>
    `;
  }

  // 스무스 스크롤 네비게이션 및 활성화 탭 표시 로직
  setupNavigation() {
    const links = this.shadowRoot.querySelectorAll(".nav-link");
    
    links.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // 스무스 스크롤 실행
          window.scrollTo({
            top: targetElement.offsetTop - 70, // 헤더 높이만큼 마진 부여
            behavior: "smooth"
          });
        }

        // 활성화된 탭 상태 업데이트
        links.forEach(l => l.classList.remove("active"));
        link.classList.add("active");
      });
    });

    // 스크롤 감지하여 현재 섹션 링크 활성화 처리
    window.addEventListener("scroll", () => {
      const scrollPosition = window.scrollY + 100;
      
      links.forEach(link => {
        const targetId = link.getAttribute("href");
        const section = document.querySelector(targetId);
        
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          
          if (scrollPosition >= top && scrollPosition < top + height) {
            links.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
          }
        }
      });
    });
  }
}

// 브라우저에 커스텀 엘리먼트로 등록합니다.
customElements.define("edu-header", EduHeader);
export default EduHeader;
