// Sync notes (list detailed modules this file covers later)
// George

// localstorage only - below is the WIP firebase code
import React, { Component } from 'react'
const http = require('http')
const css = require('./Notes.css')

let quill

let currentID = 0
let noteTabID = 0
let firstLoad = false

let mouseX, mouseY = 0

let contextMenu



const MAX_CLASSES = 12

class Notes extends Component {
  constructor(props) {
    super(props)

    this.state = {
      notes: [],
      classes: [],
      selected: 0,
      onContext: '',
      mousePos: {x: 0, y: 0},
      posSaved: false
    }
   
    //restore notes from localstorage and selection from window var
    if (localStorage.getItem('notesDB') === null) {
      this.state.notes.push(this.noteStruct('My Notes', '', currentID))
    } else {
      this.state.notes = JSON.parse(atob(localStorage.getItem('notesDB')))
      if (localStorage.getItem('content') !== null) {
        firstLoad = true
        this.state.notes[0].content = atob(localStorage.getItem('content'))
        localStorage.removeItem('content')
      }
    }

    
    
    this.generateClasses()
    
    // questionable innit
    window.addEventListener('beforeunload', (event) => {
      // Autosaves before enduser exits notes
      console.log('ISTHISEVERUSEDBEFOREUNLEAD?')
    }, false)
  }
  
  generateClasses() {
    this.state.classes = []
    for (let i = 1; i < MAX_CLASSES + 1; i++) {
      if (window.timetable.subjects[i] !== -1 && window.timetable.subjects[i].shortTitle[0] !== '_') {      
        let subject = window.timetable.subjects[i].year + window.timetable.subjects[i].shortTitle
        //console.log(this.classUnused(subject))
        if (this.classUnused(subject)) {
          this.state.classes.push(subject)
        }
      }
    }
    //console.log(this.state.classes)
  }

  classUnused(subject) {
    for (let i = 0; i < this.state.notes.length; i++) {
      if (subject == this.state.notes[i].title) {
        return false
      }
    }
    return true
  }

  componentDidMount() {
    let content = document.getElementById('content')
    content.className = 'full vcNavbarParent'

    contextMenu = document.getElementById('contextMenu')
    
    // Initialise quil
    quill = new Quill('#editor', {
      modules: {
        toolbar: true
      },
      // Snow theme displays formatting options above text box
      theme: 'snow', // OK I CHANGED IT FRICKER !
      placeholder:
      'Write any notes here! Notes are encoded and are not visible to anyone else. Notes are currently stored locally on your device. In future, notes will seamlessly sync across all your devices.'
    })

    this.initNote()

    console.log(window.selectedNote)

    //HELP BUSTOR
    console.log(window.selectedNote)
    let notesLayout = document.getElementById('notesLayout')

    UIkit.switcher(notesLayout).show(window.selectedNote)
    
    /*
    for (let i = 0; i < notesLayout.childNodes; i++) {
      if (i === window.selectedNote) {
        console.log('At ' + i + ' TRUE')
        notesLayout.childNodes[i].setAttribute('aria-expanded', 'true')
        notesLayout.childNodes[i].className = 'uk-active'
      } else {
        console.log('At ' + i + ' FALSE')
        notesLayout.childNodes[i].setAttribute('aria-expanded', 'false')
        notesLayout.childNodes[i].className = ''
      }
    }
    console.log(notesLayout.childNodes)
    */

    let posSaved = this.state.posSaved
    this.setState({ posSaved: true })
  }

  /*
  componentWillUnmount() {
    // Autosaves before enduser exits notes
    this.updateDB()
    console.log(document.getElementById('notesLayout'))
    let notesLayout = document.getElementById('notesLayout')
    
    let oldNotes = this.state.notes
    let notes = []

    console.log(this.state.notes)

    // IMPROVE EFFICIENCY
    for (let i = 0; i < notesLayout.childNodes.length; i++) {
      let title = notesLayout.childNodes[i].getAttribute('text')
      console.log(title)
      console.log(this.state.notes[i].title)
      
      if (this.state.notes[i].title !== title) {
        for (let j = 0; j < this.state.notes.length; j++) {
          if (this.state.notes[j].title === title) {
            notes.push(this.state.notes[j])
          }
        }
      } else {
        notes.push(this.state.notes[i])
      }

      // CURRENT SELECTION
      //if (notesLayout.childNodes[i].getAttribute('aria-expanded') === 'true') {
      //  window.selectedNote = 
      //}
    }

    window.selectedNote = this.state.selected

    this.state.notes = notes

    localStorage.setItem('notesDB', btoa(JSON.stringify(this.state.notes)));

    let content = document.getElementById('content')
    content.className = 'full'
  }*/

  

