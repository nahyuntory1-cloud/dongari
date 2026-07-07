# 9기 미래인재성장과정 동아리 사이트

미술 / 체육 / 음악 3개 동아리 페이지. 각 페이지에 가입신청서 버튼(모달)과 안내사항 게시판이 있습니다.
여러 사람이 각자 다른 기기에서 접속해도 같은 게시판·신청서를 보도록 **Firebase Firestore**(무료 클라우드 데이터베이스)를 사용합니다.

## 파일 구성

```
index.html          홈 (동아리 3개 카드)
art.html             미술 동아리
pe.html              체육 동아리
music.html           음악 동아리
css/style.css        공통 스타일
js/firebase-config.js   Firebase 연결 정보 (직접 채워야 함)
js/app.js            신청서 제출 / 게시판 CRUD 로직
```

## 1. Firebase 설정 (10분)

1. [console.firebase.google.com](https://console.firebase.google.com) 접속 → 구글 계정으로 로그인 → "프로젝트 추가"로 새 프로젝트 생성 (무료 Spark 요금제로 충분).
2. 왼쪽 메뉴 **빌드 > Firestore Database** → "데이터베이스 만들기" → 위치 선택 (asia-northeast3 서울 추천) → **테스트 모드**로 시작.
3. 왼쪽 위 톱니바퀴 **프로젝트 설정 > 일반** 탭 맨 아래 "내 앱"에서 **</> (웹)** 아이콘 클릭 → 앱 닉네임 입력 → 등록.
4. 화면에 나오는 `firebaseConfig = {...}` 값을 통째로 복사해서 `js/firebase-config.js` 안의 `firebaseConfig` 객체에 붙여넣기.
5. 같은 파일의 `ADMIN_PASSWORD` 값을 원하는 비밀번호로 변경 (게시글 삭제용, 운영진끼리만 공유).

## 2. Firestore 보안 규칙 설정

Firestore Database > **규칙(Rules)** 탭에서 아래로 교체 후 게시(Publish):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 안내사항 게시판: 누구나 읽기/쓰기 가능 (삭제는 앱에서 비밀번호로만 1차 확인)
    match /boardPosts/{postId} {
      allow read: if true;
      allow create: if true;
      allow delete: if true;
      allow update: if false;
    }

    // 가입신청서: 제출만 가능, 조회는 콘솔에서 운영진만
    match /applications/{appId} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

> 참고: 비밀번호로 삭제를 막는 건 완전한 보안이 아니라 "실수로 지우는 것 방지" 수준입니다. 학교 동아리 소개 사이트라면 이 정도로 충분합니다.

처음 게시판을 열었을 때 콘솔 에러 메시지에 "색인을 만드세요"라는 링크가 뜨면, 그 링크를 눌러 색인(index)을 한 번 생성해주세요. (자동으로 안내됨)

## 3. 온라인에 올리기 (배포)

파일이 전부 정적 파일(HTML/CSS/JS)이라 어떤 정적 호스팅에 올려도 됩니다. 가장 쉬운 방법 2가지:

**A. GitHub Pages (무료, 추천)**
1. GitHub에 새 저장소 생성 후 이 폴더의 파일 전체를 업로드(또는 `git push`).
2. 저장소 Settings > Pages > Branch를 `main`으로 설정 → 저장.
3. 몇 분 후 `https://아이디.github.io/저장소이름/` 주소로 접속 가능.

**B. Firebase Hosting**
1. 컴퓨터에 Node.js 설치 후 터미널에서:
   ```
   npm install -g firebase-tools
   firebase login
   firebase init hosting   (이 폴더에서 실행, public 디렉터리는 현재 폴더로 지정)
   firebase deploy
   ```
2. 배포 완료 후 나오는 `https://프로젝트이름.web.app` 주소로 접속.

## 4. 가입신청서 확인 방법

Firebase 콘솔 > Firestore Database > `applications` 컬렉션에서 실시간으로 확인 가능합니다.
신청자가 많아지면 콘솔에서 "내보내기" 기능이나, 필요 시 스프레드시트로 자동 연동하는 기능도 추가로 만들 수 있어요 (원하시면 말씀해주세요).

## 자주 묻는 것

- **게시판 글은 어디에 저장되나요?** → Firestore의 `boardPosts` 컬렉션에 실시간 저장됩니다. 새로고침해도, 다른 사람 기기에서 봐도 동일하게 보입니다.
- **비용이 드나요?** → 소규모 동아리 사이트 트래픽이면 Firebase 무료 요금제(Spark)로 충분합니다.
- **글 삭제는 어떻게 하나요?** → 각 글의 "삭제" 버튼 클릭 후, 작성 시 입력한 비밀번호 또는 관리자 비밀번호(ADMIN_PASSWORD)를 입력하면 삭제됩니다.
