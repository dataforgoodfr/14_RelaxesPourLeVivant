/**
 * Initializes a multi-select token component on a given DOM element.
 *
 * @param {HTMLElement} wrapper     - The .token-input-wrapper element
 * @param {string[]}    options     - The full list of available options
 * @param {string[]}    preselected - Already selected values (e.g. when editing)
 * @param {string}      fieldName   - The field name used for form submit (e.g. "languages")
 */
function initTokenSelect(wrapper, options, preselected = [], fieldName = 'select') {
  // Prevent double initialization
  if (wrapper.dataset.initialized) return
  wrapper.dataset.initialized = 'true'

  // Internal DOM elements
  const input = wrapper.querySelector('.token-input')
  const dropdown = wrapper.querySelector('.token-dropdown')

  // Local state
  let selected = [...preselected]
  let activeIdx = -1
  let preventClose = false

  // Render tokens (badge chips inside the input field)
  function renderTokens() {
    // Remove existing tokens and hidden inputs
    wrapper.querySelectorAll('.token').forEach((t) => t.remove())
    wrapper.parentElement
      .querySelectorAll(`input[type=hidden][name="${fieldName}[]"]`)
      .forEach((i) => i.remove())

    // Create one token + one hidden input per selected value
    selected.forEach((val) => {
      // Visual token
      const token = document.createElement('span')
      token.className = 'token'
      token.dataset.value = val
      token.innerHTML = `
        ${val}
        <button class="token-remove" data-value="${val}" tabindex="-1" title="Remove">✕</button>
      `
      wrapper.insertBefore(token, input)

      // Hidden input for form submission
      const hidden = document.createElement('input')
      hidden.type = 'hidden'
      hidden.name = `${fieldName}[]`
      hidden.value = val
      wrapper.parentElement.appendChild(hidden)
    })
  }

  // Render options in the dropdown
  function renderDropdown(filter = '') {
    const q = filter.trim().toLowerCase()
    const filtered = options.filter((o) => o.toLowerCase().includes(q))

    dropdown.innerHTML = ''
    activeIdx = -1

    if (filtered.length === 0) {
      dropdown.innerHTML = `<div class="token-dropdown-empty">Aucun résultat trouvée pour « ${filter} »</div>`
      return
    }

    filtered.forEach((opt, i) => {
      const isSelected = selected.includes(opt)
      const item = document.createElement('div')
      item.className = 'token-dropdown-item' + (isSelected ? ' selected' : '')
      item.dataset.value = opt
      item.dataset.idx = i
      item.innerHTML = `
        <input type="checkbox" class="me-1" ${isSelected ? 'checked' : ''} tabindex="-1" style="pointer-events:none">
        <span>${highlight(opt, q)}</span>
      `
      dropdown.appendChild(item)
    })
  }

  // Highlight the searched term inside the option text
  function highlight(text, q) {
    if (!q) return text
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(
      re,
      '<mark style="background:#fff3cd;padding:0;border-radius:2px">$1</mark>'
    )
  }

  // Open / close the dropdown
  function openDropdown() {
    renderDropdown(input.value)
    dropdown.classList.add('show')
  }

  function closeDropdown() {
    dropdown.classList.remove('show')
    input.value = ''
    activeIdx = -1
  }

  // Select or deselect an option
  function toggleOption(val) {
    if (selected.includes(val)) {
      selected = selected.filter((v) => v !== val)
    } else {
      selected.push(val)
    }
    input.value = ''
    renderTokens()
    renderDropdown('')
    dropdown.classList.add('show')
    input.focus()
  }

  // Remove a token
  function removeToken(val) {
    selected = selected.filter((v) => v !== val)
    renderTokens()
    if (dropdown.classList.contains('show')) renderDropdown(input.value)
  }

  // Keyboard navigation inside the dropdown list
  function moveActive(dir) {
    const items = dropdown.querySelectorAll('.token-dropdown-item')
    if (!items.length) return
    items[activeIdx]?.classList.remove('active')
    activeIdx = Math.max(0, Math.min(items.length - 1, activeIdx + dir))
    const el = items[activeIdx]
    el.classList.add('active')
    el.scrollIntoView({ block: 'nearest' })
  }

  // Events

  // Click anywhere in the wrapper for focus input and open dropdown
  wrapper.addEventListener('mousedown', (e) => {
    if (e.target.closest('.token-remove')) return
    if (e.target === input) return
    e.preventDefault()
    input.focus()
    openDropdown()
  })

  // Input focus for open dropdown
  input.addEventListener('focus', openDropdown)

  // Typing open filter the list
  input.addEventListener('input', () => {
    renderDropdown(input.value)
    if (!dropdown.classList.contains('show')) openDropdown()
  })

  // Keyboard: arrows, Enter, Escape, Backspace
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!dropdown.classList.contains('show')) openDropdown()
      moveActive(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveActive(-1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const items = dropdown.querySelectorAll('.token-dropdown-item')
      if (activeIdx >= 0 && items[activeIdx]) {
        toggleOption(items[activeIdx].dataset.value)
      }
    } else if (e.key === 'Escape') {
      closeDropdown()
    } else if (e.key === 'Backspace' && input.value === '' && selected.length > 0) {
      // Backspace on empty input removes the last token
      removeToken(selected[selected.length - 1])
    }
  })

  // Click on a dropdown option for toggle selection
  // preventClose avoids the document mousedown closing the dropdown before this handler fires
  dropdown.addEventListener('mousedown', (e) => {
    preventClose = true
    e.preventDefault()
    const item = e.target.closest('.token-dropdown-item')
    if (item) toggleOption(item.dataset.value)
  })

  // Click on a token's cross button for remove it
  wrapper.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('.token-remove')
    if (btn) {
      e.preventDefault()
      removeToken(btn.dataset.value)
    }
  })

  // Click outside the component for close dropdown
  document.addEventListener('mousedown', (e) => {
    if (preventClose) {
      preventClose = false
      return
    }
    if (!wrapper.contains(e.target)) closeDropdown()
  })

  // Initialize with pre-selected values
  renderTokens()
}

// Expose globally so Edge component inline scripts can call it
window.initTokenSelect = initTokenSelect

// Auto-init on page load: find all token-select wrappers and initialize them
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-token-select]').forEach((wrapper) => {
    const options = JSON.parse(wrapper.dataset.options || '[]')
    const selected = JSON.parse(wrapper.dataset.selected || '[]')
    const name = wrapper.dataset.name || 'select'
    initTokenSelect(wrapper, options, selected, name)
  })
})