  noteStruct(ttl, cnt, ID) {
    let note = {
      title: ttl,
      content: cnt,
      id: ID
    }
    return note
  }

  /*rows = this.state.notices.map(notice => {
    return <CollapsedNotices key={notice.ID} notices={notice} />
  })*/

  initNote() {
    let content = this.state.notes[this.state.selected].content
    if (firstLoad || content !== '') {
      quill.setContents(JSON.parse(content))
      firstLoad = false
    }
  }

  createCustomNote() {
    this.updateDB()
    let title = document.getElementById('customTitle').value
    if (this.titleInUse(title)) {
      // QUIGLEY
      // I would keep the alert message contents but maybe present it in some uikit element that looks better innit
      UIkit.modal.alert('The note \'' + title.toUpperCase() + '\' already exists.')
    } else {
      currentID++
      let n = this.state.notes
      this.setState({ n: n.push(this.noteStruct(title, '', this.state.notes.length)) })
      //console.log(this.state.notes)
    }
  }

  titleInUse(title) {
    for (let i = 0; i < this.state.notes.length; i++) {
      if (title.toLowerCase() === this.state.notes[i].title.toLowerCase()) {
        return true
      }
    }
    return false
  }

  createNote(e) {
    this.updateDB()

    for (let i = this.state.classes.length-1; i >= 0; i--) {
      if (this.state.classes[i] === e.target.title) {
        this.state.classes.splice(i, 1)
      }
    }

    currentID++
    let n = this.state.notes
    this.setState({ n: n.push(this.noteStruct(e.target.title, '', this.state.notes.length)) })
    //console.log(this.state.notes)
  }

  notesContextMenu(e) {
    contextMenu.style.visibility = 'visible'

    this.state.onContext = e.target.text
    //console.log(this.state.onContext)

    contextMenu.style.top = e.clientY+'px'
    contextMenu.style.left = e.clientX+'px'
    
    e.preventDefault()
  }

  refreshNotesList() {
    let notes = this.state.notes
    this.setState({ notes: notes })
    this.updateDB()
  }

  updateDB() {
    this.state.notes[this.state.selected].content = JSON.stringify(content)
    localStorage.setItem('notesDB', btoa(JSON.stringify(this.state.notes)))
  }

  selectNote(e) {
    this.state.notes[this.state.selected].content = JSON.stringify(content)
    localStorage.setItem('notesDB', btoa(JSON.stringify(this.state.notes)))

    console.log(this.state.notes)

    let content// = this.state.notes[this.state.selected].content
    for (let i = 0; i < this.state.notes.length; i++) {
      if (this.state.notes[i].title === e.target.text) {
        this.state.selected = i
        content = this.state.notes[i].content
      }
    }

    this.displayContent(content)
  }

  displayContent(content) {
    if (content === '' || content === undefined) {
      quill.setText('')
    } else {
      try {
        quill.setContents(JSON.parse(content))
      } catch (e) {
        console.log(content)
        console.log(e)
      }
    }
  }

  // Render uikit card and quill editor
  render() {
    let key = 0
    let notes = this.state.notes.map(note => {
      key++
      return <li key={key} text={note.title}  onContextMenu={this.notesContextMenu.bind(this)} onClick={this.selectNote.bind(this)}><a id={note.id}>{note.title}</a></li>
    })

    let key2 = 0
    let classList = this.state.classes.map(cls => {
      return <tr><td className='uk-text-middle'>{cls}</td><td><button key={key2} title={cls} onClick={this.createNote.bind(this)} className="uk-button uk-button-default uk-button-small" type="button">Add</button></td></tr>
    })

    return (
        <div>
          <a uk-icon='icon: info' uk-tooltip='title: Right click to rename, clear, or delete notes' className='uk-float-right'/>
          <ul id='notesLayout' className='uk-subnav uk-subnav-pill uk-flex-center' uk-switcher='animation: uk-animation-fade' uk-sortable='cls-custom: uk-box-shadow-small uk-flex uk-flex-middle uk-background'>
            {notes}
          </ul>
          <div className='pad'>
            <div id='editor' onInput={this.updateDB.bind(this)}/>
          </div>
          <div className=''>
            <a uk-icon='plus-circle' uk-tooltip='title: Add custom notes; pos: bottom-center;'></a>
            <div uk-dropdown='mode: click;pos: top-center'>
              <p className='uk-text-left'>Classes</p>
              
              <table className="uk-table uk-table-small uk-table-divider uk-table-hover">
                <tbody>
                  {classList}
                </tbody>
              </table>
              <p className='uk-text-left'>Custom</p>
              <input id='customTitle' className='uk-input' type='text' placeholder='Title' maxLength='10'/>
              <button onClick={this.createCustomNote.bind(this)} className='uk-margin-top uk-button uk-button-default'>Add</button>
            </div>
          </div>
        </div>
    )
  }
}

