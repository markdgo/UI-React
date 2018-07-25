import keyboardKey from 'keyboard-key'
import _ from 'lodash/fp'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Link, withRouter } from 'react-static'
import { Menu, Icon, Input, Ref } from 'semantic-ui-react'

import CarbonAd from 'docs/src/components/CarbonAd/CarbonAd'
import Logo from 'docs/src/components/Logo/Logo'
import { docTypes, getComponentPathname, typeOrder, repoURL } from 'docs/src/utils'
import shallowEqual from 'src/lib/shallowEqual'

const selectedItemLabelStyle = { color: '#fff', float: 'right' }
const selectedItemLabel = (
  <span style={selectedItemLabelStyle}>
    <Icon name='exchange' rotated='clockwise' />
    or Enter
  </span>
)

class Sidebar extends Component {
  static propTypes = {
    componentMenu: docTypes.componentMenu.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    style: PropTypes.object,
    version: PropTypes.string.isRequired,
  }

  state = { query: '' }

  constructor(props) {
    super(props)

    this.filteredMenu = props.componentMenu
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.state, nextState)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleDocumentKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown)
  }

  handleDocumentKeyDown = (e) => {
    const code = keyboardKey.getCode(e)
    const isAZ = code >= 65 && code <= 90
    const hasModifier = e.altKey || e.ctrlKey || e.metaKey
    const bodyHasFocus = document.activeElement === document.body

    if (!hasModifier && isAZ && bodyHasFocus) this._searchInput.focus()
  }

  handleItemClick = () => {
    const { query } = this.state

    if (query) this.setState({ query: '' })
    if (document.activeElement === this._searchInput) this._searchInput.blur()
  }

  handleSearchChange = (e) => {
    this.setState({
      selectedItemIndex: 0,
      query: e.target.value,
    })
  }

  handleSearchKeyDown = (e) => {
    const { history } = this.props
    const { selectedItemIndex } = this.state
    const code = keyboardKey.getCode(e)

    if (code === keyboardKey.Enter && this.selectedRoute) {
      e.preventDefault()
      history.push(this.selectedRoute)
      this.selectedRoute = null
      this._searchInput.blur()
      this.setState({ query: '' })
    }

    if (code === keyboardKey.ArrowDown) {
      e.preventDefault()
      const next = _.min([selectedItemIndex + 1, this.filteredMenu.length - 1])
      this.selectedRoute = getComponentPathname(this.filteredMenu[next])
      this.setState({ selectedItemIndex: next })
    }

    if (code === keyboardKey.ArrowUp) {
      e.preventDefault()
      const next = _.max([selectedItemIndex - 1, 0])
      this.selectedRoute = getComponentPathname(this.filteredMenu[next])
      this.setState({ selectedItemIndex: next })
    }
  }

  handleSearchRef = (c) => {
    this._searchInput = c
  }

  menuItemsByType = _.map((nextType) => {
    const items = _.flow(
      _.filter(({ type }) => type === nextType),
      _.map(info => (
        <Menu.Item
          key={info.displayName}
          name={info.displayName}
          onClick={this.handleItemClick}
          as={Link}
          to={getComponentPathname(info)}
          activeClassName='active'
        />
      )),
    )(this.props.componentMenu)

    return (
      <Menu.Item key={nextType}>
        <Menu.Header>{_.capitalize(nextType)}s</Menu.Header>
        <Menu.Menu>{items}</Menu.Menu>
      </Menu.Item>
    )
  }, typeOrder)

  renderSearchItems = () => {
    const { selectedItemIndex, query } = this.state
    if (!query) return

    let itemIndex = -1
    const startsWithMatches = []
    const containsMatches = []
    const escapedQuery = _.escapeRegExp(query)

    _.each((info) => {
      if (new RegExp(`^${escapedQuery}`, 'i').test(info.displayName)) {
        startsWithMatches.push(info)
      } else if (new RegExp(escapedQuery, 'i').test(info.displayName)) {
        containsMatches.push(info)
      }
    }, this.props.componentMenu)

    this.filteredMenu = [...startsWithMatches, ...containsMatches]
    const menuItems = _.map((info) => {
      itemIndex += 1
      const isSelected = itemIndex === selectedItemIndex

      if (isSelected) this.selectedRoute = getComponentPathname(info)

      return (
        <Menu.Item
          key={info.displayName}
          name={info.displayName}
          onClick={this.handleItemClick}
          active={isSelected}
          as={Link}
          to={getComponentPathname(info)}
        >
          {info.displayName}
          {isSelected && selectedItemLabel}
        </Menu.Item>
      )
    }, this.filteredMenu)

    return menuItems
  }

  render() {
    const { style, version } = this.props
    const { query } = this.state

    return (
      <Menu vertical fixed='left' inverted style={style}>
        <Menu.Item>
          <Logo spaced='right' size='mini' />
          <strong>
            Semantic UI React &nbsp;
            <small>
              <em>{version}</em>
            </small>
          </strong>
        </Menu.Item>
        <Menu.Item>
          <Menu.Header>Getting Started</Menu.Header>
          <Menu.Menu>
            <Menu.Item as={Link} to='/' activeClassName='active'>
              Introduction
            </Menu.Item>
            <Menu.Item as={Link} to='/usage' activeClassName='active'>
              Usage
            </Menu.Item>
            <Menu.Item as={Link} to='/theming' activeClassName='active'>
              Theming
            </Menu.Item>
            <Menu.Item as={Link} to='/layouts' activeClassName='active'>
              Layouts
            </Menu.Item>
            <Menu.Item as='a' href={repoURL} target='_blank' rel='noopener noreferrer'>
              <Icon name='github' /> GitHub
            </Menu.Item>
            <Menu.Item
              as='a'
              href={`${repoURL}/blob/master/CHANGELOG.md`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Icon name='file alternate outline' /> CHANGELOG
            </Menu.Item>
          </Menu.Menu>
        </Menu.Item>
        <Menu.Item>
          <CarbonAd />
        </Menu.Item>
        <Menu.Item active>
          <Ref innerRef={this.handleSearchRef}>
            <Input
              focus
              inverted
              transparent
              icon='filter'
              size='large'
              placeholder='Filter Components'
              value={query}
              onChange={this.handleSearchChange}
              onKeyDown={this.handleSearchKeyDown}
            />
          </Ref>
        </Menu.Item>
        {query ? this.renderSearchItems() : this.menuItemsByType}
      </Menu>
    )
  }
}

export default withRouter(Sidebar)
