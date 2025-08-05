# CLAUDE.md

> **Claude Code 프로젝트를 위한 클린코드 & 프론트엔드 개발 가이드**
>
> 이 문서는 Toss Frontend Fundamental과 클린코드 & 리팩토링 강의 자료를 바탕으로 작성되었습니다.

## 🎯 목적

이 가이드는 다음을 위해 작성되었습니다:

- 읽기 쉽고 이해하기 쉬운 코드 작성
- 팀원 간 일관성 있는 코드 스타일 유지
- 유지보수성과 확장성을 고려한 개발

---

## 📖 가독성 (Readability)

### 🔢 매직 넘버에 이름 붙이기

**규칙:** 매직 넘버를 명명된 상수로 교체하여 명확성을 높입니다.

```typescript
// ❌ 나쁜 예
async function onLikeClick() {
  await postLike(url);
  await delay(300); // 300이 무엇을 의미하는지 불분명
  await refetchPostLike();
}

// ✅ 좋은 예
const ANIMATION_DELAY_MS = 300;

async function onLikeClick() {
  await postLike(url);
  await delay(ANIMATION_DELAY_MS); // 애니메이션 대기 시간임을 명확히 표시
  await refetchPostLike();
}
```

### 🎭 구현 세부사항 추상화

**규칙:** 복잡한 로직이나 상호작용을 전용 컴포넌트나 HOC로 추상화합니다.

```tsx
// ✅ Auth Guard 패턴
function App() {
  return (
    <AuthGuard>
      <LoginStartPage />
    </AuthGuard>
  );
}

function AuthGuard({ children }) {
  const status = useCheckLoginStatus();
  useEffect(() => {
    if (status === "LOGGED_IN") {
      location.href = "/home";
    }
  }, [status]);

  return status !== "LOGGED_IN" ? children : null;
}
```

### 🚦 조건부 렌더링 코드 경로 분리

**규칙:** 크게 다른 조건부 UI/로직을 별개의 컴포넌트로 분리합니다.

```tsx
// ✅ 역할별 컴포넌트 분리
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />;
}

function ViewerSubmitButton() {
  return <TextButton disabled>Submit</TextButton>;
}

function AdminSubmitButton() {
  useEffect(() => {
    showAnimation();
  }, []);

  return <Button type="submit">Submit</Button>;
}
```

### 🧠 복잡한 조건에 이름 부여

**규칙:** 복잡한 불린 조건을 명명된 변수에 할당합니다.

```typescript
const matchedProducts = products.filter((product) => {
  // 조건의 의미를 명확하게 표현
  const isSameCategory = product.categories.some((category) => category.id === targetCategory.id);

  const isPriceInRange = product.prices.some((price) => price >= minPrice && price <= maxPrice);

  return isSameCategory && isPriceInRange;
});
```

---

## 🔮 예측 가능성 (Predictability)

### 📊 반환 타입 표준화

**규칙:** 유사한 함수/훅에 대해 일관된 반환 타입을 사용합니다.

```typescript
// ✅ API 훅 표준화
function useUser(): UseQueryResult<UserType, Error> {
  const query = useQuery({ queryKey: ["user"], queryFn: fetchUser });
  return query;
}

function useServerTime(): UseQueryResult<Date, Error> {
  const query = useQuery({
    queryKey: ["serverTime"],
    queryFn: fetchServerTime
  });
  return query;
}

// ✅ 검증 함수 표준화
type ValidationResult = { ok: true } | { ok: false; reason: string };

function checkIsNameValid(name: string): ValidationResult {
  if (name.length === 0) return { ok: false, reason: "Name cannot be empty." };
  if (name.length >= 20) return { ok: false, reason: "Name cannot be longer than 20 characters." };
  return { ok: true };
}
```

### 🎯 단일 책임 원칙

**규칙:** 함수는 시그니처에서 암시하는 작업만 수행해야 합니다.

```typescript
// ✅ 순수한 기능 분리
async function fetchBalance(): Promise<number> {
  const balance = await http.get<number>("...");
  return balance;
}

async function handleUpdateClick() {
  const balance = await fetchBalance(); // 가져오기
  logging.log("balance_fetched"); // 로깅 (명시적 작업)
  await syncBalance(balance); // 동기화
}
```

---

## 🧩 응집성 (Cohesion)

### 📝 폼 응집성 고려

**규칙:** 폼 요구사항에 따라 필드 레벨 또는 폼 레벨 응집성을 선택합니다.

```tsx
// 필드 레벨 응집성 예시
export function Form() {
  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <input
          {...register("name", {
            validate: (value) => (value.trim() === "" ? "Please enter your name." : true)
          })}
          placeholder="Name"
        />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
    </form>
  );
}
```

### 🏗️ 기능/도메인별 코드 구성

**규칙:** 코드 타입별이 아닌 기능/도메인별로 디렉토리를 구성합니다.

```
src/
├── domains/                  # 도메인(엔티티) 중심 구조
│   ├── cart/
│   │   ├── components/       # CartItem, CartSummary 등 도메인 UI
│   │   ├── hooks/            # useCart, useCartTotal 등 상태/로직
│   │   ├── models/           # 타입, 인터페이스, 엔티티 클래스
│   │   ├── utils/            # calculateCartTotal 등 cart 관련 로직
│   │   ├── services/         # API 호출, 비즈니스 로직 분리 시
│   │   └── index.ts          # 필요한 것만 export
│   ├── product/
│   └── coupon/
├── shared/                   # 재사용 가능한 범용 코드
│   ├── components/           # Button, Notification 등
│   ├── hooks/                # useLocalStorage 등
│   ├── utils/                # formatters 등
│   ├── constants/            # 고정값, Enum 등
│   ├── types/                # 범용 타입들
│   └── styles/               # 공통 스타일, 테마
├── App.tsx
└── main.tsx                  # 앱 진입점
```

