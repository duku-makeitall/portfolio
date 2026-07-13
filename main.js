/**
 * 이승화의 에듀테크 포트폴리오 - 메인 애플리케이션 진입점 및 컨트롤러 스크립트
 */

// 1. 필요한 웹 컴포넌트 모듈들을 가져옵니다.
import "./components/EduHeader.js";
import "./components/EduHero.js";
import "./components/EduProjectCard.js";
import "./components/EduProjectModal.js";
import "./components/EduContact.js";
import "./components/EduContactForm.js";
import { supabase } from "./supabase.js";

document.addEventListener("DOMContentLoaded", () => {
  // 2. 초기 렌더링에 필요한 컴포넌트 노드들을 참조합니다.
  const heroSection = document.getElementById("hero-section");
  const contactSection = document.getElementById("contact-section");
  const projectsGridContainer = document.getElementById("projects-grid-container");
  const projectDetailModal = document.getElementById("project-detail-modal");

  const renderPortfolio = (data) => {
    // 4. 데이터를 각각의 컴포넌트에 주입하여 화면을 갱신합니다.
    
    // 프로필 및 자기소개 데이터 바인딩
    if (heroSection && data.profile) {
      heroSection.profileData = data.profile;
    }

    // 연락처 및 소셜 데이터 바인딩
    if (contactSection && data.profile) {
      contactSection.contactData = {
        email: data.profile.email,
        github: data.profile.github,
        blog: data.profile.blog
      };
    }

    // 5. 프로젝트 목록 데이터를 순회하며 개별 카드를 동적으로 렌더링합니다.
    if (projectsGridContainer && data.projects) {
      projectsGridContainer.innerHTML = ""; // 기존 프레임워크 리셋 방지용 클리어
      
      data.projects.forEach(project => {
        // 커스텀 엘리먼트 <edu-project-card>를 생성합니다.
        const projectCard = document.createElement("edu-project-card");
        // 생성한 카드에 프로젝트 데이터를 프로퍼티로 주입합니다.
        projectCard.projectData = project;
        // 그리드 영역에 마운트합니다.
        projectsGridContainer.appendChild(projectCard);
      });
    }
  };

  const loadPortfolioData = async () => {
    let profileData = null;
    let projectsData = [];
    
    // 백업 JSON 읽기 함수
    let jsonBackup = null;
    const fetchBackupJson = async () => {
      if (jsonBackup) return jsonBackup;
      try {
        const res = await fetch("./profile-data.json");
        if (res.ok) {
          jsonBackup = await res.json();
          return jsonBackup;
        }
      } catch (e) {
        console.error("백업 JSON 파일 로드 실패", e);
      }
      return null;
    };

    // 1) Supabase 프로필 데이터 로드
    try {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", "seunghwa")
        .single();

      if (error) throw error;
      
      if (data) {
        console.log("Supabase에서 프로필 데이터를 로드했습니다.");
        profileData = {
          name: data.name,
          title: data.title,
          description: data.description,
          skills: data.skills || [],
          email: data.email,
          github: data.github,
          blog: data.blog || "",
          aboutCard: {
            bullets: data.bullets || [],
            interests: data.interests || []
          }
        };
      }
    } catch (e) {
      console.warn("Supabase 프로필 로드 실패, 로컬 스토리지 또는 JSON 백업을 확인합니다.", e);
      // 로컬 스토리지 감지
      const localDraft = localStorage.getItem("portfolio_draft_data");
      if (localDraft) {
        try {
          const draft = JSON.parse(localDraft);
          profileData = draft.profile;
        } catch (errLocal) {
          console.error(errLocal);
        }
      }
      if (!profileData) {
        const backup = await fetchBackupJson();
        if (backup) {
          profileData = backup.profile;
        }
      }
    }

    // 2) Supabase 프로젝트 데이터 로드
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        console.log("Supabase에서 프로젝트 목록을 불러왔습니다.");
        projectsData = data.map(dbProj => ({
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
      } else {
        // 테이블은 존재하나 데이터가 비어있는 경우 백업 JSON 로드
        console.log("Supabase 프로젝트 테이블이 비어있어 백업 데이터를 로드합니다.");
        const backup = await fetchBackupJson();
        if (backup) {
          projectsData = backup.projects;
        }
      }
    } catch (e) {
      console.warn("Supabase 프로젝트 로드 실패(또는 테이블 없음), 백업 데이터를 로드합니다.", e);
      const backup = await fetchBackupJson();
      if (backup) {
        projectsData = backup.projects;
      }
    }
    
    // 3) 화면에 렌더링
    renderPortfolio({ profile: profileData, projects: projectsData });
  };

  // 데이터 로드 실행
  loadPortfolioData();

  // 6. 이벤트 버블링(Composed Custom Event)을 활용해 프로젝트 카드 클릭 이벤트를 일괄 감지합니다.
  // 개별 카드 컴포넌트(EduProjectCard)에서 'project-select'라는 커스텀 이벤트를 발행하면 여기서 수신합니다.
  document.addEventListener("project-select", (event) => {
    const selectedProjectData = event.detail;
    
    if (projectDetailModal && selectedProjectData) {
      // 상세정보 모달 컴포넌의 open() 메서드를 호출하여 모달을 띄웁니다.
      projectDetailModal.open(selectedProjectData);
    }
  });

  // 7. IntersectionObserver를 이용한 스크롤 페이드인(Scroll Reveal) 제어 로직
  const revealElements = document.querySelectorAll(".reveal-section");
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 요소가 화면에 나타나면 visible 클래스를 추가합니다.
        entry.target.classList.add("visible");
        // 한 번 표시된 섹션은 더 이상 감시하지 않습니다. (애니메이션 반복 방지)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15 // 요소가 15% 정도 보일 때 애니메이션 실행
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
});
