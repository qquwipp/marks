let textarea = document.querySelector('textarea')
let dateInput = document.querySelector('input[type="date"]')

let list = document.createElement('div')
list.classList.add('list')
document.body.appendChild(list)

function change() {
    document.getElementById("edit").innerHTML = input();
}

let db;
// IIFE
(async () => {
    db = await idb.openDb('db', 1, db => {
        db.createObjectStore('notes', {
            keyPath: 'id'
        })
    })

    createList()
})();


const addNote = async () => {
    if (textarea.value === '') return

    let text = textarea.value

    let date
    dateInput.value === '' ? date = null : date = dateInput.value

    let note = {
        id: id,
        text: text,
        createdDate: new Date().toLocaleDateString(),
        completed: '',
        notifyDate: date
    }

    try {
        await db.transaction('notes', 'readwrite')
            .objectStore('notes')
            .add(note)
        await createList()
            .then(() => {
                textarea.value = ''
                dateInput.value = ''
            })
    } catch { }
}

document.querySelector('.add-btn').onclick = addNote

let id



const createList = async () => {
    list.innerHTML = `<h3>Заметки</h3>`

    let notes = await db.transaction('notes')
        .objectStore('notes')
        .getAll()

    let dates = []
    
    if (notes.length) {
        id = notes.length

        notes.map(note => {
            list.insertAdjacentHTML('beforeend',
            `<div class = "note" data-id="${note.id}">
            <span class="notify ${note.notifyDate}">${note.notifyDate}</span>
            <span class="info ${note.notifyDate}">?</span>
            <span class="complete">V</span>
            <p class="${note.completed}">Текст: ${note.text}, <br>Дата напоминания: ${note.createdDate}</p>
            <span class="edit">Редактировать</span>
            <span class="delete">Удалить</span>
            </div>`)
            
            if (note.notifyDate === null) {
                return
            } else {
                dates.push({
                    id: note.id,
                    date: note.notifyDate.replace(/(\d+)-(\d+)-(\d+)/, '$3.$2.$1')
                })
            }
        })
    
    } else {
    
        id = 0

        list.insertAdjacentHTML('beforeend', '<p class="note">Добро пожаловать в приложение Заметки</p>')
    }
        document.querySelectorAll('.note').forEach(note => note.addEventListener('click', event => {
        if (event.target.classList.contains('complete')) {
            event.target.nextElementSibling.classList.toggle('line-through')

            note.querySelector('p').classList.contains('line-through')
                ? notes[note.dataset.id].completed = 'line-through'
                : notes[note.dataset.id].completed = ''

            db.transaction('notes', 'readwrite')
                .objectStore('notes')
                .put(notes[note.dataset.id])

        } else if (event.target.classList.contains('delete')) {
            deleteNote(+note.dataset.id)

        } else if (event.target.classList.contains('info')) {
            event.target.previousElementSibling.classList.toggle('show')
        
        } else if (event.target.classList.contains('edit')) {
            editNode(note.dataset.id)
        }
    }))

    checkDeadline(dates)
}

const deleteNote = async key => {
    await db.transaction('notes', 'readwrite')
        .objectStore('notes')
        .delete(key)
    await createList()
}

editNode = async key => {
    await db.transaction('notes', 'readwrite')
        .objectStore('notes')
        text = input()
    await createList()
}