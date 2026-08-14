# English Master

고양이와 함께 학습하는 모바일/PWA 글로벌 비즈니스 영어 앱입니다. Day 1부터 시작하며 매일 문장 2개와 단어 5개를 제공합니다. 매 5일째는 복습 Day입니다.

## 자동 콘텐츠 생성

`Generate daily learning content` GitHub Actions가 한국 시간 매일 00:15에 실행되어 `generated-content.json`에 다음 Day를 추가합니다. 정적 GitHub Pages에서도 이 JSON을 불러오므로 별도 서버는 필요하지 않습니다.

저장소의 **Settings → Secrets and variables → Actions**에서 `OPENAI_API_KEY` repository secret을 한 번 등록해야 합니다. 필요하면 workflow의 `OPENAI_MODEL`을 Structured Outputs를 지원하는 다른 모델로 변경할 수 있습니다. 생성 실패 시 파일을 변경하거나 커밋하지 않으며, 앱은 브라우저에 캐시한 마지막 생성 콘텐츠 또는 기본 30일 콘텐츠를 계속 사용합니다.

처음 설정한 뒤 Actions 탭에서 workflow를 한 번 수동 실행하면 Day 31이 생성됩니다. 이후에는 스케줄에 따라 하루에 한 Day씩 추가됩니다.

## 로컬 확인

정적 파일 서버로 이 폴더를 열어 확인하세요. 예: `npx serve .` 또는 `python -m http.server 8080`. `file://`로 직접 열면 브라우저의 JSON fetch 및 서비스 워커 제한 때문에 자동 콘텐츠 로드가 동작하지 않을 수 있습니다.

학습 완료, 문장 즐겨찾기, 단어 즐겨찾기와 개인 시작일은 기존 `gbme365-auto-v4` localStorage 레코드에 저장됩니다.
