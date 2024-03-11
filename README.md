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

#### Nawigacja

TODO

### Funkcje

- `remember<T>(value: T): RememberedValue<T>` - Tworzy węzeł przechowujący stan pomiędzy aktualizacjami interfejsu. Modyfikacja zapamiętanej wartości powoduje przebudowanie rodzica oraz aktualizację interfejsu.
- `sideEffect(() => (void | () => void), ...dependencies)` - Reprezentuje efekt uboczny funkcji. Pierwszym argumentem jest funkcja (która opcjonalnie może zwracać funkcję sprzątającą), kolejne argumenty to zależności, które są wariadyczne. Przy pierwszym wywołaniu efektu, wykonana zostanie funkcja z pierwszego argumentu i jej wynik wraz z zależnościami zostaje zapisany w drzewie stanu. W przypadku zmiany którejś z zależności (porównanie ze względu na referencję, nie wartość), wykonana zostanie funkcja sprzątająca (o ile została zwrócona) i efekt zostanie wykonany ponownie.
- `on(name: string, handler: (event) => void, ...dependencies)` - Reprezentuje obsługę zdarzenia o podanej nazwie. Za każdym razem kiedy zdarzenie o danej nazwie zostanie wyemitowane i jego celem będzie rodzic, w którym ta funkcja została wywołana, uruchomiona będzie funkcja przekazywana w drugim argumencie i obiekt reprezentujący zdarzenie zostanie jej przekazany. Węzeł w drzewie zostanie zaktualizowany w przypadku zmiany którejkowiek z zależności (ponownie, porównanie przez referencję).
- `suspend<T>(() => Promise<T>, ...dependencies): T` - Przyjmuje funkcję asynchroniczną jako pierwszy argument oraz listę zależności jako drugi. Przy pierwszym wywołaniu (oraz przy każdorazowej zmianie którejś z zależności - porównanie przez referencję) wywołuje otrzymaną funkcję oraz przerywa budowę obecnego poddrzewa aż do napotkania pierwszego komponentu typu `SuspenseBoundary` będącego jej przodkiem. Kiedy funkcja asynchroniczna się zakończy i zwróci wynik, poddrzewo zostaje przebudowane i zwrócona wartość jest możliwa do odczytu.
- `defer<T>(() => Promise<T>, ...dependencies): T` - Działa bardzo podobnie do `suspend` z tą różnicą, że w przypadku zmiany którejkolwiek z zależności budowa poddrzewa nie zostaje przerwana. Zamiast tego, wyświetlana jest poprzednia wersja drzewa a funkcja asynchroniczna jest uruchamiana w tle. Po jej zakończeniu, poddrzewo jest przebudowywane ze zaktualizowaną wartością.
- `memoize<T>(() => T, ...dependencies): T` - Pozwala na memoizację wyniku funkcji pomiędzy różnymi wersjami drzewa. Funkcja obliczająca wartość zostanie wywołana za pierwszym razem oraz w przypadku zmiany którejś z zależności. W pozostałych przypadkach, wykorzystana zostanie wartość obliczona wcześniej. Przydatna do optymalizacji złożonych obliczeń zależnych od stanu, który nie zawsze zmienia się podczas przebudowy drzewa.
- `createAmbient`
- `readAmbient`
