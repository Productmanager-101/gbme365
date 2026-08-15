# English Master

고양이와 함께 학습하는 모바일/PWA 글로벌 비즈니스 영어 앱입니다. Day 1부터 시작하며 매일 문장 2개와 단어 5개를 제공합니다. 매 5일째는 복습 Day입니다.

## 자동 콘텐츠 생성

`Generate daily learning content` GitHub Actions가 한국 시간 매일 00:15에 실행되어 `generated-content.json`에 다음 Day를 추가합니다. 정적 GitHub Pages에서도 이 JSON을 불러오므로 별도 서버는 필요하지 않습니다.

저장소의 **Settings → Secrets and variables → Actions**에서 `OPENAI_API_KEY` repository secret을 한 번 등록해야 합니다. 필요하면 workflow의 `OPENAI_MODEL`을 Structured Outputs를 지원하는 다른 모델로 변경할 수 있습니다. 생성 실패 시 파일을 변경하거나 커밋하지 않으며, 앱은 브라우저에 캐시한 마지막 생성 콘텐츠 또는 기본 30일 콘텐츠를 계속 사용합니다.

처음 설정한 뒤 Actions 탭에서 workflow를 한 번 수동 실행하면 Day 31이 생성됩니다. 이후에는 스케줄에 따라 하루에 한 Day씩 추가됩니다.

## 로컬 확인

정적 파일 서버로 이 폴더를 열어 확인하세요. 예: `npx serve .` 또는 `python -m http.server 8080`. `file://`로 직접 열면 브라우저의 JSON fetch 및 서비스 워커 제한 때문에 자동 콘텐츠 로드가 동작하지 않을 수 있습니다.

학습 완료, 문장 즐겨찾기, 단어 즐겨찾기와 개인 시작일은 기존 `gbme365-auto-v4` localStorage 레코드에 저장됩니다.

## Web Push 알림

홈 화면에 설치한 앱에서 **알림 받기**를 누르면 Firebase Anonymous Authentication UID 아래에 기기별 FCM 토큰이 저장됩니다. 기존 localStorage 학습 기록은 그대로 유지되며, 오늘의 핵심 문장 2개 완료 여부만 Firestore에 추가 동기화됩니다.

`Send learning push notifications` workflow는 08:00/22:00(Asia/Seoul)에 실행됩니다. 저장소에는 `FIREBASE_SERVICE_ACCOUNT` Actions secret이 필요합니다. 서비스 계정 JSON이나 private key는 파일로 저장하지 않습니다.

`firestore.rules`는 production 규칙 원본입니다. 이 저장소에는 Firebase Hosting/CLI 자동 배포 설정이 없으므로 Firebase Console의 **Firestore Database → Rules**에서 이 파일 내용을 게시해야 합니다. GitHub Pages 도메인이 Firebase Authentication의 승인된 도메인에 없다면 **Authentication → Settings → Authorized domains**에도 추가합니다.