export default Notes

/*
<ul className='uk-switcher uk-margin'>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
              <li>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</li>
              <li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur, sed do eiusmod.</li>
          </ul>

*/


//fb code innit

/*// Sync notes (list detailed modules this file covers later)
// George

import React, { Component } from 'react'
const http = require('http')
const css = require('./Notes.css')

let ref
let quill
let userID
let offline
const firebase = require('firebase')
const fb = require('./fb')(firebase)
let database = firebase.database()

let lastNotes

class Notes extends Component {
  constructor(props) {
    super(props)

    this.getUserID()

    // questionable innit
    window.addEventListener('beforeunload', (event) => {
      // Autosaves before enduser exits notes
      this.updateDB()
    }, false)
  }

  interval() {
    console.log('test')

    /*if (quill.getText() === lastNotes) {
      console.log('test2')
      // no edits have been made in the last 5 seconds
      //this.retrieveDB()
      this.retrieveDB
    }*/

/*    ref.once('value', (data) => {
      if (data.val().content !== localStorage.getItem('content')) {
        console.log('test')
        retrieveDB(data.val().content)
      }
    })

    lastNotes = quill.getText()

    function retrieveDB(content) {
      quill.setContents(JSON.parse(atob(content)))
      localStorage.setItem('content', content)
    }
  }

  componentDidMount() {
    let content = document.getElementById('content')
    content.className = 'full vcNavbarParent'

    // Initialise quill editor
    quill = new Quill('#editor', {
      modules: {
        toolbar: true
      },
      // Snow theme displays formatting options above text box
      theme: 'snow', // OK I CHANGED IT FRICKER !
      placeholder:
        'Write any notes here! Notes are encrypted and are not visible to anyone else. Notes are currently stored locally on your device. In future, notes will seamlessly sync across all your devices.'
    })

    // Add previously saved text into quill editor
    if (localStorage.getItem('content') !== '') {
      try {
        quill.setContents(JSON.parse(atob(localStorage.getItem('content'))))
      } catch (e) {
        console.log(e)
      }
    }

    lastNotes = quill.getText()
  }

  getUserID() {
    http.get('/getdata?token=' + localStorage.getItem('accessToken') + '&url=details/userinfo.json', (res) => {
      res.setEncoding('utf8')
      let data = ''
      res.on('data', (body) => {
        data += body
      })
      res.on('end', () => {
        try {
          userID = btoa(JSON.parse(data).username)
          if (userID !== undefined) {
            console.log(userID)
            ref = database.ref('userNotes/' + userID)
            ref.once('value', (data) => {
              this.retrieveDB(data.val().content)
            })
            setInterval(this.interval, 5000)
          }
        } catch (e) {
          console.log('error getting userID')
          //getUserID()
        }
      })
    })
  }

  componentWillUnmount() {
    // Autosaves before enduser exits notes
    this.updateDB()
    let content = document.getElementById('content')
    content.className = 'full'
  }

  updateDB() {
    // Save notes in localStorage in unreadable format
    let content = btoa(JSON.stringify(quill.getContents()))
    let data = { content: content }
    localStorage.setItem('content', content)
    try {
      ref.update(data)
    } catch (e) {
      console.log(e)
    }
  }

  retrieveDB(content) {
    //ref.once('value', (data) => {
    //  quill.setContents(JSON.parse(atob(data.val().content)))
    //  localStorage.setItem('content', data.val().content)
    //})
    quill.setContents(JSON.parse(atob(content)))
    localStorage.setItem('content', content)
  }

  // Render uikit card and quill editor
  render() {
    return (
      <div className='vcNavbarCard notesParent'>
        <div className='notesChild card uk-animation-slide-top-small'>
          <div className='pad'>
            <div id='editor' onInput={this.updateDB.bind(this)}/>
          </div>
        </div>
      </div>
    )
  }
}

export default Notes
*/