---

## 🔗 결합도 (Coupling)

### ⚖️ 추상화와 결합도의 균형

**규칙:** 사용 사례가 분기될 가능성이 있다면 성급한 추상화를 피하고 낮은 결합도를 선호합니다.

### 🎯 상태 관리 범위 지정

**규칙:** 광범위한 상태 관리를 더 작고 집중된 훅/컨텍스트로 분할합니다.

```typescript
// ✅ 집중된 훅 (낮은 결합도)
export function useCardIdQueryParam() {
  const [cardIdParam, setCardIdParam] = useQueryParam("cardId", NumberParam);

  const setCardId = useCallback(
    (newCardId: number | undefined) => {
      setCardIdParam(newCardId, "replaceIn");
    },
    [setCardIdParam]
  );

  return [cardIdParam ?? undefined, setCardId] as const;
}
```

### 🏗️ 컴포지션으로 Props Drilling 제거

**규칙:** Props Drilling 대신 컴포넌트 컴포지션을 사용합니다.

```tsx
function ItemEditModal({ open, items, recommendedItems, onConfirm, onClose }) {
  const [keyword, setKeyword] = useState("");

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search items..."
        />
        <Button onClick={onClose}>Close</Button>
      </div>
      <ItemEditList
        keyword={keyword}
        items={items}
        recommendedItems={recommendedItems}
        onConfirm={onConfirm}
      />
    </Modal>
  );
}
```

---

## 🎨 코드 모양과 구조 (게슈탈트 원칙)

### 1. 근접성의 원칙 (Proximity)

**빈줄을 통해서 영역 구분하고 모으기**

```typescript
// ✅ 관련된 코드끼리 그룹화
const userInfo = getUserInfo();
const userPreferences = getUserPreferences();

// 다른 작업 그룹
const productData = getProductData();
const productAnalytics = getProductAnalytics();

// 최종 처리
processUserProduct(userInfo, productData);
```

### 2. 공통영역의 원칙 (Common Region)

**연관된 것끼리 함수로 그룹짓기**

```typescript
// ✅ 관련 기능을 함수로 묶기
function setupUserSession() {
  const token = getAuthToken();
  const userInfo = fetchUserInfo(token);
  return { token, userInfo };
}
```

### 3. 유사성의 원칙 (Similarity)

**같은 역할은 비슷한 이름으로, 비슷한 위치에 두기**

```typescript
// ✅ 일관된 네이밍 패턴
const handleUserClick = () => {
  /* ... */
};
const handleProductClick = () => {
  /* ... */
};
const handleOrderClick = () => {
  /* ... */
};
```

### 4. 연속성의 원칙 (Continuation)

**의존성을 바탕으로 순서대로 두기**

```typescript
// ✅ 의존성 순서에 따른 배치
const rawData = fetchData();
const processedData = processData(rawData);
const validatedData = validateData(processedData);
const result = saveData(validatedData);
```

---

## 🔄 리팩토링 원칙

### 핵심 원칙

1. **기능은 반드시 그대로 유지할 것**
2. **작은 단위로 점진적으로 진행할 것**
3. **가장 의존성이 적은 부분부터 시작할 것**
4. **테스트와 함께 할 것**

### 좋은 추상화의 특징

- **안정성**: 변하지 않는 특성
- **단순성**: 이해하고 사용하기 쉬움
- **목적에 적합한 수준**: 너무 추상화되지도, 덜 추상화되지도 않음
- **재사용 가능성**: 유사한 도메인에서 확장 가능
- **가독성**: 함축된 이름으로도 목적 이해 가능
- **일관성**: 예측 가능한 동작

---

## 🛠️ 개발 도구 및 환경

### 필수 도구

- **Prettier**: 코드 포맷팅 자동화
- **ESLint**: 코드 품질 검사
- **TypeScript**: 타입 안전성 보장

### 팀 협업

- **코드 리뷰**: 다른 사람이 읽기 좋은 코드 작성 의식
- **일관된 컨벤션**: 팀 전체의 예측 가능한 코드
- **지속적인 개선**: 점진적 리팩토링

---

## 📋 체크리스트

### ✅ 코드 작성 시 확인사항

- [ ] 매직 넘버에 의미있는 이름을 부여했는가?
- [ ] 복잡한 조건에 설명적인 변수명을 사용했는가?
- [ ] 함수는 단일 책임을 가지고 있는가?
- [ ] 반환 타입이 일관성 있게 설계되었는가?
- [ ] 관련된 코드끼리 적절히 그룹화되었는가?
- [ ] 불필요한 Props Drilling이 없는가?
- [ ] 추상화 수준이 적절한가?

### ✅ 리팩토링 시 확인사항

- [ ] 기존 기능이 그대로 유지되는가?
- [ ] 작은 단위로 점진적으로 진행하고 있는가?
- [ ] 테스트가 함께 작성되었는가?
- [ ] 의존성이 적은 부분부터 시작했는가?

---

## 📚 참고 자료

이 가이드는 다음 자료를 바탕으로 작성되었습니다:

- **Toss Frontend Fundamental**: 프론트엔드 설계 가이드라인
- **클린코드와 리팩토링**: 항해플러스 강의 자료

> **💡 기억하세요**: 좋은 코드란 다른 사람이 보았을 때 좋은 코드입니다. 코드는 작성하는 시간보다 읽는 시간이 훨씬 많기 때문에, 항상 읽는 사람을 배려하여 작성해야 합니다.
