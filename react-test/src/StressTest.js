import React from 'react'

const COUNT = 5
const LEVELS = 8

class StateUpdater extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
  }

  render() {
    return (
      <div>
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          Increment {this.state.count}
        </button>
      </div>
    )
  }
}

class RecursiveDivs extends React.Component {
  render() {
    return (
      <>
        <div
          style={{
            width: '1px',
            height: '1px',
            backgroundColor: 'red',
          }}
        >
          {this.props.index === 0 && this.props.levels === 1 && this.props.first ? (
            <StateUpdater />
          ) : null}
          {this.props.levels > 0 &&
            new Array(this.props.count).fill(0).map((_, i) => {
              return (
                <RecursiveDivs
                  index={i}
                  count={this.props.count}
                  levels={this.props.levels - 1}
                  key={`div-${i}-${this.props.levels}`}
                  first={this.props.first && i === 0}
                />
              )
            })}
        </div>
      </>
    )
  }
}

export class StressTest extends React.Component {
  constructor(props) {
    super(props)
    this.state = { visible: false, count: 0 }
  }

  increment() {
    this.setState({ count: this.state.count + 1 })
  }

  render() {
    return (
      <div>
        <button onClick={() => this.setState({ visible: !this.state.visible })}>
          {this.state.visible ? 'Clear' : 'Start'}
        </button>

        <button onClick={() => this.increment()}>Root-level counter: {this.state.count}</button>

        {this.state.visible ? (
          <div>
            <RecursiveDivs index={0} count={COUNT} levels={LEVELS} first />
          </div>
        ) : null}
      </div>
    )
  }
}
