# UNIRO, 함께 만들어가는 휠체어 배리어프리 길찾기

![Cover](https://github.com/user-attachments/assets/8e716aaf-1ded-4fd3-a5fe-c1c748586084)

# 📌 목차

1. [서비스 소개](#-서비스-소개)
2. [팀원 소개](#-팀원-소개)
3. [협업 방식](#-협업-방식)
4. [프론트엔드](#-프론트엔드)
5. [백엔드](#-백엔드)

---

# 🚀 서비스 소개

- 캠퍼스 내 이동이 더 이상 불편하지 않도록!
- 휠체어를 사용하는 대학생이 보다 안전하고 편리하게 캠퍼스를 이동할 수 있도록 돕는 길찾기 서비스입니다.
- 정보 기술을 활용하여 이동 과정에서의 물리적·정보적 장벽을 해소하고, 모두가 함께하는 포용적인 캠퍼스 환경을 만들어갑니다.

# 👥 팀원 소개

## FE 팀

<div align="center">
	<table>
	<th><a href="https://github.com/thdgustjd1"> 박준혁 </th>
    <th><a href="https://github.com/dgfh0450"> 윤동현 </th>
    <tr>
	<td style="text-align: center;"><img width="100" alt="박준혁" src="https://avatars.githubusercontent.com/u/45231740?v=4"></td>
        <td style="text-align: center;"><img width="100" alt="윤동현" src="https://avatars.githubusercontent.com/u/114418121?v=4"></td>
	</tr>
<th> FE </th>
<th> FE </th>
<tr>
    <td>
    - 길찾기 결과 페이지 구현 및 최적화 진행 <br>
    - Suspense로 로딩 자동화 <br>
    - Post 요청 안정화를 위한 debounce 구현 <br>
    - FCP 감소 및 정적 리소스 축소를 위한 클라이언트/인프라 대책 마련 <br>
    </td>
    <td>
    - 메인 / 불편한 길 / 새로운 길 지도 페이지 제작 <br>
    - API 에러 핸들 로직 구현 <br>
    - 길 선택 알고리즘 + 새로운 길 생성 알고리즘 구현 <br>
    - 캐싱과 알고리즘을 통한 지도 페이지 최적화 진행 <br>
    </td>
</tr>
	</table>
</div>

<br>

## BE 팀

<div align="center">
	<table>
	<th><a href="https://github.com/thdgustjd1"> 👑 송현성 </th>
    <th><a href="https://github.com/mikekks"> 송민규 </th>
    <tr>
	<td style="text-align: center;"><img width="100" alt="송현성" src="https://avatars.githubusercontent.com/u/129783824?v=4"></td>
        <td style="text-align: center;"><img width="100" alt="송민규" src="https://avatars.githubusercontent.com/u/100754581?v=4"></td>
	</tr>
<th> BE, 팀장 </th>
<th> BE </th>
<tr>
    <td>
    - OOM 문제를 Jpa Stream API + SSE로 데이터를 분할 처리하여 해결 <br>
    - 길찾기 알고리즘(A* 알고리즘) 개발 및 개선<br>
    - Hibernate envers를 활용한 DB버전화 & 특정 버전 조회 로직 구현<br>
    - Google Map Elevation API 연동 및 이벤트 기반 비동기 배치 처리 구현
    </td>
    <td>
    - Redis 및 FastJson을 활용한 조회속도 1,500 ms -> 160ms 개선  <br>
    - Dockerizing 및 blue-green 무중단 배포 자동화 인프라 구축 <br>
    - R-tree를 활용한 길 추가 로직 개발, 10,000 ms -> 200ms 개선 <br>
    - 테스트 컨테이너 구축<br>
    - 어드민 로그인 구현 <br>
    </td>
</tr>
	</table>
</div>

<br>

# 🤝 협업 방식

## 스프린트 단위 개발

- 저희 팀에서는 일주일 단위의 스프린트를 가지고 개발하고 있습니다. 해당 방식을 통해 아래와 같은 장점을 갖게 되었습니다.

1. 빠른 피드백과 개선
2. 유연성 있는 요구사항 변경
3. 개발 리스크 감소

### 릴리즈 노트

- 각 스프린트의 개발 내용을 아카이빙 하기 위해 릴리즈 노트를 만들어 관리했습니다.

| 릴리즈 버전 | 진행기간       | 릴리즈 노트                                                                        | 릴리즈 PR                                                    |
| ----------- | -------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| v1.0.0      | 1주차 스프린트 | [1주차 릴리즈 노트](https://github.com/softeer5th/Team2-Getit/releases/tag/v1.0.0) | [v1.0.0](https://github.com/softeer5th/Team2-Getit/pull/27)  |
| v1.1.0      | 2주차 스프린트 | [2주차 릴리즈 노트](https://github.com/softeer5th/Team2-Getit/releases/tag/v1.1.0) | [v1.1.0](https://github.com/softeer5th/Team2-Getit/pull/76)  |
| v1.2.0      | 3주차 스프린트 | [3주차 릴리즈 노트](https://github.com/softeer5th/Team2-Getit/releases/tag/v1.2.0) | [v1.2.0](https://github.com/softeer5th/Team2-Getit/pull/141) |
| v1.3.0      | 4주차 스프린트 | [4주차 릴리즈 노트](https://github.com/softeer5th/Team2-Getit/releases/tag/v1.3.0) | [v1.3.0]()                                                   |

## Jira를 이용한 프로젝트 관리

### 스프린트 1
<img width="1105" alt="스크린샷 2025-02-24 오후 11 25 51" src="https://github.com/user-attachments/assets/a572939b-3f77-438e-a13b-84e4c62c716e" />

### 스프린트 2
<img width="1102" alt="스크린샷 2025-02-24 오후 11 27 52" src="https://github.com/user-attachments/assets/c2937906-42d2-4842-982a-d60fd3724196" />

### 스프린트 3
<img width="1117" alt="스크린샷 2025-02-24 오후 11 26 35" src="https://github.com/user-attachments/assets/165ab359-0c85-47d6-b3bf-9244ab9d9eea" />

### 스프린트 4
<img width="1107" alt="스크린샷 2025-02-24 오후 11 26 58" src="https://github.com/user-attachments/assets/17ea6527-3735-4042-9049-f8a0cf832c37" />


## 배포 방식

- 각 주차마다 각 파트 브랜치에서 작업하며 금요일마다 Main 브랜치에 merge 합니다.
  <img width="547" alt="스크린샷 2025-02-15 오후 10 51 41" src="https://github.com/user-attachments/assets/9b7d0505-6288-43e4-88cb-cd09e45592ba" />

## 🙌 그라운드 룰

### 📞 일정 및 연락

1. 일정 변동 등 공유 사항은 카카오톡으로 전달해주세요.
2. 연휴 및 주말에는 확인 즉시 응답만 주시면 됩니다. 해결은 이후에 진행해도 괜찮아요.
3. 개인 일정이 생길 경우, 가능하면 전날까지 알려주세요. 카톡으로 간단히 공유해도 괜찮아요.
   1. 윤동현: 매주 목요일 19:00 퇴근
   2. 박준혁: 매주 화요일 19:00 퇴근
   3. 송민규: 매주 목요일 19:00 퇴근
4. 카톡이나 슬랙으로 먼저 연락하고, 응답이 없을 경우 대면으로 이야기해요. (센터에서 진행)
5. 상대방이 에어팟을 끼고 있어도 괜찮아요 :)

### 🗣️ 업무 및 회의

1. 매일 오전 10:30에 스크럼으로 하루를 시작해요. (수업 이후)
2. 문서 작성 및 구체적인 계획 서술 필수에요.
3. 연휴 기간 동안 매일 오전 11:00에 온라인 데일리 및 모각코를 진행해요.
4. 회의록 작성은 돌아가면서 진행해요.

### 👥 작업 및 피드백

1. 모든 머지는 반드시 1명의 승인을 받아야 가능해요.
2. 피드백은 건전하고 건강하게 주고받아요. 근데 이제 따뜻함을 잊지 말아주세요.


---

# 🎨 프론트엔드

프론트엔드에서 구현한 기능과 기술 스택을 정리합니다.

- **사용 기술**: React, TypeScript, Zustand, TanStack-Query, Tailwind CSS, Frame

## 디렉토리 구성

```bash
├── src
    ├── api (API 통신 함수)
        ├── transformer  (API 통신 변환기)
        ├── type (API 통신 타입 선언)
            ├── request
            ├── response
    ├── assets
    ├── components (페이지 별 컴포넌트)
    ├── constant (상수, Enum
    ├── hooks (커스텀 훅)
    ├── map (지도 세팅)
    ├── pages (페이지 컴포넌트)
    ├── types (타입)
    └── utils (기타 함수)
```


## FrontEnd 배포 과정
![Deploy](https://github.com/user-attachments/assets/4d87f404-d92f-4af4-803c-be8e5b30d1cd)

### Github Action Flow
1. Multi Stage Build
2. GCR Push -> VM Pull
3. Deploy New Container

---

# 🛠 백엔드

백엔드에서 구현한 기능과 기술 스택을 정리합니다.

- **사용 기술**: Java, Spring Boot, JPA, MySQL, Redis, Hibernate envers, FastJson, Querydsl

## 아키텍처
![uniro drawio](https://github.com/user-attachments/assets/803df1bc-a077-47c1-b941-32d6d5a70fa5)

## ERD
<img width="690" alt="스크린샷 2025-02-24 오후 12 27 19" src="https://github.com/user-attachments/assets/414c313c-9a6d-485c-973b-4afab34366b4" />


---

