/*
  ===== 설정 방법 (README.md 참고) =====
  1. https://console.firebase.google.com 에서 새 프로젝트를 만듭니다.
  2. 왼쪽 메뉴 [빌드 > Firestore Database] 에서 데이터베이스를 만듭니다.
  3. 프로젝트 설정(톱니바퀴) > 일반 > "내 앱" > 웹 앱(</>) 추가 후
     아래 firebaseConfig 값을 발급받은 값으로 통째로 교체하세요.
  4. ADMIN_PASSWORD 는 게시글을 관리자 권한으로 삭제할 때 쓰는 비밀번호입니다.
     원하는 값으로 바꿔서 사용하세요 (동아리 운영진만 공유).
*/

const firebaseConfig = {
  apiKey: "AIzaSyBJp0tIwiUoHs39g4SQFB7pLEmPczV6V8c",
  authDomain: "nahyeon-498ab.firebaseapp.com",
  projectId: "nahyeon-498ab",
  storageBucket: "nahyeon-498ab.firebasestorage.app",
  messagingSenderId: "659785653300",
  appId: "1:659785653300:web:87a08200140e51e98a3e61"
};

// 게시글 삭제용 관리자 비밀번호 (원하는 값으로 변경하세요)
const ADMIN_PASSWORD = "club9admin";

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
