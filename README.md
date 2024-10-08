# methodical-js

## Wstęp

Framework pozwala na budowanie aplikacji internetowych w oparciu o składanie funkcji. Wybrane elementy HTML mają swoje odpowiedniki w postaci funkcji przyjmujących obiekt konfiguracyjny oraz funkcję będącą ciałem danego komponentu. Wewnątrz ciała możliwe jest wywołanie kolejnych funkcji odpowiadającym elementom, budując w ten sposób drzewiastą strukturę. Każdy obiekt konfiguracyjny musi posiadać identyfikator, który jest unikalny lokalnie, tzn. żaden inny komponent będący jego rówieśnikiem, nie może mieć tego samego identyfikatora (są one używane do śledzenia tego samego elementu pomiędzy różnymi wersjami drzewa). Na przykład, następujący kod:

```js
Div({ id: 'outer' }, () => {
  Div({ id: 'first', style: { padding: '8px' } }, () => {
    Text({ id: 'text', style: { fontWeight: 'bold' }, value: 'Pierwszy napis' })
  })

  Div({ id: 'second' }, () => {
    Text({ id: 'text', style: { fontStyle: 'italic' }, value: 'Drugi napis' })
  })
})
```

jest równoważny do kodu HTML:

```html
<div>
  <div style="padding: 8px">
    <span style="font-weight: bold">Pierwszy napis</span>
  </div>

  <div>
    <span style="font-style: italic">Drugi napis</span>
  </div>
</div>
```

Warto zwrócić uwagę na powtórzony identyfikator `text` dla elementów tekstowych - nie jest to problem, ponieważ znajdują się one w różnych poddrzewach, więc identyfikator jest unikalny lokalnie.

Kod HTML może wydawać się bardziej zwięzły, jednak to co otrzymujemy budując odpowiadającą mu hierarchię przy użyciu funkcji JavaScript, to dużo lepsze podpowiadanie składni, automatyczne sprawdzanie typów (dzięki integracji z TypeScript) oraz możliwość stosowania instrukcji sterujących (pętle, instrukcje warunkowe, instrukcje `switch`) bezpośrednio w kodzie odpowiadającym za interfejs. Powoduje to, że integracja z kodem odpowiedzialnym za logikę biznesową jest zdecydowanie prostsza.

Z racji tego, że tworzenie widoków odbywa się poprzez wywołanie odpowiednich funkcji, budowanie własnych komponentów to proste definiowanie funkcji. Wystarczy w ich ciele wywołać funkcje odpowiadające widokom. Możliwe jest tworzenie komponentów "granicznych" oraz "płaskich". Komponenty płaskie nie wpływają bezpośrednio na drzewo przechowujące obecny stan interfejsu, tzn. wywołanie takiej funkcji jest równoważne z wklejeniem jej ciała w miejsce wykonania (pewnego rodzaju mechanizm `inline`). Wszystkie funkcje wpływające na stan, będą odwoływać się do węzła, w którym dana funkcja została wywołana, np.:

```js
function Component() {
  const state = remember('123')

  Text({ id: 'text', value: state.value })
}

Div({ id: 'root' }, () => {
  Div({ id: 'header' }, () => {
    Text({ id: 'header-text', value: 'Header' })
  })

  Component()
})
```

jest równoważny do

```js
Div({ id: 'root' }, () => {
  Div({ id: 'header' }, () => {
    Text({ id: 'header-text', value: 'Header' })
  })

  const state = remember('123')

  Text({ id: 'text', value: state.value })
})
```

Modyfikacja stanu w tym przypadku spowoduje przebudowanie całego komponentu `root`. Komponenty płaskie są dobrym narzędziem w przypadku niedużych i statycznych części interfejsu, które powtarzają się w wielu miejscach interfejsu. Dla elementów posiadających stan, lepiej sprawdzą się komponenty graniczne. Tworzą one nowy węzeł w drzewie, stanowiący granicę dla aktualizacji stanu. W przypadku zmodyfikowania poprzedniego przykładu tak, aby tworzył granicę wyglądałby następująco:

```js
const Component = createBoundary(function (config) {
  const state = remember('123')

  Text({ id: 'text', value: state.value })
})

Div({ id: 'root' }, () => {
  Div({ id: 'header' }, () => {
    Text({ id: 'header-text', value: 'Header' })
  })

  Component({ id: 'boundary-component' })
})
```

W takim przypadku, modyfikacja stanu spowoduje przebudowanie tylko komponentu `Component`, jednak ze względu na tworzenie nowego węzła w wewnętrznej reprezentacji interfejsu wymagają one obiektu konfiguracyjnego zawierającego **przynajmniej** identyfikator.

Dodatkowo, wszystkie komponenty graniczne (w tym również wbudowane odpowiedniki elementów HTML) przyjmują w obiekcie konfiguracyjnym opcjonalny parametr `pure`. Komponenty oznaczone jako `pure` są przebudowywane tylko w przypadku kiedy zmienia się ich obiekt konfiguracyjny (ze względu na wartość, nie referencję). Jest to szczególnie przydatny parametr w przypadku optymalizacji przebudowywania drzewa, gdyż pozwala zatrzymać przebudowę na poziomie, na którym nie były wprowadzone żadne zmiany. Np.:

```js
Div({ id: 'root' }, () => {
  const state = remember('123')

  Div({ id: 'child1' }, () => {
    console.log(1)
  })
  Div({ id: 'child2' }, () => {
    console.log(2)
  })
  Div({ id: 'child3', pure: true }, () => {
    console.log(3)
  })
  Div({ id: 'child4' }, () => {
    console.log(4)
  })
})
```

