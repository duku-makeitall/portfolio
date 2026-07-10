import { supabase } from "../supabase.js";

/**
 * 이승화의 에듀테크 포트폴리오 - 관리자 패널 웹 컴포넌트 (EduAdminPanel)
 * Profile 수정, 기술 스택 관리, 프로젝트 CRUD, LocalStorage 임시 저장, JSON 내보내기 기능을 원스톱으로 지원합니다.
 */
class EduAdminPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    
    // 데이터 및 UI 상태 초기화
    this.data = {
      profile: {
        name: "",
        title: "",
        description: "",
        skills: [],
        email: "",
        github: "",
        blog: "",
        aboutCard: {
          bullets: ["", "", ""],
          interests: []
        }
      },
      projects: []
    };
    
    this.activeTab = "profile"; // "profile" | "projects"
    this.editingProjectId = null; // 수정 중인 프로젝트 ID (null이면 대기/추가 모드)
    this.showProjectForm = false; // 프로젝트 추가/수정 폼 표시 여부
  }

  async connectedCallback() {
    // 1. 로그인 여부 체크
    if (sessionStorage.getItem("admin_logged_in") !== "true") {
      window.location.href = "login.html";
      return;
    }

    // 2. 데이터 불러오기 (임시 저장본 -> 원본 파일 순서)
    await this.loadData();
    this.render();
  }

  async loadData() {
    // 1) 프로필 데이터 로드
    let profileData = null;
    const localData = localStorage.getItem("portfolio_draft_data");
    
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        profileData = parsed.profile;
        console.log("임시 저장된 프로필 데이터를 로드했습니다.");
      } catch (e) {
        console.error("임시 저장 데이터 파싱 에러", e);
      }
    }
    
    // 백업 JSON 읽기 함수
    const loadBackupJson = async () => {
      try {
        const response = await fetch("./profile-data.json");
        if (response.ok) {
          return await response.json();
        }
      } catch (e) {
        console.error(e);
      }
      return null;
    };

    let backupJson = null;
    if (!profileData) {
      backupJson = await loadBackupJson();
      if (backupJson) profileData = backupJson.profile;
    }
    
    if (profileData) {
      this.data.profile = profileData;
    }

    // 2) Supabase로부터 프로젝트 로드
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        this.data.projects = data.map(dbProj => ({
          id: dbProj.id,
          title: dbProj.title,
          summary: dbProj.summary,
          description: dbProj.description,
          tags: dbProj.tags || [],
          image: dbProj.image,
          links: {
            github: dbProj.github_link || "",
            demo: dbProj.demo_link || ""
          }
        }));
        this.showToast("데이터베이스로부터 프로젝트 목록을 불러왔습니다.", "success");
      } else {
        console.log("Supabase 프로젝트 테이블이 비어있어 기본 데이터를 로드합니다.");
        if (!backupJson) backupJson = await loadBackupJson();
        if (backupJson && backupJson.projects) {
          this.data.projects = backupJson.projects;
        }
      }
    } catch (err) {
      console.warn("Supabase 프로젝트 로드 실패, 백업 데이터를 로드합니다.", err);
      if (!backupJson) backupJson = await loadBackupJson();
      if (backupJson && backupJson.projects) {
        this.data.projects = backupJson.projects;
      }
    }
  }

  async saveDraft() {
    try {
      // 1) 로컬 스토리지 저장 (백업/드래프트)
      localStorage.setItem("portfolio_draft_data", JSON.stringify(this.data));
      
      // 2) Supabase profile 테이블 저장
      const prof = this.data.profile;
      const dbProfile = {
        id: "seunghwa",
        name: prof.name,
        title: prof.title,
        description: prof.description,
        skills: prof.skills || [],
        email: prof.email,
        github: prof.github,
        blog: prof.blog || "",
        bullets: prof.aboutCard?.bullets || [],
        interests: prof.aboutCard?.interests || []
      };

      const { error } = await supabase
        .from("profile")
        .upsert(dbProfile);

      if (error) throw error;

      this.showToast("프로필과 변경 사항이 Supabase DB와 LocalStorage에 안전하게 저장되었습니다!", "success");
    } catch (e) {
      console.error(e);
      this.showToast("데이터베이스 저장 오류: " + e.message, "error");
    }
  }

  downloadJSON() {
    try {
      const jsonString = JSON.stringify(this.data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "profile-data.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      this.showToast("최종 profile-data.json 설정 파일이 다운로드되었습니다. 프로젝트 루트에 저장해 주세요.", "success");
    } catch (e) {
      this.showToast("파일 내보내기 중 오류가 발생했습니다.", "error");
    }
  }

  resetData() {
    if (confirm("정말 모든 임시 수정 내역을 삭제하고 원본 profile-data.json 파일 상태로 되돌리시겠습니까?")) {
      localStorage.removeItem("portfolio_draft_data");
      this.loadData().then(() => {
        this.render();
        this.showToast("데이터가 원본 파일 기준으로 초기화되었습니다.", "info");
      });
    }
  }

  logout() {
    sessionStorage.removeItem("admin_logged_in");
    this.showToast("로그아웃 되었습니다.", "info");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);
  }

  showToast(message, type = "info") {
    const toast = this.shadowRoot.getElementById("toast");
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
      toast.className = "toast";
    }, 4000);
  }

  switchTab(tab) {
    this.activeTab = tab;
    this.showProjectForm = false;
    this.editingProjectId = null;
    this.render();
  }

  // 자기소개 관련 폼 값 업데이트
  updateProfileField(field, value, index = null) {
    if (index !== null && field === "bullets") {
      this.data.profile.aboutCard.bullets[index] = value;
    } else {
      this.data.profile[field] = value;
    }
  }

  // 기술 배지 추가
  addSkill(skillName) {
    const name = skillName.trim();
    if (name && !this.data.profile.skills.includes(name)) {
      this.data.profile.skills.push(name);
      this.render();
    }
  }

  // 기술 배지 삭제
  removeSkill(skillName) {
    this.data.profile.skills = this.data.profile.skills.filter(s => s !== skillName);
    this.render();
  }

  // 관심 분야 추가
  addInterest(interestName) {
    const name = interestName.trim();
    if (name && !this.data.profile.aboutCard.interests.includes(name)) {
      this.data.profile.aboutCard.interests.push(name);
      this.render();
    }
  }

  // 관심 분야 삭제
  removeInterest(interestName) {
    this.data.profile.aboutCard.interests = this.data.profile.aboutCard.interests.filter(i => i !== interestName);
    this.render();
  }

  // 프로젝트 삭제
  async deleteProject(id) {
    if (confirm("해당 프로젝트를 정말 삭제하시겠습니까?")) {
      try {
        const { error } = await supabase
          .from("projects")
          .delete()
          .eq("id", id);

        if (error) throw error;
        
        this.data.projects = this.data.projects.filter(p => p.id !== id);
        this.render();
        this.showToast("프로젝트가 성공적으로 삭제되었습니다.", "success");
      } catch (err) {
        console.error(err);
        this.showToast("데이터베이스 삭제 실패: " + err.message, "error");
      }
    }
  }

  // 프로젝트 추가/수정 폼 열기
  openProjectForm(projectId = null) {
    if (projectId) {
      this.editingProjectId = projectId;
      this.showProjectForm = true;
    } else {
      this.editingProjectId = null;
      this.showProjectForm = true;
    }
    this.render();
  }

  // 프로젝트 저장
  async saveProject(event) {
    event.preventDefault();
    const form = this.shadowRoot.getElementById("project-form-el");
    const formData = new FormData(form);
    
    const tagsString = formData.get("tags") || "";
    const tagsArray = tagsString.split(",").map(t => t.trim()).filter(t => t.length > 0);

    const projectObj = {
      id: this.editingProjectId || `project-${Date.now()}`,
      title: formData.get("title"),
      tags: tagsArray,
      summary: formData.get("summary"),
      description: formData.get("description"),
      image: formData.get("image") || "images/project_placeholder.png",
      links: {
        github: formData.get("github") || "",
        demo: formData.get("demo") || ""
      }
    };

    // Supabase DB 컬럼에 맞춤 매핑
    const dbProj = {
      id: projectObj.id,
      title: projectObj.title,
      summary: projectObj.summary,
      description: projectObj.description,
      tags: projectObj.tags,
      image: projectObj.image,
      github_link: projectObj.links.github,
      demo_link: projectObj.links.demo
    };

    try {
      const { error } = await supabase
        .from("projects")
        .upsert(dbProj);

      if (error) throw error;

      if (this.editingProjectId) {
        // 수정 모드
        const idx = this.data.projects.findIndex(p => p.id === this.editingProjectId);
        if (idx !== -1) {
          this.data.projects[idx] = projectObj;
        }
        this.showToast("프로젝트가 수정 및 저장되었습니다.", "success");
      } else {
        // 추가 모드
        this.data.projects.push(projectObj);
        this.showToast("새 프로젝트가 데이터베이스에 저장되었습니다.", "success");
      }

      this.showProjectForm = false;
      this.editingProjectId = null;
      this.render();
    } catch (err) {
      console.error(err);
      this.showToast("데이터베이스 저장 실패: " + err.message, "error");
    }
  }

  render() {
    const profile = this.data.profile;
    const projects = this.data.projects;

    // 1. 공통 스타일 및 테마 변수 바인딩
    let cssStyles = `
      <style>
        :host {
          display: block;
          font-family: "Pretendard", -apple-system, sans-serif;
          background-color: var(--color-bg-main, #faf9f6);
          min-height: 100vh;
          color: var(--color-text-primary, #1c1c1e);
          padding-bottom: 80px;
        }

        * {
          box-sizing: border-box;
        }

        /* 어드민 전용 레이아웃 헤더 */
        .admin-header {
          background-color: var(--color-bg-card, #ffffff);
          border-bottom: 1px solid var(--color-border, #e5e5ea);
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.04));
        }

        .admin-logo {
          font-size: 20px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .admin-logo span {
          color: var(--color-primary-main, #ff9f0a);
        }

        .header-buttons {
          display: flex;
          gap: 12px;
        }

        .btn-view-site {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md, 12px);
          background-color: transparent;
          color: var(--color-text-primary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-normal);
        }
        
        .btn-view-site:hover {
          background-color: var(--color-bg-main);
        }

        .btn-logout {
          background-color: #ff3b30;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: var(--radius-md, 12px);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .btn-logout:hover {
          background-color: #d62f25;
        }

        /* 바디 레이아웃 */
        .admin-container {
          max-width: 1100px;
          margin: 32px auto;
          padding: 0 16px;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 32px;
        }

        @media (max-width: 768px) {
          .admin-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        /* 왼쪽 사이드 탭 제어 */
        .admin-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .sidebar-card {
          background-color: var(--color-bg-card, #ffffff);
          border: 1px solid var(--color-border, #e5e5ea);
          border-radius: var(--radius-lg, 20px);
          padding: 20px;
          box-shadow: var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.04));
        }

        .sidebar-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--color-text-secondary);
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .tab-btn {
          width: 100%;
          text-align: left;
          padding: 12px 16px;
          border: none;
          border-radius: var(--radius-md, 12px);
          background-color: transparent;
          color: var(--color-text-primary);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: var(--transition-normal);
        }

        .tab-btn:hover {
          background-color: var(--color-bg-main);
        }

        .tab-btn.active {
          background-color: rgba(255, 159, 10, 0.1);
          color: var(--color-primary-dark, #ff8500);
        }

        /* 컨트롤 센터 버튼 (임시 저장, 다운로드, 초기화) */
        .controls-card {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-control {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-md, 12px);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-bounce);
          border: none;
          text-align: center;
        }

        .btn-save-draft {
          background-color: var(--color-primary-main, #ff9f0a);
          color: white;
          box-shadow: 0 4px 12px rgba(255, 159, 10, 0.2);
        }

        .btn-save-draft:hover {
          background-color: var(--color-primary-light, #ffd60a);
          color: var(--color-text-primary);
        }

        .btn-download-json {
          background-color: var(--color-secondary-main, #30b0c7);
          color: white;
          box-shadow: 0 4px 12px rgba(48, 176, 199, 0.2);
        }

        .btn-download-json:hover {
          background-color: #279bb0;
        }

        .btn-reset {
          background-color: #f2f2f7;
          color: #ff3b30;
          border: 1px solid var(--color-border);
        }

        .btn-reset:hover {
          background-color: #e5e5ea;
        }

        /* 메인 내용 관리 영역 */
        .admin-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .content-card {
          background-color: var(--color-bg-card, #ffffff);
          border: 1px solid var(--color-border, #e5e5ea);
          border-radius: var(--radius-lg, 20px);
          padding: 32px;
          box-shadow: var(--shadow-md, 0 4px 20px rgba(0, 0, 0, 0.04));
        }

        @media (max-width: 768px) {
          .content-card {
            padding: 20px;
          }
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--color-border);
          padding-bottom: 16px;
          margin-bottom: 24px;
        }

        .card-title {
          font-size: 22px;
          font-weight: 800;
        }

        .card-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-top: 4px;
        }

        /* 폼 요소 스타일 (design.md 반영) */
        .form-group {
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 576px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
        }

        label {
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        input[type="text"],
        input[type="email"],
        textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md, 12px);
          font-size: 14px;
          font-family: inherit;
          color: var(--color-text-primary);
          background-color: var(--color-bg-card);
          transition: var(--transition-normal);
          box-sizing: border-box;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: var(--color-primary-main);
          box-shadow: 0 0 0 3px rgba(255, 159, 10, 0.15);
        }

        textarea {
          resize: vertical;
          min-height: 100px;
        }

        /* 태그 편집기 (Chip List) */
        .chip-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
          margin-bottom: 12px;
        }

        .chip {
          background-color: var(--color-bg-main);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-pill, 9999px);
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .chip-delete {
          color: #ff3b30;
          font-weight: bold;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0 2px;
          font-size: 14px;
        }

        .chip-input-row {
          display: flex;
          gap: 8px;
        }

        .btn-add-chip {
          padding: 12px 18px;
          background-color: var(--color-text-primary);
          color: white;
          border: none;
          border-radius: var(--radius-md, 12px);
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: var(--transition-bounce);
        }
        
        .btn-add-chip:hover {
          background-color: #333333;
        }

        /* 프로젝트 테이블 & 리스트 */
        .project-table-container {
          overflow-x: auto;
        }

        .project-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .project-table th {
          padding: 12px 16px;
          border-bottom: 2px solid var(--color-border);
          font-weight: 700;
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .project-table td {
          padding: 16px;
          border-bottom: 1px solid var(--color-border);
          font-size: 14px;
          vertical-align: middle;
        }

        .project-img-preview {
          width: 60px;
          height: 45px;
          object-fit: cover;
          border-radius: var(--radius-sm, 8px);
          background-color: #eee;
          border: 1px solid var(--color-border);
        }

        .table-actions {
          display: flex;
          gap: 8px;
        }

        .btn-action {
          padding: 6px 12px;
          border-radius: var(--radius-sm, 8px);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-normal);
          border: 1px solid var(--color-border);
          background-color: white;
        }

        .btn-edit {
          color: var(--color-secondary-main);
          border-color: var(--color-secondary-main);
        }

        .btn-edit:hover {
          background-color: rgba(48, 176, 199, 0.05);
        }

        .btn-delete {
          color: #ff3b30;
          border-color: #ff3b30;
        }

        .btn-delete:hover {
          background-color: rgba(255, 59, 48, 0.05);
        }

        .btn-add-project {
          background-color: var(--color-secondary-green, #34c759);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: var(--radius-md, 12px);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(52, 199, 89, 0.2);
          transition: var(--transition-bounce);
        }

        .btn-add-project:hover {
          background-color: #2da84a;
        }

        /* 토스트 팝업 (알림) */
        .toast {
          position: fixed;
          bottom: -80px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #333;
          color: white;
          padding: 14px 28px;
          border-radius: var(--radius-md, 12px);
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          z-index: 10000;
          transition: bottom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s;
          opacity: 0;
          pointer-events: none;
          text-align: center;
          width: 80%;
          max-width: 480px;
        }

        .toast.show {
          bottom: 40px;
          opacity: 1;
        }

        .toast.success {
          background-color: var(--color-secondary-green, #34c759);
        }

        .toast.error {
          background-color: #ff3b30;
        }

        .toast.info {
          background-color: var(--color-secondary-main, #30b0c7);
        }

        /* 폼 버튼 세트 */
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          border-top: 1px solid var(--color-border);
          padding-top: 20px;
        }

        .btn-form-save {
          background-color: var(--color-primary-main, #ff9f0a);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: var(--radius-md, 12px);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-bounce);
        }

        .btn-form-save:hover {
          background-color: var(--color-primary-dark);
        }

        .btn-form-cancel {
          background-color: white;
          border: 1px solid var(--color-border);
          padding: 10px 24px;
          border-radius: var(--radius-md, 12px);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-normal);
        }

        .btn-form-cancel:hover {
          background-color: var(--color-bg-main);
        }
      </style>
    `;

    // 2. 관리 데이터 렌더링을 탭 및 폼 노출 플래그에 따라 분기
    let mainContentHtml = "";

    if (this.activeTab === "profile") {
      // 프로필 편집 탭 렌더링
      const skillChips = profile.skills
        .map(skill => `
          <div class="chip">
            ${skill}
            <button class="chip-delete" data-skill="${skill}">×</button>
          </div>
        `).join("");

      const interestChips = (profile.aboutCard?.interests || [])
        .map(interest => `
          <div class="chip">
            #${interest}
            <button class="chip-delete" data-interest="${interest}">×</button>
          </div>
        `).join("");

      const bulletInputs = [0, 1, 2].map(idx => `
        <div class="form-group">
          <label>핵심 역량 요약 문장 ${idx + 1}</label>
          <input type="text" class="profile-input" data-field="bullets" data-index="${idx}" value="${profile.aboutCard?.bullets?.[idx] || ""}" placeholder="포트폴리오 카드에 나타날 요약 문장을 입력하세요.">
        </div>
      `).join("");

      mainContentHtml = `
        <div class="content-card">
          <div class="card-header">
            <div>
              <h2 class="card-title">자기소개 및 기본 프로필 설정</h2>
              <div class="card-subtitle">웹페이지의 헤더, 연락처, 자기소개 요약 블록을 편집합니다.</div>
            </div>
          </div>

          <form id="profile-edit-form">
            <div class="form-row">
              <div class="form-group">
                <label>관리자 성명</label>
                <input type="text" class="profile-input" data-field="name" value="${profile.name || ""}">
              </div>
              <div class="form-group">
                <label>이메일 주소</label>
                <input type="email" class="profile-input" data-field="email" value="${profile.email || ""}">
              </div>
            </div>

            <div class="form-group">
              <label>헤드라인 (타이틀)</label>
              <input type="text" class="profile-input" data-field="title" value="${profile.title || ""}">
            </div>

            <div class="form-group">
              <label>상세 소개 내용 (줄바꿈 가능)</label>
              <textarea class="profile-input" data-field="description">${profile.description || ""}</textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>깃허브 주소</label>
                <input type="text" class="profile-input" data-field="github" value="${profile.github || ""}">
              </div>
              <div class="form-group">
                <label>블로그/노션 링크</label>
                <input type="text" class="profile-input" data-field="blog" value="${profile.blog || ""}">
              </div>
            </div>

            <div style="border-top: 1px solid var(--color-border); margin: 24px 0; padding-top: 24px;"></div>
            <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 16px;">우측 프로필 카드 세부 항목</h3>

            ${bulletInputs}

            <div class="form-group">
              <label>보유 전문 기술 스택 배지 (태그)</label>
              <div class="chip-container">
                ${skillChips || '<span style="font-size: 13px; color: var(--color-text-secondary);">등록된 기술 스택이 없습니다.</span>'}
              </div>
              <div class="chip-input-row">
                <input type="text" id="new-skill-input" placeholder="새 기술명 입력 (예: Figma, HTML5)">
                <button type="button" class="btn-add-chip" id="btn-add-skill">추가</button>
              </div>
            </div>

            <div class="form-group" style="margin-top: 20px;">
              <label>관심 분야 태그</label>
              <div class="chip-container">
                ${interestChips || '<span style="font-size: 13px; color: var(--color-text-secondary);">등록된 관심 태그가 없습니다.</span>'}
              </div>
              <div class="chip-input-row">
                <input type="text" id="new-interest-input" placeholder="새 관심 분야 입력 (예: 초등 교육, IoT 코딩)">
                <button type="button" class="btn-add-chip" id="btn-add-interest">추가</button>
              </div>
            </div>
          </form>
        </div>
      `;
    } else if (this.activeTab === "projects") {
      if (this.showProjectForm) {
        // 프로젝트 추가/수정 폼 렌더링
        const editingProj = this.editingProjectId
          ? projects.find(p => p.id === this.editingProjectId)
          : null;

        mainContentHtml = `
          <div class="content-card">
            <div class="card-header">
              <div>
                <h2 class="card-title">${editingProj ? "프로젝트 편집" : "새 프로젝트 추가"}</h2>
                <div class="card-subtitle">작업물 카드와 세부 모달 팝업 내용을 채웁니다.</div>
              </div>
            </div>

            <form id="project-form-el">
              <div class="form-group">
                <label>프로젝트 제목 (Title) *</label>
                <input type="text" name="title" value="${editingProj ? editingProj.title : ""}" required placeholder="예: Smart-Pet: 초등 피지컬 코딩 교구 개발">
              </div>

              <div class="form-group">
                <label>한 줄 요약 (Summary) *</label>
                <input type="text" name="summary" value="${editingProj ? editingProj.summary : ""}" required placeholder="예: 조도 센서와 모터를 이용한 아두이노 반려 로봇 교구">
              </div>

              <div class="form-group">
                <label>세부 설명 (Description) *</label>
                <textarea name="description" required placeholder="프로젝트 기획 배경, 적용 기술, 콘텐츠 개요, 학습 목표 등을 자세히 기술하세요.">${editingProj ? editingProj.description : ""}</textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>태그 (쉼표로 구분) *</label>
                  <input type="text" name="tags" value="${editingProj ? editingProj.tags.join(", ") : ""}" required placeholder="아두이노, C/C++, 교구 제작 (콤마로 구분)">
                </div>
                <div class="form-group">
                  <label>대표 이미지 경로 *</label>
                  <input type="text" name="image" value="${editingProj ? editingProj.image : "images/project_placeholder.png"}" required placeholder="images/project_smartpet.png">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>GitHub 코드 링크</label>
                  <input type="text" name="github" value="${editingProj && editingProj.links ? editingProj.links.github : ""}" placeholder="https://github.com/...">
                </div>
                <div class="form-group">
                  <label>라이브 데모 (또는 관련 링크)</label>
                  <input type="text" name="demo" value="${editingProj && editingProj.links ? editingProj.links.demo : ""}" placeholder="https://...">
                </div>
              </div>

              <div class="form-actions">
                <button type="button" class="btn-form-cancel" id="btn-cancel-project">취소</button>
                <button type="submit" class="btn-form-save">프로젝트 저장</button>
              </div>
            </form>
          </div>
        `;
      } else {
        // 프로젝트 리스트 렌더링
        const projectRows = projects.map((proj, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>
              <img src="${proj.image}" class="project-img-preview" alt="썸네일" onerror="this.src='https://placehold.co/60x45?text=Edu'">
            </td>
            <td style="font-weight: 700;">${proj.title}</td>
            <td style="color: var(--color-text-secondary); max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${proj.summary}
            </td>
            <td>
              ${proj.tags.map(t => `<span style="font-size: 11px; background-color: var(--color-bg-main); padding: 3px 8px; border-radius: var(--radius-pill); border: 1px solid var(--color-border); margin-right: 4px;">#${t}</span>`).join("")}
            </td>
            <td>
              <div class="table-actions">
                <button class="btn-action btn-edit" data-id="${proj.id}">수정</button>
                <button class="btn-action btn-delete" data-id="${proj.id}">삭제</button>
              </div>
            </td>
          </tr>
        `).join("");

        mainContentHtml = `
          <div class="content-card">
            <div class="card-header" style="margin-bottom: 20px;">
              <div>
                <h2 class="card-title">프로젝트 포트폴리오 관리</h2>
                <div class="card-subtitle">등록된 에듀테크 콘텐츠 프로젝트 목록을 편집하고 새 항목을 생성합니다.</div>
              </div>
              <button class="btn-add-project" id="btn-new-project">+ 프로젝트 추가</button>
            </div>

            <div class="project-table-container">
              ${projects.length > 0 ? `
                <table class="project-table">
                  <thead>
                    <tr>
                      <th style="width: 50px;">번호</th>
                      <th style="width: 80px;">썸네일</th>
                      <th>프로젝트 제목</th>
                      <th style="width: 250px;">개요</th>
                      <th>태그</th>
                      <th style="width: 130px;">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${projectRows}
                  </tbody>
                </table>
              ` : `
                <div style="text-align: center; padding: 48px 0; color: var(--color-text-secondary);">
                  <div style="font-size: 48px; margin-bottom: 12px;">📁</div>
                  <div>등록된 프로젝트가 없습니다. "+ 프로젝트 추가" 버튼을 눌러보세요.</div>
                </div>
              `}
            </div>
          </div>
        `;
      }
    }

    this.shadowRoot.innerHTML = `
      ${cssStyles}
      
      <!-- 상단 네비게이션 헤더 -->
      <div class="admin-header">
        <div class="admin-logo">
          <span>⚙</span> SEUNG HWA <span>ADMIN</span>
        </div>
        <div class="header-buttons">
          <a href="index.html" class="btn-view-site" target="_blank">
            <span>👁</span> 포트폴리오 바로가기
          </a>
          <button class="btn-logout" id="btn-header-logout">로그아웃</button>
        </div>
      </div>

      <!-- 메인 컨테이너 영역 -->
      <div class="admin-container">
        <!-- 사이드바 제어 패널 -->
        <div class="admin-sidebar">
          <div class="sidebar-card">
            <div class="sidebar-title">콘텐츠 선택</div>
            <button class="tab-btn ${this.activeTab === "profile" ? "active" : ""}" id="tab-profile-btn">
              <span>👤</span> 자기소개 및 프로필
            </button>
            <button class="tab-btn ${this.activeTab === "projects" ? "active" : ""}" id="tab-projects-btn">
              <span>📁</span> 프로젝트 포트폴리오
            </button>
          </div>

          <div class="sidebar-card controls-card">
            <div class="sidebar-title">시스템 제어</div>
            <button class="btn-control btn-save-draft" id="ctrl-save-btn">💾 임시 저장 (미리보기)</button>
            <button class="btn-control btn-download-json" id="ctrl-download-btn">📥 설정 파일 다운로드</button>
            <button class="btn-control btn-reset" id="ctrl-reset-btn">🔄 임시 변경 취소</button>
          </div>
        </div>

        <!-- 메인 콘텐츠 카드 뷰 -->
        <div class="admin-main">
          ${mainContentHtml}
        </div>
      </div>

      <!-- 알림 메시지 토스트 -->
      <div id="toast" class="toast">알림 내용</div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const root = this.shadowRoot;

    // 헤더/사이드 바인딩
    root.getElementById("btn-header-logout").addEventListener("click", () => this.logout());
    root.getElementById("tab-profile-btn").addEventListener("click", () => this.switchTab("profile"));
    root.getElementById("tab-projects-btn").addEventListener("click", () => this.switchTab("projects"));
    
    root.getElementById("ctrl-save-btn").addEventListener("click", () => this.saveDraft());
    root.getElementById("ctrl-download-btn").addEventListener("click", () => this.downloadJSON());
    root.getElementById("ctrl-reset-btn").addEventListener("click", () => this.resetData());

    // 탭별 이벤트 분기
    if (this.activeTab === "profile") {
      // 입력값 업데이트 이벤트 일괄 수집
      const inputs = root.querySelectorAll(".profile-input");
      inputs.forEach(input => {
        input.addEventListener("input", (e) => {
          const field = e.target.dataset.field;
          const idx = e.target.dataset.index;
          if (idx !== undefined) {
            this.updateProfileField(field, e.target.value, parseInt(idx));
          } else {
            this.updateProfileField(field, e.target.value);
          }
        });
      });

      // 기술 추가 버튼
      root.getElementById("btn-add-skill").addEventListener("click", () => {
        const input = root.getElementById("new-skill-input");
        this.addSkill(input.value);
        input.value = "";
      });
      // 엔터키 추가 대응
      root.getElementById("new-skill-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.addSkill(e.target.value);
          e.target.value = "";
        }
      });

      // 관심 추가 버튼
      root.getElementById("btn-add-interest").addEventListener("click", () => {
        const input = root.getElementById("new-interest-input");
        this.addInterest(input.value);
        input.value = "";
      });
      root.getElementById("new-interest-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          this.addInterest(e.target.value);
          e.target.value = "";
        }
      });

      // 태그 삭제 이벤트 위임
      root.querySelectorAll(".chip-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const skill = e.target.dataset.skill;
          const interest = e.target.dataset.interest;
          if (skill) this.removeSkill(skill);
          if (interest) this.removeInterest(interest);
        });
      });

    } else if (this.activeTab === "projects") {
      if (this.showProjectForm) {
        // 취소 단추
        root.getElementById("btn-cancel-project").addEventListener("click", () => {
          this.showProjectForm = false;
          this.editingProjectId = null;
          this.render();
        });
        
        // 전송 이벤트 바인딩
        root.getElementById("project-form-el").addEventListener("submit", (e) => this.saveProject(e));
      } else {
        // 신규 프로젝트 단추
        root.getElementById("btn-new-project").addEventListener("click", () => this.openProjectForm());

        // 목록 수정/삭제
        root.querySelectorAll(".btn-edit").forEach(btn => {
          btn.addEventListener("click", (e) => this.openProjectForm(e.target.dataset.id));
        });

        root.querySelectorAll(".btn-delete").forEach(btn => {
          btn.addEventListener("click", (e) => this.deleteProject(e.target.dataset.id));
        });
      }
    }
  }
}

// 브라우저 커스텀 엘리먼트 정의
customElements.define("edu-admin-panel", EduAdminPanel);
export default EduAdminPanel;
