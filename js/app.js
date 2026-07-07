// 이 스크립트는 art.html / pe.html / music.html 에서 공통으로 사용됩니다.
// 각 페이지의 <body data-club="art|pe|music"> 값으로 어떤 동아리인지 구분합니다.

const club = document.body.dataset.club;

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

/* ===== 모달 공통 열기/닫기 ===== */
document.querySelectorAll("[data-open-modal]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById(btn.dataset.openModal).classList.add("open");
  });
});

document.querySelectorAll("[data-close-modal]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById(btn.dataset.closeModal).classList.remove("open");
  });
});

document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
});

/* ===== 가입신청서: 주소 콤보박스(시/도 - 시군구) 연동 ===== */
const applySido = document.getElementById("apply-sido");
const applySigungu = document.getElementById("apply-sigungu");
initRegionSelects(applySido, applySigungu);

/* ===== 가입신청서 제출 ===== */
const applyForm = document.getElementById("apply-form");

if (applyForm) {
  applyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!applySido.value || !applySigungu.value) {
      alert("주소(시/도, 시/군/구)를 선택해주세요.");
      return;
    }

    const submitBtn = applyForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "제출 중...";

    try {
      await db.collection("applications").add({
        club,
        name: applyForm.name.value.trim(),
        sido: applySido.value,
        sigungu: applySigungu.value,
        contact: applyForm.contact.value.trim(),
        reason: applyForm.reason.value.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      alert("가입신청이 완료되었습니다! 확인 후 연락드릴게요.");
      applyForm.reset();
      applySido.dispatchEvent(new Event("change"));
      document.getElementById("apply-modal").classList.remove("open");
    } catch (err) {
      alert("제출 중 오류가 발생했습니다: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "제출하기";
    }
  });
}

/* ===== 게시판: 글쓰기 ===== */
const postForm = document.getElementById("post-form");
const boardList = document.getElementById("board-list");

if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = postForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "등록 중...";

    try {
      await db.collection("boardPosts").add({
        club,
        title: postForm.title.value.trim(),
        author: postForm.author.value.trim() || "운영진",
        content: postForm.content.value.trim(),
        password: postForm.password.value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      postForm.reset();
      document.getElementById("post-modal").classList.remove("open");
    } catch (err) {
      alert("등록 중 오류가 발생했습니다: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "등록하기";
    }
  });
}

/* ===== 게시판: 목록 실시간 조회 ===== */
function renderPost(doc) {
  const p = doc.data();
  const date = p.createdAt
    ? p.createdAt.toDate().toLocaleString("ko-KR")
    : "등록 중...";

  const div = document.createElement("div");
  div.className = "post-card";
  div.innerHTML = `
    <div class="post-header">
      <h3>${escapeHtml(p.title)}</h3>
      <button class="delete-btn" type="button">삭제</button>
    </div>
    <p class="post-meta">${escapeHtml(p.author)} · ${date}</p>
    <p class="post-content">${escapeHtml(p.content)}</p>
  `;

  div.querySelector(".delete-btn").addEventListener("click", () =>
    deletePost(doc.id, p.password)
  );

  return div;
}

async function deletePost(id, correctPassword) {
  const input = prompt("삭제하려면 글 작성 시 입력한 비밀번호(또는 관리자 비밀번호)를 입력하세요.");
  if (input === null) return;

  if (input === correctPassword || input === ADMIN_PASSWORD) {
    try {
      await db.collection("boardPosts").doc(id).delete();
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다: " + err.message);
    }
  } else {
    alert("비밀번호가 일치하지 않습니다.");
  }
}

if (boardList) {
  db.collection("boardPosts")
    .where("club", "==", club)
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        boardList.innerHTML = "";
        if (snapshot.empty) {
          boardList.innerHTML = '<p class="empty">아직 등록된 안내사항이 없습니다.</p>';
          return;
        }
        snapshot.forEach((doc) => boardList.appendChild(renderPost(doc)));
      },
      (err) => {
        boardList.innerHTML = `<p class="empty">게시판을 불러오지 못했습니다.<br>(${escapeHtml(err.message)})<br>firebase-config.js 설정을 확인해주세요.</p>`;
      }
    );
}