Modyfikacja stanu w tym przypadku, spowoduje przebudowanie komponentu o id `root`, a tym samym również jego dzieci. Komponent `child3` jest oznaczony jako czysta funkcja oraz jego obiekt konfiguracyjny nie zmienia się, zatem poddrzewo tego węzła nie zostanie przebudowane. Tzn. Przy aktualizacji stanu na konsoli otrzymamy wynik `124`, ponieważ ciało `child3` nie zostanie wykonane.

## Dostępne funkcjonalności

### Widoki

Obecnie dostępne widoki:

- `SuspenseBoundary` - Pozwala na wyświetlanie tymczasowego stanu interfejsu kiedy wczytywane są rzeczywiste dane w połączeniu z funkcjami `suspend` i `defer`.
- `Div`
- `Input`
- `Text` (odpowiadający elementowi `<span />`)

Oczywiście, możliwe jest też tworzenie własnych funkcji odpowiadających wymaganym elementom HTML przy użyciu interfejsu `ViewNodeManager` oraz funkcji `createViewNode` oferowane przez klasę `WorkingTree`.

### Funkcje

- `remember<T>(value: T): RememberedValue<T>` - Tworzy węzeł przechowujący stan pomiędzy aktualizacjami interfejsu. Modyfikacja zapamiętanej wartości powoduje przebudowanie rodzica oraz aktualizację interfejsu.
- `sideEffect(() => (void | () => void), ...dependencies)` - Reprezentuje efekt uboczny funkcji. Pierwszym argumentem jest funkcja (która opcjonalnie może zwracać funkcję sprzątającą), kolejne argumenty to zależności, które są wariadyczne. Przy pierwszym wywołaniu efektu, wykonana zostanie funkcja z pierwszego argumentu i jej wynik wraz z zależnościami zostaje zapisany w drzewie stanu. W przypadku zmiany którejś z zależności (porównanie ze względu na referencję, nie wartość), wykonana zostanie funkcja sprzątająca (o ile została zwrócona) i efekt zostanie wykonany ponownie.
- `on(name: string, handler: (event) => void, ...dependencies)` - Reprezentuje obsługę zdarzenia o podanej nazwie. Za każdym razem kiedy zdarzenie o danej nazwie zostanie wyemitowane i jego celem będzie rodzic, w którym ta funkcja została wywołana, uruchomiona będzie funkcja przekazywana w drugim argumencie i obiekt reprezentujący zdarzenie zostanie jej przekazany. Węzeł w drzewie zostanie zaktualizowany w przypadku zmiany którejkowiek z zależności (ponownie, porównanie przez referencję).
- `suspend<T>(() => Promise<T>, ...dependencies): T` - Przyjmuje funkcję asynchroniczną jako pierwszy argument oraz listę zależności jako drugi. Przy pierwszym wywołaniu (oraz przy każdorazowej zmianie którejś z zależności - porównanie przez referencję) wywołuje otrzymaną funkcję oraz przerywa budowę obecnego poddrzewa aż do napotkania pierwszego komponentu typu `SuspenseBoundary` będącego jej przodkiem. Kiedy funkcja asynchroniczna się zakończy i zwróci wynik, poddrzewo zostaje przebudowane i zwrócona wartość jest możliwa do odczytu.
- `defer<T>(() => Promise<T>, ...dependencies): T` - Działa bardzo podobnie do `suspend` z tą różnicą, że w przypadku zmiany którejkolwiek z zależności budowa poddrzewa nie zostaje przerwana. Zamiast tego, wyświetlana jest poprzednia wersja drzewa a funkcja asynchroniczna jest uruchamiana w tle. Po jej zakończeniu, poddrzewo jest przebudowywane ze zaktualizowaną wartością.
- `memoize<T>(() => T, ...dependencies): T` - Pozwala na memoizację wyniku funkcji pomiędzy różnymi wersjami drzewa. Funkcja obliczająca wartość zostanie wywołana za pierwszym razem oraz w przypadku zmiany którejś z zależności. W pozostałych przypadkach, wykorzystana zostanie wartość obliczona wcześniej. Przydatna do optymalizacji złożonych obliczeń zależnych od stanu, który nie zawsze zmienia się podczas przebudowy drzewa.
- `createAmbient<T>(key: string): Ambient<T>` - Pozwala stworzyć komponent, który udostępnia swoim potomkom dodatkowe informacje które można odczytać na dowolnym poziomie w drzewie. Zwraca funkcję, która w swoim obiekcie konfiguracyjnym, przyjmuje pole `value: T` i zmiany tej wartości powodują przebudowanie wszystkich potomków, którzy ją odczytują. Szczególne znaczenie ma to w połączeniu z czystymi komponentami, które przerywają przebudowywanie poddrzewa. W takim przypadku, przebudowane zostaną tylko komponenty, które odczytują wartość.
- `readAmbient<T>(Ambient<T>): T` - Pozwala na odczytanie wartości udostępnianej przez przodka typu `Ambient`. Odczytanie wartości powoduje, że dany węzeł zaczyna nasłuchiwać na zmiany odczytanej wartości i jest przebudowaywany kiedy taka nastąpi.

