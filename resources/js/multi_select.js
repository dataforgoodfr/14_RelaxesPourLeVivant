export default class MultiSelect {
  #wrapper
  #input
  #dropdown
  #options
  #selected
  #activeIdx
  #preventClose
  #fieldName
  #isClose

  constructor(wrapper, options, preselected = [], fieldName = 'select') {
    this.#wrapper = wrapper
    this.#input = wrapper.querySelector('.token-input')
    this.#dropdown = wrapper.querySelector('.token-dropdown')
    this.#options = options
    this.#selected = [...preselected]
    this.#activeIdx = -1
    this.#preventClose = false
    this.#fieldName = fieldName
    this.#isClose = true

    this.#bind()
  }

  static init(document) {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-multi-select]').forEach((wrapper) => {
        if (wrapper.dataset.initialized) return
        wrapper.dataset.initialized = 'true'

        const options = JSON.parse(wrapper.dataset.options || '[]')
        const selected = JSON.parse(wrapper.dataset.selected || '[]')
        const name = wrapper.dataset.name || 'select'
        new MultiSelect(wrapper, options, selected, name)
      })
    })
  }

  showPicker() {
    this.#openDropdown()
  }

  #bind() {
    this.#wrapper.showPicker = this.showPicker.bind(this)

    this.#wrapper.addEventListener('mousedown', (e) => {
      if (e.target.closest('.token-remove')) return
      if (e.target === this.#input) return
      e.preventDefault()
      this.#input.focus()
      this.#openDropdown()
    })

    this.#input.addEventListener('focus', this.#openDropdown.bind(this))

    this.#input.addEventListener('input', () => {
      this.#renderDropdown(this.#input.value)
      if (!this.#dropdown.classList.contains('show')) this.#openDropdown()
    })

    this.#input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!this.#dropdown.classList.contains('show')) this.#openDropdown()
        this.#moveActive(1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.#moveActive(-1)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const items = this.#dropdown.querySelectorAll('.token-dropdown-item')
        if (this.#activeIdx >= 0 && items[this.#activeIdx]) {
          this.#toggleOption(items[this.#activeIdx].dataset.value)
        }
      } else if (e.key === 'Escape') {
        this.#closeDropdown()
      } else if (e.key === 'Backspace' && this.#input.value === '' && this.#selected.length > 0) {
        this.#removeToken(selected[selected.length - 1])
      }
    })

    this.#dropdown.addEventListener('mousedown', (e) => {
      this.#preventClose = true
      e.preventDefault()
      const item = e.target.closest('.token-dropdown-item')
      if (item) this.#toggleOption(item.dataset.value)
    })

    this.#wrapper.addEventListener('mousedown', (e) => {
      const btn = e.target.closest('.token-remove')
      if (btn) {
        e.preventDefault()
        this.#removeToken(btn.dataset.value)
      }
    })

    document.addEventListener('mousedown', (e) => {
      if (this.#preventClose) {
        this.#preventClose = false
        return
      }
      if (!this.#wrapper.contains(e.target) && !this.#isClose) this.#closeDropdown()
    })

    this.#emitChange()
  }

  #renderTokens() {
    // Update selected tokens
    // Add a line-wrapper to avoid the "more count token" to wrap to a new line
    this.#wrapper.querySelector('.token-line-wrapper')?.remove()

    const selectedCount = this.#selected.length
    // render only first token + "more" count
    if (selectedCount > 0) {
      const lineWrapper = document.createElement('div')
      lineWrapper.className = 'token-line-wrapper'

      const token = this.#renderToken(this.#selected[0])
      lineWrapper.appendChild(token)

      if (selectedCount > 1) {
        const more = document.createElement('span')
        more.className = 'token token-more'
        more.textContent = `+${selectedCount - 1}`
        lineWrapper.appendChild(more)
      }

      this.#wrapper.insertBefore(lineWrapper, this.#input)
    }

    // Update hidden inputs for form submission
    this.#wrapper.parentElement
      .querySelectorAll(`input[type=hidden][name="${this.#fieldName}[]"]`)
      .forEach((i) => i.remove())

    this.#selected.forEach((value) => {
      const hidden = document.createElement('input')
      hidden.type = 'hidden'
      hidden.name = `${this.#fieldName}[]`
      hidden.value = value
      this.#wrapper.parentElement.appendChild(hidden)
    })
  }

  #renderToken(value) {
    const token = document.createElement('span')
    token.className = 'token'
    token.dataset.value = value
    token.innerHTML = `
        <span class="text-truncate" title="${value}">${value}</span>
        <button class="token-remove" data-value="${value}" tabindex="-1" title="Supprimer">✕</button>
      `
    return token
  }

  #renderDropdown(filter = '') {
    const q = filter.trim().toLowerCase()
    const filtered = this.#options.filter((o) => o.toLowerCase().includes(q))

    this.#dropdown.innerHTML = ''
    this.#renderSelectedInDropdown()

    this.#activeIdx = -1

    if (filtered.length === 0) {
      this.#dropdown.innerHTML = `<div class="token-dropdown-empty">Aucun résultat trouvée pour « ${filter} »</div>`
      return
    }

    filtered.forEach((opt, i) => {
      const isSelected = this.#selected.includes(opt)
      const item = document.createElement('div')
      item.className = 'token-dropdown-item' + (isSelected ? ' selected' : '')
      item.dataset.value = opt
      item.dataset.idx = i
      item.innerHTML = `
        <input type="checkbox" class="me-1" ${isSelected ? 'checked' : ''} tabindex="-1" style="pointer-events:none">
        <span>${this.#highlight(opt, q)}</span>
      `
      this.#dropdown.appendChild(item)
    })
  }

  #renderSelectedInDropdown() {
    const selected = this.#selected
    if (selected.length > 0) {
      const wrapper = document.createElement('div')
      wrapper.className = 'token-dropdown-selection'
      selected.forEach((val) => {
        wrapper.appendChild(this.#renderToken(val))
      })
      this.#dropdown.appendChild(wrapper)
    }
  }

  #highlight(text, q) {
    if (!q) return text
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(
      re,
      '<mark style="background:#fff3cd;padding:0;border-radius:2px">$1</mark>'
    )
  }

  #openDropdown() {
    this.#renderDropdown(this.#input.value)
    this.#dropdown.classList.add('show')
    this.#isClose = false
    this.#input.hidden = false
    this.#input.focus()
    let lineWrapper = this.#wrapper.querySelector('.token-line-wrapper')
    if (lineWrapper) lineWrapper.hidden = true
  }

  #closeDropdown() {
    this.#dropdown.classList.remove('show')
    this.#input.value = ''
    this.#activeIdx = -1
    this.#isClose = true
    this.#input.hidden = !!this.#selected.length
    let lineWrapper = this.#wrapper.querySelector('.token-line-wrapper')
    if (lineWrapper) lineWrapper.hidden = false
    this.#renderTokens()
  }

  #toggleOption(val) {
    if (this.#selected.includes(val)) {
      this.#selected = this.#selected.filter((v) => v !== val)
    } else {
      this.#selected.push(val)
    }
    this.#input.value = ''
    this.#renderDropdown()
    this.#dropdown.classList.add('show')
    this.#input.focus()
    this.#emitChange()
  }

  #removeToken(val) {
    this.#selected = this.#selected.filter((v) => v !== val)
    this.#renderTokens()
    if (this.#dropdown.classList.contains('show')) {
      this.#renderDropdown(this.#input.value)
    }
    this.#input.hidden = !!this.#selected.length
    this.#emitChange()
  }

  #moveActive(dir) {
    const items = this.#dropdown.querySelectorAll('.token-dropdown-item')
    if (!items.length) return
    items[this.#activeIdx]?.classList.remove('active')
    this.#activeIdx = Math.max(0, Math.min(items.length - 1, this.#activeIdx + dir))
    const el = items[this.#activeIdx]
    el.classList.add('active')
    el.scrollIntoView({ block: 'nearest' })
  }

  #emitChange() {
    this.#wrapper.value = this.#selected.join(', ')
    this.#wrapper.dispatchEvent(new CustomEvent('change'))
  }
}
