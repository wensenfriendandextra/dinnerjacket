import React, { Component } from 'react'
const css = require('./Profile.css')

let userData = ''
let yearList = []
let part = {}

let profileContent
let detailsTab
let partTab
let content

let id = 0

// part is participation innit too long innit

class Profile extends Component {
  constructor(props) {
    super(props)
    this.state = { loading: true, content: 'details' }
  }
  componentWillUnmount(){
    let content = document.getElementById('content')
    content.className = 'full'
  }

  componentDidMount() {
    let content = document.getElementById('content')
    content.className = 'full vcNavbarParent'
    content = this.state.content
    profileContent = document.getElementById('profileContent')
    detailsTab = document.getElementById('detailsTab')
    partTab = document.getElementById('partTab')

    let apiPart = window.participation
    userData = window.userData
    yearList = []
    part = {}

    for (let i = 0; i < apiPart.length; i++) {
      if (!(apiPart[i].year in part)) {
        part[apiPart[i].year] = {
          event: []
        }
        yearList.push({ year: apiPart[i].year })
      }

      part[apiPart[i].year].event.push({
        activity: apiPart[i].activity,
        category: apiPart[i].categoryName,
        points: apiPart[i].points
      })
    }

    //(part)
    //(yearList)

    for (let j = 0; j < yearList.length; j++) {
      let year = yearList[j].year

      //(year)
      
      /*yearList[j].push({
        target: ' | Target: ' + part[year].event.shift().points,
        total: ' | Total: ' + part[year].event.pop().points
      })*/
      let eventOne = part[year].event[0].points
      //(eventOne)
      yearList[j].target = ' | Target: '
      if (eventOne == 0) {
        part[year].event.shift()
      }
      yearList[j].target += part[year].event.shift().points
      
      yearList[j].total = ', Total: ' + part[year].event.pop().points
    }

    //(yearList)

    //target = ' | Target: ' + part[props.years.year].event.shift().points
    //total = ' | Total: ' + part[props.years.year].event.pop().points

    let loading = this.state.loading
    this.setState({ loading: false })
  }

  render() {
    let rows = yearList.map(year => {
      id++
      return <YearList key={year+id} years={year} />
    })

    let content
    if (this.state.content === 'details') {
      content = DETAILS()
    } else if (this.state.content === 'part') {
      content = PARTICIPATION(rows)
    }

    let pptOption
    if (window.userData.role === 'Student') {
      pptOption = (<li id='partTab' onClick={() => {this.setState({ content: 'part' })}}><a>Participation</a></li>)
    }

    let subtitle = userData.role
    if (window.userData.role === 'Student') {
      subtitle += ' | ' + userData.department + ' | ' + userData.office
    }

    return (
      <div className='vcNavbarCard'>
        <div className='profileParent'>
          <div className='profileChild card uk-animation-slide-top-small'>
            <span className='profileParent' uk-icon='icon: user; ratio:2'></span>
            <h2 className='uk-text-center'>{userData.givenName+' '+userData.surname}</h2>
            <p className='uk-text-center'>{subtitle}</p>
            <ul className='uk-margin-top uk-margin-bottom uk-flex-center' uk-tab='true'>
              <li id='detailsTab' className='uk-active' onClick={() => {this.setState({ content: 'details' })}}><a>Details</a></li>
              {pptOption}
            </ul>
            <div id='profileContent'>
              {content}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const YearList = (props) => {  
  let rows = part[String(props.years.year)].event.map(event => {
    return <TableRow key={event.activity} part={event} />
  })

  ////(part[props.years.year].event)
  /*let target = part[props.years.year].event[0]
  let total = part[props.years.year].event[part[props.years.year].event.length - 1]*/

  return (
    <li>
      <p className='uk-accordion-title'>{props.years.year+props.years.target+props.years.total}</p>
      <div className='uk-accordion-content'>
        <table className='uk-table uk-table-small uk-table-hover uk-table-striped'>
          <thead>
            <tr>
              <th className=''>Category</th>
              <th className=''>Activity</th>
              <th className='uk-table-shrink'>Points</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    </li>
  )
}

const TableRow = (props) => {
  return (
    <tr>
      <td>{props.part.category}</td>
      <td>{props.part.activity}</td>
      <td>{props.part.points}</td>
    </tr>
  )
}

const DETAILS = () => {
  let ID = (window.userData.role === 'Student') ? 'ID' : 'Username'
  let nesa = NESA()

  return (
    <table id='detailsTable' className='uk-table uk-table-small'>
      <tbody>
        <tr>
            <td className='width-small'>{ID}</td>
            <td><code>{userData.username}</code></td>
        </tr>
        {nesa}
        <tr>
            <td className='width-small'>Email</td>
            <td><code>{userData.email}</code></td>
        </tr>
        <tr>
            <td className='width-small'></td>
            <td><code>{userData.emailAliases}</code></td>
        </tr>
        <tr>
            <td className='width-small'></td>
            <td><code>{userData.decEmail}</code></td>
        </tr>
        <tr>
            <td className='width-small'>Groups</td>
            <td>{userData.groups}</td>
        </tr>
      </tbody>
    </table>
  )
}

const NESA = () => {
  if (window.timetable.student.BoSNumber !== '' && window.userData.role === 'Student') {
    return (
      <tr>
        <td className='width-small'>NESA</td>
        <td><code>{window.timetable.student.BoSNumber}</code></td>
      </tr>
    )
  }
}

const PARTICIPATION = (rows) => {
  return (
    <ul uk-accordion='multiple: true'>
      {rows}
    </ul>
  )
}

export default Profile