Każda z funkcji przyjmujących zależności, optymalizuje przebudowywanie węzłów opierając się na domknięciach (closures). Jeżeli żadna z wartości używanych przez odpowiednią funkcję nie zmieniła się pomiędzy kolejnymi wywołaniami, nie ma potrzeby wywoływania jej ponownie (lub aktualizowania węzła w drzewie roboczym w przypadku obsługi zdarzeń) gdyż jej wynik nie zmieni się po ponownym jej wywołaniu.

### Nawigacja

Framework udostępnia dwa komponenty do budowania nawigacji: `Navigator` i `Route`. Oba komponenty przyjmują jako argumenty ścieżkę oraz funkcję budującą ich ciało. Ścieżka to wzór adresów, które powinny być dopasowane do danego komponentu. Ścieżka może być statyczna, ale może też być parametryzowana przez użycie symbolu `:`, np. `/user/:userId`. Wspomniane komponenty różnią się one zachowaniem: komponenty typu `Navigator` można zagnieżdzać, budując w ten sposób coraz bardziej złożoną nawigację, natomiast komponenty typu `Route` stanowią liście w kontekście nawigacji - nie mogą zawierać innych komponentów nawigacyjnych w swoich poddrzewach. Najprościej to zachowanie prezentuje prosty przykład:

```js
Navigator('/', () => {
  Route('/', () => Square('red'))

  Route('/random', () => {
    const red = Math.random() * 255
    const green = Math.random() * 255
    const blue = Math.random() * 255

    Square(`rgb(${red}, ${green}, ${blue})`)
  })

  Navigator('/custom', () => {
    Route('/:color', () => {
      const navigation = getNavigation()
      const color = navigation.params.color
      Square(color)
    })

    Route('/hex/:color', () => {
      const navigation = getNavigation()
      const color = navigation.params.color
      Square(`#${color}`)
    })
  })
})
```

Powyższy kod wyświetla kolorowy kwadra, którego kolor zależy od odwiedzonej ścieżki:

- `/` - kolor czerwony
- `/random` - losowy kolor
- `/custom/yellow` - kolor żółty
- `/custom/hex/000000` - kolor czarny

Dodarkowo dostępna jest funkcja `getNavigation()` zwracająca obiekt pozwalający na odczytywanie informacji o ścieżce oraz na jej modyfikowanie. Udostępnia następujące pola:

- `hash` - Zwraca część adresu po symbolu `#`
- `query` - Zwraca obiekt klucz-wartość na podstawie części adresu po symbolu `?`
- `params` - Zwraca obiekt klucz-wartość na podstawie parametrów występujących w ścieżce
- `back()` - Pozwala na powrót do poprzedniej ścieżki
- `navigate(string)` - Pozwala na nawigowanie do wskazanej ścieżki, jeżeli nowa ścieżka zaczyna się od `./` lub `../` jest ona traktowana jako relatywna do obecnej, w przeciwnym wypadku jest traktowana jako ścieżka absolutna. Możliwe jest też przekazanie napisu zaczynającego się od `#` lub `?` żeby zmodyfikować odpowiednio pole `hash` i `query`.

Każda zmiana ścieżki powoduje aktualizację komponentów odpowiedzialnych za nawigację, które następnie próbują dopasować ścieżkę do wzorca który miały przekazane jako argument. Jeżeli dopasowanie się uda, wywoływane jest ich ciało.

## Opis wysokopoziomowy

Wewnętrznie, hierarchia komponentów przechowywana jest w strukturze drzewa. Korzeń jest zawsze zdefiniowany i pełni rolę wartownika aby drzewo nigdy nie było puste. Podczas inicjalizacji, element w którym budowana będzie hierarchia elementów HTML jest przypisywany jako referencja widoku w korzeniu i nie zmienia się w trakcie działania aplikacji. Każda z funkcji odpowiedzialnych za tworzenie elementów, manipulację stanem lub wywoływanie efektów, wewnętrznie wykonuje operacje na drzewie.

### Opis drzewa

Drzewo może zawierać kilka rodzajów węzłów, które można podzielić na dwie grupy: widoki i efekty. Widoki są węzłami używanymi do budowania hierarchi interfejsu, natomiast efekty pozwalają na jego interaktywność. W związku z tym można wyróżnić ważną cechę: węzły odpowiadające efektom zawsze będą liściami, natomiast węzły wewnętrzne zawsze będą widokiem.

Budowanie interfejsu opiera się na składaniu kolejnych funkcji - widok otrzymuje obiekt konfiguracyjny oraz funkcję reprezentującą jego ciało. Wewnętrznie wywoływana jest odpowiednia metoda na drzewie (`WorkingTree.createViewNode`), która przed wykonaniem funkcji ciała, ustawia odpowiednią referencję do właśnie utworzonego węzła. W ten sposób, kiedy węzeł jest tworzony ma on dostęp do swojego rodzica, a tym samym do wszystkich swoich przodków. Dodatkowo, w przypadku aktualizacji, propagowana jest referencja do odpowiadającego węzła w poprzednim drzewie co pozwala na propagację stanu pomiędzy różnymi wersjami drzewa oraz na optymalizowanie przypadków kiedy dany węzeł nie musi zostać przebudowany.

Każdy węzeł przechowuje znaczące informacje, które różnią się w zależności od typu:

- `ViewNode` - Przechowuje obiekt konfiguracyjny oraz funkcję reprezentującą ciało, które są wykorzystywane w przypadku przebudowy.
- `RootNode` - Wyróżniony `ViewNode` pełniący rolę wartownika.
- `RebuildingNode` - Wyróżniony `ViewNode`, tworzony podczas procesu przebudowy drzewa.
- `SuspenseBoundary` - Specjalny rodzaj `ViewNode`, zawierający logikę obsługującą przerywanie budowania poddrzewa oraz przechowywanie tymczasowego staniu węzłów przerywających.
- `Ambient` - Specjalny rodzaj `ViewNode`, który udostępnia pewną wartość wszystkim swoim potomkom oraz pozwala obserwować jej zmiany. W przypadku zmiany wartości, kolejkowana jest aktualizacja na wszystkich obserwujących węzłach.
- `RememberNode` - Przechowuje obiekt proxy opakowujący zapamiętaną wartość. Modyfikacja wartości tego obiektu powoduje zakolejkowanie aktualizacji rodzica.
- `EffectNode` - Przechowuje funkcję sprzątającą oraz zależności. W przypadku zmiany zależności, wywoływana jest funkcja sprzątająca oraz nowo zbudowany efekt.
- `EventNode` - Przechowuje nazwę nasłuchiwanego zdarzenia, funkcję która je obsługuje oraz listę zależności. W przypadku zmiany zależności, poprzednia funkcja obsługująca jest usuwana i jest zastępowana nową.
- `SuspendNode` - Przechowuje funkcję asynchroniczną, zwróconą wartość oraz zależności. W przypadku zmiany zależności, funkcja uruchamiana jest na nowo a budowa danego poddrzewa jest przerywana. Kiedy uruchomiona funkcja się zakończy, kolejkowana jest aktualizacja na pierwszym przodku typu `SuspenseBoundary`.
- `DeferNode` - Specjalny rodzaj `SuspendNode`, który przerywa budowanie poddrzewa tylko przy pierwszym utworzeniu. Podczas aktualizacji, w przypadku zmiany zależności, uruchamiana jest funkcja asynchroniczna, a kiedy się zakończy kolejkowana jest aktualizacja na pierwszym przodku typu `SuspenseBoundary`.

Warto zwrócić uwagę na fakt, że nie każdy węzeł widoku musi posiadać referencję do faktycznego widoku (elementu HMTL), w szczególności takowej nie posiadają węzły `Ambient`, `SuspenseBoundary` oraz `RebuildingNode`.

### Pierwsza budowa drzewa

Do rozpoczęcia działania, wymagane jest zawołanie metody `init` oraz przekazania jej referencji do elementu, w którym ma być zbudowana hierarchia komponentów, np.:

```js
Methodical.init(document.getElementById('app'))
```

Przypisuje ona otrzymaną referencję elementu do korzenia drzewa, buduje pierwsze drzewo i uruchamia pętlę, która w każdej klatce sprawdza czy zakolejkowane były aktualizacje stanu i ewentualnie aplikuje je powodując przebudowanie drzewa tak aby odzwierciedlało nowy stan. W większości przypadków (chyba że zastosowane będą "płaskie" komponenty), każdej funkcji widoku i efektu będzie odpowiadał dokładnie jeden węzeł w drzewie, np.:

```js
Div({ id: 'A' }, () => {
  const val = remember(0)

  Div({ id: 'B' }, () => {
    const val = remember(1)
  })

  Div({ id: 'C' }, () => {
    Div({ id: 'E' }, () => {
      const val = remember(2)
    })

    Div({ id: 'F' }, () => {})
  })

  Div({ id: 'D' }, () => {})
})
```

spowoduje zbudowanie następującego drzewa (kolorem pomarańczowym oznaczone są węzły efektów):

```mermaid
graph TD
  #((#))
  A((A))
  B((B))
  C((C))
  D((D))
  E((E))
  F((F))
  0((0))
  1((1))
  2((2))

  # --> A
  A --> 0
  A --> B
  A --> C
  A --> D
  B --> 1
  C --> E
  C --> F
  E --> 2

  style 0 fill:#950
  style 1 fill:#950
  style 2 fill:#950
```

Węzeł `#` reprezentuje korzeń wykorzystywany wewnętrznie przez framework i będzi pomijany w kolejnych diagramach.

Klasa udostępniająca funkcje pozwalające na wykonywanie operacji na drzewie posiada referencję do obecnie przetwarzanego węzła (domyślnie, kiedy żaden węzeł nie jest przetwarzany wskazuje ona na korzeń). Każda funkcja tworząca widok czy też odpowiadająca za efekt (zapamiętanie stanu, efekt uboczny, zdarzenia, itp.) opakowuje pewne operacje na drzewie. Wywołanie funkcji widoku tworzy odpowiedni węzeł w drzewie, następnie referencja do obecnego węzła zostaje zapisana i zamieniona na nowo zbudowany węzeł. Wywoływana jest funkcja ciała, w której powyższy proces może powtórzyć się wielokrotnie w zależności od jej struktury, a kiedy wywołanie się zakończy, referencja na obecny węzeł jest z powrotem ustawiana na zapisaną przed zbudowaniem ciała. Dzięki takiemu schematowi, każdy budowany węzeł może w łatwy sposób uzyskać referencję do kontekstu (swojego rodzica w drzewie) w jakim jest budowany. Przez to, że JavaScript jest językiem operującym tylko na jednym wątku, nie ma też ryzyka na konflikt pomiędzy kilkoma poddrzewami budowanymi "równolegle".

### Modyfikacja stanu

Do przechowywania stanu wykorzystywana jest funkcja `remember`, tworząca w drzewie węzeł `RememberNode`. Każdy węzeł tego typu przechowuje obiekt proxy pozwalający na dostęp do zapamiętanej wartości (i jest on zwracany przez `remember`). Przechwytuje on operacje zapisu i przy każdej z nich kolejkuje aktualizację na swojego rodzica, ponieważ zmiana zapamiętanej wartości może mieć wpływ na jego rodzeństwo (warość może być użyta jako zależność, lub do manipulacji samym drzewem przy użyciu instrukcji sterujących).

Kolejkowanie aktualizacji obsługiwane jest za pomocą drzewa prefiksowego, w którym zapisywana jest ścieżka do aktualizowanego węzła. Podczas aplikowania aktualizacji, obliczane są prefiksy ścieżek i węzły znajdujące się na tych ścieżkach są przebudowywane. Pozwala to uniknąć niepotrzebnego przebudowywania węzłów w sytuacjach gdzie aktualizowany jest zarówno rodzic jak i któryś z jego potomków. Przy naiwnej implementacji przebudowane zostałyby oba węzły, przy czym potomek (a tym samym całe poddrzewo) byłby przebudowany dwukrotnie - pierwszy raz przez przebudowanie rodzica, drugi przez bezpośrednie przebudowanie potomka. Można tą sytuację łatwo zilustować rozważając następujące drzewo, w którym węzły pomarańczowe przechowują stan:

```mermaid
graph TD
  A((A))
  B((B))
  C((C))
  E((E))
  F((F))
  0((0))
  1((1))
  2((2))

  A --> 0
  A --> B
  A --> C
  B --> 1
  C --> E
  C --> F
  E --> 2

  style 0 fill:#950
  style 1 fill:#950
  style 2 fill:#950
```

W przypadku modyfikacji wartości zapisanej w węzłach `1` i `2`, zakolejkowane zostaną następujące aktualizacje:

```mermaid
graph TD
  A((A))
  B((B))
  C((C))
  E((E))

  A --> C
  A --> B
  C --> E

  style E fill:#050
  style B fill:#050
```

Gdyby aktualizacja została zaaplikowana w takim stanie, przebudowane zostałyby węzły `B` oraz `E`. Jeżeli jednak zostanie też zmodyfikowana wartość zapisana w węźle `1`, zakolejkowana zostanie kolejna aktualizacja:

```mermaid
graph TD
  A((A))
  B((B))
  C((C))
  E((E))

  A --> C
  A --> B
  C --> E

  style E fill:#050
  style B fill:#050
  style A fill:#050
```

W takiej sytuacji bezpośrednio przebudowany zostanie tylko węzeł `A`, ponieważ jego ścieżka stanowi prefiks dla dwóch pozostałych aktualizacji. Istnieje jednak przypadek, w którym powinny zostać przebudowane zarówno komponent znajdujący się na ścieżce reprezentowanej przez prefiks, jak i komponenty leżące głębiej w drzewie. Kiedy na ścieżce pomiędzy dwoma komponentami oczekującymi na aktualizację znajduje się czysty komponent, którego konfiguracja się nie zmieniła opisane powyżej podejście spowodowałoby zgubienie aktualizacji dla komponentu leżącego głębiej, np.:

```mermaid
graph TD
  A((A))
  B((B))
  C((C))
  E((E))
  F((F))
  0((0))
  1((1))

  A --> 0
  A --> B
  B --> C
  C --> E
  C --> F
  E --> 1

  style 0 fill:#950
  style 1 fill:#950
  style C fill:#909
```

Przyjmując, że węzeł `C` reprezentuje czysty komponent i jego konfiguracja nie zmieniła się aplikując następującą aktualizację, która jest możliwa do uzyskania np. przez obsługę zdarzenia, lub zmianę wartości na obserwowanym węźle `Ambient`:

```mermaid
graph TD
  A((A))
  B((B))
  C((C))
  E((E))

  A --> B
  B --> C
  C --> E

  style E fill:#050
  style A fill:#050
```

Na węźle `C` przebudowywanie poddrzewa zostałoby przerwane i węzeł `E` nie zostałby przebudowany. Dlatego w przypadku wykorzystywania poprzedniego poddrzewa przez czysty komponent, dodatkowo sprawdza on czy nie ma zakolejkowanej aktualizacji na któryś z jego potomków poprzez sprawdzenie drzewa prefiksowego. Jeżeli odpowiadający mu węzeł istnieje, oznacza to że któryś z jego potomków lub on sam powinny zostać zaktualizowane, w takiej sytuacji aktualizacja na odpowiednie węzły jest rekolejkowana i wykonywana w tym samym cyklu aby uniknąć rozbieżności w stanie pomiędzy węzłami.

### Przebudowywanie poddrzewa

Proces przebudowywania poddrzewa jest relatywnie prosty: tworzony jest tymczasowy węzeł (`RebuildingNode`) na podstawie węzła który ma zostać przebudowany. Tak skonstruowany węzeł posiada wszystkie najważniejsze referencje (rodzic, odpowiedni element HMTL o ile istnieje, funkcja budująca ciało) zgodne z oryginalnym. Dodatkowo, każdy węzeł posiada referencję do swojej poprzedniej wersji w drzewie, która jest wykorzystywania w trakcie przebudowy do propagacji stanu. Referencja ta jest usuwana po zakończeniu przebudowy żeby nie powodować wycieków pamięci przez przechowywanie wszystkich dotychczasowych wersji drzewa.

Po utworzeniu węzła tymczasowego, jego poddrzewo jest budowane w standardowy sposób, tzn. referencja na obecny węzeł jest ustawiana na węzeł tymczasowy oraz uruchamiana jest funkcja ciała. Następująco proces przebiega identycznie jak opisano w `Pierwszej budowie drzewa`, z tą różnicą że dodatkowo propagowana jest referencja do poprzednich wersji węzłów. To również jest prosty mechanizm, opierający się na lokalnej unikalności identyfikatorów. Pierwszy przebudowywany węzęł, ma ustawioną odpowiednią referencję na początku procesu przebudowywania, następnie podczas budowy jego dzieci, są one w stanie odczytać referencję do poprzedniej wersji swojego rodzica oraz uzyskać poprzednią wersję węzła który same reprezentują na podstawie identyfikatora. Jeżeli odpowiedni węzeł istnieje, zapisywana jest referencja do niego wewnątrz węzła, dając następującą strukturę podczas przebudowy (kolorem szarym oznaczone są referencje do poprzednich wersji odpowiednich węzłów):

```mermaid
graph TD
    A((A))
    B((B))
    C((C))
    D((D))
    E((E))
    F((F))
    A'((A'))
    B'((B'))
    C'((C'))
    D'((D'))
    E'((E'))
    F'((F'))

subgraph Poprzednie poddrzewo
    A --> B
    A --> C
    B --> D
    B --> E
    C --> F
    end

subgraph Nowe poddrzewo
    A' --> B'
    A' --> C'
    B' --> D'
    B' --> E'
    C' --> F'
end

  A' ---> A
  B' ---> B
  C' ---> C
  D' ---> D
  E' ---> E
  F' ---> F

  style A' fill:#555
  linkStyle 10,11,12,13,14,15 stroke:gray;
```

Po ustaleniu referencji przywracane są odpowiednie dane (zapisany stan, poprzednie zależności funkcji) oraz podejmowane ewentualne działania np. w przypadku gdy zależności zapisane w poprzedniej wersji węzła różnią się od zależności nowego węzła efektu, uruchamiana jest funkcja sprzątająca oraz ponownie efekt. Jeżeli taki węzeł nie istnieje, oznacza to że węzeł nie ma odpowiednika w poprzedniej wersji drzewa oraz powinien zostać zainicjalizowany bez stanu początkowego, jak podczas pierwszej budowy drzewa. Do takiej sytuacji może dojść, kiedy dany komponent jest wewnątrz instrukcji warunkowej zależnej od wartości stanu.

Kolejną różnicą w stosunku do pierwszej budowy są komponenty czyste, które nie powinny być przebudowane, chyba że zmieniła się ich konfiguracja. Kiedy podczas procesu przebudowywania tworzony jest komponent oznaczony jako czysty, jego obiekt konfuguracyjny jest porównywany z obiektem konfiguracyjnym jego poprzedniej wersji (przez wartość). Jeżeli jego poprzednia wersja nie istnieje, lub konfiguracja zmieniła się w stosunku do poprzedniej wersji, jest on przebudowywany jak zwykły komponent. Jeżeli natomiast konfiguracja jest niezmieniona, lista dzieci jest kopiowana z poprzedniej wersji drzewa oraz aktualizowane są ich referencje wskazujące na węzeł rodzica. Dodatkowo, na widoku ustawiana jest flaga, mówiąca że został on przywrócony z poprzedniej wersji drzewa i może zostać pominięty podczas obliczania różnic pomiędzy nowym a startm drzewem w trakcie renderowania, a także kolejkowane są ewentualne aktualizacje stanu na potomkach czystego komponentu, zgodnie z opisem w `modyfikacji stanu`.

Kiedy zbudowane jest całe nowe poddrzewo, renderowana jest różnica pomiędzy starym a nowo zbudowanym poddrzewem. Następnie lista dzieci węzła tymczasowego jest zapisywana w drzewie, w węźle który był przebudowywany oraz ich referencja wskazująca na rodzica zostaje zmodyfikowana tak żeby wskazywać na nowego rodzica zamiast na węzeł tymczasowy.

### Renderowanie

Renderowanie to proces odpowiedzialny za odzwierciedlanie zmian pomiędzy różnymi wersjami drzewa na faktyczny stan interfejsu użytkownika. Algorytm realizujący go, opiera się o założenie, że węzły w drzewie mogą być dodane, usunięte, lub zmodyfikowane. Nie jest dopuszczalna zamiana dwóch węzłów, taką operację można zastąpić przez usunięcie obu węzłów z drzewa, a następnie dodaniu ich ponownie w innej kolejności. Dzięki temu założeniu, można przyjąć że dana sekwencja węzłów na wybranym poziomie drzewa wystąpi w tej samej kolejności pomiędzy różnymi jego wersjami. Oczywiście dopuszczalne jest pojawienie się nowych węzłów pomiędzy nimi lub też zniknięcie niektórych w nowej wersji drzewa. Algorytm obliczający różnicę pomiędzy wersjami drzewa wygląda następująco:

```python
def diffTrees(old, new):
  # indeks ostatniego węzła w starym drzewie, który został uzgodniony z pewnym węzłem w nowym drzewie
  lastFoundIndex = 0
  for child in new.children:
    foundInOld = False
    for i in range(lastFoundIndex, len(old.children)):
      oldChild = old.children[i]
      if oldChild.id == child.id:
        # w przypadku uzgodnienia dwóch węzłów pomiędzy drzewami, wszystkie do tej pory nieuzgodnione węzły w starym drzewie muszą zostać usunięte
        for j in range(lastFoundIndex, i):
          # dropView rekurencyjnie usuwa całe poddrzewo
          dropView(old.children[j])

        # indeks, od którego zacznie się kolejne przeszukiwanie starego drzewa musi być przesunięty na pierwszy za nowo uzgodnionym węzłem żeby nie został on usunięty w kolejnych krokach
        lastFoundIndex = i + 1
        foundInOld = True

        updateView(oldChild, child)
        # jeżeli węzeł został uzgodniony z odpowiednikiem w starym drzewie, powinna zostać obliczona różnica pomiędzy ich poddrzewami, gdyż ich struktura mogła się zmienić
        diffTrees(oldChild, child)
        break

    # jeżeli nie udało się uzgodnić nowego węzła, oznacza to że został on utworzony w tym cyklu
    if not foundInOld:
      # createView rekurencyjnie buduje całe poddrzewo
      createView(child)

  # dodatkowo należy usunąć wszystkie pozostałe węzły ze starego drzewa, które nie zostały uzgodnione gdyż nie mają swojego odpowiednika w nowym
  for i in range(lastFoundIndex, len(old.children)):
    dropView(old.children[i])
```

Łatwo zauważyć, że jest to efektywnie algorytm obliczania różnicy w sekwencji gdzie dopuszczalne są pojedyncze edycje (wstawianie, usuwanie, modyfikacja), zatem jest to problem analogiczny do obliczania odległości Levenshteina. Łatwo też zauważyć, że jego pesymistyczna złożoność czasowa (dla jednego poziomu w drzewie) wynosi `O(n*m)`, gdzie `n`, `m` to odległości odpowiednich sekwencji - jest to optymalne rozwiązanie tego problemu: https://arxiv.org/abs/1412.0348. Dodatkowo, do takiej sytuacji dochodzi kiedy żaden z węzłów ze starego drzewa nie pojawia się w nowym drzewie, co w kontekście tworzenia interfejsów użytkownika jest stosunkowo rzadkim zdarzeniem.

Wszystkie operacje w powyższym algorytmie wykonywane są tylko dla węzłów odpowiadającym widokom, a odpowienie asercje oraz optymalizacje zostały pominięte w celu uproszczenia algorytmu. Jego działanie można zobrazować na następujących drzewach:

```mermaid
graph TD
    A((A))
    B((B))
    C((C))
    D((D))
    E((E))
    F((F))
    A'((A'))
    C'((C'))
    E'((E'))
    F'((F'))
    G((G))
    H((H))
    I((I))

subgraph Poprzednie poddrzewo
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    end

subgraph Nowe poddrzewo
    A' --> C'
    A' --> G
    A' --> E'
    A' --> F'
    A' --> H
    A' --> I
end

  style B fill:#a00
  style D fill:#a00

  style C fill:#00a
  style E fill:#00a
  style F fill:#00a
  style C' fill:#00a
  style E' fill:#00a
  style F' fill:#00a

  style G fill:#0a0
  style H fill:#0a0
  style I fill:#0a0
```

W powyższym przykładzie, relatywna kolejność węzłów `C`, `E`, `F` nie zmienia się pomiędzy drzewami zatem ich widoki mogą zostać zaktualizowane. Węzły `B` oraz `D` nie pojawiają się w nowym drzewie, zatem ich widoki zostaną usunięte, natomiast węzły `G`, `H`, `I` nie występowały w starym drzewie, dlatego odpowiadające im widoki zostaną utworzone. Możemy też rozważyć przypadek, gdzie kolejność węzłów zmienia się pomiędzy wersjami drzewa:

```mermaid
graph TD
    A((A))
    B((B))
    C((C))
    D((D))
    A'((A'))
    C'((C'))
    B'((B'))
    D'((D'))

subgraph Poprzednie poddrzewo
    A --> B
    A --> C
    A --> D
    end

subgraph Nowe poddrzewo
    A' --> D'
    A' --> C'
    A' --> B'
end

  style B fill:#a00
  style C fill:#a00

  style D fill:#00a
  style D' fill:#00a

  style C' fill:#0a0
  style B' fill:#0a0
```

W takiej sytacji, widok odpowiadający węzłowi `D` zostanie zaktualizowany, natomiast widoki odpowiadające węzłom `B` i `C` zostaną usunięte i utworzone ponownie.

Kolejnym problemem jest aktualizacja drzewa DOM na podstawie obliczonych różnic pomiędzy wewnętrznymi reprezentacjami drzewowymi interfejsu. W tym przypadku mamy 2 ograniczenia:

- API udostępniane przez przeglądarkę do modyfikacji drzewa DOM - dostępne są metody `appendChild`, która dodaje widok jako swoje ostatnie dziecko oraz `insertBefore`, która dodaje widok bezpośrednio przed widokiem przekazanym jako drugi parametr (drugi parametr musi być dzieckiem tego węzła do którego widok jest dodawany)
- Fakt, że nie każdy węzeł odpowiadający za widok, ma odpowiadający mu element w drzewie DOM - niektóre węzły pełnią funkcje wyłącznie logiczne i nie mają bezpośredniego wpływu na wyświetlany interfejs

Ze względu na powyższe ograniczenia, dodanie widoku do drzewa DOM wymaga przeszukiwania drzewa roboczego w poszukiwaniu następnika posiadającego odpowiadający mu węzeł w drzewie DOM, lub poprzednika, również z odpowiadającym mu węzłem w DOM. Algorytmy wyszukujące odpowienie węzły w drzewie mają dosyć prostą implementację, jednak warto zwrócić uwagę na dwa szczegóły implementacyjne:

1. Podczas przeszukiwania, rozważane są tylko węzły reprezentujące widoki (tzn. pomijane są węzły stanu, efektu, itd.), a żeby węzeł mógł zostać uznany za poprzednika lub następnika, musi on posiadać referencję do węzła DOM
2. Szukanie odpowiedniego węzła następuje w poddrzewie pierwszego przodka posiadającego referencję do węzła DOM - ten węzeł będzie rodzicem właśnie utworzonego elementu HTML. W związku z tym, przeszukiwanie zostaje przerwane w momencie napotkania wspomnianego przodka i uznaje się że odpowiedni węzeł nie istnieje.

W ogólnym przypadku, wyszukiwanie poprzednika jest zbędne gdyż informacja o następniku jest wystarczająca w celu aktualizacji drzewa DOM - jeżeli następnik nie istnieje, możemy dodać nowy element jako ostatnie dziecko, natomiast jeżeli istnieje, nowy element powinien zostać wstawiony przed swoim następnikiem. Jest to jednak kosztowna operacja w sytuacji gdy budowane jest nowe poddrzewo - żaden z rozważanych węzłów nie posiada referencji do drzewa DOM, gdyż nie zdążyły zostać zainicjalizowane zatem duża część poddrzewa zostanie odwiedzona przed zwróceniem wyniku. W takiej sytuacji, optymalne jest wyszukanie poprzednika, który w większości przypadków będzie bezpośrednim rodzeństwem rozważanego węzła (i jego referencja do drzewa DOM będzie zainicjalizowana, ponieważ inicjalizacja zachodzi w kolejności DFS). Jeżeli poprzednik istnieje i odpowiedni węzeł DOM jest ostatnim węzłem w swoim rodzicu, widok może zostać dodany jako ostatnie dziecko. Decyzja o tym, które podejście powinno zostać zastosowane jest podejmowana na podstawie flag optymalizacyjnych, które są ustawiane w trakcie przebudowy drzewa. Jeżeli dane poddrzewo zostało właśnie utworzone, podejmowana jest próba znaleznienia poprzednika i dopiero kiedy to się nie powiedzie, wyszukiwany jest następnik. W przeciwnym razie następnik wyszukiwany jest bezpośrednio. W przypadku gdy nie istnieje ani poprzednik, ani następnik, węzeł będzie jedynym elementem w drzewie DOM, zatem może być dodany jako ostatnie (pierwsze) dziecko.

### Suspense

Suspense to mechanizm, pozwalający na przerwanie renderowania danego poddrzewa na czas działania operacji asynchronicznej, od wyniku której może zależeć jego struktura. W czasie kiedy renderowanie poddrzewa jest wstrzymane, renderowany jest opcjonalny komponent zastępczy (lub nic, w przypadku gdy taki nie istnieje). Kiedy odpowiednia funckja asynchroniczna zakończy swoje działanie, poddrzewo jest aktualizowane oraz renderowany jest docelowy komponent, który ma w tym czasie dostęp do wyniku zwróconego przez zakończoną operację. `SuspenseBoundary` to komponent wyznaczający granicę poddrzewa, którego renderowanie powinno zostać przerwane w przypadku wstrzymania. Implementacja tego systemu wykorzystuje dwie cechy języka JavaScript:

- Każda funkcja asynchroniczna zwraca obiekt typu `Promise`
- Wyrażenie `throw` akceptuje dowoną poprawną wartość

Dzięki temu, wywołanie funkcja `suspend` jest równoznaczna z przerwaniem wykonywania kodu i rzuceniem obiektu `Promise` zwróconego przez funkcję będącą jej argumentem. Następnie `SuspenseBoundary` wykorzystuje konstrukcję `try...catch` w celu obsłużenia tej sytuacji. Jeżeli złapany błąd jest typu `Promise`, dodawany jest obserwator na zakończenie jego działania, który kolejkuje aktualizację na odpowiedni węzeł w drzewie roboczym.

### Ambient

Ambient pozwala na udostępnianie danych dla całego poddrzewa bez bezpośredniego przekazywania ich w obiektach konfiguracyjnych, co w połączeniu z czystymi komponentami daje możliwość optymalizacji części drzew, które powinny zostać przebudowane podczas aktualizacji. Węzeł `Ambient` udostępnia możliwość nasłuchiwania na zmiany udostępnianej przez niego wartości, która jest wykorzystywana przez funkcję `readAmbient`. Podczas pierwszego jej uruchomienia, zaczyna ona obserwować na zmiany wartości pierwszego przodka typu `Ambient` o odpowiednim kluczu. Utworzony obserwator jest niszczony, kiedy wywołanie `readAmbient` znika z konstrukcji drzewa roboczego. Kiedy obserwowana wartość zostaje zmieniona, kolejkowana jest dodatkowa aktualizacja na nasłuchujący węzeł, który następnie jest przebudowywany z dostępem do nowej wartości. Jest to szczególnie przydane narzędzie w przypadku danych, które są wymagane w dużej części poddrzewa, lub całym poddrzewie i zastępuje przekazywanie ich wprost (np. informacja o języku aplikacji, wybranym motywie kolorystycznym). Umożliwia też sprawdzanie struktury drzewa, np. lista może wyrenderować swoje dzieci w odpowiednim komponencie `Ambient`, następnie elementy listy mogą w łatwy sposób upewnić się czy są potomkami listy za pomocą funkcji `readAmbient`, podobne zachowanie może być pożądane w przypadku formularzy, tabel oraz innych komponentów wymagających konkretnej hierarchii.
